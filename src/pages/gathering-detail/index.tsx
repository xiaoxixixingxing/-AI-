import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState, useCallback } from 'react'
import RegistrationSheet from '@/components/RegistrationSheet'
import {
  fetchGatheringById,
  fetchMyRegistrationFor,
  signupGathering
} from '@/services/gatherings'
import { fetchVenueById } from '@/services/venues'
import { useUserStore } from '@/stores/user'
import type {
  Gathering,
  Registration,
  RegistrationStatus,
  RegistrationType,
  Venue
} from '@/types/models'
import './index.scss'

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  pending: '审核中',
  approved: '已通过',
  rejected: '未通过',
  cancelled: '已取消'
}

export default function GatheringDetail() {
  const router = useRouter()
  const id = router.params.id ?? ''
  const user = useUserStore((s) => s.user)

  const [gathering, setGathering] = useState<Gathering | null>(null)
  const [venue, setVenue] = useState<Venue | null>(null)
  const [myReg, setMyReg] = useState<Registration | null>(null)
  const [sheetType, setSheetType] = useState<RegistrationType | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const g = await fetchGatheringById(id)
      setGathering(g)
      if (g) {
        const [v, r] = await Promise.all([
          fetchVenueById(g.venueId),
          user ? fetchMyRegistrationFor(g.id) : Promise.resolve(null)
        ])
        setVenue(v)
        setMyReg(r)
      }
    } catch (err) {
      Taro.showToast({ title: (err as Error).message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const requireAuth = (action: () => void) => {
    if (!user) {
      Taro.showModal({
        title: '请先登录',
        content: '报名前需先登录并完成身份认证',
        confirmText: '去登录',
        success: (r) => r.confirm && Taro.navigateTo({ url: '/pages/login/index' })
      })
      return
    }
    if (user.role === 'phone' || user.role === 'wx') {
      Taro.showModal({
        title: '请完成身份认证',
        content: '报名雅集需先完成实名/演奏资质认证。如需开通，请联系琴馆。',
        showCancel: false
      })
      return
    }
    action()
  }

  const handleSubmit = async (data: { program?: string; bio?: string }) => {
    if (!gathering || !sheetType) return
    try {
      await signupGathering({
        gatheringId: gathering.id,
        type: sheetType,
        program: data.program,
        bio: data.bio
      })
      Taro.showToast({ title: '报名已提交', icon: 'success' })
      setSheetType(null)
      await refresh()
    } catch (err) {
      Taro.showToast({ title: (err as Error).message, icon: 'none' })
    }
  }

  const enterRoom = () => {
    if (!gathering) return
    if (!myReg || myReg.status !== 'approved') {
      Taro.showToast({ title: '报名通过后方可进入', icon: 'none' })
      return
    }
    Taro.navigateTo({ url: `/pages/gathering-room/index?id=${gathering.id}` })
  }

  const goVenue = () => {
    if (venue) Taro.navigateTo({ url: `/pages/venue/index?id=${venue.id}` })
  }

  if (loading && !gathering) {
    return (
      <View className='page-detail'>
        <Text className='loading'>加载中…</Text>
      </View>
    )
  }
  if (!gathering) {
    return (
      <View className='page-detail'>
        <Text className='loading'>雅集不存在或已下线</Text>
      </View>
    )
  }

  const start = new Date(gathering.startAt)
  const dateText = `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 ${String(
    start.getHours()
  ).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
  const isFullPlayer = gathering.playerQuotaLeft <= 0
  const isFullAudience = gathering.audienceQuotaLeft <= 0

  return (
    <ScrollView scrollY className='page-detail'>
      <View className='cover'>
        <Text className='cover-title'>{gathering.title}</Text>
      </View>
      <View className='body'>
        {venue && (
          <View className='venue-row' onClick={goVenue}>
            <View className='venue-logo'>{venue.name?.[0] ?? '琴'}</View>
            <Text className='venue-name'>{venue.name}</Text>
            <Text className='venue-arrow'>›</Text>
          </View>
        )}
        <View className='info-row'>
          <Text className='info-icon'>◷</Text>
          <Text className='info-text'>{dateText}</Text>
        </View>
        <View className='info-row'>
          <Text className='info-icon'>◉</Text>
          <Text className='info-text'>
            演奏 {gathering.playerQuotaLeft}/{gathering.playerQuota} ・ 观摩{' '}
            {gathering.audienceQuotaLeft}/{gathering.audienceQuota}
          </Text>
        </View>

        <View className='section'>
          <Text className='section-title'>雅集简介</Text>
          <Text className='section-content'>{gathering.intro}</Text>
        </View>

        {gathering.programs && gathering.programs.length > 0 && (
          <View className='section'>
            <Text className='section-title'>曲目单</Text>
            <View className='programs'>
              {gathering.programs.map((p, i) => (
                <View key={p} className='program-tag'>
                  <Text className='program-idx'>{i + 1}</Text>
                  <Text className='program-name'>{p}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {myReg && myReg.status !== 'cancelled' && (
          <View className={`my-reg my-reg--${myReg.status}`}>
            <Text className='my-reg-label'>我的报名状态</Text>
            <Text className='my-reg-status'>
              {myReg.type === 'player' ? '演奏' : '观摩'} ・ {STATUS_LABEL[myReg.status]}
            </Text>
            {myReg.status === 'rejected' && myReg.rejectReason && (
              <Text className='my-reg-reason'>原因：{myReg.rejectReason}</Text>
            )}
          </View>
        )}
      </View>

      <View className='actions'>
        {gathering.status === 'cancelled' ? (
          <Text className='ended-tip'>本场雅集已取消</Text>
        ) : gathering.status === 'ended' ? (
          <Text className='ended-tip'>雅集已结束（回放即将上线）</Text>
        ) : myReg && myReg.status === 'approved' ? (
          <Button className='btn-enter' onClick={enterRoom}>
            进入雅集房间
          </Button>
        ) : myReg && myReg.status === 'pending' ? (
          <Button className='btn-disabled' disabled>
            等待审核中
          </Button>
        ) : (
          <>
            <Button
              className='btn-player'
              disabled={isFullPlayer}
              onClick={() => requireAuth(() => setSheetType('player'))}
            >
              {isFullPlayer ? '演奏满员' : '报名演奏'}
            </Button>
            <Button
              className='btn-audience'
              disabled={isFullAudience}
              onClick={() => requireAuth(() => setSheetType('audience'))}
            >
              {isFullAudience ? '观摩满员' : '报名观摩'}
            </Button>
          </>
        )}
      </View>

      <RegistrationSheet
        visible={sheetType !== null}
        type={sheetType ?? 'audience'}
        onClose={() => setSheetType(null)}
        onSubmit={handleSubmit}
      />
    </ScrollView>
  )
}
