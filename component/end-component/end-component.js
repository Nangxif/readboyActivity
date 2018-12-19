// component/end-component/end-component.js
var request = require("../../utils/request.js");
const app = getApp();
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
    request.winners(app.globalData.activity_id || wx.getStorageSync('activity_id_and_num').split("-")[0],function(res){
      wx.removeStorageSync("activity_id_and_num");
      if(res.code==1){
        var winArr = res.winners;//获奖名单数组
        var lenP = res.prizes.length;
        var po = 0;

        var lenW = res.winners.length;
        var level = [res.prizes[0].amount];
        if (lenP > 1) {
          for (var n = 1; n < lenP; n++) {
            level.push(res.prizes[n - 1].amount + res.prizes[n].amount);
          }
        }
        for (var j = 0; j < lenW; j++) {
          if (j < level[level.length - 1]) {
            for (var i = 0; i < lenP; i++) {
              if (j < level[i]) {
                winArr[j].prize = res.prizes[i].name;
              } else {
                winArr[j].prize = res.prizes[i + 1].name || "奖品名额已满";
              }
              break;
            }
          } else {
            winArr[j].prize = "奖品名额已满";
          }
        }


        that.setData({
          prize: winArr
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
