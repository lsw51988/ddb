//拖车帮助请求
var util = require("../../utils/util.js");
const app = getApp()
Page({
    data: {
        mapCtx: "",
        longitude: "",
        latitude: "",
        appeal_id:"",
        markers: [],
    },

    onShareAppMessage: function () {
        return util.share(this);
    },

    onLoad: function (options) {
        var that = this;
        that.data.latitude = options.latitude
        that.data.longitude = options.longitude
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    "appeal_id": options.appeal_id,
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
                wx.request({
                    url: app.globalData.host + '/wechat/repair/near_mts',
                    method: "POST",
                    header: util.header(),
                    data: {
                        longitude: that.data.longitude,
                        latitude: that.data.latitude
                    },
                    success: function (res) {
                        if (res.data.status == true) {
                            var data = res.data.data;
                            var markers = [];
                            for (var i = 0; i < data.length; i++) {
                                var marker = {};
                                marker.id = data[i].id;
                                marker.latitude = data[i].latitude;
                                marker.longitude = data[i].longitude;
                                marker.width = 20;
                                marker.height = 20;
                                marker.iconPath = "/img/mt.png";
                                markers[i] = marker;
                            }
                            that.setData({
                                markers: markers,
                                mts_list: res.data.data
                            });
                        } else {
                            wx.showModal({
                                title: '提示',
                                content: res.data.msg,
                            })
                        }
                    },
                    fail: function (res) {
                        wx.showModal({
                            title: '提示',
                            content: "服务器内部错误",
                        })
                    }
                })
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
        this.data.mapCtx = wx.createMapContext("pay_help_map", this);
    },

    controltap: function (e) {
        var that = this;
        this.data.mapCtx.moveToLocation();
        this.data.mapCtx.getCenterLocation({
            success: function (e) {
                that.data.latitude = e.latitude;
                that.data.longitude = e.longitude;
            }
        })
    },

    cancelHelp: function (e) {
        wx.showModal({
            title: '提示',
            content: '您确定取消吗?',
            success: function (res) {
                if (res.confirm) {
                    var id = e.target.dataset.id
                    wx.showLoading({
                        title: '请稍后...',
                    })
                    wx.request({
                        url: app.globalData.host + '/wechat/appeal/cancel/' + id,
                        method: "GET",
                        header: util.header(),
                        success: function (res) {
                            if (res.data.status == true) {
                                wx.hideLoading();
                                wx.showModal({
                                    title: '提示',
                                    content: '操作成功',
                                    success: function (res) {
                                        if (res.confirm) {
                                            wx.redirectTo({
                                                url: '../member/member',
                                            })
                                        }
                                    }
                                })
                            } else {
                                util.falseHint();
                            }
                        },
                        fail: function (res) {
                            util.failHint();
                        }
                    })
                }
            }
        })
    },
})