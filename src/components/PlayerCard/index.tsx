import { View, Text } from '@tarojs/components'
import type { User } from '@/types/models'
import './index.scss'

interface Props {
  player: User
  onTap?: () => void
}

export default function PlayerCard({ player, onTap }: Props) {
  return (
    <View className='card-player' onClick={onTap}>
      <View className='avatar'>{player.nickname?.[0] ?? '琴'}</View>
      <Text className='name'>{player.nickname ?? '琴友'}</Text>
      <Text className='bio' numberOfLines={1}>
        {player.bio ?? '一弦一柱思华年'}
      </Text>
    </View>
  )
}
