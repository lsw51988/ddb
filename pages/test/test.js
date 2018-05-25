// pages/test/test.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag:'true'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
        // wx.getSetting({
        //     success:function(res){
        //         if(res.authSetting['scope.userInfo']){
        //             wx.getUserInfo({
        //                 success:function(res){
        //                     console.log(res.userInfo);
        //                 }
        //             })
        //         }else{
        //             wx.showModal({
        //                 title: '提示,还未授权',
        //                 content: '123',
        //             })
        //         }
        //     }
        // })
        console.log(
            wx.canIUse('open-data.type.userAvatarUrl')
        );
        
  },

  bindGetUserInfo:function(res){
      console.log(res);
  },
  submit:function(e){
      console.log(e);
  }
})