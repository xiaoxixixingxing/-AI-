import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import GatheringCard from '@/components/GatheringCard'
import { fetchGatheringsByVenue } from '@/services/gatherings'
import { fetchVenueById } from '@/services/venues'
import type { Gathering, Venue } from '@/types/models'
import './index.scss'

export default function VenueHome() {
  const router = useRouter()
  const id = router.params.id ?? ''
  const [venue, setVenue] = useState<Venue | null>(null)
  const [gatherings, setGatherings] = useState<Gathering[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    if (!id) return
    setLoading(true)
    Promise.all([fetchVenueById(id), fetchGatheringsByVenue(id)])
      .then(([v, gs]) => {
        setVenue(v)
        setGatherings(gs)
      })
      .catch((err) => Taro.showToast({ title: (err as Error).message, icon: 'none' }))
      .finally(() => setLoading(false))
  })

  if (loading) {
    return (
      <View className='page-venue'>
        <Text className='loading'>加载中…</Text>
      </View>
    )
  }
  if (!venue) {
    return (
      <View className='page-venue'>
        <Text className='loading'>琴馆不存在</Text>
      </View>
    )
  }

  const upcoming = gatherings.filter((g) => g.status === 'upcoming' || g.status === 'ongoing')
  const past = gatherings.filter((g) => g.status === 'ended' || g.status === 'cancelled')

  return (
    <ScrollView scrollY className='page-venue'>
      <View className='header'>
        <View className='logo'>{venue.name?.[0] ?? '琴'}</View>
        <Text className='name'>{venue.name}</Text>
        <Text className='intro'>{venue.intro}</Text>
        <View className='meta'>
          {venue.address && <Text className='meta-item'>📍 {venue.address}</Text>}
          {venue.contact && <Text className='meta-item'>☎ {venue.contact}</Text>}
        </View>
      </View>

      <View className='section'>
        <Text className='section-title'>近期雅集</Text>
        {upcoming.length === 0 ? (
          <View className='empty'>暂无近期雅集</View>
        ) : (
          upcoming.map((g) => <GatheringCard key={g.id} gathering={g} />)
        )}
      </View>

      {past.length > 0 && (
        <View className='section'>
          <Text className='section-title'>往期雅集</Text>
          {past.map((g) => (
            <GatheringCard key={g.id} gathering={g} />
          ))}
        </View>
      )}
    </ScrollView>
  )
}
