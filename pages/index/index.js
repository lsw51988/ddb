const app = getApp()
var util = require("../../utils/util.js");
Page({
  data: {
    markers: [],
    circles: [],
    longitude: "",
    latitude: "",
    btnText: "请求帮助",
    member_id: "",
    share_member_id: ""
  },
  onShareAppMessage: function() {
    return util.share(this);
  },
  onLoad: function(opts) {
    var that = this;
    if (opts.share_member_id != undefined) {
      that.data.share_member_id = opts.share_member_id;
    }
    var marker = {}
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          controls: [{
              id: 1,
              iconPath: '/img/avatar.png',
              position: {
                left: 5,
                top: 5,
                width: 25,
                height: 25
              },
              clickable: true
            },
            {
              id: 2,
              iconPath: '/img/news1.png',
              position: {
                left: res.windowWidth - 32,
                top: 5,
                width: 27,
                height: 27
              },
              clickable: true
            },
            {
              id: 3,
              iconPath: '/img/home.png',
              position: {
                left: 50,
                top: res.windowHeight - 70,
                width: 40,
                height: 40
              },
              clickable: true
            },
            {
              id: 4,
              iconPath: '/img/add-station.png',
              position: {
                left: res.windowWidth - 85,
                top: res.windowHeight - 70,
                width: 40,
                height: 40
              },
              clickable: true
            }
          ]
        });
      },
    })

    wx.getLocation({
      type: "gcj02",
      success: function(res) {
        wx.setStorageSync("latitude", res.latitude)
        wx.setStorageSync("longitude", res.longitude)
        that.data.latitude = res.latitude
        that.data.longitude = res.longitude
        locationData(res, that);
        login(res.latitude, res.longitude, that);
      },
      fail: function(res) {
        wx.showModal({
          title: '提示',
          content: '若不授权地理位置信息，无法正常使用功能，点击授权则可重新使用；若不点击，后续还要用小程序，需在微信【发现】-【小程序】-删除【电动帮】，重新授权，方可使用',
          cancelText: "不授权",
          confirmText: "授权",
          success: function(res) {
            if (res.confirm) {
              wx.openSetting({
                success: function(res) {
                  //重新获取地理位置权限
                  wx.getLocation({
                    success: function(res) {
                      wx.setStorageSync("latitude", res.latitude)
                      wx.setStorageSync("longitude", res.longitude)
                      locationData(res, that);
                      login(res.latitude, res.longitude, that);
                    },
                  })
                }
              })
            } else {
              wx.showModal({
                title: '提示',
                content: '您已拒绝授权地理位置，无法正常使用程序功能，需在微信【发现】-【小程序】-删除【电动帮】，重新授权，方可使用'
              })
            }
          }
        })
      }
    })
  },

  help: function() {
    if (this.data.btnText == "请求帮助") {
      if (wx.getStorageSync("member").auth_time == null) {
        wx.showModal({
          title: '提示',
          content: '您需要先认证',
          success: function() {
            wx.navigateTo({
              url: '../member_detail/member_detail',
            })
          }
        })
      } else {
        wx.navigateTo({
          url: '../help/help',
        })
      }
    } else {
      wx.navigateTo({
        url: '../ans-help/ans-help',
      })
    }

  },
  controltap: function(e) {
    switch (e.controlId) {
      case 1:
        util.memberAuth('../member_avatar/member_avatar');
        break;
      case 2:
        util.memberAuth('../member_message/member_message');
        break;
      case 3:
        wx.navigateTo({
          url: '../member/member',
        })
        break;
      case 4:
        wx.request({
          url: app.globalData.host + '/wechat/member/checkNearMts',
          method: "POST",
          header: util.header(),
          data: {
            longitude: that.data.longitude,
            latitude: that.data.latitude
          },
          success: function (res) {
            if (res.data.status) {
              util.memberAuth('../fix-auth/fix-auth');
            } else {
              util.memberAuth('../add-mts/add-mts');
            }
          },
          fail: function () {
            util.failHint();
          }
        })
        break;
    }
  }
})

function login(latitude, longitude, that) {
  wx.login({
    success: function(loginRes) {
      var js_code = loginRes.code;
      loginRes.js_code = js_code;
      loginRes.latitude = latitude;
      loginRes.longitude = longitude;
      loginRes.scene_code = wx.getStorageSync("scene_code");
      loginRes.share_member_id = that.data.share_member_id

      wx.request({
        url: app.globalData.host + '/wechat/index',
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        data: loginRes,
        success: function(res) {
          wx.setStorageSync('member', res.data.data);
          if (res.data.data.repair_flag) {
            that.setData({
              btnText: "响应帮助"
            })
          }
        }
      })
    },
    fail: function(loginRes) {
      wx.showModal({
        title: '提示',
        content: '微信登录异常,请重新打开小程序尝试',
      })
    }
  })
};

function locationData(res, _this) {
  var circle = {}
  circle.longitude = res.longitude
  circle.latitude = res.latitude
  circle.color = "#96BFFDAA"
  circle.fillColor = "#96BFFDAA"
  circle.radius = 500

  _this.data.circles.push(circle)
  _this.setData({
    circles: _this.data.circles,
    longitude: res.longitude,
    latitude: res.latitude
  })
}