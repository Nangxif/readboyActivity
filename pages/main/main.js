//获取应用实例
const app = getApp();
var marquee = require("../../utils/marquee.js");
var request = require("../../utils/request.js");
Page({
  data: {
    activity_id:"",//活动id
    isLogin: false,
    isStart: false,
    isEnd: false,
    myself: false,
    isShare: false,
    isWin: false,//是否获得奖品，控制“看视频赢砍价机会”按钮的显示与隐藏
    modal: [false, false],
    prize: [],//排行榜数据
    marquee: { text: "", width: 0, time: 0 },//跑马灯的数据
    //isPause:false,//是否触发视频暂停,防止在关闭页面的时候还弹出视频暂停时触发的弹框
    text: [],
    obj: [],//传递给子组件的数据
    prizeitem :[],//每个人获奖的奖品
    introduction: "",//活动介绍
    prize_price:0,//价格
    share_title:"",
    share_cover:"",
    joinNum: 0,//参加活动人数
    isfix:false,//背景是否固定
  },
  onShow: function () {
    this.setData({
      // isStart: app.globalData.isStart,
      // isEnd: app.globalData.isEnd,
      isShare: app.globalData.isShare,
      myself: app.globalData.myself,
    });
    if (wx.getStorageSync("userInfo")) {
      this.setData({
        isLogin: true
      })
    } else {
      this.setData({
        isLogin: false
      })
    }
  },
  onReady: function () {
    var that = this;
    // if (!app.globalData.isEnd) {
    that.setData({
      activity_id: wx.getStorageSync('activity_id_and_num').split("-")[0]
    })
    request.win_list(app.globalData.activity_id||that.data.activity_id,function (res) {
      if(res.code==1){
        that.setData({
          obj: res.prizes,
          // prize: res.winners,//res.winners
        }, function () {
          //跑马灯文字的总长度
          if (wx.getStorageSync('activity_id_and_num').split("-")[1]){
            var str = [("已有" + wx.getStorageSync('activity_id_and_num').split("-")[1] + "人参与活动。\t")];
          }else{
            var str = [];
          }
          
          var lenG = res.winners.length <= that.data.obj[0].amount ? res.winners.length : that.data.obj[0].amount, pz = that.data.obj[0].name;
          for (var len = 0; len < lenG; len++) {
            str.push("恭喜" + res.winners[len].nickname + "完成砍价，领走" + pz + "。\t");
          }


          var winArr = res.winners;
          var lenP = res.prizes.length;
          var po = 0;

          var lenW = res.winners.length;
          var level = [res.prizes[0].amount];
          if (lenP>1){
            for (var n = 1; n < lenP; n++) {
              level.push(res.prizes[n - 1].amount + res.prizes[n].amount);
            }
          }

          if (wx.getStorageSync('activity_id_and_num')&&wx.getStorageSync('activity_id_and_num').split("-")[2] == 1){
            that.setData({
              isStart: false,
              isEnd: true,
            })
          } else if (wx.getStorageSync('activity_id_and_num') && wx.getStorageSync('activity_id_and_num').split("-")[2] == 2){
            that.setData({
              isStart: true,
              isEnd: false,
            })
          }else{
            if (lenW >= level[level.length - 1]){
              that.setData({
                isStart: false,
                isEnd: true,
              })
            }else{
              that.setData({
                isStart: true,
                isEnd: false,
              })
            }
          }
          for (var j = 0; j < lenW; j++) {
            if (j < level[level.length-1]){
              for (var i = 0; i < lenP; i++) {
                if (j < level[i]) {
                  winArr[j].prize = res.prizes[i].name;
                } else {
                  winArr[j].prize = res.prizes[i + 1].name || "奖品名额已满";
                }
                break;
              }
            }else{
              winArr[j].prize = "奖品名额已满";
            }
          }
          that.setData({
            text: str,
            prize: winArr
          });
          var s = str.join("");
          that.setData({
            "marquee.text": s,
            "marquee.width": marquee.getWidth(s) * 27,
            "marquee.time": marquee.getWidth(s) / 2
          })
        })
      } else if (res.code == -2){
        that.setData({
          isEnd: true,
          isStart:false
        })
      }
      
    })
    // }
  },
  onPageScroll: function (e) {
    if (e.scrollTop < 0) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
  },
  onShareAppMessage: function () {
    var that = this;
    var openid = wx.getStorageSync('openid'),
      userInfo = wx.getStorageSync('userInfo'),
      activity_id = wx.getStorageSync('activity_id_and_num').split("-")[0]
    if (openid) {
      app.globalData.onShare = true;
      return {
        title: that.data.share_title,
        path: '/pages/main/main?id=' + openid + '&activity_id=' + activity_id + '&nickName=' + userInfo.nickName + '&avatarUrl=' + encodeURIComponent(userInfo.avatarUrl),
        imageUrl: that.data.share_cover
      }
    } else {
      require('../../utils/request.js').player()
    }
  },
  go: function () {
    wx.navigateTo({
      url: '../G550A/G550A'
    })
  },
  //点击看视频赢砍价机会
  winAchance: function () {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
  },
  onMyEvent: function (e) {
    var that = this;
    if (e.detail.isWin != undefined) {
      this.setData({
        isWin: e.detail.isWin
      })
    }
    if (e.detail.isLogin != undefined) {
      this.setData({
        isLogin: e.detail.isLogin
      })
    }
    if (e.detail.introduction!=undefined){
      this.setData({
        introduction: e.detail.introduction
      })
    }
    if (e.detail.prize_price != undefined){
      this.setData({
        prize_price: e.detail.prize_price
      })
    }
    if (e.detail.isfix != undefined){
      this.setData({
        isfix: e.detail.isfix
      })
    }
    if (e.detail.isStart != undefined) {
      this.setData({
        isStart: e.detail.isStart,
        isEnd: e.detail.isEnd
      })
    }
    if (e.detail.share_title != undefined){
      this.setData({
        share_title: e.detail.share_title,
        share_cover: e.detail.share_cover
      })
    }
  },
  showModal: function (e) {
    this.setData({
      ["modal[" + e.currentTarget.dataset.tip + "]"]: true,
      isfix:true
    })
    wx.stopPullDownRefresh();
  },
  //关闭弹框
  closeModal: function (e) {
    this.setData({
      ["modal[" + e.currentTarget.dataset.out + "]"]: false,
      isfix:false
    })
  },
  bindGetUser: function (e) {
    this.selectComponent("#componentId").bindGetUserInfo(e);
  },
  hide: function () {
    this.setData({
      "modal[0]": false,
      "modal[1]": false,
      isfix:false
    })
  },
  hides: function (e) {
    return false;
  },
})
