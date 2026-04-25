import { createClient, SupabaseClient } from '@supabase/supabase-js'
import Taro from '@tarojs/taro'

// 凭据通过编译期注入或运行时配置；请勿硬编码到仓库
const SUPABASE_URL = process.env.TARO_APP_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.TARO_APP_SUPABASE_ANON_KEY ?? ''

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase 凭据未配置：请在 .env 中设置 TARO_APP_SUPABASE_URL / TARO_APP_SUPABASE_ANON_KEY')
  }
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: {
        getItem: (key) => Taro.getStorageSync(key) ?? null,
        setItem: (key, value) => Taro.setStorageSync(key, value),
        removeItem: (key) => Taro.removeStorageSync(key)
      }
    }
  })
  return client
}
