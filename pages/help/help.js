const app = getApp()
Page({
  data: {
    problem: [
      "爆胎",
      "漏气",
      "电机不转",
      "断电",
      "无法启动",
      "莫名异响",
      "骑行费力，速度慢",
      "其他",
    ],
    problem_index: 0,
    cap_btn_text: "获取验证码",
    cap_loading_status: false,
    cap_btn_status: false,
    modalFlag: true,
    imageUrl: app.globalData.host + "/api/member/captcha",
    latitude: "",
    longitude: "",
    mapCtx: ""
  },

  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          controls: [
            {
              id: 0,
              iconPath: '/img/re-position.png',
              position: {
                left: res.windowWidth - 60,
                top: res.windowHeight * 0.4 - 40,
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
        that.data.longitude = res.longitude;
        that.data.latitude = res.latitude;
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude
        });
      },
    })
    this.data.mapCtx = wx.createMapContext("map", this);
  },
  problemChange: function (e) {
    this.setData({
      problem_index: e.detail.value
    })
  },
  getCaptcha: function (e) {
    this.setData({
      modalFlag: false,
      imageUrl: this.data.imageUrl + "?_t=" + new Date().getTime() + "&token=" + wx.getStorageSync("member").token
    });
  },
  captchaBlur: function (e) {
    this.data.captcha = e.detail.value;
  },
  freshCaptcha: function (e) {
    this.setData({
      imageUrl: this.data.imageUrl + "?token=" + wx.getStorageSync("member").token + "&_t=" + new Date().getTime()
    });
  },
  model_cancel: function (e) {
    this.setData({
      modalFlag: true
    });
  },
  model_confirm: function (e) {
    var that = this;
    wx.showLoading({
      title: '请稍后...',
    })
    wx.request({
      url: app.globalData.host + '/api/member/verifyCaptcha?captcha=' + this.data.captcha,
      header: {
        'content-type': "application/x-www-form-urlencoded",
        'token': wx.getStorageSync("member").token
      },
      method: "GET",
      success: function (res) {
        if (res.data.status == true) {
          //请求短信接口
          that.setData({
            cap_btn_status: true,
            modalFlag: true,
            cap_loading_status: true
          });
          var i = 0;
          var timer = setInterval(function () {
            that.setData({
              cap_btn_text: (59 - i) + "秒"
            });
            i++;
            if (i == 60) {
              clearInterval(timer);
              that.setData({
                cap_btn_status: false,
                cap_btn_text: "获取验证码",
                cap_loading_status: false
              });
            }
          }, 1000);
        }
        wx.hideLoading();
      },
      fail: function (res) {
        wx.hideLoading();
      }
    })
  },
  regionChange: function (e) {
    var that = this;
    that.data.mapCtx.getCenterLocation({
      success: function (res) {
        that.data.longitude = res.longitude;
        that.data.latitude = res.latitude;
      }
    });
  },
  controltap:function(e){
    //重新定位
    console.log("重新定位");
    this.data.mapCtx.moveToLocation();
  }
})
