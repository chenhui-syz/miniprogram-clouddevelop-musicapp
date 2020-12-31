// components/process-bar/process-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
// 取到唯一背景音乐的变量
const backgroundAudioManager = wx.getBackgroundAudioManager()
// 当前的秒数
let currentSec = -1
// 当前歌曲的总时长(秒)
let duration = 0
//锁,表示当前的进度条是否在拖拽
let isMoving = false
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame:Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    movableDis: 0,
    progress: 0,
  },
  lifetimes: {
    ready() {
      if(this.properties.isSame && this.data.showTime.totalTime =='00:00'){
        this._setTime()
      }
      this._getMovableDis()
      this._bindBgmEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event) {
      // 拖动
      if (event.detail.source == 'touch') {
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
      }
    },
    onTouchEnd() {
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec
      })
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    },
    _getMovableDis() {
      // 获取当前元素的一些数据，如果是pages里，则用wx.
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      // 将获取到的数据按代码顺序输出，并组成一个数组
      query.exec((rect) => {
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
      })
    },
    _bindBgmEvent() {
      // 播放的时候
      backgroundAudioManager.onPlay(() => {
        isMoving = false
        this.triggerEvent('musicPlay')
      })
      // 停止播放
      backgroundAudioManager.onStop(() => {

      })
      // 暂停
      backgroundAudioManager.onPause(() => {
        this.triggerEvent('musicPause')

      })
      // 监听音乐正在加载中
      backgroundAudioManager.onWaiting(() => {

      })
      // 监听背景音乐进入到可以播放的状态
      backgroundAudioManager.onCanplay(() => {
        if (typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }

      })
      // 背景音乐在前台时间改变
      backgroundAudioManager.onTimeUpdate(() => {
        if (!isMoving) {
          const currentTime = backgroundAudioManager.currentTime
          const duration = backgroundAudioManager.duration
          if (currentTime.toString().split('.')[0] != currentSec) {
            const currentTimeFmt = this._dateFormat(currentTime)
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
            currentSec = currentTime.toString().split('.')[0]
            // 联动歌词
            this.triggerEvent('timeUpdate', {
              currentTime
            })
          }
        }
      })
      // 当前背景音乐播放完成
      backgroundAudioManager.onEnded(() => {
        this.triggerEvent('musicEnd')
      })
      // 播放出错
      backgroundAudioManager.onError((res) => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误' + res.errCode,
        })
      })
    },
    _setTime() {
      duration = backgroundAudioManager.duration
      const durationFmt = this._dateFormat(duration)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    // 格式化时间
    _dateFormat(sec) {
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 6)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    },
    _parse0(s) {
      return s < 10 ? '0' + s : s
    }
  }
})