var util = require("../../utils/util.js");
const app = getApp()
Page({
    data: {
        mapCtx: "",
        longitude: "",
        latitude: "",
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
        mobile: "",
        modalFlag: true,
        imageUrl: app.globalData.host + "/wechat/captcha",
        captcha: "",
        cap_btn_text: "获取验证码",
        cap_btn_status: false,
        cap_loading_status: false,
        sms_code_flag: true,
        imgs: []
    },

    onLoad: function (options) {
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    controls: [
                        {
                            id: 0,
                            iconPath: '/img/re-position.png',
                            position: {
                                left: res.windowWidth - 60,
                                top: res.windowHeight * 0.28 - 40,
                                width: 40,
                                height: 40
                            },
                            clickable: true
                        }
                    ]
                });
            },
        })
        wx.getLocation({
            type: "gcj02",
            success: function (res) {
                that.data.longitude = res.longitude;
                that.data.latitude = res.latitude;
                that.setData({
                    longitude: res.longitude,
                    latitude: res.latitude
                });
            },
        })
        this.data.mapCtx = wx.createMapContext("map", this);
    },
    controltap: function (e) {
        //重新定位
        var that = this;
        console.log(e)
    },
    chooseImage: function () {
        var that = this;
        wx.chooseImage({
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                console.log(res);
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                that.setData({
                    bikeImgs: that.data.bikeImgs.concat(res.tempFilePaths)
                });
            }
        })
    },
    previewImage: function (e) {
        wx.previewImage({
            current: e.currentTarget.dataset.src, // 当前显示图片的http链接
            urls: this.data.imgUrls // 需要预览的图片http链接列表
        })
    },
    delImg: function (e) {
        var that = this;
        var bikeImgs = that.data.bikeImgs;
        var bikeImg = e.currentTarget.id;
        for (var i = 0; i < that.data.bikeImgs.length; i++) {
            if (bikeImg == that.data.bikeImgs[i]) {
                delete (that.data.bikeImgs[i]);
                //远程图片也需要删除
                if (bikeImg.indexOf("ddb.com") != -1) {
                    var id = bikeImg.substr(bikeImg.lastIndexOf("/") + 1);
                    wx.showLoading({
                        title: '请稍后...',
                    })
                    wx.request({
                        url: app.globalData.host + '/wechat/member/bikeImg/' + id,
                        method: "DELETE",
                        header: util.header(),
                        success: function (res) {
                            if (res.data.status == true) {
                                wx.hideLoading();
                                wx.showModal({
                                    title: '提示',
                                    content: '删除成功',
                                })
                            } else {
                                util.falseHint(res.data.msg);
                            }
                        },
                        fail: function () {
                            util.failHint()
                        }
                    })
                }
                break;
            }
        }
        var newImgs = [];
        for (var i = 0; i < that.data.bikeImgs.length; i++) {
            if (that.data.bikeImgs[i] != undefined) {
                newImgs.push(that.data.bikeImgs[i]);
            }
        }
        that.setData({
            bikeImgs: newImgs
        });
    },
    getMobile: function (e) {
        this.data.mobile = e.detail.value;
    },
    getCaptcha: function () {
        util.getCaptcha(this);
    },

    model_cancel: function (e) {
        this.setData({
            modalFlag: true
        });
    },

    model_confirm: function (e) {
        util.verifyCaptcha(this);
    },

    freshCaptcha: function () {
        util.freshCaptcha(this);
    },

    captchaBlur: function (e) {
        this.data.captcha = e.detail.value;
    },
})
function uploadFile(repair_id, img) {
    wx.uploadFile({
        url: app.globalData.host + '/wechat/member/upload',
        filePath: img,
        name: "file",
        header: {
            'content-type': "multipart/form-data",
            'token': wx.getStorageSync("member").token
        },
        formData: {
            repair_id: repair_id
        },
        success: function (res) {
            var data = JSON.parse(res.data);
            if (data.status == true) {
                console.log("上图片上传成功");
            } else {
                console.log("图片上传失败");
            }
        },
        fail: function (res) {
            console.log("图片上传失败");
        }
    })
}