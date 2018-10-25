var util = require("../../utils/util.js");
const app = getApp()
Page({
  data: {
    point: 100,
    btnText: '立即成为会员',
    hintText: '您还不是会员'
  },

  onShareAppMessage: function() {
    return util.share(this);
  },

  onLoad: function() {
    if (wx.getStorageSync('member').is_privilege) {
      this.setData({
        'btnText': '立即续费会员',
        'hintText': '您的会员将与' + wx.getStorageSync('member').privilege_time + '到期'
      });
    }
  },

  choose: function(e) {
    var point = e.currentTarget.dataset.point;
    this.setData({
      point: point
    });
  },

  become: function() {
    var point = this.data.point;
    wx.request({
      url: app.globalData.host + '/wechat/member/become_privilege',
      method: "POST",
      data: {
        point: point
      },
      header: util.header(),
      success: function(res) {
        if (res.data.status) {
          wx.showModal({
            title: '提示',
            content: '操作成功',
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
          })
        }
      }
    })
  }
})