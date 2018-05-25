const app = getApp()
var util = require("../../utils/util.js");
Page({
    onGotUserInfo: function (e) {
        if (!wx.getStorageSync("member").union_flag) {
            //拒绝授权
            if (e.detail.errMsg == 'getUserInfo:fail auth deny') {
                wx.openSetting({
                    success: function (res) {
                        if (res.authSetting['scope.userInfo']) {
                            wx.showLoading({
                                title: '请稍后...',
                            })
                            wx.getUserInfo({
                                success: function (userRes) {
                                    var data = {};
                                    data.encryptedData = userRes.encryptedData;
                                    data.iv = userRes.iv;
                                    data.avatarUrl = userRes.userInfo.avatarUrl;
                                    data.nickName = userRes.userInfo.nickName;
                                    data.gender = userRes.userInfo.gender;
                                    improveUserInfo(data);
                                }
                            })
                        } else {
                            wx.showModal({
                                title: '提示',
                                content: '您已拒绝授权身份信息，可能会影响与APP的数据同步，需在微信【发现】-【小程序】-删除【电动帮】，重新授权'
                            })
                        }
                    }
                })
            } else {
                //同意授权
                var data = {};
                wx.showLoading({
                    title: '请稍后...',
                })
                data.encryptedData = e.detail.encryptedData;
                data.iv = e.detail.iv;
                data.avatarUrl = e.detail.userInfo.avatarUrl;
                data.nickName = e.detail.userInfo.nickName;
                data.gender = e.detail.userInfo.gender;
                improveUserInfo(data);
            }
        }else{
            wx.navigateTo({
                url: '../member_detail/member_detail',
            })
        }
    },

    goto_fix_auth: function () {
        wx.navigateTo({
            url: '../fix-auth/fix-auth',
        })
    },
    goto_help: function () {
        wx.navigateTo({
            url: '../help/help',
        })
    },
    goto_lost_help: function () {
        wx.navigateTo({
            url: '../lost-help/lost-help',
        })
    }
})
function improveUserInfo(data) {
    wx.request({
        url: app.globalData.host + '/wechat/member/userInfo',
        method: "POST",
        header: util.header(),
        data: data,
        success: function (res) {
            wx.hideLoading();
            if (!res.data.status) {
                wx.showModal({
                    title: '提示',
                    content: res.data.msg
                })
            } else {
                var member = wx.getStorageSync("member");
                member.union_flag = true;
                wx.setStorageSync("member",member)
                wx.navigateTo({
                    url: '../member_detail/member_detail',
                })
            }
        },
        fail: function () {
            wx.hideLoading();
            wx.showModal({
                title: '提示',
                content: "获取unionid出错:服务器内部错误"
            })
        }
    })
}