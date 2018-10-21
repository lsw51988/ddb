var util = require("../../utils/util.js");
const app = getApp()
Page({
  data: {
    mapCtx: "",
    longitude: "",
    latitude: "",
    active: 0,
    show_list: [],
    sos_list: [],
    problem: [
      "爆胎",
      "漏气",
      "无法启动",
      "锁坏了",
      "接触不良",
      "其他",
    ],
    timer: '',
    show_markers: [],
    sos_markers: [],
    i: 0,
    active_tab: 0
  },

  onShareAppMessage: function() {
    return util.share(this);
  },

  onLoad: function(options) {
    var that = this;
    that.data.timer = setInterval(function() {
      if (that.data.i % 10 == 0) {
        nearAppeals(that);
      }
      that.data.i++;
    }, 1000);

    wx.getSystemInfo({
      success: function(res) {
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
      success: function(res) {
        that.data.longitude = res.longitude;
        that.data.latitude = res.latitude;
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude
        });
      },
    })
    this.data.mapCtx = wx.createMapContext("pay_help_map", this);
  },

  onShow: function() {
    var that = this;
    if (that.data.time == "") {
      that.data.timer = setInterval(function() {
        if (that.data.i % 10 == 0) {
          nearAppeals(that);
        }
        that.data.i++;
      }, 1000);
    }
  },

  onHide: function() {
    var that = this;
    clearInterval(that.data.timer);
  },

  onUnload: function() {
    var that = this;
    clearInterval(that.data.timer);
  },

  appealClick: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var latitude = "";
    var longitude = ""

    if (that.data.active_tab == 0) {
      for (var i = 0; i < that.data.sos_markers.length; i++) {
        if (that.data.sos_markers[i].id == id) {
          that.data.sos_markers[i].iconPath = "/img/man-click.png";
          latitude = that.data.sos_markers[i].latitude
          longitude = that.data.sos_markers[i].longitude
        } else {
          that.data.sos_markers[i].iconPath = "/img/man.png";
        }
      }
      that.setData({
        scale: 19,
        markers: that.data.sos_markers,
        latitude: latitude,
        longitude: longitude
      });
    } else {
      for (var i = 0; i < that.data.show_markers.length; i++) {
        if (that.data.show_markers[i].id == id) {
          that.data.show_markers[i].iconPath = "/img/man-click.png";
          latitude = that.data.show_markers[i].latitude
          longitude = that.data.show_markers[i].longitude
        } else {
          that.data.show_markers[i].iconPath = "/img/man.png";
        }
      }
      that.setData({
        scale: 19,
        markers: that.data.show_markers,
        latitude: latitude,
        longitude: longitude
      });
    }

  },

  controltap: function(e) {
    //重新定位
    var that = this;
    this.data.mapCtx.moveToLocation();
    this.data.mapCtx.getCenterLocation({
      success: function(e) {
        that.data.latitude = e.latitude;
        that.data.longitude = e.longitude;
      }
    })
  },
  changetab: function(opt) {
    var that = this;
    that.data.active_tab = opt.target.dataset.active;
    if (opt.target.dataset.active == 0) {
      that.setData({
        "active": opt.target.dataset.active,
        'markers': that.data.sos_markers
      });
    } else {
      that.setData({
        "active": opt.target.dataset.active,
        'markers': that.data.show_markers
      });
    }
  },

  makePhoneCall: function(e) {
    var mobile = e.target.dataset.mobile;
    var id = e.target.dataset.id;
    wx.makePhoneCall({
      phoneNumber: mobile,
      success: function() {
        wx.request({
          url: app.globalData.host + '/wechat/appeal_answer/make_phone_call/' + id,
          method: "GET",
          header: util.header(),
          success: function() {},
          fail: function() {}
        })
      },
      fail: function() {
        wx.showModal({
          title: '提示',
          content: '好像出错了,请重试',
        })
      }
    })
  }
})

function nearAppeals(that) {
  wx.showLoading({
    title: '请稍后...',
  })
  wx.request({
    url: app.globalData.host + '/wechat/appeal_answer/near_appeals',
    method: "GET",
    header: util.header(),
    data: {
      'longitude': wx.getStorageSync('longitude'),
      'latitude': wx.getStorageSync('latitude')
    },
    success: function(res) {
      wx.hideLoading();
      if (res.data.status) {
        var data = res.data.data;
        if (data.show != undefined) {
          var show_markers = [];
          for (var i = 0; i < data.show.length; i++) {
            var marker = {};
            marker.id = data.show[i].id;
            marker.latitude = data.show[i].latitude;
            marker.longitude = data.show[i].longitude;
            marker.width = 20;
            marker.height = 20;
            marker.iconPath = "/img/man.png";
            show_markers[i] = marker;
          }
          that.data.show_markers = show_markers;
          that.setData({
            'show_list': data.show
          });
        }
        if (data.sos != undefined) {
          var sos_markers = [];
          for (var i = 0; i < data.sos.length; i++) {
            var marker = {};
            marker.id = data.sos[i].id;
            marker.latitude = data.sos[i].latitude;
            marker.longitude = data.sos[i].longitude;
            marker.width = 20;
            marker.height = 20;
            marker.iconPath = "/img/man.png";
            sos_markers[i] = marker;
          }
          that.data.sos_markers = sos_markers;
          that.setData({
            'sos_list': data.sos,
            'markers': sos_markers
          });
        }
      }
    },
    fail: function() {
      util.failHint();
    }
  })
}