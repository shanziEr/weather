// 接口地址
const BASE_URL = "https://devapi.qweather.com/v7/"
// 应用 key
const KEY = "ccf00feb3aa5410aa96b334962cac4f2"

/**
 * API 请求函数
 */
export const request = (url,location,type) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      data:{
        key: KEY,
        location,
        type
      },
      header: {
        // 严格：application/json(MIME类型)
        'content-type': 'application/json' // 默认值
      },
      success(res){
        resolve(res)
      },
      fail(err){
        reject(reject)
      }
    })
  })
}
