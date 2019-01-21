var util = require("../../utils/util.js");
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
    mobile: "",
    captcha: "",
    img: [],
    sms_code_flag: true,
    modalFlag: true,
    type: ["电动车维修点", "电动车维修兼销售点", "便民开锁点"],
    type_index: 0,
    belong_creator: 0,
    appeal_visiable: true,
    is_self:0
  },

  onShareAppMessage: function () {
    return util.share(this);
  },

  onLoad: function (options) {
    var that = this;
    if (options.is_self!=undefined){
      that.data.is_self = options.is_self;
    }
    if(that.data.is_self==1){
      that.data.belong_creator=1;
      that.data.appeal_visiable = false;
      that.setData({
        belong_creator:1,
        appeal_visiable: false
      });
    }
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          controls: [{
            id: 0,
            iconPath: '/img/re-position.png',
            position: {
              left: res.windowWidth - 60,
              top: res.windowHeight * 0.4 - 40,
              width: 40,
              height: 40
            },
            clickable: true
          }]
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
    that.data.mapCtx = wx.createMapContext("map", that);
  },

  getMobile: function (e) {
    this.data.mobile = e.detail.value;
  },

  getCaptcha: function (e) {
    util.getCaptcha(this);
  },

  model_cancel: function (e) {
    this.setData({
      modalFlag: true
    });
  },

  model_confirm: function (e) {
    util.verifyCaptcha(this);
  },

  captchaBlur: function (e) {
    this.data.captcha = e.detail.value;
  },

  freshCaptcha: function () {
    util.freshCaptcha(this);
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
      sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
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
    var imgs = this.data.img;
    var newImgs = util.delImg(imgs, index);
    this.setData({
      img: newImgs
    });
  },

  tapYes: function () {
    this.setData({
      belong_creator: 1,
      appeal_visiable: false
    })
  },

  tapNo: function () {
    this.setData({
      belong_creator: 0,
      appeal_visiable: true
    })
  },

  formSubmit: function (e) {
    var that = this;
    var formData = e.detail.value;
    formData.longitude = that.data.longitude;
    formData.latitude = that.data.latitude;
    if (that.data.img.length == 0) {
      wx.showModal({
        title: '提示',
        content: '您尚未上传维修点照片',
      })
      return;
    }
    if (that.data.img.length > 3) {
      wx.showModal({
        title: '提示',
        content: '最多只能上传3张照片',
      })
      return;
    }
    console.log(formData);
    for (var key in formData) {
      if (key != "mobile" && key != "sms_code") {
        if (formData[key] === "" || formData[key] === null) {
          wx.showModal({
            title: '提示',
            content: '请填写必填项',
          })
          return false;
        }
      }
    }
    wx.showLoading({
      title: '请稍后...',
    })

    wx.request({
      url: app.globalData.host + '/wechat/repair/create',
      method: "POST",
      header: util.header(),
      data: formData,
      success: function (res) {
        if (res.data.status) {
          var repair_id = res.data.data.repair_id;
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '添加成功,后台审核通过之后,您将获取10个积分',
            success: function (res) {
              for (var i = 0; i < that.data.img.length; i++) {
                uploadFile(repair_id, that.data.img[i]);
              }
              wx.redirectTo({
                url: '../member/member',
              })
            }
          })
        } else {
          console.log(res.data);
          util.falseHint('添加失败');
        }
      },
      fail: function () {
        util.failHint();
      }
    })
  }
})

function uploadFile(repair_id, img) {
  wx.uploadFile({
    url: app.globalData.host + '/wechat/repair/upload',
    filePath: img,
    name: "file",
    header: util.header(),
    formData: {
      repair_id: repair_id
    },
    success: function (res) {
      var data = JSON.parse(res.data);
      if (data.status == true) {
        console.log("上图片上传成功");
      } else {
        console.log("图片上传失败");
      }
    },
    fail: function (res) {
      console.log("图片上传失败");
    }
  })
}

function login(latitude, longitude) {
  wx.login({
    success: function (loginRes) {
      var js_code = loginRes.code;
      wx.getUserInfo({
        success: function (userRes) {
          userRes.userInfo.js_code = js_code;
          userRes.userInfo.latitude = latitude;
          userRes.userInfo.longitude = longitude;
          userRes.userInfo.scene_code = wx.getStorageSync("scene_code");
          wx.request({
            url: app.globalData.host + '/wechat/index',
            header: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
            data: userRes.userInfo,
            success: function (res) {
              console.log(userRes);
              wx.setStorageSync('member', res.data.data);
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
                        userRes.userInfo.js_code = js_code;
                        userRes.userInfo.latitude = latitude;
                        userRes.userInfo.longitude = longitude;
                        userRes.userInfo.scene_code = wx.getStorageSync("scene_code");
                        wx.request({
                          url: app.globalData.host + '/wechat/index',
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                          },
                          method: "POST",
                          data: userRes.userInfo,
                          success: function (res) {
                            wx.setStorageSync('member', res.data.data);
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