var util = require("../../utils/util.js");
const app = getApp()
Page({
    data: {
        problem: [
            "爆胎",
            "漏气",
            "无法启动",
            "锁坏了",
            "接触不良",
            "其他",
        ],
        problem_index: 0,
        cap_btn_text: "获取验证码",
        cap_loading_status: false,
        cap_btn_status: false,
        imageUrl: app.globalData.host + "/api/member/captcha",
        latitude: "",
        longitude: "",
        mapCtx: "",
        captcha: "",
        noNeedCaptcha: false,
        modalFlag: true,
        mobile: "",
        mobile_show: "",
        sms_code_flag: true,
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
                                top: res.windowHeight * 0.4 - 40,
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
        that.data.mapCtx = wx.createMapContext("map", that);
        if (wx.getStorageSync("member").mobile == undefined) {
            wx.showLoading({
                title: '请稍后...',
            })
            wx.request({
                url: app.globalData.host + '/wechat/appeal/mobile',
                method: "GET",
                header: util.header(),
                success: function (res) {
                    if (res.data.status == true) {
                        wx.hideLoading();
                        that.setData({
                            "mobile": res.data.data.mobile,
                            "mobile_show": res.data.data.mobile.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')
                        })
                    } else {
                        wx.hideLoading();
                        wx.showModal({
                            title: '提示',
                            content: '您尚未认证,请先去认证',
                            success: function (res) {
                                wx.navigateTo({
                                    url: '../member_detail/member_detail',
                                })
                            }
                        })
                    }
                },
                fail: function (res) {
                    util.failHint();
                }
            })
        }
    },

    problemChange: function (e) {
        this.setData({
            problem_index: e.detail.value
        })
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

    captchaBlur: function (e) {
        this.data.captcha = e.detail.value;
    },

    freshCaptcha: function () {
        util.freshCaptcha(this);
    },

    regionChange: function (e) {
        var that = this;
        that.data.mapCtx.getCenterLocation({
            success: function (res) {
                that.data.longitude = res.longitude;
                that.data.latitude = res.latitude;
            }
        });
    },
    controltap: function (e) {
        //重新定位
        var that = this;
        this.data.mapCtx.moveToLocation();
        this.data.mapCtx.getCenterLocation({
            success: function (e) {
                that.data.latitude = e.latitude;
                that.data.longitude = e.longitude;
            }
        })
    },

    formSubmit: function (e) {
        var that = this;
        var formData = e.detail.value;
        formData.method = e.detail.target.dataset.id;
        formData.longitude = that.data.longitude;
        formData.latitude = that.data.latitude;
        console.log(formData);
        for (var key in formData) {
            if (formData[key] === "" || formData[key] === null) {
                wx.showModal({
                    title: '提示',
                    content: '请填写必填项',
                })
                return false;
            }
        }
        wx.showLoading({
            title: '请稍后...',
        })
        wx.request({
            url: app.globalData.host + "/wechat/appeal/create",
            method: "POST",
            header: util.header(),
            data: formData,
            success: function (res) {
                if (res.data.status == true) {
                    console.log("成功");
                    if (formData.method == 1) {
                        //查看附近维修点

                    } else {
                        //寻求拖车帮助

                    }
                } else {
                    util.falseHint(res.data.msg);
                }
            },
            fail: function (res) {
                util.failHint();
            }
        })
    }
})