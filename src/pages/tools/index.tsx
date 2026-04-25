import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useUserStore } from '@/stores/user'
import './index.scss'

interface ToolItem {
  key: string
  name: string
  desc: string
}

const tools: ToolItem[] = [
  { key: 'tuner', name: '调音器', desc: '七弦音准校验' },
  { key: 'metronome', name: '节拍器', desc: '雅集节奏伴练' },
  { key: 'score', name: '曲谱查阅', desc: '减字谱速查' }
]

export default function Tools() {
  const user = useUserStore((s) => s.user)

  const handleTap = (key: string) => {
    if (!user) {
      Taro.showModal({
        title: '请先登录',
        content: '小工具需登录后使用',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) Taro.navigateTo({ url: '/pages/login/index' })
        }
      })
      return
    }
    // TODO P5: 进入对应小工具子页
    Taro.showToast({ title: `${key} 待开发`, icon: 'none' })
  }

  return (
    <View className='page-tools'>
      <View className='page-header'>
        <Text className='page-title'>雅器</Text>
        <Text className='page-sub'>琴人之器，调心调律</Text>
      </View>
      <View className='tool-grid'>
        {tools.map((t) => (
          <View key={t.key} className='tool-card' onClick={() => handleTap(t.key)}>
            <Text className='tool-name'>{t.name}</Text>
            <Text className='tool-desc'>{t.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
