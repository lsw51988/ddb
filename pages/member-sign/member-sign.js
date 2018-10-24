const app = getApp();
var util = require("../../utils/util.js");
Page({
  signin: function() {
    wx.showLoading({
      title: '请稍后...',
    })
    wx.request({
      url: app.globalData.host + '/wechat/member/sign',
      method: "POST",
      header: util.header(),
      success: function(res) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: res.data.msg
        })
      },
      fail: function() {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: "获取unionid出错:服务器内部错误"
        })
      }
    })
  }
})