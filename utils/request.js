var host = 'https://wx-appapi.readboy.com/',
  secreKey = '9I3o20wZQ61oq064',
  header = {
    "content-type": "application/json"
  };
var md5 = require('md5.js');

function makeSn(data) {
  var timestamp = parseInt(Date.now() / 1000)
  var p1, p2, p3;
  p1 = data.openid ? data.openid : data.code;
  p2 = data.my_openid ? data.my_openid : data.my_code;
  p3 = data.friend_openid ? data.friend_openid : data.friend_code;
  data.sn = md5.md5(timestamp + (p1 ? p1 : '') + (p2 ? p2 : '') + (p3 ? p3 : '') + secreKey + md5.md5(secreKey))
  data.timestamp = timestamp
  return data
}

function postPromise(path, data, success) {
  wx.showLoading({
    title: '加载中',
  })
  return new Promise((resolve, reject) => {
    wx.request({
      url: host + path,
      data: data,
      header: header,
      method: "POST",
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode === 200) {
          typeof (success) === 'function' && success(res.data);
          resolve(res.data);
        } else {
          wx.showToast({
            title: '网络繁忙！',
            icon: 'none'
          });
          wx.clearStorage();
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '检查网络！',
          icon: 'none'
        });
      },
      complete: () =>{
        wx.hideLoading()
      }
    })
  })
}

function getUserInfo() {
  var data = {
    nickname: null,
    avatar: null
  }, userInfo = wx.getStorageSync('userInfo');
  return new Promise((resolve, reject) => {
    if (userInfo) {
      data.nickname = userInfo.nickName;
      data.avatar = userInfo.avatarUrl;
      resolve(data);
    } else {
      wx.getUserInfo({
        success: function (res) {
          data.nickname = res.userInfo.nickName;
          data.avatar = res.userInfo.avatarUrl;
          wx.setStorage({
            key: 'userInfo',
            data: res.userInfo,
          });
          resolve(data);
        },
        fail: () => {
          resolve(data);
        }
      })
    }
  })
}

function login() {
  var openid = wx.getStorageSync('openid');
  return new Promise((resolve, reject) => {
    if (openid) {
      resolve({
        key: 'openid',
        value: openid
      })
    } else {
      wx.login({
        success: function (login) {
          resolve({
            key: 'code',
            value: login.code
          });
        }
      })
    }
  })
}

function player(activity_id,callback) {
  // 使用缓存
  // var cache = wx.getStorageSync('home_cache')
  // if (cache && Date.now() < cache.timestamp + 1000000){
  //   return new Promise((a,b)=>{
  //     typeof (callback) === 'function' && callback(cache)
  //     a(cache);
  //   })
  // }
  return Promise.all([login(), getUserInfo()]).then((value) => {
    var postData = {
      nickname: value[1].nickname,
      avatar: value[1].avatar,
      activity_id: activity_id
    };
    if (value[0].key === 'openid') postData.openid = value[0].value;
    else postData.code = value[0].value;
    return postPromise('api/player', makeSn(postData), (res) => {
      typeof (callback) === 'function' && callback(res)
      if (res.code == 1) {
        wx.setStorage({
          key: 'openid',
          data: res.openid,
        });
        res.timestamp = Date.now();
        wx.setStorage({
          key: 'home_cache',
          data: res
        });
      }
    });
  })
}

function invitation(activity_id, oid, callback) {
  // var cache = wx.getStorageSync(oid);
  // if (cache && Date.now() < cache.timestamp + 100000){
  //   return new Promise((a,b)=>{
  //     typeof (callback) === 'function' && callback(cache)
  //     a(cache)
  //   })
  // }
  return Promise.all([login(), getUserInfo()]).then(value => {
    var postData = {
      my_openid: oid,
      friend_nickname: value[1].nickname,
      friend_avatar: value[1].avatar,
      activity_id: activity_id
    }
    if (value[0].key === 'openid') postData.friend_openid = value[0].value;
    else postData.friend_code = value[0].value;
    return postPromise('api/invitation', makeSn(postData), res => {
      typeof (callback) === 'function' && callback(res)
      if (res.code == 1) {
        wx.setStorage({
          key: 'openid',
          data: res.openid
        })
        res.timestamp = Date.now();
        wx.setStorage({
          key: oid,
          data: res
        });
      }
    });
  })
}

function player_roll(activity_id, nickname, avatar ,callback) {
  return login().then(login => {
    var postData = {}
    if (login.key === 'openid') postData.openid = login.value;
    else postData.code = login.value;
    postData.activity_id = activity_id;
    postData.nickname=nickname;
    postData.avatar=avatar;
    return postPromise('api/player_roll', makeSn(postData), callback);
  })
}

