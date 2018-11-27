// component/other-component/other-component.js
const app = getApp();
var request = require('../../utils/request.js');
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
    isLogin: false,//是否授权
    isWin: false,
    nickName: "未授权",
    avatarUrl: "",
    modal: [false, false, false],//0、看视频砍价弹框，1、砍价弹框，2、兑奖弹框
    isLastOne: false,//是否第一个没中奖
    friend_help: [],
    originmuch: 0,//已砍钱数
    howmuch: 0,//砍了多少钱
    originWidth: 560,//原始宽度
    width: 0,
    animationData: {},
    animationData1: {},
    animationDatas: {},
    isCut: 1,//剩下的砍价次数
    cacheCut:1,//在还没确定是否已经授权的时候，将剩余砍价次数赋值给cacheCut
    ranking: 0,//排名
    hasCutChance:true,
    toast: false,
    main_title: "",
    sub_title: "",
    cover_link: "",
    prize_setting: [],//奖品列表
    prize_level: 0
  },
  ready: function () {
    var that=this;
    //实例化一个动画
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out',
    });
    this.animation = animation;
    //实例化另一个动画
    var animation1 = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out',
    });
    this.animation1 = animation1;
    //此处调用接口初始化数据
    this.setData({
      nickName: app.globalData.firend_nickName,
      avatarUrl: app.globalData.firend_avatarUrl,
    })
    request.invitation(app.globalData.activity_id,app.globalData.friend_openid).then(res => {
      if (res.code == 1) {
        var po = 0, leng = res.prize_setting.length, level = 0;
        if (res.position != 0) {//确定奖品等级
          for (var l = 0; l <= leng; l++) {
            if (res.position > po) {
              po = po + res.prize_setting[l] ? res.prize_setting[l].amount : 0;
            } else {
              level = l - 1;
              break;
            }
          }
          that.setData({
            prize_level: level
          })
        }
        that.setData({
          isWin: (res.position != 0),
          prize_price: res.prize_price,
          originWidth: ((res.prize_price - res.money) / res.prize_price) * 560,
          originmuch: res.money,
          friend_help: res.help_list,
          ranking: res.position,
          cacheCut: res.can_help,
          main_title: res.main_title,
          sub_title: res.sub_title,
          cover_link: res.cover_link,
          main_title: res.main_title,
          sub_title: res.sub_title,
          cover_link: res.cover_link,
          prize_setting: res.prize_setting,
        },function(){
          
          that.triggerEvent('myevent', { isWin: that.data.isWin,introduction: res.introduction.replace(/\<br\>/g, "\n"), prize_price: res.prize_price });
        })
        if (wx.getStorageSync("userInfo")) {
          that.setData({
            isCut: res.can_help,
            isLogin: true
          })
          if (res.can_help == -1 || res.can_help == -2){
            that.setData({
              toast:true
            })
            setTimeout(function(){
              that.setData({
                toast: false
              })
            },2200);
          }
        } else {
          that.setData({
            isLogin: false
          })
        }
      }
    })
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //砍价按钮
    cut: function () {
      var that = this;
      if (this.data.isCut > 0){
        request.helper_roll(app.globalData.activity_id,app.globalData.friend_openid).then(res => {
          if (res.code == 1) {
            that.setData({
              hasCutChance: true,
              howmuch: res.money,
              isCut: -3,
            })
            if (res.position > 0) {
              that.setData({
                isWin: true
              })
              var po = 0, leng = that.data.prize_setting.length, level = 0;
              for (var l = 0; l <= leng; l++) {
                if (res.position > po) {
                  if (that.data.prize_setting[l]) {
                    po = po + that.data.prize_setting[l].amount;
                  } else {
                    level = l;
                  }
                } else {
                  level = l - 1;
                  break;
                }
              }
              that.setData({
                prize_level: level
              })
              if(!that.data.prize_setting[level]){
                that.setData({
                  "modal[2]":true,
                  isLastOne:true
                })
              }
            } else {
              that.setData({
                "modal[1]": true,
                isAmiantion: true,
                friend_help: [{ avatar: wx.getStorageSync('userInfo').avatarUrl, money: that.data.howmuch, nickname: wx.getStorageSync('userInfo').nickName }, ...that.data.friend_help]
              })
            }
          } else if (res.code == 2) {
            that.setData({
              isWin: true
            })
          } else {
            that.setData({
              "modal[1]": true
            })
            that.triggerEvent('myevent', { isfix: true });
          }
        })
      }
    },
    closeModal: function (e) {
      var that = this;
      if (e.currentTarget.dataset.out != 1) {
        this.setData({
          ["modal[" + e.currentTarget.dataset.out + "]"]: false
        });
        this.triggerEvent('myevent', { isfix: false });
      } else {
        this.setData({
          "modal[1]": false,
          isAmiantion: false,
        }, function () {
          var percent = 1 - (that.data.howmuch + that.data.originmuch) / that.data.prize_price;
          that.setData({
            width: percent * 560
          })
          //点击砍价之后进度条动画
          this.animation.width(that.data.width + "rpx").step();
          that.setData({
            animationData: this.animation.export()
          }, function () {
            that.setData({
              originmuch: that.data.originmuch + that.data.howmuch
            })
          })
          //点击砍价之后小对话框动画
          this.animation1.left((that.data.width - 64) + "rpx").step();
          that.setData({
            animationData1: this.animation1.export()
          })
          that.triggerEvent('myevent', { isfix: false });
        })
      }
    },
    hide: function () {
      this.setData({
        isAuthorization: false
      })
    },
    hides: function (e) {
      return false;
    },
    bindGetUserInfo: function (e) {
      var that = this;
      if(e.detail.iv){
        wx.setStorage({
          key: 'userInfo',
          data: e.detail.userInfo
        })
        this.setData({
          isLogin: true,
          isCut: this.data.cacheCut
        }, function () {
          this.triggerEvent('myevent', { isLogin: true });
        })
        //未授权的
        if (e.currentTarget.dataset.index == 0) {
          that.cut();
        }
      }
    },
    //点击我要参加按钮，修改isShare的值，然后重载界面
    wanttijoin: function () {
      app.globalData.isShare = false;
      app.globalData.myself = true;
      delete app.globalData.friend_openid;
      delete app.globalData.firend_nickName;
      delete app.globalData.firend_avatarUrl;
      wx.redirectTo({
        url: '../index/index',
      })
    }
  }
})
