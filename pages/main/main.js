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
    introduction: "",//活动介绍
    prize_price:0,//价格
    share_title:"",
    share_cover:"",
    joinNum: 0,//参加活动人数
  },
  onShow: function () {
    this.setData({
      isStart: app.globalData.isStart,
      isEnd: app.globalData.isEnd,
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
    if (!app.globalData.isEnd) {
      that.setData({
        activity_id: wx.getStorageSync('activity_id')
      })
      request.win_list(app.globalData.activity_id||that.data.activity_id,function (res) {
        that.setData({
          obj: res.prizes,
          prize: res.winners//res.winners
        }, function () {
          //跑马灯文字的总长度
          var str = [("参加该活动人数："+that.data.joinNum)];
          var lenG = this.data.prize.length <= that.data.obj[0].amount ? this.data.prize.length : that.data.obj[0].amount, pz = that.data.obj[0].name;
          for (var len = 0; len < lenG; len++) {
            str.push("恭喜" + that.data.prize[len].nickname + "完成砍价，领走" + pz+"。\t");
          }
          that.setData({
            text: str
          });
          var s = str.join("");
          that.setData({
            "marquee.text": s,
            "marquee.width": marquee.getWidth(s) * 27,
            "marquee.time": marquee.getWidth(s) / 3
          })
        })
        request.activity_share(wx.getStorageSync('activity_id'), function (share) {
          if(share.code==1){
            that.setData({
              share_title: share.data.share_title,
              share_cover: share.data.share_cover
            })
          }
        })
      })
    }
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
      activity_id = wx.getStorageSync('activity_id')
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
  },
  showModal: function (e) {
    this.setData({
      ["modal[" + e.currentTarget.dataset.tip + "]"]: true
    })
    wx.stopPullDownRefresh();
  },
  //关闭弹框
  closeModal: function (e) {
    this.setData({
      ["modal[" + e.currentTarget.dataset.out + "]"]: false
    })
  },
  bindGetUser: function (e) {
    this.selectComponent("#componentId").bindGetUserInfo(e);
  },
  hide: function () {
    this.setData({
      "modal[0]": false,
      "modal[1]": false
    })
  },
  hides: function (e) {
    return false;
  },
})
