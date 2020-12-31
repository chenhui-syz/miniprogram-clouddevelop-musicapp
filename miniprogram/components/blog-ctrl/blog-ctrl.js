// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogid: String,
    blog: Object
  },
  externalClasses: ['iconfont', 'icon-pinglun', 'icon-fenxiang'],

  /**
   * 组件的初始数据
   */
  data: {
    //当前登录的组件是否显示
    loginShow: false,
    // 当前底层弹出层是否显示
    modelShow: false,
    content: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      //判断用户是否授权
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (res) => {
                userInfo = res.userInfo
                //显示评论的弹出层
                this.setData({
                  modelShow: true,
                })
              }
            })
          } else {
            this.setData({
              loginShow: true
            })
          }
        }
      })
    },
    onLoginSuccess(event) {
      userInfo: event.detail
      // 授权框消失，评论框显示
      this.setData({
        loginShow: false,
      }, () => {
        this.setData({
          modelShow: true,
        })
      })
    },
    onLoginfail() {
      wx.showModal({
        title: '授权用户才能进行评价',
        content: '',
      })
    },
    onSend(event) {
      // 插入数据库
      let content = event.detail.value.content
      let formId = event.detail.formId
      if (content.trim() == '') {
        wx.showModal({
          title: '评论内容不能为空',
          content: '',
        })
        return
      }
      wx.showLoading({
        title: '评价中',
        mask: true,
      })
      db.collection('blog-comment').add({
        data: {
          content,
          createTime: db.serverDate(),
          blogid: this.properties.blogid,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then((res) => {
        // 推送模板消息
        wx.cloud.callFunction({
          name: 'sendMessage',
          data: {
            content,
            formId,
            blogid: this.properties.blogid
          }
        }).then((res) => {
          console.log(res)
        })
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          modelShow: false,
          content: ''
        })

        //父元素刷新评论
        this.triggerEvent('refreshCommentList')
      })

    }
  }
})