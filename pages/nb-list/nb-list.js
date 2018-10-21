var util = require("../../utils/util.js");
const app = getApp()
Page({
  data: {
    region: ["地区", "地区", "地区"],
    price_range: ["价格", "1000-2000", "2000-3000", "3000-4000", "4000-5000", "5000及以上"],
    bike_list: [],
    price_index: 0,
    search: [],
    current_page: 1,
    max_page: 1,
    self_flag: false
  },

  onShareAppMessage: function() {
    return util.share(this);
  },

  onLoad: function(options) {
    this.data.region = [];
    if (options.self_flag) {
      this.data.search['self_flag'] = true;
      this.data.self_flag = true;
    }
    this.data.search['city'] = wx.getStorageSync("member").location[1];
    this.data.search['district'] = wx.getStorageSync("member").location[2];
    this.data.search['current_page'] = this.data.current_page;
    getList(this, this.data.search);
  },

  addrChange: function(e) {
    this.data.search['district'] = e.detail.value[2];
    this.data.search['city'] = e.detail.value[1];
    this.setData({
      "region": e.detail.value
    });
    getList(this, this.data.search);
  },

  priceChange: function(e) {
    this.data.search['price'] = e.detail.value;
    this.setData({
      "price_index": e.detail.value
    });
    getList(this, this.data.search);
  },

  gotoDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../nb-detail/nb-detail?id=' + id,
    })
  },

  onReachBottom: function() {
    var that = this;
    if (that.data.max_page > that.data.current_page) {
      that.data.search['current_page'] = that.data.current_page + 1;
      getList(that, that.data.search)
    }
  },
})

function getList(_this, search) {
  wx.showLoading({
    title: '请稍后...',
  })
  wx.request({
    url: app.globalData.host + '/wechat/nb/list',
    method: "GET",
    header: util.header(),
    data: search,
    success: function(res) {
      console.log(res.data.data);
      if (res.data.status == true) {
        wx.hideLoading();
        var resData = res.data.data;
        _this.setData({
          "bike_list": resData.rows,
          "current_page": resData.current_page,
          "max_page": resData.max_page
        })
      } else {
        util.falseHint(res.data.msg);
      }
    },
    fail: function() {
      util.failHint();
    }
  })
}