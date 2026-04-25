-- ============================================================
-- 古琴云雅集 - 初始数据库 schema
-- 包含: 枚举类型 / 表结构 / 索引
-- 触发器与 RLS 在后续迁移中
-- ============================================================

-- ---------- 扩展 ----------
create extension if not exists "pgcrypto"; -- gen_random_uuid

-- ---------- 枚举类型 ----------
create type user_role as enum (
  'phone',       -- 手机号注册用户
  'wx',          -- 微信快捷登录用户
  'player',      -- 已认证演奏者
  'audience',    -- 已认证观摩演员
  'host',        -- 主持方
  'venue_admin', -- 琴馆管理员
  'sys_admin'    -- 系统管理员
);

create type venue_status as enum ('pending', 'approved', 'rejected', 'suspended');

create type gathering_status as enum ('upcoming', 'ongoing', 'ended', 'cancelled');

create type registration_type as enum ('player', 'audience');
create type registration_status as enum ('pending', 'approved', 'rejected', 'cancelled');

create type participant_role as enum ('host', 'player', 'audience');
create type on_stage_status as enum ('off', 'on');

-- ---------- 用户档案 ----------
-- 关联 auth.users，由 trigger 自动创建
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nickname    text,
  avatar_url  text,
  phone       text,
  openid      text unique,
  role        user_role not null default 'phone',
  real_name   text,
  bio         text,
  certified_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_role_idx on profiles(role);
create index profiles_openid_idx on profiles(openid) where openid is not null;

-- ---------- 琴馆 ----------
create table venues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo        text,
  intro       text,
  contact     text,
  address     text,
  longitude   double precision,
  latitude    double precision,
  owner_id    uuid not null references profiles(id),
  status      venue_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  reject_reason text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index venues_status_idx on venues(status);
create index venues_owner_idx on venues(owner_id);

-- ---------- 琴馆成员（用于指派主持人）----------
create table venue_members (
  id         uuid primary key default gen_random_uuid(),
  venue_id   uuid not null references venues(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  member_role text not null check (member_role in ('admin', 'host', 'member')),
  created_at timestamptz not null default now(),
  unique (venue_id, user_id, member_role)
);

create index venue_members_user_idx on venue_members(user_id);

-- ---------- 雅集 ----------
create table gatherings (
  id                  uuid primary key default gen_random_uuid(),
  venue_id            uuid not null references venues(id),
  host_id             uuid not null references profiles(id),
  title               text not null,
  cover               text,
  start_at            timestamptz not null,
  end_at              timestamptz,
  intro               text not null default '',
  programs            jsonb not null default '[]'::jsonb,
  player_quota        int  not null default 5,
  player_quota_left   int  not null default 5,
  audience_quota      int  not null default 50,
  audience_quota_left int  not null default 50,
  status              gathering_status not null default 'upcoming',
  trtc_room_id        bigint,
  recording_enabled   boolean not null default false,
  recording_url       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (player_quota_left >= 0 and player_quota_left <= player_quota),
  check (audience_quota_left >= 0 and audience_quota_left <= audience_quota)
);

create index gatherings_status_start_idx on gatherings(status, start_at);
create index gatherings_venue_idx on gatherings(venue_id);
create index gatherings_host_idx on gatherings(host_id);

-- ---------- 报名 ----------
create table registrations (
  id            uuid primary key default gen_random_uuid(),
  gathering_id  uuid not null references gatherings(id) on delete cascade,
  user_id       uuid not null references profiles(id),
  type          registration_type not null,
  program       text,
  bio           text,
  status        registration_status not null default 'pending',
  order_index   int,
  reviewed_by   uuid references profiles(id),
  reviewed_at   timestamptz,
  reject_reason text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (gathering_id, user_id, type)
);

create index registrations_gathering_status_idx on registrations(gathering_id, status);
create index registrations_user_idx on registrations(user_id);

-- ---------- 房间参与者（实时状态）----------
create table participants (
  id           uuid primary key default gen_random_uuid(),
  gathering_id uuid not null references gatherings(id) on delete cascade,
  user_id      uuid not null references profiles(id),
  role         participant_role not null,
  on_stage     on_stage_status not null default 'off',
  camera_on    boolean not null default false,
  mic_on       boolean not null default false,
  muted        boolean not null default false,
  kicked       boolean not null default false,
  joined_at    timestamptz not null default now(),
  left_at      timestamptz,
  unique (gathering_id, user_id)
);

create index participants_gathering_stage_idx on participants(gathering_id, on_stage);

-- ---------- 弹幕 ----------
create table danmaku (
  id           uuid primary key default gen_random_uuid(),
  gathering_id uuid not null references gatherings(id) on delete cascade,
  user_id      uuid not null references profiles(id),
  content      text not null,
  blocked      boolean not null default false,
  hit_word     text,
  created_at   timestamptz not null default now()
);

create index danmaku_gathering_time_idx on danmaku(gathering_id, created_at desc);

-- ---------- 献花 / 点赞 ----------
create table gifts (
  id            uuid primary key default gen_random_uuid(),
  gathering_id  uuid not null references gatherings(id) on delete cascade,
  from_user_id  uuid not null references profiles(id),
  to_user_id    uuid references profiles(id),
  gift_type     text not null default 'flower',
  count         int  not null default 1,
  created_at    timestamptz not null default now()
);

create index gifts_gathering_idx on gifts(gathering_id);
create index gifts_to_user_idx on gifts(to_user_id) where to_user_id is not null;

create table likes (
  id            uuid primary key default gen_random_uuid(),
  gathering_id  uuid not null references gatherings(id) on delete cascade,
  from_user_id  uuid not null references profiles(id),
  to_user_id    uuid not null references profiles(id),
  created_at    timestamptz not null default now(),
  unique (gathering_id, from_user_id, to_user_id)
);

create index likes_to_user_idx on likes(to_user_id);

-- ---------- 敏感词库 ----------
create table sensitive_words (
  id         uuid primary key default gen_random_uuid(),
  word       text not null unique,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- 系统配置（KV）----------
create table system_config (
  key        text primary key,
  value      jsonb not null,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

-- ---------- 人才发现（管理员手动推荐）----------
create table featured_players (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) unique,
  recommended_by  uuid not null references profiles(id),
  reason          text,
  weight          int  not null default 0,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

create index featured_players_active_weight_idx on featured_players(active, weight desc);
