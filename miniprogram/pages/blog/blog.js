// pages/blog/blog.js
// 搜索关键字
let keyword = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modelShow: false,
    blogList: [],
  },
  onPublish() {
    wx.getSetting({
      success: (res) => {
        // 如果用户授权过，我们就去获取用户的信息
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: (res) => {
              this.onLoginSuccess({
                detail: res.userInfo
              })
            }
          })
        } else {
          this.setData({
            modelShow: true
          })
        }
      }
    })
  },
  onLoginSuccess(event) {
    const detail = event.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })
  },
  onLoginFail() {
    wx.showModal({
      title: '授权用户才能发布博客',
      content: '',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._loadBlogList()

    // 实现在小程序端调用云数据
    // const db = wx.cloud.database()
    // db.collection('blog').orderBy('creatTime', 'desc').get().then((res) => {
    //   console.log(res)
    // const data = res.data
    // for (let i = 0, len = data.length; i < len; i++) {
    //   data[i].creatTime = data[i].creatTime.toString()
    // }
    // this.setData({
    //   blogList: data
    // })
    // this.serData({
    //   blogList:res.data
    // })
    // })

  },
  onSearch(event) {
    this.setData({
      blogList: []
    })
    keyword = event.detail.keyword
    // 参数0在这里可以写，也可以不写
    this._loadBlogList(0)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      blogList: []
    })
    this._loadBlogList(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this._loadBlogList(this.data.blogList.length)
  },
  _loadBlogList(start = 0) {
    wx.showLoading({
      title: '拼命加载中',
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        keyword,
        start,
        count: 10,
        $url: 'list',
      }
    }).then((res) => {
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  goComment(event) {
    wx.navigateTo({
      url: '../../pages/blog-comment/blog-comment?blogId=' + event.target.dataset.blogid,
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(event) {
    // console.log(event)
    let blogObj = event.target.dataset.blog
    return {
      title:blogObj.content,
      path:`/pages/blog-comment/blog-comment?blogid=${blogObj._id}`
      // imageUrl:''
    }
  }
})