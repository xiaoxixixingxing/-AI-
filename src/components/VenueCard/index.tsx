import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Venue } from '@/types/models'
import './index.scss'

interface Props {
  venue: Venue
}

export default function VenueCard({ venue }: Props) {
  const handleTap = () => {
    Taro.navigateTo({ url: `/pages/venue/index?id=${venue.id}` })
  }
  return (
    <View className='card-venue' onClick={handleTap}>
      <View className='logo'>{venue.name?.[0] ?? '琴'}</View>
      <View className='body'>
        <Text className='name'>{venue.name}</Text>
        <Text className='intro'>{venue.intro ?? '一处雅集之所'}</Text>
      </View>
    </View>
  )
}
