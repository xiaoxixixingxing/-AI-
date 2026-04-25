import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Gathering } from '@/types/models'
import './index.scss'

interface Props {
  gathering: Gathering
}

export default function GatheringCard({ gathering }: Props) {
  const handleTap = () => {
    Taro.navigateTo({ url: `/pages/gathering-detail/index?id=${gathering.id}` })
  }
  const start = new Date(gathering.startAt)
  const dateText = `${start.getMonth() + 1}月${start.getDate()}日 ${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`

  return (
    <View className='card-gathering' onClick={handleTap}>
      <View className='cover' />
      <View className='body'>
        <Text className='title'>{gathering.title}</Text>
        <Text className='time'>{dateText}</Text>
        <View className='quota'>
          <Text className='quota-tag'>演奏 {gathering.playerQuotaLeft}/{gathering.playerQuota}</Text>
          <Text className='quota-tag'>观摩 {gathering.audienceQuotaLeft}/{gathering.audienceQuota}</Text>
        </View>
      </View>
    </View>
  )
}
