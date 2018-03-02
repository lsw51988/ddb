Page({

  data: {
    problem:[
      "爆胎",
      "漏气",
      "电机不转",
      "断电",
      "无法启动",
      "莫名异响",
      "骑行费力，速度慢",
      "其他",
    ],
    problem_index:0
  },

  onLoad: function (options) {
  
  },
  problemChange:function(e){
    this.setData({
      problem_index: e.detail.value
    })
  }
})