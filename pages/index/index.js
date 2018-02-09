
const app = getApp()

Page({
  data: {
    markers: [],
    circles: [],
    longitude: "",
    latitude: ""
  },
  onLoad: function () {
    var that = this;
    var marker = {}
    var circle = {}
    wx.getLocation({
      type: "gcj02",
      success: function (res) {
        circle.longitude = res.longitude
        circle.latitude = res.latitude
        circle.color = "#96BFFDAA"
        circle.fillColor = "#96BFFDAA"
        circle.radius = 500

        that.data.circles.push(circle)
        that.setData({
          circles: that.data.circles,
          longitude: res.longitude,
          latitude: res.latitude,

        })
        wx.getSystemInfo({
          success: function (res) {
            that.setData({
              controls: [
                {
                  id: 1,
                  iconPath: '/img/avatar.png',
                  position: {
                    left: 5,
                    top: 5,
                    width: 25,
                    height: 25
                  },
                  clickable: true
                },
                {
                  id: 2,
                  iconPath: '/img/news.png',
                  position: {
                    left: res.windowWidth - 32,
                    top: 5,
                    width: 27,
                    height: 27
                  },
                  clickable: true
                },
                {
                  id: 3,
                  iconPath: '/img/re-position.png',
                  position: {
                    left: 60,
                    top: res.windowHeight - 70,
                    width: 40,
                    height: 40
                  },
                  clickable: true
                },
                {
                  id: 4,
                  iconPath: '/img/add-station.png',
                  position: {
                    left: res.windowWidth - 85,
                    top: res.windowHeight - 70,
                    width: 40,
                    height: 40
                  },
                  clickable: true
                }
              ]
            });
          },
        })
      },
    })
  },
  help: function () {
    console.log(1);
  }
})