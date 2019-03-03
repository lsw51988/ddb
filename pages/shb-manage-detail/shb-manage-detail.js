var util = require("../../utils/util.js");
const app = getApp();
Page({
  data: {
    region: [],
    customItem: '全部',
    voltage: ["请选择","48V", "60V", "72V", "96V", "其他"],
    voltage_index: 0,
    memberData: [],
    bikeImgs: [],
    status: "",
    in_status: "",
    detail_addr: "",
    last_change_time: "未更换",
    id: "",
    modalFlag: true,
    reason: ""
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
      url: app.globalData.host + '/wechat/shb/manage_detail/' + that.data.id,
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
          var last_change_time = memberData["last_change_time"];
          if (last_change_time != null) {
            last_change_time = memberData["last_change_time"].substring(0, 7)
          } else {
            last_change_time = "未更换";
          }

          that.data.region.push(memberData['province']);
          that.data.region.push(memberData['city']);
          that.data.region.push(memberData['district']);
          that.setData({
            "mobile": wx.getStorageSync("member").mobile,
            "member_name": memberData['member_name'],
            "voltage_index": index,
            "brand_name": memberData["brand_name"],
            "number": memberData["number"],
            "in_status": memberData["in_status"],
            "status": memberData["status"],
            "in_price": memberData["in_price"],
            "buy_date": memberData["buy_date"].substring(0, 7),
            "last_change_time": last_change_time,
            "region": that.data.region,
            "detail_addr": memberData["detail_addr"],
            "out_price": memberData["out_price"],
            "remark": memberData["remark"],
            "bikeImgs": memberData["imgUrls"]
          });
        } else {
          util.falseHint(res.data.msg);
        }
      },
      fail: function() {
        util.failHint();
      }
    })
  },

  statusChange: function(e) {
    this.setData({
      'in_status': e.detail.value
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
            url: app.globalData.host + '/wechat/shb/bikeImg/' + id,
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

  formSubmit: function(e) {
    var that = this;
    var formType = e.detail.target.dataset.type;
    if (!util.validateImgCount(that.data.bikeImgs)) {
      return;
    }
    var data = e.detail.value;
    data.id = that.data.id;
    data.in_status = that.data.in_status;
    if (data['voltage'] == 0) {
      wx.showModal({
        title: '提示',
        content: '请选择电压',
      })
      return;
    }
    for (var key in data) {
      if (key != 'last_change_time' && key != 'remark' && (data[key] === "" || data[key] === null)) {
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
        url: app.globalData.host + '/wechat/shb/update',
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
                  url: '../shb-manage/shb-manage',
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
              util.falseHint(res.data.msg);
            }
          }
        },
        fail: function(res) {
          util.failHint();
        }
      })
    } 

    if (formType =='refresh'){
      var id = that.data.id;
      wx.showLoading({
        title: '请稍后...',
      })
      wx.request({
        url: app.globalData.host + '/wechat/member/flush',
        method: "GET",
        header: util.header(),
        data: {
          'bike_id': id,
          'type': 2
        },
        success: function (res) {
          if (res.data.status == true) {
            var count = res.data.data;
            if (count > 0) {
              var okmsg = '该条记录今天还可免费刷新' + count + '次';
            } else {
              var okmsg = '刷新成功';
            }
            wx.hideLoading();
            wx.showModal({
              title: '提示',
              content: okmsg,
            })
          } else {
            if (res.data.msg = '积分不足') {
              wx.showModal({
                title: '提示',
                content: '积分不足',
                success: function () {
                  wx.navigateTo({
                    url: '../point/point',
                  })
                }
              })
            } else {
              util.falseHint(res.data.msg);
            }
          }
        },
        fail: function () {
          util.failHint();
        }
      })
    }

    if (formType =='repub'){
      wx.request({
        url: app.globalData.host + '/wechat/shb/repub',
        method: "POST",
        header: util.header(),
        data: data,
        success: function (res) {
          if (res.data.status == true) {
            wx.hideLoading();

            for (var i = 0; i < that.data.bikeImgs.length; i++) {
              if (that.data.bikeImgs[i].indexOf(app.globalData.host) == -1) {
                uploadFile(that.data.id, that.data.bikeImgs[i]);
              }
            }
            wx.showModal({
              title: '提示',
              content: '操作成功',
              success: function () {
                wx.redirectTo({
                  url: '../shb-manage/shb-manage',
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
                success: function () {
                  wx.navigateTo({
                    url: '../point/point',
                  })
                }
              })
            }
          }
        },
        fail: function (res) {
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

/*
  deal: function() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定操作吗',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '请稍后...',
          })
          wx.request({
            url: app.globalData.host + '/wechat/shb/deal/' + that.data.id,
            method: "GET",
            header: util.header(),
            success: function(res) {
              wx.hideLoading();
              if (res.data.status) {
                wx.showModal({
                  title: '提示',
                  content: '操作成功',
                  success: function() {
                    wx.redirectTo({
                      url: '../shb-manage/shb-manage',
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
      }
    })
  },
  */

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
      url: app.globalData.host + '/wechat/shb/revoke/' + that.data.id,
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
                url: '../shb-manage/shb-manage',
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
    url: app.globalData.host + '/wechat/shb/upload',
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