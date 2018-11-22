function authorization(callback){
  wx.getSetting({
    success: (res) => {
      if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {//非初始化进入该页面,且未授权
        wx.showModal({
          title: '温馨提醒',
          content: '读书郎需要获取您的地理位置，请确认授权，否则无法获取您所需数据',
          cancelText: '使用默认',
          confirmText: '开启设置',
          success: function (res) {
            if (res.cancel) {
              wx.showToast({
                title: '授权失败',
                icon: 'success',
                duration: 1000
              })
            } else if (res.confirm) {
              wx.openSetting({
                success: function (dataAu) {
                  if (dataAu.authSetting["scope.userLocation"] == true) {
                    wx.showToast({
                      title: '授权成功',
                      icon: 'success',
                      duration: 1000,
                      success:function(){
                        typeof callback === "function" && callback({ code:1 });
                      }
                    })
                    //再次授权，调用getLocationt的API
                    // getLocation(that);
                  } else {
                    wx.showToast({
                      title: '授权失败',
                      icon: 'success',
                      duration: 1000
                    })
                  }
                }
              })
            }
          }
        })
      } else if (res.authSetting['scope.userLocation'] == undefined) {//初始化进入
        // getLocation(that);
      }
      else { //授权后默认加载
        typeof callback === "function" && callback({ code: 2 });
      }
    }
  })
}



module.exports.authorization = authorization;
