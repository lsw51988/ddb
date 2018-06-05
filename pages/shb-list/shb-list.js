var util = require("../../utils/util.js");
const app = getApp()
Page({
    data: {
        region: ["地区", "地区", "地区"],
        time_range: ["时间", "今天", "最近一周", "本月内"],
        price_range: ["价格", "递增", "递减"],
        bike_list: [],
        time_index: 0,
        price_index: 0,
        search: [],
        current_page:1
    },

    onLoad: function (options) {
        this.data.region = [];
        this.data.search['city'] = wx.getStorageSync("member").location[1];
        this.data.search['district'] = wx.getStorageSync("member").location[2];
        getList(this, this.data.search);
    },

    timeChange: function (e) {
        this.data.search['time'] = e.detail.value;
        this.setData({
            "time_index": e.detail.value
        });
        getList(this, this.data.search);
    },

    addrChange: function (e) {
        this.data.search['district'] = e.detail.value[2];
        this.data.search['city'] = e.detail.value[1];
        this.setData({
            "region": e.detail.value
        });
        getList(this, this.data.search);
    },

    priceChange: function (e) {
        this.data.search['price'] = e.detail.value;
        this.setData({
            "price_index": e.detail.value
        });
        getList(this, this.data.search);
    },

    gotoShbDetail: function (e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../shb-detail/shb-detail?id='+id,
        })
    }
})

function getList(_this, search) {
    wx.showLoading({
        title: '请稍后...',
    })
    wx.request({
        url: app.globalData.host + '/wechat/shb/list',
        method: "GET",
        header: util.header(),
        data: search,
        success: function (res) {
            console.log(res.data.data);
            if (res.data.status == true) {
                wx.hideLoading();
                var resData = res.data.data;
                _this.setData({
                    "bike_list": resData.rows
                })
            } else {
                util.falseHint(res.data.msg);
            }
        },
        fail: function () {
            util.failHint();
        }
    })
}