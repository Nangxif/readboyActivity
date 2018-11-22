// pages/Map/map.js
var amapFile = require('../../utils/amap-wx.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    markers: [{
      iconPath: "../../images/mapicon_navi_s.png",
      id: 0,
      latitude: "",
      longitude: "",
      width: 23,
      height: 33
    }, {
      iconPath: "../../images/mapicon_navi_e.png",
      id: 0,
      latitude: "",
      longitude: "",
      width: 24,
      height: 34
    }],
    center:{},//中心点坐标
    target: [],
    distance: "",
    duration: '',//需要的时间
    traffic_lights:'',//红绿灯个数
    polyline: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      "markers[0].latitude": wx.getStorageSync("local").split(",")[1],
      "markers[0].longitude": wx.getStorageSync("local").split(",")[0],
      "markers[1].latitude": wx.getStorageSync("target").lat,
      "markers[1].longitude": wx.getStorageSync("target").lon,
    }) 
    var myAmapFun = new amapFile.AMapWX({ key: '19c282197a346b17749ac00505bff673' });
    myAmapFun.getDrivingRoute({
      origin: wx.getStorageSync("local"),
      destination: that.data.markers[1].longitude + "," + that.data.markers[1].latitude,
      success: function (data) {
        var points = [];
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          var steps = data.paths[0].steps;
          for (var i = 0; i < steps.length; i++) {
            var poLen = steps[i].polyline.split(';');
            for (var j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            }
          }
        }
        that.setData({
          polyline: [{
            points: points,
            color: "#0091ff",
            width: 5
          }]
        });
        if (data.paths[0] && data.paths[0].distance) {
          that.setData({
            distance: (data.paths[0].distance/1000).toFixed(2) + '公里'
          });
        }
        if (data.paths[0].duration) {
          that.setData({
            duration: data.paths[0].duration / 60 >= 60 ? Math.floor(data.paths[0].duration / 3600) + "小时" + ((data.paths[0].duration % 3600)/60).toFixed(0)+"分钟":(data.paths[0].duration / 60).toFixed(0) + '分钟'
          });
        }
        if (data.paths[0].traffic_lights) {
          that.setData({
            traffic_lights: data.paths[0].traffic_lights
          });
        }

      },
      fail: function (info) {

      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that=this;
    this.setData({
      center:{
        "latitude": (Number(this.data.markers[0].latitude) + Number(this.data.markers[1].latitude))/2,
        "longitude": (Number(this.data.markers[0].longitude) + Number(this.data.markers[1].longitude)) / 2
      },
    })
    this.mapCtx = wx.createMapContext('navi_map')
    this.mapCtx.includePoints({//使路线图一直在可视区内
      padding: [50],
      points: [{
        latitude: that.data.markers[0].latitude,
        longitude: that.data.markers[0].longitude
      }, {
        latitude: that.data.markers[1].latitude,
        longitude: that.data.markers[1].longitude
      }]
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})