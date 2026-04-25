import type { Gathering, Registration, RegistrationType } from '@/types/models'
import { isMockMode } from '@/utils/env'
import { findGathering, mockGatherings, mockRegistrations } from './_mock/fixtures'
import { getSupabase } from './supabase'

export async function fetchGatheringList(): Promise<Gathering[]> {
  if (isMockMode()) {
    return mockGatherings
      .filter((g) => g.status === 'upcoming' || g.status === 'ongoing')
      .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt))
  }
  const sb = getSupabase()
  const { data, error } = await sb
    .from('gatherings')
    .select('*')
    .in('status', ['upcoming', 'ongoing'])
    .order('start_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Gathering[]
}

export async function fetchGatheringById(id: string): Promise<Gathering | null> {
  if (isMockMode()) return findGathering(id)
  const sb = getSupabase()
  const { data, error } = await sb.from('gatherings').select('*').eq('id', id).single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data as unknown as Gathering
}

export async function fetchGatheringsByVenue(venueId: string): Promise<Gathering[]> {
  if (isMockMode()) {
    return mockGatherings
      .filter((g) => g.venueId === venueId)
      .sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt))
  }
  const sb = getSupabase()
  const { data, error } = await sb
    .from('gatherings')
    .select('*')
    .eq('venue_id', venueId)
    .order('start_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Gathering[]
}

export interface SignupParams {
  gatheringId: string
  type: RegistrationType
  program?: string
  bio?: string
}

export async function signupGathering(params: SignupParams): Promise<Registration> {
  if (isMockMode()) {
    const reg: Registration = {
      id: `r-${Date.now()}`,
      gatheringId: params.gatheringId,
      userId: 'u-mock-current',
      type: params.type,
      program: params.program,
      bio: params.bio,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    mockRegistrations.push(reg)
    return reg
  }
  const sb = getSupabase()
  const { data, error } = await sb
    .from('registrations')
    .insert({
      gathering_id: params.gatheringId,
      type: params.type,
      program: params.program,
      bio: params.bio,
      status: 'pending'
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as unknown as Registration
}

export async function fetchMyRegistrations(): Promise<Registration[]> {
  if (isMockMode()) {
    return [...mockRegistrations].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    )
  }
  const sb = getSupabase()
  const { data, error } = await sb
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Registration[]
}

export async function cancelRegistration(id: string): Promise<void> {
  if (isMockMode()) {
    const r = mockRegistrations.find((x) => x.id === id)
    if (r) r.status = 'cancelled'
    return
  }
  const sb = getSupabase()
  const { error } = await sb.from('registrations').update({ status: 'cancelled' }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchMyRegistrationFor(gatheringId: string): Promise<Registration | null> {
  if (isMockMode()) {
    return (
      mockRegistrations.find(
        (r) => r.gatheringId === gatheringId && r.status !== 'cancelled'
      ) ?? null
    )
  }
  const sb = getSupabase()
  const { data, error } = await sb
    .from('registrations')
    .select('*')
    .eq('gathering_id', gatheringId)
    .neq('status', 'cancelled')
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as unknown as Registration) ?? null
}
