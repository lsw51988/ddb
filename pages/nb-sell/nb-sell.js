var util = require("../../utils/util.js");
const app = getApp();
Page({
  data: {
    voltage: ["请选择", "48V", "60V", "72V", "96V", "其他"],
    voltage_index: 0,
    memberData: [],
    bikeImgs: []
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
      url: app.globalData.host + '/wechat/nb/canCreate',
      header: util.header(),
      success: function(res) {
        if (res.data.status == true) {
          wx.hideLoading();
          that.data.memberData = res.data.data;
          var memberData = that.data.memberData;
          that.setData({
            "mobile": wx.getStorageSync("member").mobile,
            "real_name": that.data.memberData['real_name']
          });
        } else {
          if (res.data.msg =='请先添加您的维修点店铺'){
            wx.hideLoading();
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              success:function(){
                wx.redirectTo({
                  url: '/pages/add-mts/add-mts',
                })
              }
            })
          }else{
            util.falseHint(res.data.msg);
          }
        }
      },
      fail: function() {
        util.failHint();
      }
    })
  },

  voltageChange: function(e) {
    this.setData({
      voltage_index: e.detail.value
    })
  },

  chooseImage: function() {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: ['camera'],
      success: function(res) {
        that.setData({
          bikeImgs: that.data.bikeImgs.concat(res.tempFilePaths)
        });
      }
    })
  },

  previewImage: function(e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.bikeImgs // 需要预览的图片http链接列表
    })
  },

  delImg: function(e) {
    var bikeImgs = this.data.bikeImgs;
    var bikeImg = e.currentTarget.id;
    var newImgs = util.delImg(bikeImgs, bikeImg);
    this.setData({
      bikeImgs: newImgs
    });
  },

  formSubmit: function(e) {
    var that = this;
    console.log(e.detail.value);
    if (!util.validateImgCount(that.data.bikeImgs)) {
      return;
    }
    var data = e.detail.value;
    if (data['voltage'] == 0) {
      wx.showModal({
        title: '提示',
        content: '请选择电压',
      })
      return;
    }
    for (var key in data) {
      if (data[key] === "" || data[key] === null) {
        wx.showModal({
          title: '提示',
          content: '请填写必填项',
        })
        return false;
      }
    }
    wx.showLoading({
      title: '请稍后...',
    })
    wx.request({
      url: app.globalData.host + '/wechat/nb/create',
      method: "POST",
      header: util.header(),
      data: data,
      success: function(res) {
        if (res.data.status == true) {
          wx.hideLoading();
          var nb_id = res.data.data.nb_id;
          for (var i = 0; i < that.data.bikeImgs.length; i++) {
            uploadFile(nb_id, that.data.bikeImgs[i]);
          }
          wx.showModal({
            title: '提示',
            content: '添加成功,等待后台审核',
            success: function() {
              wx.redirectTo({
                url: '../nb-list/nb-list?self_flag=true',
              })
            }
          })
        } else {
          wx.hideLoading();
          if (res.data.msg == "积分不足") {
            //转入积分充值页面
            wx.showModal({
              title: '提示',
              content: '积分不足,请先充值',
              success: function() {
                wx.navigateTo({
                  url: '../point/point',
                })
              }
            })
          }else{
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              success: function () {
                wx.navigateTo({
                  url: '../add-mts/add-mts?is_self=1',
                })
              }
            })
          }
        }
      },
      fail: function(res) {
        util.failHint();
      }
    })
  }
})

function uploadFile(nb_id, img) {
  wx.uploadFile({
    url: app.globalData.host + '/wechat/nb/upload',
    filePath: img,
    name: "file",
    header: {
      'content-type': "multipart/form-data",
      'token': wx.getStorageSync("member").token
    },
    formData: {
      new_bike_id: nb_id
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