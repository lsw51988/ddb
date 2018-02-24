// pages/member_detail/member_detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    battery_capacity: ["48V", "60V", "72V", "其他"],
    brand: [
      "爱玛", "雅迪", "新日", "小牛",
      "E客", "台铃", "速珂", "小刀",
      "绿源", "立马", "小米", "新大洲",
      "安马达", "大阳", "超威"
    ],
    brand_index: 0,
    battery_index: 0,
    status: 'new',
    modalFlag: false,
    imageUrl:"http://47.97.194.247/api/member/captcha"
  },

  onLoad: function (options) {

  },

  brandChange: function (e) {
    this.setData({
      brand_index: e.detail.value
    })
  },
  buyTimeChange: function (e) {
    this.setData({
      buy_time: e.detail.value
    })
  },
  batteryCapacityChange: function (e) {
    this.setData({
      battery_index: e.detail.value
    })
  },

  batteryChangeTime: function (e) {
    this.setData({
      battery_change_time: e.detail.value
    })
  },
  tapNew: function () {
    this.setData({
      status: 'new'
    })
  },
  tapOld: function () {
    this.setData({
      status: 'old'
    })
  },
  getCaptcha: function (e) {
    this.setData({
      modalFlag: false
    });
  },

  model_cancel:function(e){
    this.setData({
      modalFlag: true
    });
  },

  model_confirm:function(e){
    console.log(e);
  },

  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },
  formReset: function () {
    console.log('form发生了reset事件')
  }
})