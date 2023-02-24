//原则：定义函数用到的变量在函数定义之前先被定义
window.onload=function(){
    //保存屏幕宽高 iphone X
    //const bodyWidth1=document.body.offsetWidth; //980
    //const bodyWidth2=document.body.scrollWidth; //980
    const bodyWidth=document.body.clientWidth;  //980
    
    //const bodyHeight1=document.body.offsetHeight; //2121
    //const bodyHeight2=document.body.scrollHeight; //2122
    const bodyHeight=document.body.clientHeight; //2121

    //封装页面渲染函数:模板id,数据,容器。
    function render(strTemp,objData,eleBox){
        var reHTML = template(strTemp,objData);
        eleBox.innerHTML=reHTML;
    }
    
    function scrollMove(obj,target){
        clearInterval(obj.timer);
        obj.timer=setInterval(function(){
            var speed=(target-obj.scrollTop)/8;
            speed=speed>0?Math.ceil(speed):Math.floor(speed);
            var gap=parseFloat(obj.scrollTop)-target;
            if(gap<0.5&&gap>-0.5){
                clearInterval(obj.timer);
            }
            obj.scrollTop+=speed;
        },50);
    }
    
    //封装内容切换的函数,控制列表:controlList,被控制列表:totalList,fn为随click事件执行的函数
    function changePage(controlList,totalList,fn){
        for(var i=0;i<controlList.length;i++){
            controlList[i].index=i;
            controlList[i].onclick=function(){
                for(var j=0; j<totalList.length;j++){
                    controlList[j].style.background="";
                    totalList[j].style.display="none";
                }
                //标识出控制元素的背景
                controlList[this.index].style.background="#E4E4E4";
                totalList[this.index].style.display="block";
                if(fn){
                    fn(this.index);
                }
            }
        }
    }

    //导航页切换
    var navList=document.getElementById('top-menu').getElementsByTagName('dd');
    var contList=document.getElementsByClassName('visbPage');
    contList[0].style="display:block";
    changePage(navList,contList,function(a){
        navIndex=a;
        console.log(navIndex);
    });
    
    
    //替换掉前面绑定的onclick事件
    navList[3].onclick=function(){
        if(navIndex==3) return;
        
        for(var j=0; j<contList.length;j++){
            navList[j].style.background="";
            contList[j].style.display="none";
        }
        navList[this.index].style.background="#E4E4E4";
        contList[3].style="display:block;height:107%;background:linear-gradient(to top,rgba(0,0,0,0.9),rgba(0,0,0,0.8),rgba(0,0,0,0.7),rgba(0,0,0,0.6),rgba(0,0,0,0.5));position:absolute;top:107%;";
        
        startMove(contList[3],{
            "top":0
        });
        navIndex=3;
        console.log("导航索引："+navIndex);
    }
    
    //调试  待删除
    navList[0].style.background="#E4E4E4";
    
    
    //调试  转到num秒
    function gotoAudio(num){
        for(var j=0;j<arrLrcTimePort.length;j++){
            if(num>=arrLrcTimePort[j]){
                lrcj=j;
            }
        }
        
        myAudio.currentTime=num;
        
        //如果音乐暂停中且有歌词时，把歌词拉到相应位置
        if(myAudio.paused&&getLRC){
            scrollMove(playPageLrc,averScroll*lrcj);
            oLyric[lrcj].style.color="yellow";
        }
        
    }
    //调试  快进num秒
    function advAudio(num){
        if((myAudio.duration-myAudio.currentTime)<=num) return;
        
        myAudio.currentTime+=num;
        
        for(var j=0;j<arrLrcTimePort.length;j++){
            if(myAudio.currentTime>=arrLrcTimePort[j]){
                lrcj=j;
            }
        }
    }
    //调试  快退num秒
    function backAudio(num){
        if(myAudio.currentTime<=num) return;
        
        myAudio.currentTime-=num;
        
        for(var j=0;j<arrLrcTimePort.length;j++){
            if(myAudio.currentTime>=arrLrcTimePort[j]){
                lrcj=j;
            }
        }
    }

    var b=document.getElementById("top-empty-left");
    b.onclick=function(){
        backAudio(20); //快退20s;
    }
    var c=document.getElementById("PSD");
    c.onclick=function(){
        advAudio(20); //快进20s;
    }
    
    
    /**
     * 进度条部分
     */
    //获取元素节点
    var parentBar=document.getElementById("parentBar");
    var sonPlayBar=document.getElementById("sonPlayBar");
    var handle=document.getElementById("handle");
    var playTime=document.getElementById("playTime");
    var duration=document.getElementById("duration");
    
    //获取进度条总长
    //var maxWidth=parentBar.offsetWidth;
    //var maxWidth=parseInt(getStyle(parentBar,"width"));
    //var parentBarLeft=parentBar.offsetLeft;
    var maxWidth=bodyWidth*0.8;
    var parentBarLeft=bodyWidth*0.1;
    
    //设置播放条长度
    function setPlayBarLength(){
        var long=event.touches[0].clientX-parentBarLeft;
        if(long<maxWidth){
            sonPlayBar.style.width=long+"px";
        }
    }
    //歌曲 控制的放条长度
    var setBarLength=true;
    function loadPlayBarLength(n){
        if(setBarLength){
            sonPlayBar.style.width=n+"px";
        }
    }
    //播放条控制
    handle.ontouchmove=function(){
        setBarLength=false;
        setPlayBarLength();
    }
    parentBar.ontouchstart=function(){
        setBarLength=false;
        setPlayBarLength();
    }
    parentBar.ontouchend=function(){
        var schedule=((parseInt(getStyle(sonPlayBar,"width")))/maxWidth)*1000;
        schedule=Math.floor(schedule);

        setBarLength=true;
        gotoAudio((schedule/1000)*myAudio.duration);
    }
    
    //格式化时间，输入为秒，输出为mm:ss;
    function formTime(time){
        time=Math.floor(time);
        var multiple=Math.floor(time/60);
        var remainder=time%60;
        function formNumb(n){
            if(n<10){
                return "0"+n;
            } else {
                return n;
            }
        }
        return formNumb(multiple)+":"+formNumb(remainder);
    }
    
    //图片页和歌词页切换(也可以用定位，修改z-index实现切换)
    var playPageImg=document.getElementById("playPageImg");
    var playPageLrc=document.getElementById("playPageLrc");
    playPageImg.onclick=function(){
        startMove(playPageImg,{
            "opacity":0
        },function(){
            playPageLrc.style.display="block";
            playPageLrc.style.opacity="1";
            playPageImg.style.display="none";
        });
    }
    playPageLrc.onclick=function(){
        
        startMove(playPageLrc,{
            "opacity":0
        },function(){
            playPageImg.style.display="block";
            playPageImg.style.opacity="1";
            playPageLrc.style.display="none";
        });
    }
    
    //简单封装ajax函数，暂未支持post
    function ajax(obj){
        var xhr=null;
        if(window.XMLHttpRequest){
            xhr=new window.XMLHttpRequest();
        } else {
            xhr=new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhr.onreadystatechange=function(){
            if (xhr.readyState!=4) return;
            if(xhr.status==200){
                obj.success(xhr);
            } else {
                obj.error(xhr);
            }
        }
        xhr.open(obj.type,obj.url,obj.sync);
        xhr.send();
	}
    
    //当前播放歌曲的索引
    var nowIndex=0;
    
    //当前导航项的索引
    var navIndex=0;
    
    //audio标签和控件
    var myAudio=document.getElementById("myAudio");
    var playBtn=document.getElementsByClassName("playBtn");   //共有两个
    var lastSong=document.getElementsByClassName("lastSong");   //共有两个
    var nextSong=document.getElementsByClassName("nextSong");   //共有两个
    
    //主控按钮 待简化
    playBtn[0].onclick=function(){
        if(myAudio.paused){
            myAudio.play();

            audioCanPlay();
            
        } else {
            myAudio.pause();
            //音频定时器清空,节省性能
            clearInterval(timer_audio);
            
            playBtn[0].innerHTML='<i class="fa fa-play-circle"></i>';
            playBtn[1].innerHTML='<i class="fa fa-play-circle"></i>';
        }
    }
    playBtn[1].onclick=function(){
        if(myAudio.paused){
            myAudio.play();
            
            audioCanPlay();
        } else {
            myAudio.pause();
            //音频定时器清空,节省性能
            clearInterval(timer_audio);
            
            playBtn[0].innerHTML='<i class="fa fa-play-circle"></i>';
            playBtn[1].innerHTML='<i class="fa fa-play-circle"></i>';
        }
    }
    
    //上一首
    lastSong[0].onclick=function(){
        if(nowIndex==0) return;
        reloadAllSongsMeg(nowIndex-1);
    }
    lastSong[1].onclick=function(){
        if(nowIndex==0) return;
        reloadAllSongsMeg(nowIndex-1);
    }
    
    //下一首
    nextSong[0].onclick=function(){
        if(nowIndex==(oSong.length-1)) return;
        reloadAllSongsMeg(nowIndex+1);
    }
    nextSong[1].onclick=function(){
        if(nowIndex==(oSong.length-1)) return;
        reloadAllSongsMeg(nowIndex+1);
    }
    
    //播放结束时
    myAudio.onended=function(){
        playBtn[0].innerHTML='<i class="fa fa-play-circle"></i>';
        playBtn[1].innerHTML='<i class="fa fa-play-circle"></i>';
        
        //时间点的索引清零
        lrcj=0;
        //音频定时器清空
        console.log("清除定时器timer_audio");
        clearInterval(timer_audio);
    }
    
    
    //底部点击事件,进入播放页
    var song_show=document.getElementById("song-show");
    song_show.onclick=function(){
        navList[3].click();
    }
    
    
    //获取待渲染歌曲数据的DOM结点
    var oSongs=document.getElementById('songs');
    var oSong=document.getElementsByClassName("song");
    var gequArrData=null;
    //定义由歌手索引i请求歌手的歌曲信息并渲染到特定位置
    function getOneSingerSongs(i){
        ajax({
            url:`/user/des/songs?index=${i}`,
            type:"GET",
            sync:true,
            success:function(xhr){
                gequArrData=JSON.parse(xhr.responseText);
                
                render("gequ",{
                    "gequData":gequArrData
                },oSongs);
                
                //给每个歌曲条目添加click
                for(var i=0;i<oSong.length;i++){
                    oSong[i].index=i;
                    oSong[i].onclick=function(){
                        
                        reloadAllSongsMeg(this.index);
                    }
                }
            },
            error:function(){
                console.log("歌曲数据请求失败！");
            }
        })
    }
    
    
    /**
     * 歌曲部分
     */
    var oSource=myAudio.getElementsByTagName("source")[0];
    
    var song_img1=document.getElementsByClassName("song_img")[0].getElementsByTagName("img")[0];
    var song_img2=document.getElementById("imgBox").getElementsByTagName("img")[0];
    
    var ofilter=document.getElementById("filter");
    
    var song_name=document.getElementsByClassName("song_name");
    var song_author=document.getElementsByClassName("song_author");
    
    //用变量getAUD保存当前音频可否播放状态，默认值为true
    var getAUD=true;
    
    /*由gequArrData修改audio标签的属性*/
    function reloadAllSongsMeg(j){
        //请求的是当前歌曲
        //？？？
        
        //清空音频定时器
        clearInterval(timer_audio);
        
        //清空歌词索引
        lrcj=0;
        
        //清空歌词时间点
        arrLrcTimePort=[];
        
        //设定为默认歌曲状态
        getAUD=false;
        
        //设定为默认歌词状态
        getLRC=false;
        
        //修改视图
        playBtn[0].innerHTML='<i class="fa fa-play-circle"></i>';
        playBtn[1].innerHTML='<i class="fa fa-play-circle"></i>';
        oSource.src=gequArrData[j].url;
        song_img1.src=gequArrData[j].alImg;
        song_img2.src=gequArrData[j].alImg;
        ofilter.style="background-image:url("+gequArrData[j].alImg+")";
        song_name[0].innerHTML=gequArrData[j].name;
        song_name[1].innerHTML=gequArrData[j].name;
        song_author[0].innerHTML=gequArrData[j].musician;
        song_author[1].innerHTML=gequArrData[j].musician;
        
        
        //重载audio并播放
        myAudio.load();
        myAudio.play();
        
        
        //用轮询替代oncanplay
        var waitStart=Date.now();
        var wait=setInterval(function(){
            if(!myAudio.paused){
                clearInterval(wait);
                console.log("音乐开始播放了！");
                //音频可播放
                getAUD=true;
                audioCanPlay();
            }
            if(Date.now()-waitStart>5000){
                console.log("5秒了！音频还没加载出来！");
                clearInterval(wait);
            }
        },100);
        
//        myAudio.oncanplaythrough=function(){
//            console.log("触发了oncanplaythrough事件,歌曲载入完成！");
//        }
        
        //由歌曲id通过Ajax请求歌词数据，歌曲播放与否都加载歌词
        loadLRC(j,true);
        
        //重置当前歌曲索引
        nowIndex=j;
        console.log("当前歌曲索引为："+nowIndex);
    }
    
    
    //当歌曲可正常播放时(包括加载新歌和从暂停状态开始时两种情况)执行,否则返回
    function audioCanPlay(){
        //音频不能播放时
        if(!getAUD) return;
        
        //显示歌曲总时长
        var waitStart=Date.now();
        var wait=setInterval(function(){
            if(myAudio.duration){
                clearInterval(wait);
                duration.innerHTML=formTime(myAudio.duration);
            }
            if(Date.now()-waitStart>5000){
                duration.innerHTML="!?:!?";
                clearInterval(wait);
            }
        },500);
        
        
        playBtn[0].innerHTML='<i class="fa fa-pause-circle"></i>';
        playBtn[1].innerHTML='<i class="fa fa-pause-circle"></i>';
        
        if(getLRC){
            console.log("getLRC为true:"+getLRC);
            playWithLRC();
            
        } else {
            console.log("getLRC为false:"+getLRC);
            playWithoutLRC();
        }
    }
    
    
    
    //监听歌曲播放的定时器
    var timer_audio=null;
    //歌词时间点的索引lrcj
    var lrcj=0;
    //scrollMove的滚动控制开关，默认关闭
    var scrollSwitch=false;
    
    /**
     * 处理歌词部分,加载完成返回true,在调用它的函数中myAudio.load();但返回false超出时间也要myAudio.load()
     * j：要加载的歌曲索引
     * arrLRC：当前歌词
     * arrLong：当前歌词行数
     * getLRC：当前歌词状态，默认值由于arrLRC的存在所以为true，var arrLRC=getFirstLrc();
     * 
     */  
    var arrLRC=[];
    var arrLong=0;
    var getLRC=false;
    
    //歌词部分DOM元素
    var playPageLrc=document.getElementById("playPageLrc");
    var oLyrics=document.getElementById("lyrics");
    var oLyric=document.getElementsByClassName("lyric");
    
    //保存所有歌词dd的高度之和
    var lyricsHeight=0;
    //保存显示歌词的容器的高
    var playPageLrcHeight=parseInt(bodyHeight*0.6821);
    
    //平均每个歌词条目容器(<dd>)分得的scrollTop值
    var averScroll=0;
    
    function playWithLRC(){
        console.log("有歌词 开始滚动歌词！");
        
        //设定所有歌词dd的高度之和
        lyricsHeight=80*arrLong;
        
        //设定平均每个dd分得的scrollTop值,这里1120为marginTop+marginBottom值
        averScroll=((lyricsHeight+1120)-playPageLrcHeight)/(arrLong);
        
        console.log("成功获得了歌词");
        console.log("dl高："+lyricsHeight);
        console.log("差值："+(lyricsHeight-playPageLrcHeight));
        console.log("均值："+averScroll);
        
        //歌词滚动scrollMove()开关打开;
        scrollSwitch=true;
        
        //音频定时器打开
        timer_audio=setInterval(function(){
            //调用滚动歌词函数
            lrcRollControl();
            
            //调用加载进度条函数
            runPlayBar();
            
            //调用旋转图片函数
        },150);
    }

    //滚动歌词函数
    function lrcRollControl(){
        if(!getLRC) return;  //可删除，如果前面判断过
        
        if(myAudio.currentTime>=arrLrcTimePort[lrcj]){
            if(lrcj<arrLong){
                
                for(var i=0;i<oLyric.length;i++){
                    oLyric[i].style.color="rgb(187,184,186)";
                }
                oLyric[lrcj].style.color="#fff";
                
                //滚动一行
                if(scrollSwitch){
                    scrollMove(playPageLrc,averScroll*lrcj);
                    console.log("scrollSwitch:"+scrollSwitch);
                }
                //替代滚动（如果不使用动画函数）
                //playPageLrc.scrollTop+=averScroll;
                
                //歌词的终点
                if(lrcj==arrLong-1){
                    console.log("歌词滚动结束,lrcj:"+lrcj);
                } else {
                    lrcj++;
                }
            }
        } 
    }
    
    
    function playWithoutLRC(){
        console.log("无歌词 播放音频");
        
        //歌词滚动scrollMove()开关关闭;
        //scrollSwitch=false;
        
        timer_audio=setInterval(function(){
            //调用加载进度条函数
            runPlayBar();
            //调用旋转图片函数
        },150);
    }
    
    
    //定义加载进度条函数
    function runPlayBar(){
        var a=Math.floor((myAudio.currentTime/myAudio.duration)*1000);
        console.log("播放进度条："+a+"%0");
        
        //load滚动条尺寸
        loadPlayBarLength((a/1000)*maxWidth);
        
        //显示当前播放时间
        playTime.innerHTML=formTime(myAudio.currentTime);
        
        //调试数据
        document.title=arrLrcTimePort[lrcj]+" / "+myAudio.currentTime+" / "+myAudio.duration;
    }
    
    
    function loadLRC(j,s){
        if(s!=true) return;

        console.log("正在加载歌词...当前歌曲id为："+gequArrData[j].id);
        //由歌曲id通过Ajax请求歌词数据
        ajax({
            url:`/user/des/lyric?id=${gequArrData[j].id}`,
            type:"GET",
            success:function(xhr){
                //获得响应,转对象
                arrLRC=JSON.parse(xhr.responseText);
                if(arrLRC.code==404||arrLRC[0]==null||arrLRC.length<3){
                    console.log("后台返回信息："+arrLRC.mes);
                } else {
                    arrLong=arrLRC.length;
                    //用template渲染歌词页面
                    renderLyric(arrLRC);
                    //设定当前歌词状态
                    getLRC=true;
                    //保存歌词时间点到数组arrLrcTimePort
                    loadLrcTimePort();
                    //轮询:当myAudio.paused!=false,执行歌词滚动函数
                    var waitStart=Date.now();
                    var wait=setInterval(function(){
                        if(!myAudio.paused){
                            clearInterval(wait);
                            //console.log("播放开关开启");
                        }
                        if(Date.now()-waitStart>5000){
                            console.log("5秒了！音频还没加载出来！先看看歌词吧！");
                            clearInterval(wait);
                        }
                    },100);
                }
            },
            error:function(){
                console.log('歌词数据请求失败！');
            }
        })
    }

    /**
     * 用template渲染歌词页面
     */
    function renderLyric(arrLRC){
        render("geci",{
            arrLRC:arrLRC
        },oLyrics);
    }
    /*定义保存歌词时间点到数组的方法*/
    var arrLrcTimePort=[];
    function loadLrcTimePort(){
        if(!getLRC) return;
        for(var i=0;i<arrLong;i++){
            var arrTime=arrLRC[i].time.split(":");
            if(!isNaN(arrTime[0])){
                //var lrcTimePort=arrTime[0]*60+parseFloat(arrTime[1]);
                var lrcTimePort=(arrTime[0]*6000+parseInt(arrTime[1]*100))/100;
                arrLrcTimePort[i]=lrcTimePort;
            } else {
                arrLrcTimePort[i]=arrLrcTimePort[i-1]||0;
            }
        }
        // console.log("歌词数："+arrLRC.length+" 歌词如下：");
        // console.log(arrLRC);
        // console.log("节点数："+arrLrcTimePort.length+" 节点如下：");
        // console.log(arrLrcTimePort);
    }
    loadLrcTimePort();
    //console.log(arrLrcTimePort);
    
    
    //触摸暂停歌词滚动，暂停5s
    var wait_5s=null;
    playPageLrc.ontouchstart=function(){
        console.log("ontouchstart");
        clearTimeout(wait_5s);
        scrollSwitch=false;
        clearInterval(playPageLrc.timer);
    }
    playPageLrc.ontouchmove=function(){
        console.log("ontouchmove");
        clearTimeout(wait_5s);
        scrollSwitch=false;
        clearInterval(playPageLrc.timer);
    }
    playPageLrc.ontouchend=function(){
        console.log("ontouchend");
        clearTimeout(wait_5s);
        scrollSwitch=false;
        clearInterval(playPageLrc.timer);
        wait_5s = setTimeout(function(){
            clearTimeout(wait_5s);
            if(!myAudio.paused){
                console.log("reStartRoll");
                scrollSwitch=true;
            } else {
                console.log("NotreStartRoll");
            }
        },10000);
    }
    
    
    //页面初始化数据,请求后台所有歌手姓名并渲染到特定位置
    var oSingers=document.getElementById('singers');
    var oSinger=document.getElementsByClassName("singer");
    ajax({
        url:"/user/des/singers",
        type:"GET",
        sync:true,
        success:function(xhr){
            //渲染歌手部分
            var arrSingers=JSON.parse(xhr.responseText);
            render("geshou",{
                arrSingers:arrSingers
            },oSingers);
            
            //每个歌手list添加click
            for(var i=0;i<oSinger.length;i++){
                oSinger[i].index=i;
                oSinger[i].onclick=function(){
                    //请求歌手的歌曲信息并渲染到特定位置
                    getOneSingerSongs(this.index);
                }
            }
            //确定oSinger父级的宽度
            document.getElementById("singers").style.width=(parseInt(getStyle(oSinger[0],"width"))+4)*(oSinger.length)+"px";
            
            //首次自发请求歌曲数据来渲染
            getOneSingerSongs(0);
        },
        error:function(){
            console.log('初始化数据请求失败！');
        }
    })
    //页面初始化渲染歌词数据
//    render("geci",{
//        arrLRC:arrLRC
//    },oLyrics);
}
