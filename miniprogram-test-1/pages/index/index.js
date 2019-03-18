//index.js
//获取应用实例
const app = getApp()

Page({
  data:{
    show : "扫码结果",
    audioresult:"语音转文字"
  },
  onLoad: function () {
    var that = this;
    //创建录音管理
    this.recorderManager = wx.getRecorderManager();
    this.recorderManager.onError(function(){
        //录音失败的回调处理
    });
    this.recorderManager.onStop(function(res){
        //停止录音之后，把录取到的音频放在res.tempFilePath
        that.setData({
          src:res.tempFilePath
        });
        console.log(res.tempFilePath);
    });
    //创建文件管理
    this.fileSystemManager = wx.getFileSystemManager();
  },

  //长按
  longTap:function(){
     console.log('longTap');
  },

  touchStart:function(){
    this.recorderManager.start({
      format: 'mp3', //如果录制acc类型音频则改成acc
      sampleRate:8000, //采样率
      numberOfChannels:1, //录音通道数
     // encodeBitRate:16000 //编码码率
    });
  },

  touchEnd:function(){
    this.recorderManager.stop();
  },

  playlongRecord:function(){
    this.recorderManager.start({
      //format: 'mp3' //如果录制acc类型音频则改成acc
    });
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.onError((res) => {
      //播放音频失败的回调
    });
    this.innerAudioContext.src = this.data.src; //这里可以是录音的临时路径
    this.innerAudioContext.play();
    this.recorderManager.stop();
  },

  transferAudioToText:function(){
    this.transfer(1);
    console.log('transfer(1)');
  },
  
  transfer: function (i) {
    //取到录音文件的地址 并转为字符串格式
    //var srcString = 'pages/images/0703262.wav'+"";
    var srcString = this.data.src+"";
    console.log('src ---', srcString);

    //读取本地文件 参数为Object类型 地址为字符串格式
    var voiceBuffer = '';
    var _data = '';
    var that = this;
    console.log('--------test11111-------:', _data)

    //读文件
    this.fileSystemManager.readFile({
      filePath: srcString,
      success: function (data) {
        console.log('--------test-------:',_data)
        console.log('data ---', data.data);
        // 读取文件成功,
        voiceBuffer = data.data;
        console.log('voiceBuffer', voiceBuffer);
      },
      fail: function (data) {
        console.log('--- readFile fail ---',data);
        // 读取文件失败
      },
      complete: function () { 
        // 读取完成
        // 文件长度
        var countAll = Math.ceil((voiceBuffer.byteLength) / 1600);
        console.log('voiceBuffer.byteLength', voiceBuffer.byteLength);
        console.log('countAll === ', countAll);
        //文件数据
        var buffer = '';
        //是否是最后一段数据 , 1 是  0 不是
        var islastValue = '';
        //上传语音时的数据编号 , 从 1 开始
        var idxValue = '';

        console.log(' --- i ---',i);
        // 文件切片，单字传输
        if (i <= countAll) {
          idxValue = i;
          // islastValue = 1,是最后一段， = 0 不是最后一段
          if (i != countAll) {
            buffer = voiceBuffer.slice((i - 1) * 1600, i * 1600);
            console.log('---buffer---',buffer);
            console.log('---bufferLength---', buffer.byteLength);
            islastValue = 0;
          } else {
            buffer = voiceBuffer.slice((i - 1) * 1600, voiceBuffer.byteLength);
           // buffer = voiceBuffer.slice((i - 1) * 1600);      
            console.log('---buffer---', buffer);
            console.log('---bufferLength---', buffer.byteLength);
            islastValue = 1;
          }
          let urlString = 'http://10.37.2.243:80/asr.php?username=python&did=ccccc&dtype=bbbbb&auth=aaa&etype=stream&rectype=1&islast=' + islastValue + '&idx=' + idxValue + '&sid=c94e7a40-39b8-11e9-ab35-7085c202fb28';
        // console.log('---url---', urlString);
        // 网络请求，参数拼接在ip之后
          wx.request({
            url: urlString,
            // 语音文件
            data: buffer,
            method: 'POST',
            header: {
              'content-type': 'application/i7-voice',
             // 'content-length': buffer.length,
             // 'connection': 'Keep-Alive'
            },
            success: function (res) {
              //console.log('==================:',typeof(res),typeof(_data),_data,res);
              // 请求成功后，将返回值赋给_data
              _data += JSON.stringify(res);
              console.log('=======succ====:', _data);
            },
              // 请求失败后，打印err
            fail: function (err) {
              console.log(err);
            },
             // 完成后操作
            complete: function () {
              if (i == countAll) {
               
                var start = _data.indexOf('<phoneme>');
                var end = _data.indexOf('</phoneme>');
                var str = _data.substring(start + 9, end);
                console.log("---str---", str);
      
                that.setData({
                  audioresult: str
                })
              }
                i++;
                that.transfer(i);
            }
          });
        } else {
          console.log('=========end==========', i, countAll)
        }
      }
    });
  },
  
  //扫码功能
  scanCode: function () {
    var that = this;
    var show;
    wx.scanCode({
      success: (res) => {
        this.show = "结果:" + res.result;
        that.setData({
          audioresult: this.show
        })
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: (res) => {
        wx.showToast({
          title: '失败',
          icon: 'fail',
          duration: 2000
        })
      },
      complete: (res) => {

      }
    })
  }
})
 