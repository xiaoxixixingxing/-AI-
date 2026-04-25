import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useUserStore } from '@/stores/user'
import './index.scss'

export default function Profile() {
  const { user, logout } = useUserStore()

  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' })
  }

  const navTo = (url: string) => () => Taro.navigateTo({ url })

  return (
    <View className='page-profile'>
      <View className='profile-header'>
        {user ? (
          <>
            <View className='avatar'>{user.nickname?.[0] ?? '琴'}</View>
            <Text className='nickname'>{user.nickname ?? '雅集琴友'}</Text>
            <Text className='role'>{user.role}</Text>
          </>
        ) : (
          <>
            <View className='avatar'>客</View>
            <Text className='nickname'>未登录</Text>
            <Button className='btn-login' onClick={handleLogin}>
              登录 / 注册
            </Button>
          </>
        )}
      </View>

      <View className='menu'>
        <View className='menu-item' onClick={navTo('/pages/registrations/index')}>
          <Text>我的报名</Text>
          <Text className='arrow'>›</Text>
        </View>
        <View className='menu-item' onClick={navTo('/pages/host-console/index')}>
          <Text>我的雅集（主持/琴馆）</Text>
          <Text className='arrow'>›</Text>
        </View>
        <View className='menu-item' onClick={navTo('/pages/venue-admin/index')}>
          <Text>琴馆管理</Text>
          <Text className='arrow'>›</Text>
        </View>
        <View className='menu-item' onClick={() => Taro.switchTab({ url: '/pages/tools/index' })}>
          <Text>雅器（小工具）</Text>
          <Text className='arrow'>›</Text>
        </View>
        <View className='menu-item' onClick={navTo('/pages/search/index')}>
          <Text>搜索</Text>
          <Text className='arrow'>›</Text>
        </View>
      </View>

      {user && (
        <Button className='btn-logout' onClick={logout}>
          退出登录
        </Button>
      )}
    </View>
  )
}
