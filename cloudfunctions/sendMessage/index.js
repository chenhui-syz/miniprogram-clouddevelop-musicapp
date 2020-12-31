// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {OPENID} = cloud.getWXContext()
  const result = await cloud.openapi.templateMessage.send({
    touser:OPENID,
    page:`/pages/blog-comment/blog-comment?blogid=${event.blogid}`,
    data:{
      thing2:{
        value:event.content
      },
      time4:{
        value:'刚刚'
      }
    },
    templateId:'0m3J1_zRBBTcGz2MUgdVL06iqCDaKj-3hO8y85us-8I',
    formId:event.formId
  })
  return result
}