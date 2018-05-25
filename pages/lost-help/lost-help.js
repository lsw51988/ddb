// 丢失求助页面
var util = require("../../utils/util.js");
const app = getApp()
Page({
  data: {
      imgUrls: [
          'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
          'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
          'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
      ],
      indicatorDots: false,
      autoplay: false,
      interval: 5000,
      duration: 1000,
      windowWidth: wx.getSystemInfoSync().windowWidth,
      region: ['江苏省', '南京市', '秦淮区'],
      lost_date:""
  },

  onLoad: function (options) {
      var that = this;
      if (wx.getStorageSync("member").mobile == undefined) {
          wx.showLoading({
              title: '请稍后...',
          })
          wx.request({
              url: app.globalData.host + '/wechat/appeal/mobile',
              method: "GET",
              header: util.header(),
              success: function (res) {
                  if (res.data.status == true) {
                      wx.hideLoading();
                  } else {
                      wx.hideLoading();
                      wx.showModal({
                          title: '提示',
                          content: '您尚未认证,请先去认证',
                          success: function (res) {
                              wx.redirectTo({
                                  url: '../member_detail/member_detail',
                              })
                          }
                      })
                  }
              },
              fail: function (res) {
                  util.failHint();
              }
          })
      }
  },

  previewImage: function (e) {
      wx.previewImage({
          current: e.currentTarget.dataset.src, // 当前显示图片的http链接
          urls: this.data.imgUrls // 需要预览的图片http链接列表
      })
  },

  lostDateChange:function(e){
      this.setData({
          lost_date: e.detail.value
      })
  },

  formSubmit:function(e){
      var data = e.detail.value;
  }
})