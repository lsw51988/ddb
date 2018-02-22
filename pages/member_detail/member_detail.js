// pages/member_detail/member_detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bike_type:["48V","60V","72V","其他"],
    brand: [
      "爱玛", "雅迪", "新日", "小牛", 
      "E客", "台铃", "速珂", "小刀", 
      "绿源", "立马", "小米", "新大洲", 
      "安马达", "大阳", "超威"
      ],
    type:[

    ]

  },

  onLoad: function (options) {
  
  },

  brandChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
})