function helper_roll(activity_id, oid, callback) {
  // var cache = wx.getStorageSync('friend_roll_cache');
  // var oidcache = wx.getStorageSync('oid_cache');
  // if (oidcache&&oidcache == oid){
  //   if (Date.now() < new Date(new Date(new Date().setDate(new Date(cache.time).getDate() + 1)).toLocaleDateString()).getTime()) {
  //     return new Promise((a, b) => {
  //       console.log(cache.code + "  " + cache.message);
  //       typeof (callback) === 'function' && callback(cache)
  //       a(cache);
  //     })
  //   }
  // }else{
  //   wx.setStorage({
  //     key:'oid_cache',
  //     data: oid
  //   })
  // }
  
  return login().then(value => {
    var postData = {
      my_openid: oid,
      activity_id: activity_id
    }
    if (value.key === 'openid') postData.friend_openid = value.value;
    else postData.friend_code = value.value;
    return postPromise('api/helper_roll', makeSn(postData), res => {
      console.log(postData);
      console.log(res.code+"  "+res.message);
      typeof callback === "function" && callback(res);
      if (res.code < 1) {
        wx.setStorage({
          key: 'friend_roll_cache',
          data: {
            code: res.code,
            message: res.message,
            time: Date.now()
          }
        })
      }
    });
  })
}

function win_list(activity_id, callback) {
  // 使用缓存
  // var cache = wx.getStorageSync('winlist_cache')
  // if (cache && Date.now() < cache.cache_time + 1000000) {
  //   return new Promise((a, b) => {
  //     typeof (callback) === 'function' && callback(cache)
  //     a(cache);
  //   })
  // }
  var postData = {}
  postData.activity_id = activity_id;
  return postPromise('api/win_list', makeSn(postData), res => {
    typeof (callback) === 'function' && callback(res);
    if (res.code == 1) {
      res.timestamp = Date.now();
      wx.setStorage({
        key: 'winlist_cache',
        data: res,
      })
    }
  });
}

function winners(activity_id, callback) {
  // 使用缓存
  // var cache = wx.getStorageSync('winners_cache');
  // if (cache && cache.Date.now() < cache_time + 1000000) {
  //   return new Promise((a, b) => {
  //     typeof (callback) === 'function' && callback(cache)
  //     a(cache);
  //   })
  // }
  var postData = {}
  postData.activity_id = activity_id;
  return postPromise('api/winners', makeSn(postData), res => {
    typeof (callback) === 'function' && callback(res);
    if (res.code == 1) {
      res.timestamp = Date.now()
      wx.setStorage({
        key: 'winners_cache',
        data: res,
      })
    }
  });
}

function take_prize(postData, callback) {
  return login().then(login => {
    if (login.key === 'openid') postData.openid = login.value;
    else postData.code = login.value;
    return postPromise('api/take_prize', makeSn(postData), callback);
  })
}

function get_chance(activity_id, callback) {
  // var cache = wx.getStorageSync('get_chance_cache');
  // if (cache && Date.now() < new Date(new Date(new Date().setDate(new Date(cache.time).getDate() + 1)).toLocaleDateString()).getTime()){
  //   return new Promise((a, b) => {
  //     typeof (callback) === 'function' && callback(cache)
  //     a(cache);
  //   })
  // }
  return login().then(login => {
    var postData = {};
    postData.activity_id = activity_id;
    if (login.key === 'openid') postData.openid = login.value;
    else postData.code = login.value;
    return postPromise('api/get_chance', makeSn(postData), res =>{
      typeof callback === "function" && callback(res)
      if(res.code == 1){
        wx.setStorage({
          key: 'get_chance_cache',
          data: {
            code: -3,
            message: "watched",
            time: Date.now()
          }
        })
      }
    });
  })
}

function index(lng, lat, city,callback){
  var postData = {};
  postData.lng = lng;
  postData.lat = lat;
  postData.city = city;
  return postPromise("api/index", makeSn(postData),res =>{
    typeof callback === "function" && callback(res)
  })
}
 
function activities(page, lng, lat, city,callback){
  var postData = {};
  postData.page = page;
  postData.lng = lng;
  postData.lat = lat;
  postData.city = city;
  return postPromise("api/activities", makeSn(postData), res => {
    typeof callback === "function" && callback(res)
  })
}

function activity_search(lng, lat, city,callback){
  var postData = {};
  postData.lng = lng;
  postData.lat = lat;
  postData.city = city;
  return postPromise("api/activity_search", makeSn(postData), res => {
    typeof callback === "function" && callback(res)
  })
}


function activity_share(activity_id, callback){
  var postData = {};
  postData.activity_id = activity_id;
  return postPromise("api/activity_share", makeSn(postData), res => {
    typeof callback === "function" && callback(res)
  })
}


module.exports.player = player;
module.exports.invitation = invitation;
module.exports.player_roll = player_roll;
module.exports.helper_roll = helper_roll;
module.exports.win_list = win_list;
module.exports.winners = winners;
module.exports.take_prize = take_prize;
module.exports.get_chance = get_chance;

module.exports.index = index;
module.exports.activities = activities;
module.exports.activity_search = activity_search;
module.exports.activity_share = activity_share;