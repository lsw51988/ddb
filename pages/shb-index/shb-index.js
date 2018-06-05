var util = require("../../utils/util.js");
Page({
    goto_sell:function(){
        wx.navigateTo({
            url: '../shb-sell/shb-sell',
        })
    },
    goto_buy: function () {
        wx.navigateTo({
            url: '../shb-list/shb-list',
        })
    }
})