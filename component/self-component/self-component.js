// component/self-component/self-component.js
var request=require("../../utils/request.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    obj:Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    isLogin:false,//是否授权
    isWin:false,
    nickName:"未授权",
    avatarUrl:"",
    modal:[false,false,false,false],//0、看视频砍价弹框，1、砍价弹框，2、兑奖弹框
    isLastOne:false,
    friend_help: [],
    prize_price: 0,//奖品价格
    originmuch:0,//已砍钱数
    howmuch: 0,//砍了多少钱
    originWidth:560,//原始宽度
    width:0,
    animationData:{},
    animationData1: {},
    animationDatas:{},
    isCut:1,//剩下的砍价次数
    isAmiantion:false,//是否运动
    ranking: 0,//排名
    noconvert: false,//是否兑换
    isconvert: false,//是否兑换
    activity_id: "",//活动的id
    main_title:"",
    sub_title:"",
    cover_link:"",
    prize_setting:[],//奖品列表
    prize_level:0,
  },
  ready:function(){
    var that = this;
    //此处调用接口初始化数据
    that.setData({
      activity_id: wx.getStorageSync('activity_id_and_num').split("-")[0]
    })
    if (wx.getStorageSync('userInfo').nickName) {
      request.player(that.data.activity_id, function(res){
        if(res.code==1){
          var po = 0, leng = res.prize_setting.length, level = 0;
          if (res.position != 0) {//判断奖品等级
            for (var l = 0; l <= leng; l++) {
              if (res.position > po) {
                if (res.prize_setting[l]) {
                  po = po + res.prize_setting[l].amount;
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
          }
          if (wx.getStorageSync('activity_id_and_num').split("-")[2] == 2) {//活动提前结束
              if (!res.prize_setting[level]){//如果排名超过奖品数量
                that.triggerEvent('myevent', { isStart: false, isEnd: true });
              }else{
                if (res.prize_received) {
                  that.triggerEvent('myevent', { isStart: false, isEnd: true });
                } else {
                  that.triggerEvent('myevent', { isStart: true, isEnd: false });
                }
              }
          } else {//活动还没结束
            request.activity_share(wx.getStorageSync('activity_id_and_num').split("-")[0], function (share) {
              if (share.code == 1) {
                that.triggerEvent('myevent', { share_title: share.data.share_title, share_cover: share.data.share_cover, });
              }
            })
          }




          that.setData({
            nickName: wx.getStorageSync("userInfo").nickName,
            avatarUrl: wx.getStorageSync("userInfo").avatarUrl,
            isLogin: true,
            isCut:res.chance,
            isWin: (res.position!=0),
            prize_price: res.prize_price,
            originWidth: ((res.prize_price - res.money) / res.prize_price) * 560,
            originmuch: res.money,
            friend_help: res.help_list,
            ranking:res.position,
            noconvert: !res.prize_received,
            isconvert: res.prize_received,
            main_title: res.main_title,
            sub_title:res.sub_title,
            cover_link: res.cover_link,
            prize_setting: res.prize_setting,
          })
          that.triggerEvent('myevent', { isWin: that.data.isWin, introduction: res.introduction.replace(/\<br\>/g, "\n"), prize_price: res.prize_price});
        }else{
          that.setData({
            isLogin:false
          })
        }
      })
    }else{
      that.setData({
        isLogin: false
      })
    }
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
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //砍价按钮
    cut:function(){
      var that=this;
      if(this.data.isCut>0){
        request.player_roll(that.data.activity_id, wx.getStorageSync('userInfo').nickName, wx.getStorageSync('userInfo').avatarUrl,function(res){
          if(res.code==1){//砍价成功
            if(res.position==0){//砍价成功还没中奖
              that.setData({
                howmuch: res.money,
              }, function () {
                that.setData({
                  "modal[1]": true,
                  isAmiantion: true,
                  friend_help: [{ avatar: wx.getStorageSync('userInfo').avatarUrl, money: res.money, nickname: wx.getStorageSync('userInfo').nickName }, ...that.data.friend_help]
                })
              })
            }else{//砍价成功中奖
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
              if (that.data.prize_setting[level]){//如果砍完价之后的排名有对应奖品
                that.setData({
                  howmuch: res.money,
                  friend_help: [{ avatar: wx.getStorageSync('userInfo').avatarUrl, money: res.money, nickname: wx.getStorageSync('userInfo').nickName }, ...that.data.friend_help],
                  ranking: res.position
                }, function () {
                  that.setData({
                    "modal[1]": true,
                    isAmiantion: true,
                    isWin: true
                  })
                })
              } else {//如果砍完价之后的排名没有对应奖品，活动结束
                that.setData({
                  "modal[3]": true,
                  isLastOne:true,
                  isWin: true
                })
                that.triggerEvent('myevent', { isWin: true, isfix: true });
              }
            }
          }
        })
      }
    },
    closeModal:function(e){
      var that=this;
      if (e.currentTarget.dataset.out!=1){
        this.setData({
          ["modal[" + e.currentTarget.dataset.out + "]"]: false,
          isPlay: false,
          noPlay:false,
        });
        that.triggerEvent('myevent', { isfix: false });
      }else{
        this.setData({
          "modal[1]": false,
          isAmiantion: false
        },function(){
          var percent = 1-(that.data.howmuch + that.data.originmuch) / that.data.prize_price;
          that.setData({
            width: percent * 560,
            isCut: --that.data.isCut
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
        })
        that.triggerEvent('myevent', { isfix: false });
      }
    },
    bindGetUserInfo: function (e) {
      var that=this;
      //此处调用接口初始化数据
      if (e.detail.iv){
        request.player(that.data.activity_id,function (res) {
          if (res.code == 1) {
            that.setData({
              nickName: wx.getStorageSync("userInfo").nickName,
              avatarUrl: wx.getStorageSync("userInfo").avatarUrl,
              isLogin: true,
              isCut: res.chance,
              isWin: (res.position != 0),
              prize_price: res.prize_price,
              originWidth: ((res.prize_price - res.money) / res.prize_price) * 560,
              originmuch: res.money,
              friend_help: res.help_list,
              ranking: res.position,
              noconvert: !res.prize_received,
              isconvert: res.prize_received,
              main_title: res.main_title,
              sub_title: res.sub_title,
              cover_link: res.cover_link,
              prize_setting: res.prize_setting,
            }, function () {
              var po = 0, leng = res.prize_setting.length, level = 0;
              if (res.position != 0) {
                for (var l = 0; l <= leng; l++) {
                  if (res.position > po) {
                    if (res.prize_setting[l]) {
                      po = po + res.prize_setting[l].amount;
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
              }
              that.triggerEvent('myevent', { isLogin: true });
              that.triggerEvent('myevent', { isWin: that.data.isWin, introduction: res.introduction.replace(/\<br\>/g, "\n"), prize_price: res.prize_price});
              if (e.currentTarget.dataset.index == 0 && (res.position == 0)) {
                that.cut();
              }
            })
          } else {
            that.setData({
              isLogin: false
            }, function () {
              that.triggerEvent('myevent', { isLogin: false });
            })
          }
        })
      }
    },
    saveModal: function () {
      this.setData({
        "modal[2]":true
      })
      this.triggerEvent('myevent', { isfix: true });
    },
    save: function (e) {//输入信息兑换成功
      var that = this;
      if (e.detail.value.tel == "" || e.detail.value.name == "" || e.detail.value.address == "") {
        wx.showModal({
          title: "提交失败",
          content: "信息填写不完整",
          showCancel: false
        })
      } else if (!(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/.test(e.detail.value.tel)) && !(/^0\d{2,3}\d{7,8}/.test(e.detail.value.tel))) {
        wx.showModal({
          title: "提交失败",
          content: "号码格式错误",
          showCancel: false
        })
      } else {
        wx.showModal({
          title: "是否提交",
          content: "信息是否填写正确？",
          success: function (show) {
            if (show.confirm) {
              request.take_prize({ activity_id:that.data.activity_id, phone_number: e.detail.value.tel, name: e.detail.value.name, address: e.detail.value.address }, function (res) {
                if (res.code == 1) {
                  that.setData({
                    noconvert: false,
                    isconvert: true,
                    "modal[2]": false
                  })
                  that.triggerEvent('myevent', { isLogin: false, isfix: false });
                } else {
                  wx.showModal({
                    title: "提交失败",
                    content: "信息提交失败，请重试",
                    showCancel: false
                  })
                }
              });
            }
          }
        })
      }
    }
  }
})
