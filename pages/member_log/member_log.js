var util = require("../../utils/util.js");
Page({
  data: {
      time: "时间",
  },

  onShareAppMessage: function () {
      return util.share(this);
  },

  onLoad: function (options) {
  
  },
})