//index.js
//获取应用实例
const app = getApp();
var marquee = require("../../utils/marquee.js");
var request = require("../../utils/request.js");
var address = require("../../utils/address.js");


var amapFile = require('../../utils/amap-wx.js');

Page({
  data: {
    region: ['广东省', '中山市', '五桂山镇'],
    recommendactivityItem:{
      "area": [{ "county": "北湖区", "address": "五桂山长命水长逸路38号" }, { "county": "火炬开发区", "address": "广东药科大学中山校区" }, { "county": "天河区", "address": "广东工业大学龙洞校区" }, { "county": "番禺区", "address": "广东工业大学大学城校区" }],
      "title":"儿童智能手表",
      "subhead":"福利停不下来",
      "date":"2018.9.27-2018.10.12",
      "shareTitle":"【国庆福利】读书郎学生平板G550A免费领",
      "pic":"../../images/11.png",
      "joinNum":8000,
      "status":1
    },
    localactivityItem:[
      {
        "area": "五桂山区",
        "title": "学生平板电脑",
        "subhead": "福利停不下来",
        "date": "2018.9.27-2018.10.12",
        "shareTitle": "【国庆福利】读书郎学生平板G550A免费领",
        "pic": "../../images/10.png",
        "joinNum": 7000,
        "status": 1
      }, {
        "area": "石歧区",
        "title": "学生平板电脑",
        "subhead": "福利停不下来",
        "date": "2018.9.27-2018.10.12",
        "shareTitle": "【国庆福利】读书郎学生平板G550A免费领",
        "pic": "../../images/10.png",
        "joinNum": 7000,
        "status": 0
      }
    ],
    nationwideactivityItem:[
      {
        "area": "石歧区",
        "title": "儿童智能手表",
        "subhead": "福利停不下来",
        "date": "2018.9.27-2018.10.12",
        "shareTitle": "【国庆福利】读书郎学生平板G550A免费领",
        "pic": "../../images/11.png",
        "joinNum": 6520,
        "status": 1
      }
    ],
    isModalShow:false,//弹框是否出现
    myAmapFun:{},//高德地图对象
    latitude:0,//本地x坐标
    longitude:0,//本地y坐标
    destination:[],//目的地坐标数组
    distance:[],//距离数组
    islocalReflash:false,//本地门店是否刷新
    isnationwideReflash: false,//全国门店是否刷新
  },
  onLoad: function () {
    this.setData({
      query: wx.createSelectorQuery()
    })
    // address.authorization()
  },
  onShow: function () { 
  },
  onReady: function () {
    var that = this;
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        that.setData({
          latitude: res.latitude,//纬度
          longitude: res.longitude//经度
        })
        wx.setStorageSync("local", res.longitude + "," + res.latitude);
        that.setData({
          myAmapFun: new amapFile.AMapWX({ key: '19c282197a346b17749ac00505bff673' })//19c282197a346b17749ac00505bff673
        })
        that.data.myAmapFun.getRegeo({
          success: function (data) {
            that.setData({
              region: [data[0].regeocodeData.addressComponent.province, data[0].regeocodeData.addressComponent.city, data[0].regeocodeData.addressComponent.township]
            })
          },
          fail: function (info) {
            wx.showModal({ title: info.errMsg })
          }
        })
      }
    })
  },
  onPageScroll:function(e){
    if(e.scrollTop<0){
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
  },
  go: function () {
    wx.navigateTo({
      url: '../G550A/G550A'
    })
  },
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },
  //MMZBZ-JQERX-6ZR4O-ZG4TF-35ZGE-5XFBX


  show:function(){
    var that=this;
    var length = this.data.recommendactivityItem.area.length;
    var addressArr=[];
    var distanceArr = [];
    for(var i=0;i<length;i++){
      this.data.myAmapFun.getInputtips({
        keywords: that.data.recommendactivityItem.area[i].address,
        location: '',
        success: function (data) {
          if (data && data.tips) {
            addressArr.push(data.tips[0].location);
            that.data.myAmapFun.getDrivingRoute({
              origin: that.data.longitude + "," +that.data.latitude,
              destination: data.tips[0].location,
              success: function (res) {
                distanceArr.push((res.paths[0].distance / 1000).toFixed(2));
                that.setData({
                  destination: addressArr,
                  distance: distanceArr
                })
              }
            })
          }
        }
      })
    }
    this.setData({
      isModalShow: true
    })
  },
  hide:function(){
    this.setData({
      isModalShow: false
    })
  },
  hides:function(e){
    return false;
  },
  goMap:function(e){
    // wx.setStorageSync('distance', this.data.destination[e.currentTarget.dataset.index]);
    // console.log(e.currentTarget.dataset.index);
    wx.setStorage({
      key: "distance",
      data: this.data.destination[e.currentTarget.dataset.index],
      success:function(){
        wx.navigateTo({
          url: '../Map/map'
        })
      }
    })
  },
  goActivity:function(){
    wx.navigateTo({
      url: '../main/main'
    })
  },
  localReflash:function(){
    var that=this;
    this.setData({
      islocalReflash:true
    })
    var localactivityItemArr = that.data.localactivityItem;
    localactivityItemArr.push({
      "area": "惠城区",
      "title": "学生平板电脑",
      "subhead": "福利停不下来",
      "date": "2018.9.27-2018.10.12",
      "shareTitle": "【国庆福利】读书郎学生平板G550A免费领",
      "pic": "../../images/10.png",
      "joinNum": 7000,
      "status": 1
    }, {
        "area": "傻逼区",
        "title": "学生平板电脑",
        "subhead": "福利停不下来",
        "date": "2018.9.27-2018.10.12",
        "shareTitle": "【国庆福利】读书郎学生平板G550A免费领",
        "pic": "../../images/10.png",
        "joinNum": 7000,
        "status": 0
      })
    setTimeout(function(){
      that.setData({
        islocalReflash: false
      },function(){
        that.setData({
          localactivityItem: localactivityItemArr
        })
      })
    },1000);
  },
  nationwideReflash:function(){
    var that = this;
    this.setData({
      isnationwideReflash: true
    })
    var nationwideactivityItemArr = that.data.nationwideactivityItem;
    nationwideactivityItemArr.push({
      "area": "惠城区",
      "title": "学生平板电脑",
      "subhead": "福利停不下来",
      "date": "2018.9.27-2018.10.12",
      "shareTitle": "【国庆福利】读书郎学生平板G550A免费领",
      "pic": "../../images/10.png",
      "joinNum": 7000,
      "status": 1
    }, {
        "area": "傻逼区",
        "title": "学生平板电脑",
        "subhead": "福利停不下来",
        "date": "2018.9.27-2018.10.12",
        "shareTitle": "【国庆福利】读书郎学生平板G550A免费领",
        "pic": "../../images/10.png",
        "joinNum": 7000,
        "status": 0
      })
    setTimeout(function () {
      that.setData({
        isnationwideReflash: false
      }, function () {
        that.setData({
          nationwideactivityItem: nationwideactivityItemArr
        })
      })
    }, 1000);
  }
})
