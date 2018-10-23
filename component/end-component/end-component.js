// component/end-component/end-component.js
var request = require("../../utils/request.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    prize: [],
    height:0,
    width:0
  },
  ready:function(){
    var that=this;
    request.winners(function(res){
      if(res.code==1){
        that.setData({
          prize:res.winners
        })
      }
    })
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          height: res.windowHeight*2,
          width: (res.windowWidth*2-692)/2
        })
      }
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {

  }
})
