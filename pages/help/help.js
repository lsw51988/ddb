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
        appeal_id: ""
    },
    onLoad: function (options) {
        var that = this;
        if (wx.getStorageSync("member").mobile != undefined) {
            wx.showLoading({
                title: '请稍后...',
            })
            wx.request({
                url: app.globalData.host + '/wechat/appeal/create',
                method: "GET",
                header: util.header(),
                success: function (res) {
                    if (res.data.status == true) {
                        wx.hideLoading();
                        if (res.data.data.appeal != undefined) {
                            var appeal = res.data.data.appeal;
                            that.setData({
                                problem_index: appeal.type,
                                desc: appeal.desc,
                                appeal_id: appeal.id
                            });
                        }
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
                                wx.redirectTo({
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

    //暂时隐藏地图拖拽定位功能
    // regionChange: function (e) {
    //     var that = this;
    //     that.data.mapCtx.getCenterLocation({
    //         success: function (res) {
    //             that.data.longitude = res.longitude;
    //             that.data.latitude = res.latitude;
    //         }
    //     });
    // },
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
        formData.mobile = that.data.mobile;
        if (that.data.appeal_id != "") {
            formData.appeal_id = that.data.appeal_id;
        }
        for (var key in formData) {
            if (formData[key] === "" || formData[key] === null) {
                wx.showModal({
                    title: '提示',
                    content: '请填写必填项',
                })
                return false;
            }
        }
        if (formData.method == 2) {
            if (that.data.appeal_id == "") {
                //如果是创建操作才会给出提示
                wx.showModal({
                    title: '提示',
                    content: '该求助方式将消耗您10个积分,且无法回撤,您确定吗?',
                    success: function (res) {
                        if (res.confirm) {
                            help(that, formData)
                        }
                    }
                })
            }else{
                help(that, formData)
            }
        } else {
            help(that, formData)
        }

    }
})

function help(_this, formData) {
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
                wx.hideLoading();
                console.log(res.data.data);
                if (formData.method == 1) {
                    //查看附近维修点
                    wx.navigateTo({
                        url: '../near-mts/near-mts?appeal_id=' + res.data.appeal_id + '&longitude=' + _this.data.longitude + "&latitude=" + _this.data.latitude
                    })
                } else {
                    //寻求拖车帮助
                    wx.navigateTo({
                        url: '../pay-help/pay-help?appeal_id=' + res.data.appeal_id+'&longitude=' + _this.data.longitude + "&latitude=" + _this.data.latitude
                    })
                }
            } else {
                wx.hideLoading();
                if (res.data.msg.no_repairs!=undefined) {
                    wx.showModal({
                        title: '提示',
                        content: '附近没有记录的维修点,您如果看到可手动添加,获得很多积分哦'
                    })
                }else{
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg
                    })
                }
            }
        },
        fail: function (res) {
            util.failHint();
        }
    })
}