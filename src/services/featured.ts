import type { User } from '@/types/models'
import { isMockMode } from '@/utils/env'
import { mockUsers } from './_mock/fixtures'
import { getSupabase } from './supabase'

export async function fetchFeaturedPlayers(): Promise<User[]> {
  if (isMockMode()) {
    return mockUsers.filter((u) => u.role === 'player')
  }
  const sb = getSupabase()
  const { data, error } = await sb
    .from('featured_players')
    .select('*, user:profiles!featured_players_user_id_fkey(*)')
    .eq('active', true)
    .order('weight', { ascending: false })
    .limit(20)
  if (error) throw new Error(error.message)
  return ((data ?? []) as Array<{ user: User }>).map((row) => row.user)
}

export async function searchPlayers(keyword: string): Promise<User[]> {
  if (isMockMode()) {
    if (!keyword) return []
    return mockUsers.filter(
      (u) => (u.role === 'player' || u.role === 'host') && (u.nickname?.includes(keyword) ?? false)
    )
  }
  const sb = getSupabase()
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .ilike('nickname', `%${keyword}%`)
    .in('role', ['player', 'host'])
    .limit(20)
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as User[]
}
