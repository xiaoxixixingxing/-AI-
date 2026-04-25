export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/discover/index',
    'pages/tools/index',
    'pages/profile/index',
    'pages/login/index',
    'pages/gathering-detail/index',
    'pages/gathering-room/index',
    'pages/venue/index',
    'pages/venue-admin/index',
    'pages/host-console/index',
    'pages/admin/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1f1a17',
    navigationBarTitleText: '古琴云雅集',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#888888',
    selectedColor: '#b8860b',
    backgroundColor: '#fafafa',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '发现'
      },
      {
        pagePath: 'pages/tools/index',
        text: '雅器'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  },
  permission: {
    'scope.userLocation': {
      desc: '您的位置信息将用于发现附近的琴馆'
    },
    'scope.camera': {
      desc: '雅集房间需要使用摄像头进行视频演奏'
    },
    'scope.record': {
      desc: '雅集房间需要使用麦克风进行音频演奏'
    }
  },
  requiredPrivateInfos: ['getLocation'],
  lazyCodeLoading: 'requiredComponents'
})
