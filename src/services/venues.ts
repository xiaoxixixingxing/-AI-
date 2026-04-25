import type { Venue } from '@/types/models'
import { getSupabase } from './supabase'

export async function fetchVenueList(): Promise<Venue[]> {
  const sb = getSupabase()
  const { data, error } = await sb
    .from('venues')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Venue[]
}

export async function fetchVenueById(id: string): Promise<Venue | null> {
  const sb = getSupabase()
  const { data, error } = await sb.from('venues').select('*').eq('id', id).single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data as unknown as Venue
}
