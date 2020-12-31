// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modelShow:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGotUserInfo(event){
      const userInfo = event.detail.userInfo
      // 如果当前用户允许授权
      if(userInfo){
        this.setData({
          modelShow:false
        })
        // 把成功和失败的事件抛出去，让调用方去处理
        this.triggerEvent('loginSuccess',userInfo)
      }else{
        this.triggerEvent('loginfail')
      }
    }
  }
})
