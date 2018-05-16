var host = "http://local.ddb.com";
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function transDate(msec) {
    var date = new Date(msec);
    return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay()
}

//获取验证码
function getCaptcha(_this) {
    if (!(/^1\d{10}$/.test(_this.data.mobile))) {
        wx.showModal({
            title: '提示',
            content: '请输入正确的手机号码',
        });
        return false;
    }
    _this.data.imageUrl = host + "/wechat/captcha";
    _this.setData({
        modalFlag: false,
        imageUrl: _this.data.imageUrl + "?_t=" + new Date().getTime() + "&token=" + wx.getStorageSync("member").token
    });
}

//验证验证码
function verifyCaptcha(_this) {
    wx.showLoading({
        title: '请稍后...',
    })
    wx.request({
        url: host + '/wechat/verifyCaptcha',
        header: {
            'content-type': "application/x-www-form-urlencoded",
            'token': wx.getStorageSync("member").token
        },
        data: {
            "captcha": _this.data.captcha
        },
        method: "POST",
        success: function (res) {
            if (res.data.status == true) {
                //请求短信接口
                wx.request({
                    url: host + '/wechat/member/smsCode',
                    header: {
                        'content-type': "application/x-www-form-urlencoded",
                        'token': wx.getStorageSync("member").token
                    },
                    data: {
                        "mobile": _this.data.mobile
                    },
                    method: "POST",
                    success: function (res) {
                        if (res.data.status == true) {
                            wx.showModal({
                                title: '提示',
                                content: '短信发送成功',
                            })
                        }
                    },
                    fail: function (res) {
                        wx.showModal({
                            title: '提示',
                            content: '短信发送失败',
                        })
                    }
                })

                _this.setData({
                    cap_btn_status: true,
                    modalFlag: true,
                    cap_loading_status: true,
                    sms_code_flag: false
                });
                var i = 0;
                var timer = setInterval(function () {
                    _this.setData({
                        cap_btn_text: (59 - i) + "秒"
                    });
                    i++;
                    if (i == 60) {
                        clearInterval(timer);
                        _this.setData({
                            cap_btn_status: false,
                            cap_btn_text: "获取验证码",
                            cap_loading_status: false
                        });
                    }
                }, 1000);
            } else {
                wx.showModal({
                    title: '提示',
                    content: '验证码输入错误',
                })
                _this.freshCaptcha()
            }
            wx.hideLoading();
        },
        fail: function (res) {
            wx.hideLoading();
        }
    })
}

//刷新验证码
function freshCaptcha(_this) {
    _this.data.imageUrl = host + "/wechat/captcha";
    _this.setData({
        imageUrl: _this.data.imageUrl + "?token=" + wx.getStorageSync("member").token + "&_t=" + new Date().getTime()
    });
}

//ajax请求header
function header() {
    return {
        'content-type': "application/x-www-form-urlencoded",
        'token': wx.getStorageSync("member").token
    };
}

//ajax 回调fail
function failHint() {
    wx.hideLoading();
    wx.showModal({
        title: '提示',
        content: '网络异常，请重新操作',
    })
}

//ajax 回调success 错误处理
function falseHint(msg) {
    wx.hideLoading();
    wx.showModal({
        title: '提示',
        content: msg,
    })
}

//判断图片数量
function validateImgCount(img) {
    if (img.length < 3) {
        wx.showModal({
            title: '提示',
            content: '电动车照片至少上传3张',
        });
        return false;
    }

    if (img.length > 5) {
        wx.showModal({
            title: '提示',
            content: '电动车照片最多上传5张',
        });
        return false;
    }
    return true;
}
/**
 * imgs:原来的所有图片数组
 * del_key:要删除的那个图片的url
 * 返回删除之后的新的数组
 */
function delImg(imgs, del_key) {
    for (var i = 0; i < imgs.length; i++) {
        if (del_key == imgs[i]) {
            delete (imgs[i]);
            break;
        }
    }
    var newImgs = [];
    for (var i = 0; i < imgs.length; i++) {
        if (imgs[i] != undefined) {
            newImgs.push(imgs[i]);
        }
    }
    return newImgs;
}

module.exports = {
    formatTime: formatTime,
    transDate: transDate,
    getCaptcha: getCaptcha,
    verifyCaptcha: verifyCaptcha,
    header: header,
    freshCaptcha: freshCaptcha,
    failHint: failHint,
    falseHint: falseHint,
    validateImgCount: validateImgCount,
    delImg: delImg
}
