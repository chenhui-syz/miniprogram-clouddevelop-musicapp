// 输入文字的最大限制
const MAX_WORDS_NUM = 140
// 最大图片数量
const MAX_IMG_NUM = 9
//数据库初始化
const db = wx.cloud.database()
// 输入的内容
let content = ''
// 用户信息
let userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum: 0,
    footerBottom: 0,
    images: [],
    selectPhoto: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    userInfo = options
  },
  onInput(event) {
    let wordsNum = event.detail.value.length
    if (wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value

  },
  onFocus(event) {
    this.setData({
      footerBottom: event.detail.height,
    })
  },
  onBlur() {
    this.setData({
      footerBottom: 0,
    })
  },
  onChooseImage() {
    // 这是微信提供的上传图片的接口
    wx.chooseImage({
      count: MAX_IMG_NUM - this.data.images.length,
      // 初始值/压缩
      sizeType: ['original', 'compressed'],
      // 从手机相册选/拍照选择
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 把上传成功的图片链接赋值给data中预先定义好的变量
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        // 控制添加图片的元素是否显示
        let max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto: max <= 0 ? false : true
        })
      },
    })
  },
  onDeleteImgs(event) {
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
    if (this.data.images.length == MAX_IMG_NUM - 1) {
      this.setData({
        selectPhoto: true
      })
    }
  },
  onPreviewImage(event) {
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imagesrc
    })
  },
  send() {
    if (content.trim() === '') {
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return
    }
    wx.showLoading({
      title: '发布中',
      mask:true
    })
    //  数据=>云数据库
    let promiseArr = []
    let fileIds = []
    // 1.图片上传，将图片存到云存储中
    for (let i = 0, len = this.data.images.length; i < len; i++) {
      let p = new Promise((resolve, reject) => {
        let item = this.data.images[i]
        //文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 10000000 + suffix,
          filePath: item,
          success: (res) => {
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    Promise.all(promiseArr).then((res) => {
      db.collection('blog').add({
        data: {
          ...userInfo,
          content,
          img: fileIds,
          creatTime: db.serverDate() //服务端时间
        }
      }).then((res)=>{
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        // 返回blog页面，并且刷新
        wx.navigateBack()
        // 取到当前小程序的界面以及之前界面的信息
        const pages = getCurrentPages()
        // 取到上一个界面的
        const prevPage = pages[pages.length-2]
        prevPage.onPullDownRefresh()

      })
    }).catch((err)=>{
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
    // 存入到云数据库中
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})