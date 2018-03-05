const app = getApp()

Page({
  data: {
    markers: [],
    circles: [],
    longitude: "",
    latitude: ""
  },
  onLoad: function () {
    var that = this;
    var marker = {}
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          controls: [
            {
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
              iconPath: '/img/news.png',
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
              iconPath: '/img/re-position.png',
              position: {
                left: 60,
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
      success: function (res) {
        locationData(res, that);
        login();
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '若不授权地理位置信息，无法正常使用功能，点击授权则可重新使用；若不点击，后续还要用小程序，需在微信【发现】-【小程序】-删除【电动帮】，重新授权，方可使用',
          cancelText: "不授权",
          confirmText: "授权",
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: function (res) {
                  //重新获取地理位置权限
                  wx.getLocation({
                    success: function (res) {
                      locationData(res, that);
                      login();
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
  help: function () {
    wx.navigateTo({
      url: '../member/member',
    })
  },
  controltap: function (e) {
    switch (e.controlId) {
      case 0:

        break;
    }
  }
})
function login() {
  wx.login({
    success: function (loginRes) {
      var js_code = loginRes.code;
      wx.getUserInfo({
        success: function (userRes) {
          userRes.userInfo.js_code = js_code;
          wx.request({
            url: app.globalData.host+'/api/member/login',
            header: {
              'content-type': "application/x-www-form-urlencoded",
            },
            method: "POST",
            data: userRes.userInfo,
            success: function (res) {
              wx.clearStorageSync('member');
              wx.setStorage({
                key: 'member',
                data: res.data.data,
              })
            }
          })
        },
        fail: function (userRes) {
          wx.showModal({
            title: '提示',
            content: '若不授权用户信息，无法正常使用功能，点击授权则可重新使用；若不点击，后续还要用小程序，需在微信【发现】-【小程序】-删除【电动帮】，重新授权，方可使用',
            cancelText: "不授权",
            confirmText: "授权",
            success: function (confirmRes) {
              if (confirmRes.confirm) {
                wx.openSetting({
                  success: function () {
                    wx.getUserInfo({
                      success: function (userRes) {
                        wx.request({
                          url: app.globalData.host+'/api/member/login',
                          header: {
                            'content-type': "application/x-www-form-urlencoded",
                          },
                          method: "POST",
                          data: userRes.userInfo,
                          success: function (res) {
                            wx.clearStorageSync('member');
                            wx.setStorage({
                              key: 'member',
                              data: res.data.data,
                            })
                          }
                        })
                      },
                    })
                  }
                })
              } else {
                wx.showModal({
                  title: '提示',
                  content: '您已拒绝授权用户信息，无法正常使用程序功能，需在微信【发现】-【小程序】-删除【电动帮】，重新授权，方可使用'
                })
              }
            }
          })
        }
      })
    },
    fail: function (loginRes) {
      console.log("wx接口login请求错误");
      console.log(loginRes);
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