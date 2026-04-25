// 运行时环境探测
// 凭据未配置时进入 mock 模式，便于无后端时开发 UI

export function isMockMode(): boolean {
  const url = process.env.TARO_APP_SUPABASE_URL
  return !url || url === 'https://your-project.supabase.co'
}
