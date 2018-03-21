// pages/socket/socket.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //建立连接
    wx.connectSocket({
      url: "ws://local.ddb.com:9502",
    })
    //连接成功
    wx.onSocketOpen(function () {
      wx.sendSocketMessage({
        data:{
          "member_id":100,
        },
      })
    })

    wx.onSocketMessage(function (data) {
      console.log(data);
    })

    //连接失败
    wx.onSocketError(function () {
      console.log('websocket连接失败！');
    })
  },
})