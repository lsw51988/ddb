// pages/nb-index/nb-index.js
Page({
  data: {

  },

  onLoad: function(options) {

  },

  goto_sell: function() {
    wx.navigateTo({
      url: '../nb-sell/nb-sell',
    })
  },

  goto_buy: function() {
    wx.navigateTo({
      url: '../nb-list/nb-list',
    })
  },

  goto_manager: function() {
    wx.navigateTo({
      url: '../nb-manage/nb-manage',
    })
  }
})