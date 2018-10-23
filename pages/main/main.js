//获取应用实例
const app = getApp();
var marquee = require("../../utils/marquee.js");
var request = require("../../utils/request.js");
Page({
  data: {
    isLogin: false,
    isVideo: false,
    isStart: false,
    isEnd: false,
    myself: false,
    isShare: false,
    isWin: false,//是否获得奖品，控制“看视频赢砍价机会”按钮的显示与隐藏
    modal: [false, false],
    isVideo: true,//视频是否出现
    prize: [],//排行榜数据
    marquee: { text: "", width: 0, time: 0 },//跑马灯的数据
    //isPause:false,//是否触发视频暂停,防止在关闭页面的时候还弹出视频暂停时触发的弹框
    text: []
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
    //初始化一个视频
    this.videoContext = wx.createVideoContext('myVideo');
    var that = this;
    if (!app.globalData.isEnd) {
      request.win_list(function (res) {
        that.setData({
          prize: [{ avatar: "https://wx.qlogo.cn/mmopen/vi_32/aZRjMM52d9X3NFhPiagYBuibCfcPpaiciaiagvWrvFVebh1DAictUNjjhk9bArrt07rzhqne9foNTOaE9J9827mws4Dw/132", nickname:"曩昔方nangxif"}]//res.winners
        }, function () {
          //跑马灯文字的总长度
          var str = [];
          var lenG = this.data.prize.length <= 10 ? this.data.prize.length : 10;
          for (var len = 0; len < lenG; len++) {
            str.push("恭喜" + that.data.prize[len].nickname + "完成砍价，领走学生平板G550A。\t");
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
    var openid = wx.getStorageSync('openid'),
      userInfo = wx.getStorageSync('userInfo')
    if (openid) {
      app.globalData.onShare = true;
      return {
        title: '【国庆福利】读书郎学生平板免费领',
        path: '/pages/index/index?id=' + openid + '&nickName=' + userInfo.nickName + '&avatarUrl=' + encodeURIComponent(userInfo.avatarUrl),
        imageUrl: '../../images/share.png'
      }
    } else {
      require('../../utils/request.js').index()
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
    wx.createVideoContext('myVideo').play();
  },
  onMyEvent: function (e) {
    var that = this;
    if (e.detail.isWin != undefined) {
      this.setData({
        isWin: e.detail.isWin
      })
    }
    if (e.detail.isVideo != undefined) {
      this.setData({
        isVideo: e.detail.isVideo
      })
    }
    if (e.detail.isLogin != undefined) {
      this.setData({
        isLogin: e.detail.isLogin
      })
    }

  },
  end: function () {
    var that = this;
    if (this.selectComponent("#componentId")) {
      this.selectComponent("#componentId").end();
    }
    if (this.data.isWin) {
      this.setData({
        isVideo: false
      }, () => {
        that.setData({
          isVideo: true
        })
      })
    }
  },
  error: function (e) {
    if (e) {
      wx.showToast({
        title: '视频播放错误！',
        icon: 'none'
      });
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
})
