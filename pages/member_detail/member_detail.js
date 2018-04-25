const app = getApp()
var util = require('../../utils/util.js')
Page({
  data: {
    voltage: ["48V", "60V", "72V", "96V", "其他"],
    voltage_index: 0,
    modalFlag: true,
    imageUrl: app.globalData.host + "/wechat/captcha",
    captcha: "",
    cap_btn_text: "获取验证码",
    cap_btn_status: false,
    cap_loading_status: false,
    mobile: "",
    status: 1,
    sms_code_flag: true
  },

  onLoad: function (options) {
    var that = this;
    wx.request({
      url: app.globalData.host + '/wechat/homePage/memberData',
      method: 'GET',
      header: {
        "content-type": "application/x-www-form-urlencoded",
        "token": wx.getStorageSync("member").token
      },
      success: function (res) {
        var data = res.data.data;
        that.setData({
          "memberData": data
        });
        console.log(data['real_name']);
        that.data.real_name = data['real_name'];
        that.setData({
          "real_name": data['real_name']
        })
        that.data.mobile = data['mobile'];
        that.data.brand_name = data['brand_name'];
        that.data.buy_date = data['buy_date'];
        that.data.number = data['number'];
        that.data.voltage = data['voltage'];
        that.data.price = data['price'];
        that.data.status = data['status'];
        that.data.last_change_time = data['last_change_time'];
        console.log(that.data);
      },
      fail: function (res) { }
    })
  },

  brandChange: function (e) {
    this.setData({
      brand_index: e.detail.value
    })
  },
  buyTimeChange: function (e) {
    this.setData({
      buy_date: e.detail.value
    })
  },
  voltageChange: function (e) {
    this.setData({
      voltage_index: e.detail.value
    })
  },

  batteryChangeTime: function (e) {
    this.setData({
      battery_change_date: e.detail.value
    })
  },
  tapNew: function () {
    this.setData({
      buy_status: '1'
    })
  },
  tapOld: function () {
    this.setData({
      buy_status: '2'
    })
  },
  getMobile: function (e) {
    this.data.mobile = e.detail.value;
  },
  getCaptcha: function (e) {
    var that = this;
    // if (!(/^1\d{10}$/.test(that.data.mobile))) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '请输入正确的手机号码',
    //   });
    //   return false;
    // }
    that.setData({
      modalFlag: false,
      imageUrl: that.data.imageUrl + "?_t=" + new Date().getTime() + "&token=" + wx.getStorageSync("member").token
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
      url: app.globalData.host + '/wechat/verifyCaptcha?captcha=' + this.data.captcha,
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
            cap_loading_status: true,
            sms_code_flag: false
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

  freshCaptcha: function (e) {
    this.setData({
      imageUrl: this.data.imageUrl + "?token=" + wx.getStorageSync("member").token + "&_t=" + new Date().getTime()
    });
  },

  captchaBlur: function (e) {
    this.data.captcha = e.detail.value;
  },

  formSubmit: function (e) {
    var data = e.detail.value;
    for (var key in data) {
      if (key != 'battery_change_date' && (data[key] === "" || data[key] === null)) {
        wx.showModal({
          title: '提示',
          content: '请填写必填项',
        })
        return false;
      }
    }
    data.buy_date = util.transDate(new Date(data.buy_date).getTime());
    if (data.battery_change_date != null) {
      data.battery_change_date = util.transDate(new Date(data.battery_change_date).getTime());
    } else {
      delete data.battery_change_date;
    }
    wx.showLoading({
      title: '请稍后...',
    })
    wx.request({
      url: app.globalData.host + '/api/info',
      method: "POST",
      header: {
        'content-type': "application/x-www-form-urlencoded",
        'token': wx.getStorageSync("member").token
      },
      data: data,
      success: function (res) {
        wx.hideLoading();
        if (res.data.status == true) {
          wx.showModal({
            title: '提示',
            content: '操作成功',
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '操作失败',
          })
        }
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '网络异常，请重新操作',
        })
      }
    })
  }
})
