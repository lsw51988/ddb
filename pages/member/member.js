const app = getApp();
Page({
    data: {

    },
    onShareAppMessage: function (res) {
        return {
            title: '电动帮',
            path: '/pages/member/member',
            success: function (res) {
                wx.showModal({
                    title: '提示',
                    content: '转发成功',
                    success: function () {
                        wx.getShareInfo({
                            shareTicket: res.shareTickets[0],
                            success: function (res1) {
                                console.log(res1);
                            }
                        })
                    }
                })
            },
            fail: function (res) {
                wx.showModal({
                    title: '提示',
                    content: '转发失败',
                })
            }
        }
    },

    onLoad: function (options) {
        var that = this;
        wx.showShareMenu({
            withShareTicket: true
        })
        that.setData({
            'member': wx.getStorageSync('member'),
            'avatarUrl': app.globalData.host + '/wechat/avatar?path=' + wx.getStorageSync('member').avatarUrl,
            'imgUrl': app.globalData.host + "/wechat/qr_code"
        });
    },

    previewImage: function (e) {
        wx.previewImage({
            current: app.globalData.host +"/wechat/qr_code?_t=" + Date.parse(new Date()), // 当前显示图片的http链接
            urls: [app.globalData.host +"/wechat/qr_code?_t=" + Date.parse(new Date())] // 需要预览的图片http链接列表
        })
    },

    goto_member_want:function(){
      wx.navigateTo({
          url: '../member-want/member-want',
      })
    },

    goto_shb_index:function(){
        wx.navigateTo({
            url: '../shb-index/shb-index',
        })
    },

    goto_member_avatar:function(){
        wx.navigateTo({
            url: '../member_avatar/member_avatar',
        })
    },

    goto_suggestions:function(){
        wx.navigateTo({
            url: '../suggestion/suggestion',
        })
    },

    goto_lost_list:function(){
        wx.navigateTo({
            url: '../lost-list/lost-list',
        })
    },

    goto_about:function(){
        wx.navigateTo({
            url: '../about/about',
        })
    },

    goto_recommend: function () {
        wx.navigateTo({
            url: '../recommend/recommend',
        })
    },

    goto_member_log: function () {
        wx.navigateTo({
            url: '../member_log/member_log',
        })
    }
})