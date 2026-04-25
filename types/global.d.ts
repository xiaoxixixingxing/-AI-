/// <reference types="@tarojs/taro" />

declare const defineAppConfig: (config: unknown) => unknown
declare const definePageConfig: (config: unknown) => unknown

declare module '*.png'
declare module '*.gif'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'
declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.styl'

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_APP_SUPABASE_URL?: string
    TARO_APP_SUPABASE_ANON_KEY?: string
    NODE_ENV: 'development' | 'production'
  }
}
