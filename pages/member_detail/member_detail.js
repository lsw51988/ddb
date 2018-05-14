var util = require("../../utils/util.js");
const app = getApp()
Page({
    data: {
        voltage: ["48V", "60V", "72V", "96V", "其他"],
        voltage_index: 0,
        modalFlag: true,
        imageUrl: app.globalData.host + "/wechat/captcha",
        captcha: "",
        cap_btn_text: "获取验证码",
        cap_btn_status: false,
        cap_loading_status: false,
        mobile: "",
        status: 1,
        sms_code_flag: true,
        bikeImgs: []
    },

    onLoad: function (options) {
        var that = this;
        wx.request({
            url: app.globalData.host + '/wechat/member/auth',
            method: 'GET',
            header: util.header(),
            success: function (res) {
                var data = res.data.data;
                that.setData({
                    "memberData": data
                });
                that.data.real_name = data['real_name'];
                var index = 0;
                for (var i = 0; i < that.data.voltage.length; i++) {
                    if (data['voltage'] == that.data.voltage[i])
                        index = i;
                    break;
                }
                that.setData({
                    "real_name": data['real_name'],
                    "mobile": data['mobile'],
                    "brand_name": data['brand_name'],
                    "buy_date": data['buy_date'].substring(0, 7),
                    "number": data['number'],
                    "voltage_index": index,
                    "price": data['price'],
                    "status": data['status'],
                    "last_change_time": data['last_change_time'].substring(0, 7),
                    "bikeImgs": data['bikeImgs']
                })
            },
            fail: function (res) { 
                util.failHint();
            }
        })
    },

    brandChange: function (e) {
        this.setData({
            brand_index: e.detail.value
        })
    },

    buyTimeChange: function (e) {
        this.setData({
            buy_date: e.detail.value
        })
    },

    voltageChange: function (e) {
        this.setData({
            voltage_index: e.detail.value
        })
    },

    batteryChangeTime: function (e) {
        this.setData({
            last_change_time: e.detail.value
        })
    },

    tapNew: function () {
        this.setData({
            buy_status: '1'
        })
    },

    tapOld: function () {
        this.setData({
            buy_status: '2'
        })
    },

    getMobile: function (e) {
        this.data.mobile = e.detail.value;
    },

    getCaptcha: function (e) {
        var that = this;
        if (!(/^1\d{10}$/.test(that.data.mobile))) {
            wx.showModal({
                title: '提示',
                content: '请输入正确的手机号码',
            });
            return false;
        }
        util.getCaptcha(that);
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

    formSubmit: function (e) {
        var that = this;
        if (that.data.bikeImgs.length < 3) {
            wx.showModal({
                title: '提示',
                content: '电动车照片至少上传3张',
            });
            return;
        }

        if (that.data.bikeImgs.length > 5) {
            wx.showModal({
                title: '提示',
                content: '电动车照片最多上传5张',
            });
            return;
        }
        var data = e.detail.value;
        for (var key in data) {
            if (key != 'last_change_time' && (data[key] === "" || data[key] === null)) {
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
            url: app.globalData.host + '/wechat/member/auth',
            method: "POST",
            header: util.header(),
            data: data,
            success: function (res) {
                wx.hideLoading();
                if (res.data.status == true) {
                    wx.hideLoading();
                    wx.showModal({
                        title: '提示',
                        content: '操作成功',
                    })
                    //上传文件
                    console.log(res.data);
                    var member_bike_id = res.data.data.member_bike_id;
                    for (var i = 0; i < that.data.bikeImgs.length; i++) {
                        if (that.data.bikeImg[i].indexOf("ddb.com") == -1) {
                            uploadFile(member_bike_id, that.data.bikeImgs[i]);
                        }
                    }
                } else {
                    util.falseHint(res.data.msg);
                }
            },
            fail: function (res) {
                util.failHint();
            }
        })
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
            current: e.currentTarget.id, // 当前显示图片的http链接
            urls: this.data.bikeImgs // 需要预览的图片http链接列表
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
                if (bikeImg.indexOf("ddb.com")!=-1){
                    var id = bikeImg.substr(bikeImg.lastIndexOf("/") + 1);
                    wx.showLoading({
                        title: '请稍后...',
                    })
                    wx.request({
                        url: app.globalData.host + '/wechat/member/bikeImg/'+id,
                        method: "DELETE",
                        header: util.header(),
                        success:function(res){
                            if(res.data.status==true){
                                wx.hideLoading();
                                wx.showModal({
                                    title: '提示',
                                    content: '删除成功',
                                })
                            }else{
                                util.falseHint(res.data.msg);
                            }
                        },
                        fail:function(){
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
})
function uploadFile(member_bike_id, img) {
    wx.uploadFile({
        url: app.globalData.host + '/wechat/member/upload',
        filePath: img,
        name: "file",
        header: {
            'content-type': "multipart/form-data",
            'token': wx.getStorageSync("member").token
        },
        formData: {
            member_bike_id: member_bike_id
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
