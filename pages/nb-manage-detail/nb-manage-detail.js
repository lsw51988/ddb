var util = require("../../utils/util.js");
const app = getApp();
Page({
  data: {
    region: [],
    customItem: '全部',
    voltage: ["48V", "60V", "72V", "96V", "其他"],
    voltage_index: 0,
    show_days: ['请选择', '一周-7天', '二周-14天', '一个月-30天', '三个月-90天', '半年-180天', '一年-365天'],
    show_days_index: 0,
    memberData: [],
    bikeImgs: [],
    status: "",
    detail_addr: "",
    id: "",
    modalFlag: true,
    reason: "",
    battery_brand: "",
    guarantee_period: "",
    distance: "",
    left_days: ''
  },

  onShareAppMessage: function() {
    return util.share(this);
  },

  onLoad: function(options) {
    var that = this;
    var id = options.id;
    that.data.id = options.id;
    wx.showLoading({
      title: '请稍后...',
    })
    wx.request({
      url: app.globalData.host + '/wechat/nb/manage_detail/' + that.data.id,
      header: util.header(),
      success: function(res) {
        if (res.data.status == true) {
          wx.hideLoading();
          that.data.memberData = res.data.data;
          var memberData = that.data.memberData;
          var index = 0;
          for (var i = 0; i < that.data.voltage.length; i++) {
            if (parseInt(memberData['voltage']) == parseInt(that.data.voltage[i])) {
              index = i;
              break;
            }
          }

          that.data.region.push(memberData['province']);
          that.data.region.push(memberData['city']);
          that.data.region.push(memberData['district']);
          that.setData({
            "mobile": wx.getStorageSync("member").mobile,
            "member_name": memberData['member_name'],
            "voltage_index": index,
            "brand_name": memberData["brand_name"],
            "status": memberData["status"],
            "price": memberData["price"],
            "region": that.data.region,
            "detail_addr": memberData["detail_addr"],
            "remark": memberData["remark"],
            "bikeImgs": memberData["imgUrls"],
            "battery_brand": memberData["battery_brand"],
            "guarantee_period": memberData["guarantee_period"],
            "distance": memberData["distance"],
            "left_days": memberData["left_days"]
          });
        } else {
          util.falseHint();
        }
      },
      fail: function() {
        util.failHint();
      }
    })
  },

  statusChange: function(e) {
    this.setData({
      'status': e.detail.value
    });
  },

  buyTimeChange: function(e) {
    this.setData({
      buy_date: e.detail.value
    })
  },

  lastChangeTimeChange: function(e) {
    this.setData({
      last_change_time: e.detail.value
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
    var that = this;
    var bikeImgs = that.data.bikeImgs;
    var bikeImg = e.currentTarget.id;
    for (var i = 0; i < that.data.bikeImgs.length; i++) {
      if (bikeImg == that.data.bikeImgs[i]) {
        delete(that.data.bikeImgs[i]);
        //远程图片也需要删除
        if (bikeImg.indexOf(app.globalData.host) != -1) {
          var id = bikeImg.substr(bikeImg.lastIndexOf("/") + 1);
          wx.showLoading({
            title: '请稍后...',
          })
          wx.request({
            url: app.globalData.host + '/wechat/nb/bikeImg/' + id,
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

  voltageChange: function(e) {
    this.setData({
      voltage_index: e.detail.value
    })
  },

  showDayChange: function(e) {
    this.setData({
      show_days_index: e.detail.value
    })
  },

  formSubmit: function(e) {
    var that = this;
    var formType = e.detail.target.dataset.type;
    if (!util.validateImgCount(that.data.bikeImgs)) {
      return;
    }
    var data = e.detail.value;
    data.id = that.data.id;
    for (var key in data) {
      if (key != 'show_days_index' && key != 'remark' && (data[key] === "" || data[key] === null)) {
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
    if (formType == 'update') {
      wx.request({
        url: app.globalData.host + '/wechat/nb/update',
        method: "POST",
        header: util.header(),
        data: data,
        success: function(res) {
          if (res.data.status == true) {
            wx.hideLoading();
            for (var i = 0; i < that.data.bikeImgs.length; i++) {
              if (that.data.bikeImgs[i].indexOf(app.globalData.host) == -1) {
                uploadFile(that.data.id, that.data.bikeImgs[i]);
              }
            }
            wx.showModal({
              title: '提示',
              content: '更新成功',
              success: function() {
                wx.redirectTo({
                  url: '../nb-manage/nb-manage?self_flag=true',
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
            }
          }
        },
        fail: function(res) {
          util.failHint();
        }
      })
    } else {
      wx.request({
        url: app.globalData.host + '/wechat/nb/repub',
        method: "POST",
        header: util.header(),
        data: data,
        success: function(res) {
          if (res.data.status == true) {
            wx.hideLoading();

            for (var i = 0; i < that.data.bikeImgs.length; i++) {
              if (that.data.bikeImgs[i].indexOf(app.globalData.host) == -1) {
                uploadFile(that.data.id, that.data.bikeImgs[i]);
              }
            }
            wx.showModal({
              title: '提示',
              content: '更新成功',
              success: function() {
                wx.redirectTo({
                  url: '../nb-manage/nb-manage?self_flag=true',
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
            }
          }
        },
        fail: function(res) {
          util.failHint();
        }
      })
    }

  },

  model_cancel: function() {
    this.setData({
      modalFlag: true
    });
  },

  reasonBlur: function(e) {
    this.data.reason = e.detail.value;
  },

  revoke: function() {
    this.setData({
      modalFlag: false
    });
  },

  model_confirm: function() {
    var that = this;
    wx.showLoading({
      title: '请稍后...',
    })
    wx.request({
      url: app.globalData.host + '/wechat/nb/revoke/' + that.data.id,
      method: "GET",
      header: util.header(),
      data: {
        "reason": that.data.reason
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.status) {
          wx.showModal({
            title: '提示',
            content: '操作成功',
            success: function() {
              wx.redirectTo({
                url: '../nb-manage/nb-manage?self_flag=true',
              })
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
          })
        }
      },
      fail: function() {
        util.failHint();
      }
    })
  }
})

function uploadFile(shb_id, img) {
  wx.uploadFile({
    url: app.globalData.host + '/wechat/nb/upload',
    filePath: img,
    name: "file",
    header: {
      'content-type': "multipart/form-data",
      'token': wx.getStorageSync("member").token
    },
    formData: {
      second_bike_id: shb_id
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