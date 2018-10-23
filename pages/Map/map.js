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
      latitude: wx.getStorageSync("local").split(",")[1],
      longitude: wx.getStorageSync("local").split(",")[0],
      width: 23,
      height: 33
    }, {
      iconPath: "../../images/mapicon_navi_e.png",
      id: 0,
      latitude: wx.getStorageSync("distance").split(",")[1],
      longitude: wx.getStorageSync("distance").split(",")[0],
      width: 24,
      height: 34
    }],
    distance: '',
    cost: '',
    polyline: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var myAmapFun = new amapFile.AMapWX({ key: '19c282197a346b17749ac00505bff673' });
    myAmapFun.getDrivingRoute({
      origin: wx.getStorageSync("local"),
      destination: wx.getStorageSync("distance"),
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
            width: 6
          }]
        });
        if (data.paths[0] && data.paths[0].distance) {
          that.setData({
            distance: data.paths[0].distance + '米'
          });
        }
        if (data.taxi_cost) {
          that.setData({
            cost: '打车约' + parseInt(data.taxi_cost) + '元'
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