// 丢失求助页面
var util = require("../../utils/util.js");
const app = getApp()
Page({
    data: {
        imgUrls: [],
        indicatorDots: false,
        autoplay: false,
        interval: 5000,
        duration: 1000,
        windowWidth: wx.getSystemInfoSync().windowWidth,
        region: [],
        lost_date: "",
        address: "",
        btnText: "提交",
        lostBikeId: ""
    },

    onShareAppMessage: function () {
        return util.share(this);
    },
    
    onLoad: function (options) {
        var that = this;
        if (wx.getStorageSync("member").mobile == undefined) {
            util.memberAuth();
        }
        wx.showLoading({
            title: '请稍后...',
        })
        wx.request({
            url: app.globalData.host + '/wechat/lost/create',
            method: "GET",
            header: util.header(),
            success: function (res) {
                if (res.data.status == true) {
                    wx.hideLoading();
                    var data = res.data.data;
                    that.setData({
                        region: data.location,
                        imgUrls: data.bikeImages
                    });
                    if (data.lostBike != null) {
                        that.setData({
                            lost_date: data.lostBike.lost_date,
                            address: data.lostBike.address,
                            memo: data.lostBike.memo,
                            rewards: data.lostBike.rewards,
                            btnText: "更新",
                            lostBikeId: data.lostBike.id
                        });
                    }
                } else {
                    util.falseHint(res.data.msg);
                }
            },
            fail: function (res) {
                util.failHint();
            }
        })
    },

    previewImage: function (e) {
        wx.previewImage({
            current: e.currentTarget.dataset.src, // 当前显示图片的http链接
            urls: this.data.imgUrls // 需要预览的图片http链接列表
        })
    },

    lostDateChange: function (e) {
        this.setData({
            lost_date: e.detail.value
        })
    },

    formSubmit: function (e) {
        var that = this;
        var data = e.detail.value;
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
        if (that.data.lostBikeId != "") {
            data.lostBikeId = that.data.lostBikeId;
        }
        wx.request({
            url: app.globalData.host + '/wechat/lost/create',
            method: "POST",
            header: util.header(),
            data: data,
            success: function (res) {
                if (res.data.status == true) {
                    wx.hideLoading();
                    if (that.data.btnText == "提交") {
                        wx.showModal({
                            title: '提示',
                            content: '发布成功,记得每天到此页面刷新哦,祝愿您早日找回.',
                            success: function (res) {
                                wx.navigateBack()
                            }
                        })
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: '刷新成功.',
                            success: function (res) {
                                wx.navigateBack()
                            }
                        })
                    }
                } else {
                    wx.hideLoading();
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        success: function (res) {
                            wx.navigateBack()
                        }
                    })
                }
            },
            fail: function (res) {
                util.failHint();
            }
        })
    }
})