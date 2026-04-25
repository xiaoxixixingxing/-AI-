import type { User, UserRole } from '@/types/models'

// 是否可使用小工具：登录后即可（手机号/微信/演奏者/观摩/主持/琴馆/系统管理员）
export function canUseTools(user: User | null): boolean {
  return !!user
}

// 是否可报名雅集：必须为已认证身份
export function canSignupGathering(user: User | null): boolean {
  if (!user) return false
  return ['player', 'audience', 'host', 'venue_admin', 'sys_admin'].includes(user.role)
}

// 是否可进入雅集房间（需配合该用户在该雅集的报名状态）
export function canEnterRoom(user: User | null): boolean {
  if (!user) return false
  return ['player', 'audience', 'host', 'venue_admin', 'sys_admin'].includes(user.role)
}

export function isAdmin(role: UserRole): boolean {
  return role === 'sys_admin'
}
export function isVenueAdmin(role: UserRole): boolean {
  return role === 'venue_admin'
}
export function isHost(role: UserRole): boolean {
  return role === 'host'
}
