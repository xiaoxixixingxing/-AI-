import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { cancelRegistration, fetchMyRegistrations, fetchGatheringById } from '@/services/gatherings'
import type { Gathering, Registration, RegistrationStatus } from '@/types/models'
import './index.scss'

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  pending: '审核中',
  approved: '已通过',
  rejected: '未通过',
  cancelled: '已取消'
}

interface Row {
  reg: Registration
  gathering: Gathering | null
}

export default function MyRegistrations() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const regs = await fetchMyRegistrations()
      const enriched = await Promise.all(
        regs.map(async (r) => ({ reg: r, gathering: await fetchGatheringById(r.gatheringId) }))
      )
      setRows(enriched)
    } catch (err) {
      Taro.showToast({ title: (err as Error).message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useDidShow(() => {
    load()
  })

  const goDetail = (id: string) =>
    Taro.navigateTo({ url: `/pages/gathering-detail/index?id=${id}` })

  const handleCancel = (id: string) => {
    Taro.showModal({
      title: '确认取消报名？',
      content: '取消后名额将释放给他人',
      success: async (r) => {
        if (!r.confirm) return
        try {
          await cancelRegistration(id)
          Taro.showToast({ title: '已取消', icon: 'success' })
          await load()
        } catch (err) {
          Taro.showToast({ title: (err as Error).message, icon: 'none' })
        }
      }
    })
  }

  if (loading) {
    return (
      <View className='page-regs'>
        <Text className='hint'>加载中…</Text>
      </View>
    )
  }
  if (rows.length === 0) {
    return (
      <View className='page-regs'>
        <Text className='hint'>暂无报名记录</Text>
      </View>
    )
  }

  return (
    <ScrollView scrollY className='page-regs'>
      {rows.map(({ reg, gathering }) => (
        <View key={reg.id} className='reg-card' onClick={() => gathering && goDetail(gathering.id)}>
          <View className='reg-header'>
            <Text className='reg-title'>
              {gathering?.title ?? '雅集'}
            </Text>
            <Text className={`reg-status reg-status--${reg.status}`}>
              {STATUS_LABEL[reg.status]}
            </Text>
          </View>
          <Text className='reg-meta'>
            {reg.type === 'player' ? '演奏报名' : '观摩报名'}
            {reg.program ? ` ・ ${reg.program}` : ''}
          </Text>
          {reg.status === 'rejected' && reg.rejectReason && (
            <Text className='reg-reason'>原因：{reg.rejectReason}</Text>
          )}
          {(reg.status === 'pending' || reg.status === 'approved') && (
            <Button
              className='btn-cancel'
              size='mini'
              onClick={(e) => {
                e.stopPropagation()
                handleCancel(reg.id)
              }}
            >
              取消报名
            </Button>
          )}
        </View>
      ))}
    </ScrollView>
  )
}
