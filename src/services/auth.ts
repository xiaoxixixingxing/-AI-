import Taro from '@tarojs/taro'
import type { User } from '@/types/models'
import { getSupabase } from './supabase'

export async function sendSmsCode(phone: string): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb.auth.signInWithOtp({ phone })
  if (error) throw new Error(error.message)
}

export async function signInWithSms(phone: string, code: string): Promise<User> {
  const sb = getSupabase()
  const { data, error } = await sb.auth.verifyOtp({ phone, token: code, type: 'sms' })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('登录失败')
  return mapToUser(data.user)
}

export async function signInWithWeixin(): Promise<User> {
  // 微信小程序登录需要：
  // 1) wx.login() 拿 code
  // 2) 调用 Edge Function /wx-login，后端用 code 换 openid + 颁发 Supabase session
  const { code } = await Taro.login()
  if (!code) throw new Error('微信授权失败')
  const sb = getSupabase()
  const { data, error } = await sb.functions.invoke('wx-login', { body: { code } })
  if (error) throw new Error(error.message)
  return data as User
}

export async function signOut(): Promise<void> {
  const sb = getSupabase()
  await sb.auth.signOut()
}

function mapToUser(authUser: { id: string; phone?: string; user_metadata?: Record<string, unknown> }): User {
  const meta = authUser.user_metadata ?? {}
  return {
    id: authUser.id,
    phone: authUser.phone,
    nickname: typeof meta.nickname === 'string' ? meta.nickname : undefined,
    avatar: typeof meta.avatar === 'string' ? meta.avatar : undefined,
    role: 'phone'
  }
}
