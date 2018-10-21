Page({
  onShareAppMessage: function() {
    return util.share(this);
  },
  gotoMustKnow: function() {
    wx.navigateTo({
      url: '../must-know/must-know',
    })
  },

  gotoSuggestion: function() {
    wx.navigateTo({
      url: '../suggestion/suggestion',
    })
  },

  gotoCoop: function() {
    wx.navigateTo({
      url: '../coop/coop',
    })
  },

})