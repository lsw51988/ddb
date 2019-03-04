//app.js
var util = require("utils/util.js");
App({
    onLaunch: function (res) {
        wx.setStorageSync("scene_code", res.scene);
        //检查当前token是否有效,如果无效则,重新获取token并写入本地缓存
        if (wx.getStorageSync("member").id!=undefined) {
            wx.request({
                //url: 'http://local.ddb.com/wechat/checkToken',
                url: 'https://www.njddb.com/wechat/checkToken',
                method: "POST",
                header: util.header(),
                data: {
                    "member_id": wx.getStorageSync('member').id
                },
                success: function (res) {
                    if (!res.data.status) {
                        var data = res.data.data;
                        wx.setStorageSync("member", data);
                    }
                },
                fail: function (res) {
                    util.failHint();
                }
            })
        }
    },
    globalData: {
      userInfo: null,
      host: "https://www.njddb.com",
      //host: "http://local.ddb.com",
    }
})