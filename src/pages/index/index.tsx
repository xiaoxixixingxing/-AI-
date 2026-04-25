import { View, Text, ScrollView } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import GatheringCard from '@/components/GatheringCard'
import VenueCard from '@/components/VenueCard'
import type { Gathering, Venue } from '@/types/models'
import './index.scss'

export default function Discover() {
  const [gatherings, setGatherings] = useState<Gathering[]>([])
  const [venues, setVenues] = useState<Venue[]>([])

  useDidShow(() => {
    // TODO P2: 接入 Supabase 拉取雅集预告与琴馆列表
    setGatherings([])
    setVenues([])
  })

  return (
    <ScrollView scrollY className='page-discover'>
      <View className='hero'>
        <Text className='hero-title'>古琴云雅集</Text>
        <Text className='hero-sub'>琴心一片，云端共鸣</Text>
      </View>

      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>雅集预告</Text>
        </View>
        {gatherings.length === 0 ? (
          <View className='empty'>暂无雅集预告</View>
        ) : (
          gatherings.map((g) => <GatheringCard key={g.id} gathering={g} />)
        )}
      </View>

      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>琴馆推荐</Text>
        </View>
        {venues.length === 0 ? (
          <View className='empty'>暂无琴馆</View>
        ) : (
          venues.map((v) => <VenueCard key={v.id} venue={v} />)
        )}
      </View>
    </ScrollView>
  )
}
