var util = require("../../utils/util.js");
const app = getApp();
Page({
    data: {
        region: [],
        customItem: '全部',
        voltage: ["48V", "60V", "72V", "96V", "其他"],
        voltage_index: 0,
        memberData: [],
        bikeImgs: [],
        status:1,
        detail_addr:"",
        last_change_time:"未更换"
    },

    onShareAppMessage: function () {
        return util.share(this);
    },

    onLoad: function (options) {
        var that = this;
        wx.showLoading({
            title: '请稍后...',
        })
        wx.request({
            url: app.globalData.host + '/wechat/member/auth',
            header: util.header(),
            success: function (res) {
                if (res.data.status == true) {
                    wx.hideLoading();
                    that.data.memberData = res.data.data;
                    var memberData = that.data.memberData;
                    var index = 0;
                    for (var i = 0; i < that.data.voltage.length; i++) {
                        if (memberData['voltage'] == that.data.voltage[i])
                            index = i;
                        break;
                    }
                    console.log(that.data.memberData);
                    var last_change_time = memberData["last_change_time"];
                    if (last_change_time!=null){
                        last_change_time = memberData["last_change_time"].substring(0, 7)
                    }else{
                        last_change_time ="未更换";
                    }
                    that.setData({
                        "mobile": wx.getStorageSync("member").mobile,
                        "real_name": that.data.memberData['real_name'],
                        "voltage_index": index,
                        "brand_name": memberData["brand_name"],
                        "number": memberData["number"],
                        "status": memberData["status"],
                        "price": memberData["price"],
                        "buy_date": memberData["buy_date"].substring(0, 7),
                        "last_change_time": last_change_time,
                        "region": memberData["region"]
                    });
                } else {
                    util.falseHint();
                }
            },
            fail: function () {
                util.failHint();
            }
        })
    },

    bikeChange: function (e) {
        var that = this;
        var memberData = that.data.memberData;
        if (e.detail.value == 1) {
            //现有车辆
            var index = 0;
            for (var i = 0; i < that.data.voltage.length; i++) {
                if (memberData['voltage'] == that.data.voltage[i])
                    index = i;
                break;
            }
            that.setData({
                "voltage_index": index,
                "brand_name": memberData["brand_name"],
                "number": memberData["number"],
                "status": memberData["status"],
                "price": memberData["price"],
                "buy_date": memberData["buy_date"].substring(0, 7),
                "last_change_time": memberData["last_change_time"].substring(0, 7),
                "region": memberData["region"]
            });
        } else {
            that.setData({
                "voltage_index": 0,
                "brand_name": "",
                "number": "",
                "price": "",
                "buy_date": "",
                "last_change_time": ""
            });
        }
    },

    voltageChange: function (e) {
        this.setData({
            voltage_index: e.detail.value
        })
    },

    statusChange:function(e){
        this.setData({
            'status':e.detail.value
        });
    },

    buyTimeChange: function (e) {
        this.setData({
            buy_date: e.detail.value
        })
    },

    lastChangeTimeChange: function (e) {
        this.setData({
            last_change_time: e.detail.value
        })
    },

    chooseImage: function () {
        var that = this;
        wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: ['camera'],
            success: function (res) {
                that.setData({
                    bikeImgs: that.data.bikeImgs.concat(res.tempFilePaths)
                });
            }
        })
    },

    previewImage: function (e) {
        wx.previewImage({
            current: e.currentTarget.id, // 当前显示图片的http链接
            urls: this.data.files // 需要预览的图片http链接列表
        })
    },

    delImg: function (e) {
        var bikeImgs = this.data.bikeImgs;
        var bikeImg = e.currentTarget.id;
        var newImgs = util.delImg(bikeImgs, bikeImg);
        this.setData({
            bikeImgs: newImgs
        });
    },

    formSubmit: function (e) {
        var that = this;
        console.log(e.detail.value);
        if(!util.validateImgCount(that.data.bikeImgs)){
            return;
        }
        var data = e.detail.value;
        for (var key in data) {
            if (key != 'last_change_time' && key != 'remark' && (data[key] === "" || data[key] === null)) {
                wx.showModal({
                    title: '提示',
                    content: '请填写必填项',
                })
                return false;
            }
        }
        data.status = that.data.status;
        wx.showLoading({
            title: '请稍后...',
        })
        wx.request({
            url: app.globalData.host + '/wechat/shb/create',
            method: "POST",
            header: util.header(),
            data: data,
            success: function (res) {
                if (res.data.status == true) {
                    wx.hideLoading();
                    var shb_id = res.data.data.shb_id;
                    for (var i = 0; i < that.data.bikeImgs.length; i++) {
                        //if (that.data.bikeImgs[i].indexOf(app.globalData.host) == -1) {
                            uploadFile(shb_id, that.data.bikeImgs[i]);
                        //}
                    }
                    wx.showModal({
                        title: '提示',
                        content: '添加成功',
                        success: function () {
                            wx.redirectTo({
                                url: '../shb-list/shb-list',
                            })
                        }
                    })
                } else {
                    wx.hideLoading();
                    if (res.data.msg == "积分不足") {
                        //转入积分充值页面
                        wx.showModal({
                            title: '提示',
                            content: '积分不足,请先充值',
                            success:function(){
                                wx.navigateTo({
                                    url: '../point/point',
                                })
                            }
                        })
                    }
                }
            },
            fail: function (res) {
                util.failHint();
            }
        })
    }
})
function uploadFile(shb_id, img) {
    wx.uploadFile({
        url: app.globalData.host + '/wechat/shb/upload',
        filePath: img,
        name: "file",
        header: {
            'content-type': "multipart/form-data",
            'token': wx.getStorageSync("member").token
        },
        formData: {
            second_bike_id: shb_id
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