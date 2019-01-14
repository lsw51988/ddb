const app = getApp();
var util = require("../../utils/util.js");
Page({
  data: {
    appeal_text: "求助记录",
    avatarUrl: ''
  },

  onShareAppMessage: function() {
    return util.share(this);
  },

  onShow: function(options) {
    var that = this;
    wx.showLoading({
      title: '请稍后...',
    })
    wx.request({
      url: app.globalData.host + '/wechat/homePage/index',
      method: "GET",
      header: util.header(),
      success: function(res) {
        if (res.data.status == true) {
          wx.hideLoading();
          var resData = res.data.data;
          wx.setStorageSync('member', resData.member);
          if (resData.member.avatar_url == '') {
            that.data.avatarUrl = '/img/default_avatar.jpg';
          } else if ((/wx.qlogo.cn/.test(resData.member.avatar_url))) {
            that.data.avatarUrl = resData.member.avatar_url;
          } else {
            that.data.avatarUrl = app.globalData.host + '/wechat/avatar?path=' + resData.member.avatar_url
          }
          that.setData({
            'member': wx.getStorageSync('member'),
            'avatarUrl': that.data.avatarUrl,
            //'level': resData.level,
            'point': resData.point,
            'appeal_times': resData.appeal_times,
            'deal_times': resData.deal_times,
          })
        } else {
          util.falseHint(res.data.msg);
        }
      },
      fail: function(e) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: 'homePage/index接口出错',
        })
      }
    })

    if (wx.getStorageSync('member').repair_flag) {
      that.data.appeal_text = "应助记录";
    }

    that.setData({
      'imgUrl': app.globalData.host + "/wechat/qr_code",
      'appeal_text': that.data.appeal_text
    });
  },

  goto_guide: function() {
    wx.navigateTo({
      url: '../guide/guide',
    })
  },

  previewImage: function(e) {
    wx.previewImage({
      current: app.globalData.host + "/wechat/qr_code?_t=" + Date.parse(new Date()), // 当前显示图片的http链接
      urls: [app.globalData.host + "/wechat/qr_code?_t=" + Date.parse(new Date())] // 需要预览的图片http链接列表
    })
  },

  goto_member_want: function() {
    wx.navigateTo({
      url: '../member-want/member-want',
    })
  },

  goto_shb_index: function() {
    wx.navigateTo({
      url: '../shb-index/shb-index',
    })
  },

  goto_nb_index: function() {
    wx.navigateTo({
      url: '../nb-index/nb-index',
    })
  },

  goto_member_avatar: function() {
    wx.navigateTo({
      url: '../member_avatar/member_avatar',
    })
  },

  goto_suggestions: function() {
    wx.navigateTo({
      url: '../suggestion/suggestion',
    })
  },

  goto_lost_list: function() {
    wx.navigateTo({
      url: '../lost-list/lost-list',
    })
  },

  goto_about: function() {
    wx.navigateTo({
      url: '../about/about',
    })
  },

  goto_recommend: function() {
    wx.navigateTo({
      url: '../recommend/recommend',
    })
  },

  goto_member_log: function() {
    wx.navigateTo({
      url: '../member_log/member_log',
    })
  },

  goto_shop: function() {
    wx.showModal({
      title: '提示',
      content: '即将开放,欢迎洽谈合作',
    })
  },

  goto_insure: function() {
    wx.showModal({
      title: '提示',
      content: '即将开放',
    })
  }
})