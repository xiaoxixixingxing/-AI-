import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import GatheringCard from '@/components/GatheringCard'
import VenueCard from '@/components/VenueCard'
import PlayerCard from '@/components/PlayerCard'
import { fetchGatheringList } from '@/services/gatherings'
import { searchVenues } from '@/services/venues'
import { searchPlayers } from '@/services/featured'
import type { Gathering, User, Venue } from '@/types/models'
import './index.scss'

type Tab = 'gathering' | 'venue' | 'player'

export default function Search() {
  const [keyword, setKeyword] = useState('')
  const [tab, setTab] = useState<Tab>('gathering')
  const [gatherings, setGatherings] = useState<Gathering[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [players, setPlayers] = useState<User[]>([])
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    const k = keyword.trim()
    if (!k) {
      Taro.showToast({ title: '请输入关键词', icon: 'none' })
      return
    }
    try {
      const [allGatherings, vs, ps] = await Promise.all([
        fetchGatheringList(),
        searchVenues(k),
        searchPlayers(k)
      ])
      setGatherings(allGatherings.filter((g) => g.title.includes(k)))
      setVenues(vs)
      setPlayers(ps)
      setSearched(true)
    } catch (err) {
      Taro.showToast({ title: (err as Error).message, icon: 'none' })
    }
  }

  const goPlayer = (userId: string) =>
    Taro.navigateTo({ url: `/pages/discover/index?id=${userId}` })

  const counts = {
    gathering: gatherings.length,
    venue: venues.length,
    player: players.length
  }

  return (
    <View className='page-search'>
      <View className='search-header'>
        <Input
          className='search-input'
          placeholder='搜索雅集 / 琴馆 / 琴师'
          value={keyword}
          confirmType='search'
          onInput={(e) => setKeyword(e.detail.value)}
          onConfirm={handleSearch}
        />
        <Text className='search-btn' onClick={handleSearch}>
          搜索
        </Text>
      </View>

      {searched && (
        <View className='tabs'>
          {(['gathering', 'venue', 'player'] as Tab[]).map((t) => (
            <View
              key={t}
              className={`tab ${tab === t ? 'tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              <Text>
                {t === 'gathering' ? '雅集' : t === 'venue' ? '琴馆' : '琴师'} ({counts[t]})
              </Text>
            </View>
          ))}
        </View>
      )}

      <ScrollView scrollY className='results'>
        {!searched ? (
          <View className='hint'>请输入关键词后点击搜索</View>
        ) : tab === 'gathering' ? (
          gatherings.length === 0 ? (
            <View className='hint'>未找到相关雅集</View>
          ) : (
            gatherings.map((g) => <GatheringCard key={g.id} gathering={g} />)
          )
        ) : tab === 'venue' ? (
          venues.length === 0 ? (
            <View className='hint'>未找到相关琴馆</View>
          ) : (
            venues.map((v) => <VenueCard key={v.id} venue={v} />)
          )
        ) : players.length === 0 ? (
          <View className='hint'>未找到相关琴师</View>
        ) : (
          <View className='player-grid'>
            {players.map((p) => (
              <PlayerCard key={p.id} player={p} onTap={() => goPlayer(p.id)} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
