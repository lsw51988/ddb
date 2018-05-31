var util = require("../../utils/util.js");
const app = getApp()
Page({
  data: {
    amount:1000
  },

  choose:function(e){
      var amount = e.currentTarget.dataset.amount;
      this.setData({
          amount: amount
      });
  },
  withdraw:function(){
    var amount = this.data.amount;
    console.log(amount);
    wx.request({
        url: app.globalData.host +'/wechat/point/pay',
        method:"POST",
        data:{
            total_fee:amount
        },
        header:util.header(),
        success:function(res){
            if(res.data.status){
                var data = res.data.data;
                var orderId = data.orderId;
                wx.requestPayment({
                    'timeStamp': data.timeStamp.toString(),
                    'nonceStr': data.nonceStr,
                    'package': data.package,
                    'signType': 'MD5',
                    'paySign': data.paySign,
                    success:function(payRes){
                        wx.showLoading({
                            title: '请稍后...',
                        })
                        wx.request({
                            url: app.globalData.host+'/wechat/point/pay_callback',
                            header:util.header(),
                            method:"POST",
                            data:{
                                'orderId': orderId
                            },
                            success:function(){
                                wx.hideLoading();
                                wx.showModal({
                                    title: '提示',
                                    content: '充值成功',
                                })
                            },
                            fail:function(){
                                wx.hideLoading();
                                wx.showModal({
                                    title: '提示',
                                    content: '电动帮服务器内部错误',
                                })
                            }
                        })
                    },
                    fail:function(res){
                        wx.showModal({
                            title: '提示',
                            content: '充值失败',
                        })
                    }
                })
            }else{
                wx.showModal({
                    title: '提示',
                    content: res.data.msg,
                })
            }
        },
        fail:function(res){
            wx.showModal({
                title: '提示',
                content: '签名失败',
            })
        }
    })
  }
})