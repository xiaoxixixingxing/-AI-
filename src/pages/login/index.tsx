import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useUserStore } from '@/stores/user'
import { sendSmsCode, signInWithSms, signInWithWeixin } from '@/services/auth'
import './index.scss'

export default function Login() {
  const setUser = useUserStore((s) => s.setUser)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [counting, setCounting] = useState(0)

  const handleSendCode = async () => {
    if (!/^1\d{10}$/.test(phone)) {
      Taro.showToast({ title: '请输入有效手机号', icon: 'none' })
      return
    }
    try {
      await sendSmsCode(phone)
      Taro.showToast({ title: '验证码已发送', icon: 'success' })
      setCounting(60)
      const timer = setInterval(() => {
        setCounting((c) => {
          if (c <= 1) {
            clearInterval(timer)
            return 0
          }
          return c - 1
        })
      }, 1000)
    } catch (err) {
      Taro.showToast({ title: (err as Error).message, icon: 'none' })
    }
  }

  const handleSmsLogin = async () => {
    if (!phone || !code) {
      Taro.showToast({ title: '请填写手机号和验证码', icon: 'none' })
      return
    }
    try {
      const u = await signInWithSms(phone, code)
      setUser(u)
      Taro.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 600)
    } catch (err) {
      Taro.showToast({ title: (err as Error).message, icon: 'none' })
    }
  }

  const handleWxLogin = async () => {
    try {
      const u = await signInWithWeixin()
      setUser(u)
      Taro.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 600)
    } catch (err) {
      Taro.showToast({ title: (err as Error).message, icon: 'none' })
    }
  }

  return (
    <View className='page-login'>
      <View className='brand'>
        <Text className='brand-title'>古琴云雅集</Text>
        <Text className='brand-sub'>登录后开启琴心之旅</Text>
      </View>
      <View className='form'>
        <Input
          className='input'
          placeholder='手机号'
          type='number'
          maxlength={11}
          value={phone}
          onInput={(e) => setPhone(e.detail.value)}
        />
        <View className='code-row'>
          <Input
            className='input code-input'
            placeholder='验证码'
            type='number'
            maxlength={6}
            value={code}
            onInput={(e) => setCode(e.detail.value)}
          />
          <Button
            className='btn-code'
            disabled={counting > 0}
            onClick={handleSendCode}
          >
            {counting > 0 ? `${counting}s` : '获取验证码'}
          </Button>
        </View>
        <Button className='btn-primary' onClick={handleSmsLogin}>
          手机号登录
        </Button>
        <View className='divider'>
          <Text>或</Text>
        </View>
        <Button className='btn-secondary' onClick={handleWxLogin}>
          微信一键登录
        </Button>
      </View>
      <Text className='tip'>登录后仅可使用小工具，报名雅集需完成身份认证。</Text>
    </View>
  )
}
