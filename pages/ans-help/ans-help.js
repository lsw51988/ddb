// 相应帮助页面
Page({
  data: {
    mapCtx: "",
    longitude: "",
    latitude: "",
    active:0
  },

  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          controls: [
            {
              id: 0,
              iconPath: '/img/re-position.png',
              position: {
                left: res.windowWidth - 60,
                top: res.windowHeight * 0.4 - 40,
                width: 40,
                height: 40
              },
              clickable: true
            },
            {
              id: 1,
              iconPath: '/img/mt.png',
              position: {
                left: res.windowWidth - 120,
                top: res.windowHeight * 0.2 - 20,
                width: 20,
                height: 20
              },
              clickable: true
            },
            {
              id: 2,
              iconPath: '/img/mt-click.png',
              position: {
                left: res.windowWidth - 260,
                top: res.windowHeight * 0.3 - 140,
                width: 20,
                height: 20
              },
              clickable: true
            }
          ]
        });
      },
    })
    wx.getLocation({
      type: "gcj02",
      success: function (res) {
        that.data.longitude = res.longitude;
        that.data.latitude = res.latitude;
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude
        });
      },
    })
    this.data.mapCtx = wx.createMapContext("map", this);
  },
  controltap: function (e) {
    //重新定位
    var that = this;
    console.log(e)
  },
  changetab:function(opt){
    this.setData({ "active": opt.target.dataset.active});
  }
})