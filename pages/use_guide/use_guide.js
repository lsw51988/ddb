var util = require("../../utils/util.js");
Page({
  goto_help: function() {
    wx.navigateTo({
      url: '../help/help',
    })
  },
  goto_lost_help: function() {
    util.memberAuth('../lost-help/lost-help');
  },
  goto_shb: function() {
    wx.navigateTo({
      url: '../shb-index/shb-index',
    })
  },
  goto_new: function() {
    wx.navigateTo({
      url: '../nb-index/nb-index',
    })
  },
})