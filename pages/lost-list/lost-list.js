var util = require("../../utils/util.js");
Page({
    data: {
        time: "时间",
        addr: "地区",
        commission: "佣金",
    },

    onShareAppMessage: function () {
        return util.share(this);
    },

    onLoad: function (options) {

    },

    timeChange: function () { },
    addrChange: function () { },
    commissionChange: function () { },
})