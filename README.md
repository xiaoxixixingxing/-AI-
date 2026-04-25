# 古琴云雅集

一款面向古琴文化爱好者、琴馆及演奏者的微信小程序，支持线上视频雅集的发布、报名、主持与观摩。

## 技术栈

- **前端**：Taro 4 + React 18 + TypeScript
- **状态管理**：Zustand
- **后端**：Supabase（PostgreSQL + Auth + Edge Functions + Storage）
- **音视频**：腾讯云 TRTC（小程序 `live-pusher` / `live-player`）
- **样式**：SCSS

## 目录结构

```
.
├── config/                  # Taro 编译配置
├── src/
│   ├── pages/               # 页面（每个页面一个目录）
│   ├── components/          # 复用组件
│   ├── services/            # API 客户端（Supabase / TRTC）
│   ├── stores/              # Zustand 状态
│   ├── types/               # TS 类型定义
│   ├── utils/               # 工具函数
│   ├── app.tsx / app.config.ts / app.scss
│   └── index.html
├── types/global.d.ts
├── package.json
├── tsconfig.json
├── .eslintrc.js
└── project.config.json      # 微信小程序项目配置
```

## 开发路线（分期）

| 期 | 范围 |
|---|---|
| **P1**（当前） | 项目骨架、tabBar、登录/注册、Supabase 客户端、用户角色 |
| **P2** | 首页发现流、雅集详情、报名流程、琴馆主页 |
| **P3** | 琴馆管理、报名审核、主持方控制台、演奏顺序 |
| **P4** | TRTC 视频房间（推流/拉流、上下台、弹幕/敏感词） |
| **P5** | 系统管理后台、小工具内容、回放 |

## 环境配置

```bash
cp .env.example .env.local
# 填入 Supabase URL 与 anon key
npm install
npm run dev:weapp
```

构建产物在 `dist/`，用微信开发者工具打开 `dist/` 即可预览。

## 凭据安全

- 前端 `.env.local` 仅放 Supabase **anon key**（公开 key，配合 RLS 限制权限）
- TRTC `SecretKey`、Supabase `service_role` key **只能放在 Supabase Edge Function 的环境变量里**
- `.env*` 已加入 `.gitignore`，请勿提交到仓库

## legacy/

旧的 XGBoost 比赛资料保留在 `legacy/` 目录，与本项目无关，可随时删除。
