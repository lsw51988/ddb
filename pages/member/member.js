const app = getApp();
Page({
    data: {

    },
    onShareAppMessage: function (res) {
        return {
            title: '电动帮',
            path: '/pages/member/member',
            success: function (res) {
                console.log(res);
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
            'imgUrl': app.globalData.host + "/wechat/qr_code"
        });
    },
    previewImage: function (e) {
        console.log(e);
        wx.previewImage({
            current: "https://www.ebikea.com/api/member/qr_code?_t=" + Date.parse(new Date()), // 当前显示图片的http链接
            urls: ["https://www.ebikea.com/api/member/qr_code?_t=" + Date.parse(new Date())] // 需要预览的图片http链接列表
        })
    },
    memberMaterial:function(){
      wx.navigateTo({
        url: '../member_detail/member_detail',
      })
    }
})