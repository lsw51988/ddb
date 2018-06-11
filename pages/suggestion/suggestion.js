// 建议页面
var util = require("../../utils/util.js");
const app = getApp()
Page({
    data: {
        'types': ["用户完善资料", "修理者认证", "求助", "丢失求助", "积分充值", "二手车", "推荐"],
        type_index: 0
    },

    onShareAppMessage: function () {
        return util.share(this);
    },
    
    onLoad: function (options) {

    },

    typeChange: function (e) {
        this.setData({
            type_index: e.detail.value
        })
    },

    formSubmit: function (e) {
        var data = {};
        data.type = this.data.type_index;
        data.content = e.detail.value.content;
        wx.showLoading({
            title: '请稍后...',
        })
        wx.request({
            url: app.globalData.host + '/wechat/suggestion/create',
            method: "POST",
            header: util.header(),
            data: data,
            success: function (res) {
                wx.hideLoading();
                if (res.data.status == true) {
                    wx.hideLoading();
                    wx.showModal({
                        title: '提示',
                        content: '操作成功',
                        success: function () {
                            wx.navigateBack()
                        }
                    })
                } else {
                    util.falseHint(res.data.msg);
                }
            },
            fail: function (res) {
                util.failHint();
            }
        })
    }
})