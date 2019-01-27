var util = require("../../utils/util.js");
const app = getApp();
Page({
  data: {
    avatar_url: "",
    nick_name: "",
    origin_avatar_url: "",
    origin_nick_name: "",
  },

  onShareAppMessage: function() {
    return util.share(this);
  },

  onLoad: function(options) {
    var that = this;
    wx.showLoading({
      title: '请稍后...',
    })
    wx.request({
      url: app.globalData.host + "/wechat/member/baseInfo",
      method: "GET",
      header: util.header(),
      success: function(res) {
        if (res.data.status == true) {
          wx.hideLoading();
          that.data.origin_avatar_url = res.data.data.avatar_url;
          that.data.origin_nick_name = res.data.data.nick_name;
          that.setData({
            avatar_url: res.data.data.avatar_url,
            nick_name: res.data.data.nick_name
          });
        } else {
          util.falseHint(res.data.msg);
        }
      },
      fail: function(res) {
        util.failHint();
      }
    })
  },

  getNickName: function(e) {
    var that = this;
    if (e.detail.value == "") {
      that.data.nick_name = "骑行侠";
    } else {
      that.data.nick_name = e.detail.value;
    }
  },

  uploadAvatar: function() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          avatar_url: res.tempFilePaths[0]
        });
      }
    })
  },

  submit: function() {
    var that = this;
    //用户没有上传头像或者用户没有更改头像
    //用户没有更改昵称

    if (that.data.avatar_url == that.data.origin_avatar_url && that.data.nick_name == that.data.origin_nick_name){
      wx.showModal({
        title: '提示',
        content: '您未作出任何修改',
      })
      return
    }

    if (that.data.avatar_url != that.data.origin_avatar_url) {
      wx.showLoading({
        title: '请稍后...',
      })
      wx.uploadFile({
        url: app.globalData.host + '/wechat/member/baseInfo',
        filePath: that.data.avatar_url,
        name: "file",
        header: {
          'content-type': "multipart/form-data",
          'token': wx.getStorageSync("member").token
        },
        formData: {
          nick_name: that.data.nick_name
        },
        success: function (res) {
          wx.hideLoading();
          var data = JSON.parse(res.data);
          if (data.status == true) {
            wx.setStorageSync('member', data.data);
            wx.showModal({
              title: '提示',
              content: '更新成功',
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '更新失败',
            })
          }
        },
        fail: function (res) {
          wx.showModal({
            title: '提示',
            content: '更新失败,请稍后再试',
          })
        }
      })
    }

    if (that.data.nick_name != that.data.origin_nick_name) {
      wx.showLoading({
        title: '请稍后...',
      })
      wx.request({
        url: app.globalData.host + '/wechat/member/baseInfo',
        data: {
          nick_name: that.data.nick_name
        },
        header:util.header(),
        method:"POST",
        success: function (res) {
          wx.hideLoading();
          var data = res.data;
          if (data.status == true) {
            wx.setStorageSync('member', data.data);
            wx.showModal({
              title: '提示',
              content: '更新成功',
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '更新失败',
            })
          }
        },
        fail: function (res) {
          wx.showModal({
            title: '提示',
            content: '更新失败,请稍后再试',
          })
        }
      })
    }
  }
})