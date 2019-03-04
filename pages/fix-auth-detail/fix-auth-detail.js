var util = require("../../utils/util.js");
const app = getApp()
Page({
  data: {
    mapCtx: "",
    longitude: "",
    latitude: "",
    imgUrls: [],
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    windowWidth: wx.getSystemInfoSync().windowWidth,
    mobile: "",
    modalFlag: true,
    imageUrl: app.globalData.host + "/wechat/captcha" + "?token=" + wx.getStorageSync("member").token + "&_t=" + new Date().getTime(),
    captcha: "",
    cap_btn_text: "获取验证码",
    cap_btn_status: false,
    cap_loading_status: false,
    sms_code_flag: true,
    imgs: [],
    repair_id: "",
    latitude: "",
    longitude: "",
    controls: []
  },

  onShareAppMessage: function() {
    return util.share(this);
  },

  onLoad: function(options) {
    var that = this;
    that.data.repair_id = options.id;
    that.data.latitude = options.latitude;
    that.data.longitude = options.longitude;
    wx.getSystemInfo({
      success: function(res) {
        var markers = [];
        var marker = {};
        marker.latitude = options.latitude;
        marker.longitude = options.longitude;
        marker.width = 20;
        marker.height = 20;
        marker.iconPath = "/img/mt.png";
        markers[0] = marker;
        that.setData({
          markers: markers,
          longitude: options.longitude,
          latitude: options.latitude,
          controls: [{
            id: 0,
            iconPath: '/img/re-position.png',
            position: {
              left: res.windowWidth - 60,
              top: res.windowHeight * 0.27 - 40,
              width: 40,
              height: 40
            },
            clickable: true
          }]
        });
      },
    })
    wx.request({
      url: app.globalData.host + '/wechat/repair/' + that.data.repair_id + '/images',
      header: util.header(),
      method: "GET",
      success: function(res) {
        var data = res.data.data;
        for (var i = 0; i < data.length; i++) {
          that.setData({
            imgUrls: data
          });
        }
      },
      fail: function(res) {

      }
    })
    this.data.mapCtx = wx.createMapContext("near_map", this);
  },

  // regionChange: function(e) {
  //   var that = this;
  //   wx.showModal({
  //     title: '提示',
  //     content: '您确定要改变当前位置吗?',
  //     success: function(res) {
  //       if (res.confirm) {
  //         that.data.mapCtx.getCenterLocation({
  //           success: function(res) {
  //             that.data.longitude = res.longitude;
  //             that.data.latitude = res.latitude;
  //           }
  //         });
  //       } else {
  //         that.setData({
  //           longitude: that.data.longitude,
  //           latitude: that.data.latitude,
  //         });
  //       }
  //     }
  //   })
  // },

  controltap: function(e) {
    //重新定位
    var that = this;
    that.data.mapCtx.moveToLocation();
    that.data.mapCtx.getCenterLocation({
      success: function(e) {
        that.data.latitude = e.latitude;
        that.data.longitude = e.longitude;
      }
    })
  },

  previewRpairImage: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: this.data.imgUrls // 需要预览的图片http链接列表
    })
  },

  delImg: function(e) {
    var that = this;
    var bikeImgs = that.data.bikeImgs;
    var bikeImg = e.currentTarget.id;
    for (var i = 0; i < that.data.bikeImgs.length; i++) {
      if (bikeImg == that.data.bikeImgs[i]) {
        delete(that.data.bikeImgs[i]);
        //远程图片也需要删除
        if (bikeImg.indexOf("ddb.com") != -1) {
          var id = bikeImg.substr(bikeImg.lastIndexOf("/") + 1);
          wx.showLoading({
            title: '请稍后...',
          })
          wx.request({
            url: app.globalData.host + '/wechat/member/bikeImg/' + id,
            method: "DELETE",
            header: util.header(),
            success: function(res) {
              if (res.data.status == true) {
                wx.hideLoading();
                wx.showModal({
                  title: '提示',
                  content: '删除成功',
                })
              } else {
                util.falseHint(res.data.msg);
              }
            },
            fail: function() {
              util.failHint()
            }
          })
        }
        break;
      }
    }
    var newImgs = [];
    for (var i = 0; i < that.data.bikeImgs.length; i++) {
      if (that.data.bikeImgs[i] != undefined) {
        newImgs.push(that.data.bikeImgs[i]);
      }
    }
    that.setData({
      bikeImgs: newImgs
    });
  },

  getMobile: function(e) {
    console.log(e);
    this.data.mobile = e.detail.value;
  },

  getCaptcha: function() {
    util.getCaptcha(this);
  },

  model_cancel: function(e) {
    this.setData({
      modalFlag: true
    });
  },

  model_confirm: function(e) {
    util.verifyCaptcha(this);
  },

  freshCaptcha: function() {
    util.freshCaptcha(this);
  },

  captchaBlur: function(e) {
    this.data.captcha = e.detail.value;
  },

  chooseImage: function() {
    var that = this;
    wx.chooseImage({
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        console.log(res);
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          imgs: that.data.imgs.concat(res.tempFilePaths)
        });
      }
    })
  },

  previewAuthImage: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: this.data.imgs // 需要预览的图片http链接列表
    })
  },

  formSubmit: function(e) {
    var that = this;
    var data = e.detail.value;
    // data.longitude = that.data.longitude;
    // data.latitude = that.data.latitude;
    // for (var key in data) {
    //   if (data[key] === "" || data[key] === null) {
    //     wx.showModal({
    //       title: '提示',
    //       content: '请填写必填项',
    //     })
    //     return false;
    //   }
    // }
    if (that.data.imgs.length>3){
      wx.showModal({
        title: '提示',
        content: '最多上传3张照片',
      })
      return false;
    }

    wx.showLoading({
      title: '请稍后...',
    })
    data.repair_id = that.data.repair_id;
    wx.request({
      url: app.globalData.host + '/wechat/repair/claim',
      method: "POST",
      header: util.header(),
      data: data,
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == true) {
          wx.hideLoading();
          //上传文件
          var repair_id = that.data.repair_id;
          for (var i = 0; i < that.data.imgs.length; i++) {
            uploadFile(repair_id, that.data.imgs[i]);
          }
          wx.showModal({
            title: '提示',
            content: '操作成功,等待后台审核',
            success: function() {
              wx.navigateBack()
            }
          })
        } else {
          util.falseHint(res.data.msg);
        }
      },
      fail: function(res) {
        util.failHint();
      }
    })
  }
})

function uploadFile(repair_id, img) {
  wx.uploadFile({
    url: app.globalData.host + '/wechat/repair/upload_auth',
    filePath: img,
    name: "file",
    header: {
      'content-type': "multipart/form-data",
      'token': wx.getStorageSync("member").token
    },
    formData: {
      repair_id: repair_id
    },
    success: function(res) {
      var data = JSON.parse(res.data);
      if (data.status == true) {
        console.log("上图片上传成功");
      } else {
        console.log("图片上传失败");
      }
    },
    fail: function(res) {
      console.log("图片上传失败");
    }
  })
}