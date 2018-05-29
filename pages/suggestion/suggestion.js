// 建议页面
var util = require("../../utils/util.js");
const app = getApp()
Page({
    data: {
        checkboxItems: [
            { name: '页面美观', value: '0' },
            { name: '操作复杂.', value: '1' }
        ],
        types:[]
    },

    onLoad: function (options) {

    },

    checkboxChange: function (e) {
        var that = this;
        var checkboxItems = this.data.checkboxItems, values = e.detail.value;
        for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
            checkboxItems[i].checked = false;
            for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
                if (checkboxItems[i].value == values[j]) {
                    checkboxItems[i].checked = true;
                    break;
                }
            }
        }

        this.setData({
            checkboxItems: checkboxItems
        });
        that.data.types = e.detail.value;
    },

    formSubmit:function(e){
        var data = {};
        data.type = this.data.types;
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