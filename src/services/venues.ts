import type { Venue } from '@/types/models'
import { isMockMode } from '@/utils/env'
import { findVenue, mockVenues } from './_mock/fixtures'
import { getSupabase } from './supabase'

export async function fetchVenueList(): Promise<Venue[]> {
  if (isMockMode()) return mockVenues
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
  if (isMockMode()) return findVenue(id)
  const sb = getSupabase()
  const { data, error } = await sb.from('venues').select('*').eq('id', id).single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data as unknown as Venue
}

export async function searchVenues(keyword: string): Promise<Venue[]> {
  if (isMockMode()) {
    if (!keyword) return []
    return mockVenues.filter((v) => v.name.includes(keyword))
  }
  const sb = getSupabase()
  const { data, error } = await sb
    .from('venues')
    .select('*')
    .ilike('name', `%${keyword}%`)
    .eq('status', 'approved')
    .limit(20)
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Venue[]
}
