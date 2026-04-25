-- ============================================================
-- 函数与触发器
-- 1. updated_at 自动更新
-- 2. auth.users 创建时自动建 profile
-- 3. 报名状态变化时自动维护雅集名额
-- 4. 雅集状态/名额自动校验
-- ============================================================

-- ---------- 通用 updated_at 触发器 ----------
create or replace function set_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger venues_updated_at
  before update on venues
  for each row execute function set_updated_at();

create trigger gatherings_updated_at
  before update on gatherings
  for each row execute function set_updated_at();

create trigger registrations_updated_at
  before update on registrations
  for each row execute function set_updated_at();

-- ---------- 新用户自动创建 profile ----------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_role user_role;
begin
  -- 区分手机号 / 微信登录
  if new.phone is not null then
    default_role := 'phone';
  elsif new.raw_user_meta_data ->> 'provider' = 'wx' then
    default_role := 'wx';
  else
    default_role := 'phone';
  end if;

  insert into public.profiles (id, phone, role)
  values (
    new.id,
    new.phone,
    default_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- 报名状态变化 → 维护名额 ----------
-- 通过：扣减 quota_left
-- 拒绝/取消（且原状态为通过）：归还 quota_left
create or replace function adjust_gathering_quota()
returns trigger
language plpgsql as $$
declare
  delta int;
begin
  -- 新增 / 状态变化
  if (tg_op = 'INSERT' and new.status = 'approved')
     or (tg_op = 'UPDATE' and new.status = 'approved' and old.status <> 'approved') then
    delta := -1;
  elsif tg_op = 'UPDATE' and old.status = 'approved' and new.status <> 'approved' then
    delta := 1;
  else
    return new;
  end if;

  if new.type = 'player' then
    update gatherings
       set player_quota_left = player_quota_left + delta
     where id = new.gathering_id;
  else
    update gatherings
       set audience_quota_left = audience_quota_left + delta
     where id = new.gathering_id;
  end if;

  return new;
end;
$$;

create trigger registrations_quota_trg
  after insert or update of status on registrations
  for each row execute function adjust_gathering_quota();

-- ---------- 报名前校验：雅集状态 + 是否满员 ----------
create or replace function validate_registration()
returns trigger
language plpgsql as $$
declare
  g gatherings%rowtype;
begin
  select * into g from gatherings where id = new.gathering_id;
  if not found then
    raise exception '雅集不存在';
  end if;
  if g.status not in ('upcoming', 'ongoing') then
    raise exception '雅集已结束或已取消，无法报名';
  end if;
  if new.type = 'player' and g.player_quota_left <= 0 and new.status = 'approved' then
    raise exception '演奏名额已满';
  end if;
  if new.type = 'audience' and g.audience_quota_left <= 0 and new.status = 'approved' then
    raise exception '观摩名额已满';
  end if;
  return new;
end;
$$;

create trigger registrations_validate_trg
  before insert on registrations
  for each row execute function validate_registration();

-- ---------- 雅集取消 → 所有未结束报名标记为已取消 ----------
create or replace function cascade_gathering_cancel()
returns trigger
language plpgsql as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update registrations
       set status = 'cancelled'
     where gathering_id = new.id
       and status in ('pending', 'approved');
  end if;
  return new;
end;
$$;

create trigger gatherings_cancel_trg
  after update of status on gatherings
  for each row execute function cascade_gathering_cancel();
