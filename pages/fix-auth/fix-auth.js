//附近维修点
const app = getApp()
var util = require("../../utils/util.js");
Page({
    data: {
        mapCtx: "",
        longitude: "",
        latitude: "",
        mts_list: [],
        markers:[],
        scale: 18,
        current_item_id: ""
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
                //获取附近所有的维修点
                wx.request({
                    url: app.globalData.host + '/wechat/repair/near_mts',
                    method:"POST",
                    header: util.header(),
                    data: {
                        longitude: res.longitude,
                        latitude: res.latitude
                    },
                    success: function (res) {
                        if (res.data.status == true) {
                            var data = res.data.data;
                            var markers = [];
                            for(var i =0;i<data.length;i++){
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
                                markers: markers
                            });

                            that.setData({
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
        this.data.mapCtx = wx.createMapContext("near_map", this);
    },
    controltap: function (e) {
        //重新定位
        console.log(e);
        var that = this;
        this.data.mapCtx.moveToLocation();
        this.data.mapCtx.getCenterLocation({
            success: function (e) {
                that.data.latitude = e.latitude;
                that.data.longitude = e.longitude;
            }
        })
    },
    goto_add_mts: function () {
        wx.request({
            url: app.globalData.host + '/wechat/appeal/mobile',
            method: "GET",
            header: util.header(),
            success: function (res) {
                if (res.data.status == true) {
                    wx.hideLoading();
                    wx.navigateTo({
                        url: '../add-mts/add-mts',
                    })
                } else {
                    wx.hideLoading();
                    wx.showModal({
                        title: '提示',
                        content: '您尚未认证,请先去认证',
                        success: function (res) {
                            wx.redirectTo({
                                url: '../member_detail/member_detail',
                            })
                        }
                    })
                }
            },
            fail: function (res) {
                util.failHint();
            }
        })
    },

    goto_fix_auth_detail: function (e) {
        var id = e.currentTarget.dataset.id;
        var longitude = e.currentTarget.dataset.longitude;
        var latitude = e.currentTarget.dataset.latitude;
        wx.navigateTo({
            url: '../fix-auth-detail/fix-auth-detail?id=' + id + "&longitude=" + longitude + "&latitude=" + latitude,
        })
    },

    mt_click:function(e){
        var that = this;
        var id = e.currentTarget.dataset.id;
        for (var i = 0; i < that.data.markers.length;i++){
            that.data.markers[i].iconPath = "/img/mt.png";
        }
        that.data.markers[id-1].iconPath = "/img/mt-click.png";
        that.setData({
            current_item_id: id,
            scale: 19,
            markers: that.data.markers
        });
    }
})