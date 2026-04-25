import { getSupabase } from './supabase'

export interface TRTCConfig {
  sdkAppId: number
  userId: string
  userSig: string
  roomId: number
  pushUrl: string
  playUrl: string
}

// UserSig 必须由后端生成（Edge Function: trtc-usersig），前端绝不持有 SecretKey
export async function getTRTCConfig(gatheringId: string, role: 'host' | 'player' | 'audience'): Promise<TRTCConfig> {
  const sb = getSupabase()
  const { data, error } = await sb.functions.invoke('trtc-usersig', {
    body: { gatheringId, role }
  })
  if (error) throw new Error(error.message)
  return data as TRTCConfig
}
