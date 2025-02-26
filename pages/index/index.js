
//index.js
//获取应用实例
var recorder = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext() //获取播放对象
const app = getApp();

Page({
  data: {
    config:config,
    isIphoneXHeight: app.globalData.isIphoneXHeight,
    picShow: false,
    safeheight: '', //安全高度,
    userInputContent: '', //输入框内容
    index: '',
    close_flag: 5000,
    scrollTop: '50',
    scrollAnimation: true, // scorll-view 滑动动画，设置为false为防止首次进入页面滑动
    emojiSource: 'https://res.wx.qq.com/wxdoc/dist/assets/img/emoji-sprite.b5bd1fe0.png',
    lineHeight: 24,
    comment: '',
    cursor: 0,
    talkData: [
      {
        from_uid: '321', // 发送人id
        type: 'text', // 消息类型
        content: [
          {type: 1, content: '不告诉你'},
          {type: 2, content: "[龇牙]", imageClass: "smiley_13"}
        ]
      },
      {
        from_uid: '1382253560489709568', // 发送人id
        type: 'text', // 消息类型
        content: [
          {type: 1, content: '今天天气怎么样？'},
          {type: 2, content: "[流泪]", imageClass: "smiley_5"}
        ]
      },
      {
        from_uid: '1382253560489709568', // 发送人id
        type: 'text', // 消息类型
        content: [
          {type: 2, content: "[流泪]", imageClass: "smiley_5"},
          {type: 1, content: '手机没电'},
        ]
      },
      {
        from_uid: '123', // 发送人id
        type: 'image', // 消息类型
        content: {url:'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=757545797,2214471709&fm=11&gp=0.jpg',width:100,height:100},
      }
    ], // 聊天内容
    uploadPic_url: '', 
    img: '',
    currentUser:{
      id:'1382253560489709568',
      avatar:'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=757545797,2214471709&fm=11&gp=0.jpg'
    },
    remoteUser:{
      id:123,
      avatar:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2622933625,920552892&fm=26&gp=0.jpg'
    },
    //from_head: 'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=757545797,2214471709&fm=11&gp=0.jpg',// 当前用户头像
    emojiArr: [],
    isLoad: true,//解决初试加载时emoji动画执行一次
    emojis: [],//qq、微信原始表情
    keyboardHeight: '', // 键盘高度
    inputFocus: false, // 输入框自动对焦
    refreshStatus: true,
    menuHeight: 0,
    toolHeight:0,//输入框那一栏高度
    toolViewHeight: '',//输入框下方功能区高度
    total_page: 5,
    page: 0,
    loading: false,
    menuList: [
      {
        type: 'photo',
        icon: '/img/photo.png',
        text: '照片'
      },
      {
        type: 'camera',
        icon: '/img/camera.png',
        text: '拍摄'
      }
    ],
    recording: false, // 录音按钮按下样式
    isRcord: false // 录音按钮显隐
  },
  // 录音
  onRecord(){
    let isRcord = this.data.isRcord
    this.setData({
      isRcord: !isRcord
    })
  },
  // 关闭表情、失焦
  onClose(){
    this.setData({
      picShow: false,
      inputFocus: false,
      emojiShow: false,
      functionShow: false,
      toolViewHeight: 0
    })
    this.pageUp()
  },
  // 滑动
  onScroll(e){
    let detail = e.detail
    let scrollTouch = detail.scrollTop
    // if(scrollTouch < this.data.scrollTouch){
    //   this.onClose()
    // }
    this.setData({
      scrollTouch: scrollTouch
    })
  },
  // 输入框监听
  InputBlur: function (e) {
    this.setData({
      userInputContent: e.detail.value
    })
  },
  // 隐藏
  hideAllPanel() {
    this.setData({
      functionShow: false,
      emojiShow: false
    })
  },
  // 展示emoji Panel
  showEmoji() {
    console.log('showEmoji');
    if(!this.keyboardShow || this.data.emojiShow){
      this.setData({
        isRcord: false
      })
    }
    this.setData({
      emojiShow: this.keyboardShow || !this.data.emojiShow,
      functionShow: false,
      toolViewHeight: !this.data.emojiShow ? 300+this.data.toolHeight/2-this.data.isIphoneXHeight/2 : 0
    })
    this.pageUp()
  },
  // 展示附件 Panel
  showFunction() {
    if(!this.keyboardShow || this.data.functionShow){
      this.setData({
        isRcord: false
      })
    }
    this.setData({
      functionShow: this.keyboardShow || !this.data.functionShow,
      emojiShow: false,
      toolViewHeight: !this.data.functionShow ? 200+this.data.toolHeight/2-this.data.isIphoneXHeight/2 : 0
    })
    // this.pageUp()
  },
    
  //获取焦点
  onInputFocus(e){
    this.keyboardShow = true;
    console.log(e);
  },

  onInputBlur(){
    console.log('bindBlur')
    this.keyboardShow = false;
  },
  // 监听键盘高度变化
  onkeyboardHeightChange(e) {
    return;
    console.log('获取键盘高度')
    const that = this
    const {height} = e.detail
    console.log(height)
    that.setData({
      keyboardHeight: height,
    })
    if(height !=0){
      that.setData({
        emojiShow: false,
      functionShow: false
      })
    }
    let query = wx.createSelectorQuery();
    query.selectAll('.msg-box').boundingClientRect(function (rect) {
      that.setData({
        scrollTop: rect[0].height + height
      })
    }).exec();
  },
  // input输入
  onInput(e) {
    const value = e.detail.value
    this.data.comment = value;
    this.data.cursor = value.length;
  },
  onConfirm() {
    this.onSend()
  },
  // 发送消息
  onSend() {
    const comment = this.data.comment
    const from_uid = this.data.currentUser.id
    let obj = {from_uid: from_uid, content: [...this.parseEmoji(comment)]}
    const talkData = this.data.talkData
    console.log(talkData)

    if(comment.length == ''){
      wx.showToast({
        title: '内容不能为空',
        icon:'none'
      });
      return;
    }

    talkData.unshift(obj)
    this.setData({
      talkData,
      comment: '' // 发送成功，清空输入框
    })
    this.pageUp()
  },

  // 插入表情
  insertEmoji(evt) {
    const emotionName = evt.detail.emotionName
    const { cursor, comment } = this.data
    console.log(`cursor:${cursor}`);
    const newComment =
      comment.slice(0, cursor) + emotionName + comment.slice(cursor)
    
    this.setData({
      comment: newComment,
      cursor: cursor + emotionName.length
    })
    console.log()
  },

  deleteEmoji: function() {
    const pos = this.data.cursor
    const comment = this.data.comment
    let result = '',
      cursor = 0

    let emojiLen = 6
    let startPos = pos - emojiLen
    if (startPos < 0) {
      startPos = 0
      emojiLen = pos
    }
    const str = comment.slice(startPos, pos)
    const matchs = str.match(/\[([\u4e00-\u9fa5\w]+)\]$/g)
    // 删除表情
    if (matchs) {
      const rawName = matchs[0]
      const left = emojiLen - rawName.length
      if (this.emojiNames.indexOf(rawName) >= 0) {
        const replace = str.replace(rawName, '')
        result = comment.slice(0, startPos) + replace + comment.slice(pos)
        cursor = startPos + left
      }
      // 删除字符
    } else {
      let endPos = pos - 1
      if (endPos < 0) endPos = 0
      const prefix = comment.slice(0, endPos)
      const suffix = comment.slice(pos)
      result = prefix + suffix
      cursor = endPos
    }
    this.setData({
      comment: result,
      cursor: cursor
    })
  },
  // 页面上推
  pageUp(){
    const that = this
    let query = wx.createSelectorQuery();
    let toolViewHeight  = this.data.toolViewHeight
    query.selectAll('.msg-box').boundingClientRect(function (rect) {
      that.setData({
        scrollTop: rect[0].height + toolViewHeight
      })
      console.log(that.data.scrollTop)
    }).exec();
  },
  
  // 消息触底
  msgBottom: function () {
    const that = this;
    let query = wx.createSelectorQuery();
    query.selectAll('.cu-chat').boundingClientRect(function (rects) {
      wx.pageScrollTo({
        scrollTop: rects[rects.length - 1].bottom
      })
      that.setData({
        bottom: rects[rects.length - 1].bottom
      })
    }).exec();
  },
  // 消息未读
  unRead(){
    const that  = this
    let from_uid = that.data.currentUser.id;
    let toid = that.data.remoteUser.id;
    util.request({
      modules: '',
      method: 'post',
      data: {
          from_uid: from_uid,
          toid: toid
      },
      success: (result) => {
        console.log(result)
      }
    })
  },
  // 连接socket
  connect: function () {
    
    // 创建一个websocket连接
    // return wx.connectSocket({
    //   url: 'wss://test.nwx000.com/wss',
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   method: 'GET',
    //   success: res => {
    //     console.log('websocket连接')
    //   },
    //   fail: res => {
    //     console.log('websocket连接失败~')
    //   }
    // })
  },
  onSocketMessage(){
    const that = this
    
    wx.onSocketMessage(function (res) {
    
      let from_uid = that.data.currentUser.id;
      let toid = that.data.remoteUser.id;
      let chatData = JSON.parse(res.data);
      console.log(chatData)
      //接收服务端传过来的消息
      let type = chatData.type
      switch (type) {
            case "init":

              wx.sendSocketMessage({
                  data: JSON.stringify({
                    type: 'bind',
                    from_uid: from_uid, // 自己的id
                })
              });
              
              let online = '{"type":online,"toid":"'+toid+'","from_uid":"'+from_uid+'"}';   //查看当前用户是否在线
              wx.sendSocketMessage(JSON.stringify(online));
              that.unRead()
              // changeNoRead();
              break;
            case "text":        //处理文字消息
              
              // if (toid == chatData.from_uid) {
              //   console.log(chatData.data)
                
              // }
              console.log(type)
              let receiveMsg = {};
              let msg = unescape(chatData.data)
              console.log(msg)
              // receiveMsg.content = chatData.data; // 输入框内容
              receiveMsg.content = msg; // 输入框内容

              receiveMsg.type = chatData.type; // 消息类型       
              receiveMsg.from_uid = chatData.from_uid; // 对方
              let avatar = '/img/my/avatar.png'
              receiveMsg.portrait = avatar // 头像
              let talkData = that.data.talkData
              if(chatData.from_uid == that.data.remoteUser.id){
                talkData.push(receiveMsg)
                that.setData({
                  talkData: talkData
                })
              }
              let query = wx.createSelectorQuery();
              query.selectAll('.msg-box').boundingClientRect(function (rect) {
                console.log(rect)
                that.setData({
                  scrollTop: rect[0].height
                })
              }).exec();
              // $(".chat-content").scrollTop(3000);   将对话框定到最下面
              // changeNoRead();
              break;
            case "say_img":     //处理图片消息
              //处理图片放在对话框
            
            case "save":        //聊天记录持久化
              // that.saveMessage(chatData)   //聊天记录
              if (chatData.isread == 1) {
                online = 1;
                // $(".shop-online").text("在线");
              } else {
                // $(".shop-online").text("不在线");
              }

            case "online":     //用户是否在线
              if(chatData.status == 1){
                  // online=1;
                  // $(".shop-online").text("在线");
              } else{
                  // online=0;
                  // $(".shop-online").text("不在线");
              }
      }
    })
  },
 
  getSystemInfo(){
    wx.getSystemInfo({
      success: (result) => {
        this.setData({
          windowHeight: result.windowHeight
        })
      },
    })
  },

  /*
  * sceoll-view滑动事件
  */

  // 自定义下拉刷新空间被下拉
  startPull(){
  
  },
  // 自定义下拉刷新被触发
  refreshPull(){
    const that = this
    console.log('自定义下拉刷新被触发')
    setTimeout(()=>{
      this.setData({
        refreshStatus: false
      })
    },200)
    // let page = that.data.page
    // this.setData({
    //   talkData: [...this.data.talkData,...this.data.talkData],
    //   page: page++
    // })
    // console.log(page)
    // that.setData({
    //   scrollIntoView: `page${page}`
    // })
  },
  // 自定义下拉刷新被复位
  restorePull(){
    console.log('自定义下拉刷新被复位')
  },

  /*
  *  发送附件 照片
  */
 
  // 发送图片信息
  sendPic: function (url,width, height) {
    const that = this;
    let msg = {};
    msg.type = 'image'; // 消息类型
    msg.content = {url:url,width:width,height:height};
    console.log(msg);
    let arr = [];
    let talkData = that.data.talkData;
    arr = [msg, ...talkData] // 对象拼接
    that.setData({
      talkData: arr
    })
  },
  // 图片比例缩放
  setPicSize(content) {
    console.log(content)
    let maxW = 700;//350是定义消息图片最大宽度
    let maxH = 700;//350是定义消息图片最大高度
    if (content.width > maxW || content.height > maxH) {
      let scale = content.width / content.height;
      content.width = scale > 1 ? maxW : maxH * scale;
      content.height = scale > 1 ? maxW / scale : maxH;
    }
    return content;
  },
  // 上传图片至服务器
  uploadPic: function (tempFilePath) {
    const that = this
    let img = {};
    const from_uid = that.data.currentUser.id;
    wx.getImageInfo({
      src: tempFilePath,
      success(res) {
        that.setPicSize(res)
        img = {
          width: res.width,
          height: res.height,
          url: tempFilePath
        }

        let obj = {from_uid: from_uid, type:'image',content: img}
        console.log(obj);
        const talkData = that.data.talkData
        talkData.unshift(obj)
        that.setData({
          talkData,
        })
      }
    })
    return
    wx.uploadFile({
      url: url,
      filePath: tempFilePath,
      name: 'file',
      success(res) {
        const data = JSON.parse(res.data)
        if (data.state === 2000) {
          wx.getImageInfo({
            src: tempFilePath,
            success(res) {
              that.sendPic(url,res.width, res.height); // 发送图片
            }
          })
        }
      }
    })
  },
  // 相册选取图片
  choosePic: function (e) {
    let type = e.currentTarget.dataset.type
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths)

        that.setData({
          functionShow: false,
          //toolViewHeight: 0
        })

        // 上传图片至服务端
        that.uploadPic(tempFilePaths[0]);
      },
      fail(res) { }
    })
  },

  // 图片查看
  onTapImage: function (res) {
    const url = res.currentTarget.dataset.url
    var current_url = url
    var urls = []
    var list = this.data.talkData
    for (var index in list) {
      if (list[index].type == 'image') {
        urls.push(list[index].content.url)
      }
    }
    urls = urls.reverse();
    wx.previewImage({
      current: current_url,
      urls: urls
    })
  },
  // 开始录音
  onRecordStart(){
    console.log('手指点击录音')
    wx.showToast({
      title: '开始录音',
      icon: 'none'
    })
    
    this.setData({
      recording: true,
      recordStart_temp: new Date().getTime(), //记录开始点击的时间
    })
    const options = {
      duration: 10000, //指定录音的时长，单位 ms
      sampleRate: 8000, //采样率
      numberOfChannels: 1, //录音通道数
      encodeBitRate: 24000, //编码码率
      format: 'mp3', //音频格式，有效值 aac/mp3
      audioSource: 'auto',
      frameSize: 12, //指定帧大小，单位 KB
    }
    recorder.start(options) //开始录音
  },
  // 监听录音事件
  listenRecord(){
    console.log('录音监听事件');
    recorder.onStart((res) => {
      console.log('开始录音');
    })
    recorder.onStop((res) => {
      let {
        tempFilePath
      } = res;
      console.log('停止录音,临时路径', tempFilePath);
      var x = new Date().getTime() - this.data.voice_ing_start_date
      if (x > 1000) {
        let timestamp = new Date().getTime();
        console.log(tempFilePath)
        // wx.cloud.uploadFile({
        //   cloudPath: "sounds/" + timestamp + '.mp3',
        //   filePath: tempFilePath,
        //   success: res => {
        //     console.log('上传成功', res)
        //     that.setData({
        //       soundUrl: res.fileID,
        //     })
 
        //     var data = {
        //       _qunId: 'fb16f7905e4bfa24009098dc34b910c8',
        //       _openId: wx.getStorageSync('openId'),
        //       // 消息
        //       text: '',
        //       voice: res.fileID,
        //       img: '',
        //       // 时间
        //       dataTime: util.nowTime(),
        //       // 头像
        //       sendOutHand: wx.getStorageSync('userInfo').avatarUrl,
        //       // 昵称
        //       sendOutname: wx.getStorageSync('userInfo').nickName
        //     }
        //     console.log(data)
        //     wx.cloud.callFunction({
        //       name: "news",
        //       data: data,
        //       success(res) {
        //         console.log('发送语音发送', res)
        //       },
        //       fail(res) {
        //         console.log('发送语音失败', res)
        //       }
        //     })
        //   },
        // })
      }
    })
  },
  // 结束录音
  onRecordEnd(){
    var x = new Date().getTime() - this.data.voice_ing_start_date
    if (x < 1000) {
      console.log('录音停止，说话小于1秒！')
      wx.showModal({
        title: '提示',
        content: '说话要大于1秒！',
      })
      recorder.stop();
    } else {
      // 录音停止，开始上传
      recorder.stop();
      this.setData({
        recording: false
      })
    }
  },
  /*
  *  小程序生命周期
  */

  onLoad: function (options) {
    const that = this;
    const emojiInstance = this.selectComponent('.mp-emoji')
    this.emojiNames = emojiInstance.getEmojiNames()
    this.parseEmoji = emojiInstance.parseEmoji
    // 获取手机系统信息
    wx.getSystemInfo({
      success: function (res) {
        const model = res.model;
        const mobileModel = model.indexOf('iPhone X');
        if (mobileModel == 0) {
          that.setData({
            safeheight: 68
          })
        }
      }
    })

    //socketClient.onMessage('chat_private',()=>{});
  },
  onShow: function (options) {

  },
  onReady: function () {
    const that = this;
    let query = wx.createSelectorQuery();
    query.selectAll('.tools').boundingClientRect(function (rect) {
      console.log(`toolHeight:${that.data.toolHeight}`)
      that.setData({
        toolHeight: rect[0].height
      })
    }).exec();
    query.selectAll('.menu').boundingClientRect(function (rect) {
      if(rect.length > 0){
        console.log(`menuHeight:${that.data.menuHeight}`)
        that.setData({
          menuHeight: rect[0].height
        })
      }
    }).exec();
    this.getSystemInfo();

    this.listenRecord();
  },
  //页面隐藏
  onHide: function () {

  },
  onPullDownRefresh: function () {
    // this.getTalkData();
  }
});
