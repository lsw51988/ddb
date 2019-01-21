var util = require("../../utils/util.js");
const app = getApp()
Page({
  data: {
    region: ["地区", "地区", "地区"],
    time_range: ["时间", "今天", "最近一周", "本月内"],
    rewards_range: ["赏金", "递增", "递减"],
    time_index: 0,
    rewards_index: 0,
    search: [],
    current_page: 1,
    max_page: 1
  },

  onShareAppMessage: function() {
    return util.share(this);
  },

  onLoad: function(options) {
    this.data.region = [];
    this.data.search['current_page'] = this.data.current_page;
    getList(this, this.data.search);
  },

  timeChange: function(e) {
    this.data.search['time'] = e.detail.value;
    this.setData({
      "time_index": e.detail.value
    });
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

  commissionChange: function(e) {
    this.data.search['rewards'] = e.detail.value;
    this.setData({
      "rewards_index": e.detail.value
    });
    getList(this, this.data.search);
  },

  gotoLostDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../lost-detail/lost-detail?id=' + id,
    })
  }
})

function getList(_this, search) {
  wx.showLoading({
    title: '请稍后...',
  })
  wx.request({
    url: app.globalData.host + '/wechat/lost/list',
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