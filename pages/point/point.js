var md5 = require("../../utils/md5.js");
Page({
  data: {
    amount:10
  },

  onLoad: function (options) {
      console.log(md5.hexMD5("appid=wxd930ea5d5a258f4f&body=test&device_info=1000&mch_id=10000100&nonce_str=ibuaiVcKdpRxkhJA&key=192006250b4c09247ec02edce69f6a2d"));
  },
  choose:function(e){
      var amount = e.currentTarget.dataset.amount;
      this.setData({
          amount: amount
      });
  },
  withdraw:function(){
    var amount = this.data,amount;
    console.log(amount);
    wx.requestPayment({
        timeStamp: Date.parse(new Date()),
        nonceStr: md5.hexMD5(Date.parse(new Date())),
        package: '',
        signType: 'MD5',
        paySign: '',
    })
  }
})