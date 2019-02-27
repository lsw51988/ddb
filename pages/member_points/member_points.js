var util = require("../../utils/util.js");
const app = getApp()
Page({
  data: {
    log_list: [],
    current_page: 1,
    max_page: 0,
    search:[]
  },

  onShareAppMessage: function() {
    return util.share(this);
  },

  onLoad: function(options) {
    this.data.region = [];
    this.data.search['page'] = this.data.current_page;
    getList(this, this.data.search);
  },
})

function getList(_this, search) {
  wx.showLoading({
    title: '请稍后...',
  })
  wx.request({
    url: app.globalData.host + '/wechat/member/point_log',
    method: "GET",
    header: util.header(),
    data: search,
    success: function(res) {
      console.log(res.data.data);
      if (res.data.status) {
        wx.hideLoading();
        var resData = res.data.data;
        _this.setData({
          "log_list": resData.items,
          "current_page": resData.current,
          "max_page": resData.total_items
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