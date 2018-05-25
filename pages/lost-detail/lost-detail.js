// 丢失求助页面
Page({
    data: {
        imgUrls: [
            'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
            'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
            'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
        ],
        indicatorDots: false,
        autoplay: false,
        interval: 5000,
        duration: 1000,
        windowWidth: wx.getSystemInfoSync().windowWidth,
        region: ['江苏省', '南京市', '秦淮区'],
        lost_date: ""
    },

    onLoad: function (options) {

    },

    previewImage: function (e) {
        wx.previewImage({
            current: e.currentTarget.dataset.src, // 当前显示图片的http链接
            urls: this.data.imgUrls // 需要预览的图片http链接列表
        })
    },

    lostDateChange: function (e) {
        this.setData({
            lost_date: e.detail.value
        })
    },

    formSubmit: function (e) {
        var data = e.detail.value;
    }
})