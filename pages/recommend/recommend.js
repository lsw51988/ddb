var util = require("../../utils/util.js");
Page({
    onShareAppMessage: function () {
        return util.share(this);
    }
})