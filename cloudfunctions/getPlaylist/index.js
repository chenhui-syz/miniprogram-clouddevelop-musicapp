const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 对数据库进行初始化
const db = cloud.database()

const rp = require('request-promise')

const URL = 'http://musicapi.xiecheng.live/personalized'

const playlistCollection = db.collection('playlist')

const MAX_LIMIT = 100

exports.main = async(event, context) => {
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // 突破云函数拿取数据库信息的条数限制
  // const list = await playlistCollection.get()
  const countResult = await playlistCollection.count()
  const total = countResult.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let list = {
    data: []
  }
  if (tasks.length > 0) {
    list = (await Promise.all(task)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }
  //************************************************************

  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // 拿取推荐歌单列表的数据
  const playlist = await rp(URL).then((res) => {
    return JSON.parse(res).result
  })
  //************************************************************
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // 对比数据库与接口请求来的数据，只需要新增加的数据
  const newData = []
  for (let i = 0, len1 = playlist.length; i < len1; i++) {
    let flag = true
    for (let j = 0, len2 = list.data.length; j < len2; j++) {
      if (playlist[i].id === list.data[j].id) {
        flag = false
        break
      }
    }
    if (flag) {
      newData.push(playlist[i])
    }
  }
  //************************************************************

  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // 向数据库中插入歌单数据
  let len = newData.length
  for (let i = 0; i < len; i++) {
    await playlistCollection.add({
      data: {
        ...newData[i],
        createTime: db.serverDate(),
      }
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.error('插入失败')
    })
  }
  //************************************************************
  return newData.length
}