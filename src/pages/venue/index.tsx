import { View, Text } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'

export default function VenueHome() {
  const router = useRouter()
  const id = router.params.id ?? ''
  // TODO P2: 拉取琴馆详情、所发布雅集、推荐演奏者
  return (
    <View>
      <Text>琴馆主页（占位） id={id}</Text>
    </View>
  )
}
