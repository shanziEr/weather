// index.js
import {request} from "../../utils/api";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    otherInfo: [
      {
        name: "温度(℃)",
        info: null
      },{
        name: "体感温度(℃)",
        info: null
      },{
        name: "相对湿度(%)",
        info: null
      },{
        name: "降水量(mm)",
        info: null
      },{
        name: "风向",
        info: null
      },{
        name: "风向角度(deg)",
        info: null
      },{
        name: "风力(级)",
        info: null
      },{
        name: "风速(km/h)",
        info: null
      },{
        name: "能见度(km)",
        info: null
      },{
        name: "气压(mb)",
        info: null
      },{
        name: "云量",
        info: null
      }
    ],
    //加载完成的数量
    loadingNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;

    wx.p.getLocation({
      type: 'wgs84',
      success (res) {
        // 纬度latitude
        // 经度longitude
        let location = res.longitude + "," + res.latitude ;
        // 获取用户地址
        that.getAddress(location);
      }
     })
     wx.p.getUserInfo({
      success: function(res) {
        that.setData({
          userName: "登录",
          userImg: res.userInfo.avatarUrl
        })
        wx.showToast({
          title: '正在加载',
          icon: 'loading'
        })
      }
    })
    
  },
  getUserInfo(e){
    wx.p.getUserProfile({
      desc: '获取您的账号信息',
      success:(res)=>{
        this.setData({
          userImg: res.userInfo.avatarUrl,
          userName: res.userInfo.nickName
        })
      }
    })
  },
  //获取当天天气
  async getWeather(url,location){
    
    let resData = await request(url,location);
    // 其他天气信息
    let otherInfo = [
      {
        name: "温度(℃)",
        info: resData.data.now.temp || null
      },{
        name: "体感温度(℃)",
        info: resData.data.now.feelsLike
      },{
        name: "相对湿度(%)",
        info: resData.data.now.humidity
      },{
        name: "降水量(mm)",
        info: resData.data.now.precip
      },{
        name: "风向",
        info: resData.data.now.windDir
      },{
        name: "风向角度(deg)",
        info: resData.data.now.wind360
      },{
        name: "风力(级)",
        info: resData.data.now.windScale
      },{
        name: "风速(km/h)",
        info: resData.data.now.windSpeed
      },{
        name: "能见度(km)",
        info: resData.data.now.vis
      },{
        name: "气压(mb)",
        info: resData.data.now.pressure
      },{
        name: "云量",
        info: resData.data.now.cloud
      }
    ]
    let weatherTime = new Date(resData.data.now.obsTime);
    let yue = (weatherTime.getMonth() + 1).toString()[1] ? (weatherTime.getMonth() + 1) : "0" + (weatherTime.getMonth() + 1);
    let time = yue + "-" + weatherTime.getDate() + ' ' + weatherTime.getHours()+":"+weatherTime.getMinutes() + " 更新";
    this.setData({
      otherInfo,
      // 时间
      weatherTime: time,
      // 温度
      temperature: resData.data.now.temp,
      // 天气状况的文字描述，包括阴晴雨雪等天气状态的描述
      situation: resData.data.now.text,
      // 能见度
      visibility: resData.data.now.vis
    })
    this.data.loadingNum+=1
    if(this.data.loadingNum >= 4){
      wx.hideToast();
    }
  },
  // 获取近七天天气信息
  async getSevenWeather(url,location){
    let resData = await request(url,location);
    let sevenWeather = [];
    resData.data.daily.forEach(v=>{
      let temp = {
        // 时间
        time: v.fxDate,
        // 预报当天最高温度 ~ 预报当天最低温度
        temperature: v.tempMax + "~" + v.tempMin + "℃",
        // 预报白天天气状况文字描述，包括阴晴雨雪等天气状态的描述
        textDay: v.textDay,
        // 预报白天风向 + 预报白天风力等级
        wind: v.windDirDay + v.windScaleDay,
        // 图标
        iconDay: v.iconDay
      }
      sevenWeather.push(temp);

      this.data.loadingNum+=1
      if(this.data.loadingNum >= 4){
        wx.hideToast();
      }
    })
    this.setData({
      sevenWeather
    })
  },

  // 24小时逐3小时预报
  async getHourWeather(url,location){
    let resData = await request(url,location);
    let hourWeather = [];
    resData.data.hourly.forEach((v,idx)=>{
      if(idx % 3 == 0){
        let temp = [
          {
            name: "温度(℃)",
            info: v.temp
          },{
            name: "天气",
            info: v.text
          },{
            name: "相对湿度(%)",
            info: v.humidity
          },{
            name: "露点温度(℃)",
            info: v.dew
          },
          {
            name: "降水概率",
            info: v.pop
          },
          {
            name: "风向",
            info: v.windDir
          },{
            name: "风向角度(deg)",
            info: v.wind360
          },{
            name: "风力(级)",
            info: v.windScale
          },{
            name: "风速(km/h)",
            info: v.windSpeed
          },{
            name: "气压(mb)",
            info: v.pressure
          },{
            name: "云量",
            info: v.cloud
          }
        ];
        let weatherTime = new Date(v.fxTime);
        let yue = (weatherTime.getMonth() + 1).toString()[1] ? (weatherTime.getMonth() + 1) : "0" + (weatherTime.getMonth() + 1);
        let time = weatherTime.getFullYear() + "-" +  yue + "-" + weatherTime.getDate() + ' ' + weatherTime.getHours()+":"+weatherTime.getMinutes();
        hourWeather.push({
          temp,
          time
        });
      }
    })
    this.setData({
      hourWeather
    })

    this.data.loadingNum+=1
    if(this.data.loadingNum >= 4){
      wx.hideToast();
    }
  },

  // 生活指数
  async getlife(url,location){
    let type =  "8,3,9,1,6,5,2,10";
    let resData = await request(url,location,type);
    let life = [];
    if(resData.data.daily){
      resData.data.daily.forEach(v=>{
        let temp = {
          title: v.name +  v.category,
          text: v.text,
          type: v.type
        }
        life.push(temp)
      })
    }

    this.setData({
      life
    })

    this.data.loadingNum+=1
    if(this.data.loadingNum >= 4){
      wx.hideToast();
    }
  },

  // 获取地址
  async getAddress(address){
    let resData = await wx.p.request({
      url: "https://geoapi.qweather.com/v2/city/lookup",
      data:{
        key: "ccf00feb3aa5410aa96b334962cac4f2",
        location: address
      }
    })
    // 纬度
    // 经度
    let location = resData.data.location[0].lon + "," + resData.data.location[0].lat;
    this.setData({
      address: resData.data.location[0].name,
      loadingNum: 0
    })

    //获取当天天气
    this.getWeather("weather/now",location);
    //获取进七天信息
    this.getSevenWeather("weather/7d",location);
    // 24小时逐3小时预报
    this.getHourWeather("weather/24h",location);
    // 获取生活指数
    this.getlife("indices/1d",location);
  },
  // 搜索
  searchChange(e){
    let info = e.detail.value;
    this.getAddress(info);
  }
})