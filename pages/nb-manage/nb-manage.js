var util = require("../../utils/util.js");
const app = getApp()
Page({
  data: {
    bike_list: [],
    time_range: ["发布时间", "今天", "最近一周", "本月内"],
    time_index: 0,
    search: [],
    current_page: 1,
    max_page: 1
  },

  onShareAppMessage: function() {
    return util.share(this);
  },

  onLoad: function(options) {
    this.data.search['self_flag'] = true;
    this.data.search['current_page'] = this.data.current_page;
    getList(this, this.data.search)
  },

  timeChange: function(e) {
    this.data.search['time'] = e.detail.value;
    this.setData({
      "time_index": e.detail.value
    });
    getList(this, this.data.search);
  },

  gotoShbDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../nb-manage-detail/nb-manage-detail?id=' + id,
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