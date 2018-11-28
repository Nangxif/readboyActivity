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
    activityItem:[],
    nationwideactivityItem:[],
    activityDetail:[],
    isModalShow:false,//弹框是否出现
    myAmapFun:{},//高德地图对象
    latitude:0,//本地x坐标
    longitude:0,//本地y坐标
    citycode:0,
    destination:[],//目的地坐标数组
    distance:[],//最近距离
    isnationwideReflash: false,//全国门店是否刷新
    canflash:true,//是否可以加载更多
    page:1,//全国门店当前页数
    isAuthorization:false,//是否授权
  },
  onLoad: function () {//页面卸载的时候清除picker缓存
    wx.removeStorageSync("picker");
    this.setData({
      page:1
    })
  },
  onShow: function () { 
    var that = this;
    this.setData({
      page: 1
    })
    wx.getLocation({//调出授权窗口
      type: 'wgs84',
      success: function (res) {
        that.setData({
          latitude: res.latitude,//纬度
          longitude: res.longitude//经度
        })
        wx.setStorageSync("local", res.longitude + "," + res.latitude);
        that.setData({
          myAmapFun: new amapFile.AMapWX({ key: '19c282197a346b17749ac00505bff673' })//19c282197a346b17749ac00505bff673
        })
        that.data.myAmapFun.getRegeo({//获取当前位置的名称等信息
          success: function (data) {
            // wx.setStorageSync("pickercode", e.detail.code)
            if(wx.getStorageSync("picker")){
              that.setData({
                region: wx.getStorageSync("picker").value,
                citycode: data[0].regeocodeData.addressComponent.adcode
              })
              request.activity_search(that.data.longitude, that.data.latitude, wx.getStorageSync("picker").code[1], function (searc) {
                if (searc.code == 1) {
                  that.setData({
                    activityItem: searc.data
                  })
                }
              })
            }else{
              that.setData({
                region: [data[0].regeocodeData.addressComponent.province, data[0].regeocodeData.addressComponent.city, data[0].regeocodeData.addressComponent.township],
                citycode: data[0].regeocodeData.addressComponent.adcode
              })
              request.index(that.data.longitude, that.data.latitude, data[0].regeocodeData.addressComponent.adcode, function (inde) {
                if (inde.code == 1) {
                  that.setData({
                    activityItem: inde.data
                  })
                }
              })
            }
            request.activities(that.data.page, that.data.longitude, that.data.latitude, data[0].regeocodeData.addressComponent.adcode, function (nation) {
              if (nation.code === 1) {
                if (nation.data.length != 0) {
                  that.setData({
                    nationwideactivityItem: nation.data,
                    page: ++that.data.page
                  })
                } else {
                  that.setData({
                    canflash: false
                  })
                }
              }
            })
          },
          fail: function (info) {
            wx.showModal({ title: info.errMsg })
          }
        })
      },
      fail: function (err) {
        address.authorization(function (res) {
          if (res.code == 1) {
            wx.redirectTo({
              url: "../index/index"
            })
          }
        });
      }
    })
  },
  onReady: function () { 
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
    var that = this;
    console.log('picker发送选择改变，携带值为', e.detail)
    this.setData({
      region: e.detail.value
    })
    address.authorization(function(res){
      if(res.code==1){
        wx.redirectTo({
          url: "../index/index"
        })
      }else{
        wx.setStorageSync("picker", e.detail);
        request.activity_search(that.data.longitude, that.data.latitude, e.detail.code[1], function (searc) {         
          if (searc.code == 1) {
            that.setData({
              activityItem: searc.data
            })
          }
        })
      }
    })
  },
  //MMZBZ-JQERX-6ZR4O-ZG4TF-35ZGE-5XFBX


  show:function(e){
    var that=this;
    var pattern = /all/;
    if (pattern.test(e.target.dataset.store)){
      this.setData({
        activityDetail: that.data.nationwideactivityItem[e.target.dataset.store.substring(3)]
      }, function () {
        var storeLen = that.data.activityDetail.same_endpoints.length, distances = [];
        for (var c = 0; c < storeLen; c++) {
          distances[c] = that.distanceFilter(that.data.activityDetail.same_endpoints[c].lng, that.data.activityDetail.same_endpoints[c].lat)
        }
        that.setData({
          distance: distances,
          isModalShow: true,
        })
      })
    }else{
      this.setData({
        activityDetail: that.data.activityItem[e.target.dataset.store]
      },function(){
        var storeLen = that.data.activityDetail.same_endpoints.length,distances=[];
        for(var c=0;c<storeLen;c++){
          distances[c] = that.distanceFilter(that.data.activityDetail.same_endpoints[c].lng, that.data.activityDetail.same_endpoints[c].lat)
        }
        that.setData({
          distance: distances,
          isModalShow: true
        })
      })
    }
  },
  hide:function(){
    this.setData({
      isModalShow: false,
      isAuthorization:false
    })
  },
  hides:function(e){
    return false;
  },
  goMap:function(e){
    // wx.setStorageSync('distance', this.data.destination[e.currentTarget.dataset.index]);
    // console.log(e.currentTarget.dataset.index);
    var dataIndex = 0,that = this;
    if (e.currentTarget.dataset.index>=0){
      if (this.data.distance[e.currentTarget.dataset.index]<=30){
        wx.setStorage({
          key: "target",
          data: {
            lat: this.data.activityDetail.same_endpoints[e.currentTarget.dataset.index].lat,
            lon: this.data.activityDetail.same_endpoints[e.currentTarget.dataset.index].lng
          },
          success: function () {
            wx.navigateTo({
              url: '../Map/map'
            })
          }
        })
      }
    }else{
      if (/all/.test(e.currentTarget.dataset.store)){
        if (that.distanceFilter(that.data.nationwideactivityItem[e.currentTarget.dataset.store.substring(3)].same_endpoints[0].lat, that.data.nationwideactivityItem[e.currentTarget.dataset.store.substring(3)].same_endpoints[0].lng) <= 30){
          wx.setStorage({
            key: "target",
            data: {
              lat: this.data.nationwideactivityItem[e.currentTarget.dataset.store.substring(3)].same_endpoints[0].lat,
              lon: this.data.nationwideactivityItem[e.currentTarget.dataset.store.substring(3)].same_endpoints[0].lng
            },
            success: function () {
              wx.navigateTo({
                url: '../Map/map'
              })
            }
          })
        }
      }else{
        if (that.distanceFilter(this.data.activityItem[e.currentTarget.dataset.store].same_endpoints[0].lat, this.data.activityItem[e.currentTarget.dataset.store].same_endpoints[0].lng)<=30){
          wx.setStorage({
            key: "target",
            data: {
              lat: this.data.activityItem[e.currentTarget.dataset.store].same_endpoints[0].lat,
              lon: this.data.activityItem[e.currentTarget.dataset.store].same_endpoints[0].lng
            },
            success: function () {
              wx.navigateTo({
                url: '../Map/map'
              })
            }
          })
        }
      }
    }
  },
  goActivity:function(e){
    var that = this;
    if (wx.getStorageSync('userInfo')){
      wx.setStorage({
        key: 'activity_id_and_num',
        data: e.currentTarget.dataset.activity,
        success: function (res) {
          wx.navigateTo({
            url: '../main/main'
          })
        }
      })
    }else{
      this.setData({
        isAuthorization: true
      })
      wx.setStorage({
        key: 'activity_id_and_num',
        data: e.currentTarget.dataset.activity
      })
    }
  },
  nationwideReflash:function(){
    var that = this;
    this.setData({
      isnationwideReflash: true
    })
    
    request.activities(this.data.page, that.data.longitude, that.data.latitude, that.data.citycode,function (nation) {
      if (nation.code === 1) {
        if (nation.data.length != 0) {
          var nationwideactivityItemArr = that.data.nationwideactivityItem;
          that.setData({
            nationwideactivityItem: nationwideactivityItemArr.concat(nation.data),
            isnationwideReflash: false,
            page: ++that.data.page,
          })
        } else {
          that.setData({
            canflash: false
          })
        }
      }
    })
  },
  bindGetUserInfo: function (e) {
    var that =this;
    if (e.detail.iv) {
      wx.getUserInfo({
        success: function (res) {
          wx.setStorage({
            key: 'userInfo',
            data: res.userInfo,
            success:function(){
              that.setData({
                isAuthorization: false
              })
              wx.navigateTo({
                url: '../main/main'
              })
            }
          });
        }
      })
    }else{
      
    }
  },
  distanceFilter: function (lng2, lat2){
    var lng1 = wx.getStorageSync("local").split(",")[0];
    var lat1 = wx.getStorageSync("local").split(",")[1];
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378137.0; // 取WGS84标准参考椭球中的地球长半径(单位:m)
    s = Math.round(s * 10000) / 10000;
    return (s/1000).toFixed(2);
  }
})