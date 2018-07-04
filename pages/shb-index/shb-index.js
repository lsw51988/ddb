var util = require("../../utils/util.js");
Page({

    onShareAppMessage: function () {
        return util.share(this);
    },

    goto_sell: function () {
        wx.navigateTo({
            url: '../shb-sell/shb-sell',
        })
    },
    goto_buy: function () {
        wx.navigateTo({
            url: '../shb-list/shb-list',
        })
    },
    goto_manager: function () {
        wx.navigateTo({
            url: '../shb-manage/shb-manage',
        })
    }
})