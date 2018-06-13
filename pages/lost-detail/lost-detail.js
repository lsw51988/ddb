var util = require("../../utils/util.js");
const app = getApp();
Page({
    data: {
        imgUrls: [],
        indicatorDots: false,
        autoplay: false,
        interval: 5000,
        duration: 1000,
        windowWidth: wx.getSystemInfoSync().windowWidth,
        bikeInfo: [],
        lost_date: "",
        id: ""
    },

    onShareAppMessage: function () {
        return util.share(this);
    },

    onLoad: function (e) {
        var that = this;
        that.data.id = e.id;
        wx.showLoading({
            title: '请稍后...',
        })
        wx.request({
            url: app.globalData.host + '/wechat/lost/detail/' + that.data.id,
            methond: "GET",
            header: util.header(),
            success: function (res) {
                if (res.data.status == true) {
                    wx.hideLoading();
                    var data = res.data.data;
                    that.setData({
                        bikeInfo: data,
                        imgUrls: data.imgUrls
                    });
                } else {
                    util.falseHint(res.data.msg);
                }
            },
            fail: function () {
                util.failHint();
            }
        })
        wx.request({
            url: app.globalData.host + '/wechat/lost/browse/' + that.data.id,
            method: "GET",
            header: util.header(),
            success: function () { },
            fail: function () { }
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

    makePhoneCall: function () {
        var that = this;
        wx.makePhoneCall({
            phoneNumber: that.data.bikeInfo['mobile'],
            success: function () {
                wx.request({
                    url: app.globalData.host + '/wechat/lost/contact/' + that.data.id,
                    method: "GET",
                    header: util.header(),
                    success: function () { },
                    fail: function () { }
                })
            },
            fail: function () {
                wx.showModal({
                    title: '提示',
                    content: '好像出错了,请重试',
                })
            }
        })
    }
})