const app = getApp()
Page({
  data: {
    cap_btn_text: "获取验证码",
    cap_loading_status: false,
    cap_btn_status: false,
    imageUrl: app.globalData.host + "/api/member/captcha",
    latitude: "",
    longitude: "",
    mapCtx: "",
    captcha: "",
    noNeedCaptcha: false,
    img:[]
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

  getCaptcha: function (e) {
    var that = this;
    wx.showLoading({
      title: '请稍后...',
    })
    if (!that.data.noNeedCaptcha) {
      wx.request({
        url: app.globalData.host + '/api/member/verifyCaptcha?captcha=' + that.data.captcha,
        header: {
          'content-type': "application/x-www-form-urlencoded",
          'token': wx.getStorageSync("member").token
        },
        method: "GET",
        success: function (res) {
          wx.hideLoading();
          if (res.data.status == true) {
            //请求短信接口
            sendCaptcha(that);
          } else {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '验证码填写错误',
              success: function () {
                that.setData({
                  imageUrl: that.data.imageUrl + "?token=" + wx.getStorageSync("member").token + "&_t=" + new Date().getTime()
                });
              }
            })
          }
        },
        fail: function (res) {
          wx.hideLoading();
        }
      })
    } else {
      sendCaptcha(that);
    }
  },

  freshCaptcha: function (e) {
    this.setData({
      imageUrl: this.data.imageUrl + "?token=" + wx.getStorageSync("member").token + "&_t=" + new Date().getTime()
    });
  },
  captchaBlur: function (e) {
    console.log(e.detail.value);
    this.data.captcha = e.detail.value;
  },

  controltap: function (e) {
    //重新定位
    var that = this;
    this.data.mapCtx.moveToLocation();
    this.data.mapCtx.getCenterLocation({
      success: function (e) {
        that.data.latitude = e.latitude;
        that.data.longitude = e.longitude;
      }
    })
  },

  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log(res)
        if (res.tempFiles[0].size >= 5 * 1024 * 1024) {
          wx.showModal({
            title: ' 提示',
            content: '上传图片大小不得超过5M',
          })
          return;
        }
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.data.img.concat(res.tempFilePaths[0]);
        that.setData({
          img: that.data.img.concat(res.tempFilePaths[0])
        });
      }
    })
  },

  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.img // 需要预览的图片http链接列表
    })
  },

  delImg: function (e) {
    var index = e.currentTarget.id;
    this.data.img.splice(index, 1);
    this.setData({
      img: this.data.img
    });
  },

  formSubmit: function (e) {
    var formData = e.detail.value;
    formData.type = e.detail.target.dataset.id;
    for (var key in formData) {
      if (formData[key] === "" || formData[key] === null) {
        wx.showModal({
          title: '提示',
          content: '请填写必填项',
        })
        return false;
      }
    }
  }
})

function sendCaptcha(that) {
  that.setData({
    cap_btn_status: true,
    cap_loading_status: true,
  });
  wx.showModal({
    title: '提示',
    content: '已经发送验证码',
    showCancel: false
  })
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
