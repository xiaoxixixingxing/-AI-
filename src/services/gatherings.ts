import type { Gathering, Registration, RegistrationType } from '@/types/models'
import { getSupabase } from './supabase'

export async function fetchGatheringList(): Promise<Gathering[]> {
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
  const sb = getSupabase()
  const { data, error } = await sb.from('gatherings').select('*').eq('id', id).single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data as unknown as Gathering
}

export interface SignupParams {
  gatheringId: string
  type: RegistrationType
  program?: string
  bio?: string
}

export async function signupGathering(params: SignupParams): Promise<Registration> {
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
  const sb = getSupabase()
  const { data, error } = await sb
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Registration[]
}
