var util = require("../../utils/util.js");
const app = getApp()
Page({
  data: {
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    windowWidth: wx.getSystemInfoSync().windowWidth,
    bikeInfo: [],
    id: "",
    btnText: "立即联系"
  },

  onShareAppMessage: function() {
    return util.share(this);
  },

  onLoad: function(e) {
    console.log(e);
    var that = this;
    if (e.manage != undefined) {
      that.setData({
        'btnText': "立即更新"
      })
    }
    that.data.id = e.id;
    wx.showLoading({
      title: '请稍后...',
    })
    wx.request({
      url: app.globalData.host + '/wechat/nb/detail/' + that.data.id,
      methond: "GET",
      header: util.header(),
      success: function(res) {
        if (res.data.status == true) {
          wx.hideLoading();
          var data = res.data.data;
          that.setData({
            bikeInfo: data,
            imgUrls: data.imgUrls
          });
        } else {
          util.falseHint(res.data.msg);
        }
      },
      fail: function() {
        util.failHint();
      }
    })
    wx.request({
      url: app.globalData.host + '/wechat/nb/browse/' + that.data.id,
      method: "GET",
      header: util.header(),
      success: function() {},
      fail: function() {}
    })
  },

  previewImage: function(e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.imgUrls // 需要预览的图片http链接列表
    })
  },

  makePhoneCallOrUpdate: function() {
    var that = this;
    if (that.data.btnText == "立即联系") {
      wx.makePhoneCall({
        phoneNumber: that.data.bikeInfo['mobile'],
        success: function() {
          wx.request({
            url: app.globalData.host + '/wechat/nb/contact/' + that.data.id,
            method: "GET",
            header: util.header(),
            success: function() {},
            fail: function() {}
          })
        },
        fail: function() {
          wx.showModal({
            title: '提示',
            content: '好像出错了,请重试',
          })
        }
      })
    }
  }
})