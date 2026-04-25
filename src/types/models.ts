// 古琴云雅集 - 领域模型定义

export type UserRole =
  | 'guest'      // 游客（未登录）— 通常不会进入数据库
  | 'phone'      // 手机号注册用户
  | 'wx'         // 微信快捷登录用户
  | 'player'     // 已认证演奏者
  | 'audience'   // 已认证观摩演员
  | 'host'       // 主持方
  | 'venue_admin' // 琴馆管理员
  | 'sys_admin'  // 系统管理员

export interface User {
  id: string
  nickname?: string
  avatar?: string
  phone?: string
  openid?: string
  role: UserRole
  realName?: string
  bio?: string
  certifiedAt?: string
}

export interface Venue {
  id: string
  name: string
  logo?: string
  intro?: string
  contact?: string
  address?: string
  ownerId: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export type GatheringStatus = 'upcoming' | 'ongoing' | 'ended' | 'cancelled'

export interface Gathering {
  id: string
  venueId: string
  hostId: string
  title: string
  cover?: string
  startAt: string
  intro: string
  programs?: string[]   // 曲目单
  playerQuota: number
  playerQuotaLeft: number
  audienceQuota: number
  audienceQuotaLeft: number
  status: GatheringStatus
  trtcRoomId?: number
  createdAt: string
}

export type RegistrationType = 'player' | 'audience'
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface Registration {
  id: string
  gatheringId: string
  userId: string
  type: RegistrationType
  program?: string
  bio?: string
  status: RegistrationStatus
  orderIndex?: number   // 演奏顺序（已通过的演奏者）
  rejectReason?: string
  reviewedAt?: string
  createdAt: string
}

export type ParticipantRole = 'host' | 'player' | 'audience'
export type ParticipantOnStageStatus = 'off' | 'on'

export interface Participant {
  id: string
  gatheringId: string
  userId: string
  role: ParticipantRole
  onStage: ParticipantOnStageStatus
  cameraOn: boolean
  micOn: boolean
  joinedAt: string
}

export interface DanmakuMessage {
  id: string
  gatheringId: string
  userId: string
  content: string
  createdAt: string
}
