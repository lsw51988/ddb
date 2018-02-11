Page({
  data: {
    
  },

  onLoad: function (options) {
    var that = this;
    console.log(wx.getStorageSync('member'));
    that.setData({
      'member': wx.getStorageSync("member")
    });
  }
})