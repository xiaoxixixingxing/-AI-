# Supabase 后端

古琴云雅集的数据库 schema、RLS 策略与 Edge Functions 都在这里。

## 目录

```
supabase/
├── migrations/
│   ├── 20260425120001_initial_schema.sql       # 表、枚举、索引
│   ├── 20260425120002_functions_triggers.sql   # 触发器、quota 维护、新用户钩子
│   └── 20260425120003_rls_policies.sql         # 行级权限
├── functions/                                   # Edge Functions（P2/P4 期添加）
├── seed.sql                                     # 敏感词、系统配置初始数据
└── config.toml                                  # 本地 CLI 配置
```

## 部署方式

### 方式 A：Supabase Studio（**推荐首次使用**，无需安装 CLI）

1. 登录 https://app.supabase.com，选择您的项目
2. 左侧菜单 **SQL Editor → New query**
3. **依次** 复制粘贴以下文件内容并点 **Run**：
   1. `migrations/20260425120001_initial_schema.sql`
   2. `migrations/20260425120002_functions_triggers.sql`
   3. `migrations/20260425120003_rls_policies.sql`
   4. `seed.sql`
4. 左侧菜单 **Table Editor** 检查所有表是否创建成功（应有 12 张表）

### 方式 B：Supabase CLI（适合后续多次迭代）

```bash
# 安装 CLI（一次性）
npm install -g supabase

# 登录
supabase login

# 关联项目
supabase link --project-ref <你的-project-ref>

# 推送所有迁移
supabase db push

# 灌入种子数据
supabase db reset --linked   # 注意：会清空数据库
# 或单独跑 seed
psql "$(supabase db remote-url)" -f seed.sql
```

## 表结构速览

| 表 | 用途 |
|---|---|
| `profiles` | 用户档案（关联 auth.users，含角色 / 实名 / 简介） |
| `venues` | 琴馆 |
| `venue_members` | 琴馆成员（用于指派主持人） |
| `gatherings` | 雅集 |
| `registrations` | 报名（演奏 / 观摩） |
| `participants` | 房间内实时参与者状态 |
| `danmaku` | 弹幕（含敏感词标记） |
| `gifts` | 献花记录 |
| `likes` | 点赞 |
| `sensitive_words` | 敏感词库 |
| `system_config` | 系统配置（公告、虚拟道具、小工具等 KV） |
| `featured_players` | 人才发现（管理员手动推荐） |

## RLS 策略要点

- 公开内容（已审核琴馆、未取消雅集）所有人可读
- 用户只能读写自己的 profile / registration
- 琴馆管理员可管理自己的琴馆与雅集
- 主持方可审核所主持雅集的报名
- 房间内互动（弹幕/献花/点赞）需为已通过报名的用户
- `sys_admin` 角色拥有全表读写

## 凭据获取（前端要用）

部署完后，到 Supabase Dashboard → **Settings → API**：
- `Project URL` → 填到前端 `.env.local` 的 `TARO_APP_SUPABASE_URL`
- `anon public` key → 填到 `TARO_APP_SUPABASE_ANON_KEY`
- `service_role` key → **只能放在 Edge Function 环境变量**，前端绝不持有

## 后续扩展

- P2 期：Edge Function `wx-login`（微信 code 换 openid 并颁发 session）
- P4 期：Edge Function `trtc-usersig`（使用 SecretKey 签发 UserSig）
- P4 期：可能添加 `realtime` 配置以推送弹幕/参与者变更
