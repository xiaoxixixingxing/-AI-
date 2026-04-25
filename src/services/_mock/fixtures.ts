// Mock 数据：仅在 isMockMode() === true 时启用
import type { Gathering, Registration, User, Venue } from '@/types/models'

const now = Date.now()
const day = 24 * 60 * 60 * 1000

export const mockUsers: User[] = [
  { id: 'u-001', nickname: '止庵', role: 'player', bio: '习琴十年，私淑虞山派', certifiedAt: new Date(now - 30 * day).toISOString() },
  { id: 'u-002', nickname: '清韵', role: 'player', bio: '以琴养气，喜《平沙落雁》' },
  { id: 'u-003', nickname: '听雪', role: 'audience' },
  { id: 'u-host', nickname: '伯牙', role: 'host' },
  { id: 'u-venue', nickname: '广陵琴馆', role: 'venue_admin' }
]

export const mockVenues: Venue[] = [
  {
    id: 'v-001',
    name: '广陵琴馆',
    intro: '承袭广陵派古琴艺术，常年举办雅集与公益讲座',
    contact: '0511-xxxxxxxx',
    address: '江苏省扬州市瘦西湖畔',
    ownerId: 'u-venue',
    status: 'approved',
    createdAt: new Date(now - 200 * day).toISOString()
  },
  {
    id: 'v-002',
    name: '虞山琴社',
    intro: '虞山派传承，温润敦厚，重在修心',
    contact: '0512-xxxxxxxx',
    address: '江苏省常熟市虞山脚下',
    ownerId: 'u-venue',
    status: 'approved',
    createdAt: new Date(now - 180 * day).toISOString()
  },
  {
    id: 'v-003',
    name: '九嶷琴轩',
    intro: '九嶷派古琴研习社，承管平湖先生琴学',
    contact: '010-xxxxxxxx',
    address: '北京市东城区',
    ownerId: 'u-venue',
    status: 'approved',
    createdAt: new Date(now - 150 * day).toISOString()
  }
]

export const mockGatherings: Gathering[] = [
  {
    id: 'g-001',
    venueId: 'v-001',
    hostId: 'u-host',
    title: '清明春雅·琴韵流芳',
    cover: '',
    startAt: new Date(now + 2 * day).toISOString(),
    intro: '清明时节，邀诸位琴友云端共赏。本次雅集以《平沙落雁》《梅花三弄》《阳关三叠》为主题曲目。',
    programs: ['平沙落雁', '梅花三弄', '阳关三叠'],
    playerQuota: 6,
    playerQuotaLeft: 3,
    audienceQuota: 50,
    audienceQuotaLeft: 28,
    status: 'upcoming',
    createdAt: new Date(now - 5 * day).toISOString()
  },
  {
    id: 'g-002',
    venueId: 'v-002',
    hostId: 'u-host',
    title: '虞山月夜雅集',
    cover: '',
    startAt: new Date(now + 5 * day).toISOString(),
    intro: '夜静琴心，共话流水高山。',
    programs: ['流水', '潇湘水云'],
    playerQuota: 4,
    playerQuotaLeft: 2,
    audienceQuota: 30,
    audienceQuotaLeft: 15,
    status: 'upcoming',
    createdAt: new Date(now - 3 * day).toISOString()
  },
  {
    id: 'g-003',
    venueId: 'v-003',
    hostId: 'u-host',
    title: '九嶷雅集·琴道初心',
    cover: '',
    startAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
    intro: '九嶷派传承公开雅集，正在进行中。',
    programs: ['普庵咒', '良宵引'],
    playerQuota: 5,
    playerQuotaLeft: 0,
    audienceQuota: 60,
    audienceQuotaLeft: 12,
    status: 'ongoing',
    createdAt: new Date(now - 7 * day).toISOString()
  },
  {
    id: 'g-004',
    venueId: 'v-001',
    hostId: 'u-host',
    title: '广陵冬至雅集（已结束）',
    cover: '',
    startAt: new Date(now - 30 * day).toISOString(),
    intro: '冬至岁朝，琴心团圆。',
    programs: ['梅花三弄'],
    playerQuota: 5,
    playerQuotaLeft: 0,
    audienceQuota: 40,
    audienceQuotaLeft: 0,
    status: 'ended',
    createdAt: new Date(now - 60 * day).toISOString()
  }
]

// 当前用户的报名（mock 模式下默认未登录或未报名）
export const mockRegistrations: Registration[] = []

export function findVenue(id: string): Venue | null {
  return mockVenues.find((v) => v.id === id) ?? null
}
export function findGathering(id: string): Gathering | null {
  return mockGatherings.find((g) => g.id === id) ?? null
}
export function gatheringsOfVenue(venueId: string): Gathering[] {
  return mockGatherings.filter((g) => g.venueId === venueId)
}
