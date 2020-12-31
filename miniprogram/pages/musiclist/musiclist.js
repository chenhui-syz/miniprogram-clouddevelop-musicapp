// pages/musiclist/musiclist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    musiclist: [],
    listInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        playlistid: options.playlistid,
        $url: 'musiclist'
      }
    }).then((res) => {
      console.log(res)
      const pl = res.result.playlist
      this.setData({
        musiclist: pl.tracks,
        listInfo: {
          coverImgUrl: pl.coverImgUrl,
          name: pl.name,
        }
      })
      this._setMuscilist()
      wx.hideLoading()
    })
  },

  _setMuscilist(){
    wx.setStorage({
      key: 'musiclist',
      data: this.data.musiclist,
    })
  }
})