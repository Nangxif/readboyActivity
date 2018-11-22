//app.js
App({
  onShow: function (options){
    var endTime = new Date('2018/12/2');
    var now = new Date();
    if ((now - endTime) < 0) {
      this.globalData.isStart = true;
      this.globalData.isEnd = false;
      this.globalData.friend_openid = options.query.id
      this.globalData.activity_id = options.query.activity_id;
      if (options.query.id && options.query.id != wx.getStorageSync('openid') && (options.scene == 1007 || options.scene == 1008) && !this.globalData.onShare) {
        this.globalData.myself = false;
        this.globalData.isShare = true;
        this.globalData.firend_nickName = options.query.nickName;
        this.globalData.firend_avatarUrl = decodeURIComponent(options.query.avatarUrl);
      } else {
        this.globalData.isShare = false;
        this.globalData.myself = true; 
        this.globalData.onShare = false;
      }
    } else {
      this.globalData.isStart = false;
      this.globalData.isEnd = true;
    }

  },
  onLaunch: function () {
    
  },
  globalData: {
    userInfo: null,
    isStart:false,
    isEnd:false,
    isShare:false,
    onShare:false,
    myself:false,
    friend_openid:'',
    activity_id:''
  }
})