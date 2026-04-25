import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { fetchGatheringById } from '@/services/gatherings'
import { useUserStore } from '@/stores/user'
import type { Gathering } from '@/types/models'
import './index.scss'

export default function GatheringDetail() {
  const router = useRouter()
  const id = router.params.id ?? ''
  const user = useUserStore((s) => s.user)
  const [gathering, setGathering] = useState<Gathering | null>(null)

  useEffect(() => {
    if (!id) return
    fetchGatheringById(id).then(setGathering).catch(() => setGathering(null))
  }, [id])

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
      Taro.showToast({ title: '请先完成身份认证', icon: 'none' })
      return
    }
    action()
  }

  const handleSignupPlayer = () => requireAuth(() => {
    // TODO P2: 跳转报名演奏表单
    Taro.showToast({ title: '报名演奏 - 待实现', icon: 'none' })
  })
  const handleSignupAudience = () => requireAuth(() => {
    // TODO P2: 直接提交观摩报名
    Taro.showToast({ title: '报名观摩 - 待实现', icon: 'none' })
  })
  const handleEnterRoom = () => {
    if (!gathering) return
    Taro.navigateTo({ url: `/pages/gathering-room/index?id=${gathering.id}` })
  }

  if (!gathering) {
    return (
      <View className='page-detail'>
        <Text className='loading'>加载中…</Text>
      </View>
    )
  }

  return (
    <View className='page-detail'>
      <View className='cover' />
      <View className='body'>
        <Text className='title'>{gathering.title}</Text>
        <Text className='time'>{new Date(gathering.startAt).toLocaleString()}</Text>
        <Text className='intro'>{gathering.intro}</Text>
        <View className='quota'>
          <Text>演奏名额：{gathering.playerQuotaLeft}/{gathering.playerQuota}</Text>
          <Text>观摩名额：{gathering.audienceQuotaLeft}/{gathering.audienceQuota}</Text>
        </View>
      </View>
      <View className='actions'>
        {gathering.status === 'upcoming' && (
          <>
            <Button className='btn-player' onClick={handleSignupPlayer}>报名演奏</Button>
            <Button className='btn-audience' onClick={handleSignupAudience}>报名观摩</Button>
          </>
        )}
        {gathering.status === 'ongoing' && (
          <Button className='btn-enter' onClick={handleEnterRoom}>进入雅集</Button>
        )}
        {gathering.status === 'ended' && (
          <Text className='ended-tip'>雅集已结束（回放即将上线）</Text>
        )}
      </View>
    </View>
  )
}
