import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { User } from '@/types/models'
import { signOut } from '@/services/auth'

interface UserState {
  user: User | null
  setUser: (u: User | null) => void
  loadFromStorage: () => void
  logout: () => Promise<void>
}

const STORAGE_KEY = 'guqin_user'

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => {
    if (user) Taro.setStorageSync(STORAGE_KEY, user)
    else Taro.removeStorageSync(STORAGE_KEY)
    set({ user })
  },
  loadFromStorage: () => {
    const cached = Taro.getStorageSync(STORAGE_KEY) as User | undefined
    if (cached) set({ user: cached })
  },
  logout: async () => {
    try {
      await signOut()
    } catch {
      // 忽略远端登出失败，本地仍要清状态
    }
    Taro.removeStorageSync(STORAGE_KEY)
    set({ user: null })
  }
}))
