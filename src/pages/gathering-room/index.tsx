import { View, Text } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import './index.scss'

export default function GatheringRoom() {
  const router = useRouter()
  const id = router.params.id ?? ''

  // TODO P4: 接入腾讯云 TRTC live-pusher / live-player
  // - 主持人视图：管理面板、上下台、屏幕共享、布局切换
  // - 演奏者视图：被邀请上台前仅观看
  // - 观摩者视图：仅观看 + 弹幕/点赞/献花
  return (
    <View className='page-room'>
      <View className='stage'>
        <Text className='placeholder'>视频雅集房间（TRTC 待集成）</Text>
        <Text className='gid'>gathering id: {id}</Text>
      </View>
      <View className='controls'>
        <Text className='hint'>主持/演奏/观摩 三视图将在 P4 期实现</Text>
      </View>
    </View>
  )
}
