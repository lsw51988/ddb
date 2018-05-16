
Page({
    data:{
       
    },
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