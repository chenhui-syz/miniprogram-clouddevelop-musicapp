// components/lyric/lyric.js
let lyricHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false
    },
    lyric: String,
  },
  observers: {
    lyric(lrc) {
      if (lrc == '暂无歌词') {
        this.setData({
          lrclist: [{
            lrc,
            time: 0,
          }]
        })
      } else {
        this._parseLyric(lrc)
      }

    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lrclist: [],
    nowLyricIndex: 0,
    scrollTop: 0, //滚动条滚动高度
  },
  lifetimes: {
    ready() {
      wx.getSystemInfo({
        success: function(res) {
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    }
  },


  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime) {
      let lrclist = this.data.lrclist
      if (lrclist.length == 0) {
        return
      }
      if (currentTime > lrclist[lrclist.length - 1].time) {
        if (this.data.nowLyricIndex != -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lrclist.length * lyricHeight
          })
        }
      }

      for (let i = 0, len = lrclist.length; i < len; i++) {
        if (currentTime <= lrclist[i].time) {
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * lyricHeight
          })
          break
        }
      }
    },
    _parseLyric(sLyric) {
      let line = sLyric.split('\n')
      let _lrclist = []
      line.forEach((elem) => {
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if (time != null) {
          let lrc = elem.split(time)[1]
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // 把时间转换成秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3] / 1000)
          _lrclist.push({
            lrc,
            time: time2Seconds,
          })
        }
      })
      this.setData({
        lrclist: _lrclist
      })
    }
  }
})