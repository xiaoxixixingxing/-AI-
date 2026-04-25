import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import { useState } from 'react'
import GatheringCard from '@/components/GatheringCard'
import VenueCard from '@/components/VenueCard'
import PlayerCard from '@/components/PlayerCard'
import { fetchGatheringList } from '@/services/gatherings'
import { fetchVenueList } from '@/services/venues'
import { fetchFeaturedPlayers } from '@/services/featured'
import type { Gathering, User, Venue } from '@/types/models'
import './index.scss'

export default function Discover() {
  const [gatherings, setGatherings] = useState<Gathering[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [players, setPlayers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [g, v, p] = await Promise.all([
        fetchGatheringList(),
        fetchVenueList(),
        fetchFeaturedPlayers()
      ])
      setGatherings(g)
      setVenues(v)
      setPlayers(p)
    } catch (err) {
      Taro.showToast({ title: (err as Error).message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useDidShow(() => {
    loadAll()
  })

  usePullDownRefresh(async () => {
    await loadAll()
    Taro.stopPullDownRefresh()
  })

  const goSearch = () => Taro.navigateTo({ url: '/pages/search/index' })
  const goPlayer = (id: string) =>
    Taro.navigateTo({ url: `/pages/discover/index?id=${id}` })

  return (
    <ScrollView scrollY className='page-discover'>
      <View className='hero'>
        <Text className='hero-title'>古琴云雅集</Text>
        <Text className='hero-sub'>琴心一片，云端共鸣</Text>
        <View className='search-bar' onClick={goSearch}>
          <Text className='search-icon'>⌕</Text>
          <Text className='search-placeholder'>搜索雅集 / 琴馆 / 琴师</Text>
        </View>
      </View>

      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>雅集预告</Text>
        </View>
        {loading && gatherings.length === 0 ? (
          <View className='empty'>加载中…</View>
        ) : gatherings.length === 0 ? (
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

      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>人才发现</Text>
        </View>
        {players.length === 0 ? (
          <View className='empty'>暂无推荐</View>
        ) : (
          <ScrollView scrollX className='player-row' enableFlex>
            {players.map((p) => (
              <PlayerCard key={p.id} player={p} onTap={() => goPlayer(p.id)} />
            ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  )
}
