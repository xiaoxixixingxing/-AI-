-- ============================================================
-- 行级权限（RLS）
-- 设计原则：
--   - 公开数据（已审核琴馆 / 未结束雅集）所有人可读
--   - 私密数据（个人报名、房间状态）按角色限制
--   - 写操作严格按角色: 琴馆管理员 / 主持方 / 系统管理员
-- ============================================================

-- ---------- 启用 RLS ----------
alter table profiles            enable row level security;
alter table venues              enable row level security;
alter table venue_members       enable row level security;
alter table gatherings          enable row level security;
alter table registrations       enable row level security;
alter table participants        enable row level security;
alter table danmaku             enable row level security;
alter table gifts               enable row level security;
alter table likes               enable row level security;
alter table sensitive_words     enable row level security;
alter table system_config       enable row level security;
alter table featured_players    enable row level security;

-- ---------- 辅助函数 ----------
create or replace function current_role_value()
returns user_role
language sql stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_sys_admin()
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'sys_admin');
$$;

create or replace function is_venue_admin_of(target_venue uuid)
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from venues where id = target_venue and owner_id = auth.uid()
  ) or exists (
    select 1 from venue_members
     where venue_id = target_venue
       and user_id = auth.uid()
       and member_role = 'admin'
  );
$$;

create or replace function is_host_of(target_gathering uuid)
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from gatherings where id = target_gathering and host_id = auth.uid()
  );
$$;

create or replace function is_approved_in(target_gathering uuid)
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from registrations
     where gathering_id = target_gathering
       and user_id = auth.uid()
       and status = 'approved'
  );
$$;

-- ============================================================
-- profiles
-- ============================================================
create policy profiles_self_read on profiles
  for select using (auth.uid() = id);

create policy profiles_public_read on profiles
  for select using (true); -- 昵称头像基础信息所有人可见

create policy profiles_self_update on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy profiles_admin_all on profiles
  for all using (is_sys_admin()) with check (is_sys_admin());

-- ============================================================
-- venues
-- ============================================================
create policy venues_public_read on venues
  for select using (status = 'approved' or owner_id = auth.uid() or is_sys_admin());

create policy venues_owner_insert on venues
  for insert with check (auth.uid() = owner_id);

create policy venues_owner_update on venues
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy venues_admin_all on venues
  for all using (is_sys_admin()) with check (is_sys_admin());

-- ============================================================
-- venue_members
-- ============================================================
create policy venue_members_read on venue_members
  for select using (
    user_id = auth.uid() or is_venue_admin_of(venue_id) or is_sys_admin()
  );

create policy venue_members_admin_write on venue_members
  for all using (is_venue_admin_of(venue_id) or is_sys_admin())
  with check (is_venue_admin_of(venue_id) or is_sys_admin());

-- ============================================================
-- gatherings
-- ============================================================
create policy gatherings_public_read on gatherings
  for select using (
    status in ('upcoming', 'ongoing', 'ended')
    or is_venue_admin_of(venue_id)
    or is_host_of(id)
    or is_sys_admin()
  );

create policy gatherings_venue_insert on gatherings
  for insert with check (is_venue_admin_of(venue_id) or is_sys_admin());

create policy gatherings_venue_update on gatherings
  for update using (is_venue_admin_of(venue_id) or is_host_of(id) or is_sys_admin())
  with check (is_venue_admin_of(venue_id) or is_host_of(id) or is_sys_admin());

create policy gatherings_admin_delete on gatherings
  for delete using (is_venue_admin_of(venue_id) or is_sys_admin());

-- ============================================================
-- registrations
-- ============================================================
create policy registrations_self_read on registrations
  for select using (
    user_id = auth.uid()
    or is_host_of(gathering_id)
    or is_venue_admin_of((select venue_id from gatherings where id = gathering_id))
    or is_sys_admin()
  );

create policy registrations_self_insert on registrations
  for insert with check (auth.uid() = user_id);

create policy registrations_self_cancel on registrations
  for update using (
    user_id = auth.uid() and status in ('pending', 'approved')
  ) with check (user_id = auth.uid() and status = 'cancelled');

create policy registrations_host_review on registrations
  for update using (
    is_host_of(gathering_id)
    or is_venue_admin_of((select venue_id from gatherings where id = gathering_id))
    or is_sys_admin()
  ) with check (
    is_host_of(gathering_id)
    or is_venue_admin_of((select venue_id from gatherings where id = gathering_id))
    or is_sys_admin()
  );

-- ============================================================
-- participants（房间内实时状态）
-- ============================================================
create policy participants_member_read on participants
  for select using (
    user_id = auth.uid()
    or is_host_of(gathering_id)
    or is_approved_in(gathering_id)
    or is_sys_admin()
  );

create policy participants_self_insert on participants
  for insert with check (
    user_id = auth.uid() and is_approved_in(gathering_id)
  );

create policy participants_host_update on participants
  for update using (
    is_host_of(gathering_id) or user_id = auth.uid() or is_sys_admin()
  ) with check (
    is_host_of(gathering_id) or user_id = auth.uid() or is_sys_admin()
  );

-- ============================================================
-- danmaku / gifts / likes（房间互动）
-- ============================================================
create policy danmaku_room_read on danmaku
  for select using (is_approved_in(gathering_id) or is_host_of(gathering_id) or is_sys_admin());

create policy danmaku_member_insert on danmaku
  for insert with check (
    auth.uid() = user_id and (is_approved_in(gathering_id) or is_host_of(gathering_id))
  );

create policy gifts_room_read on gifts
  for select using (is_approved_in(gathering_id) or is_host_of(gathering_id) or is_sys_admin());

create policy gifts_member_insert on gifts
  for insert with check (
    auth.uid() = from_user_id and (is_approved_in(gathering_id) or is_host_of(gathering_id))
  );

create policy likes_room_read on likes
  for select using (true);

create policy likes_member_insert on likes
  for insert with check (
    auth.uid() = from_user_id and (is_approved_in(gathering_id) or is_host_of(gathering_id))
  );

-- ============================================================
-- sensitive_words / system_config / featured_players（管理员）
-- ============================================================
create policy sensitive_words_read on sensitive_words
  for select using (true); -- 前端校验需读取

create policy sensitive_words_admin_write on sensitive_words
  for all using (is_sys_admin()) with check (is_sys_admin());

create policy system_config_read on system_config
  for select using (true);

create policy system_config_admin_write on system_config
  for all using (is_sys_admin()) with check (is_sys_admin());

create policy featured_players_read on featured_players
  for select using (active or is_sys_admin());

create policy featured_players_admin_write on featured_players
  for all using (is_sys_admin()) with check (is_sys_admin());
