const express=require('express');
const router=express.Router();
const art=require('express-art-template');
const fs=require('fs');
const request=require('request');

let readJson=require("../my_modules/readJson");


var musicData=readJson('./data/musicData.json');

router.get('/',function(req,res){
    res.send('用户页面');
})


router.get('/vipUser',function(req,res){
    res.json({'vipUser':'vipUser'});
})


//由后端实时获取数据，对前端隐藏音乐源API
router.get('/des',function(req,res){
    var desTemp=fs.readFileSync("./views/desTemp.html");
    desTemp=desTemp.toString();
    res.send(desTemp);
})
router.get('/des/singers',function(req,res){
    var arrSingers=[];
    for(var i=0;i<musicData.length;i++){
        arrSingers.push(musicData[i].name);
    }
    res.json(arrSingers);
})
router.get('/des/songs',function(req,res){
    res.json(musicData[req.query.index].songs);
})
router.get('/des/lyric',function(rq,rs){
    console.log(rq.query.id);
    
    //请求歌词
    let options={
        method:'GET',
        url:'https://api.imjad.cn/cloudmusic/',
        qs: {
            type:'lyric',
            id:rq.query.id
        },
        headers:{
            'Cache-Control':'no-cache'
        }
    }
    request(options,function(err,res,body){
        if(err){
            console.log("请求歌曲数据出错！");
        } else {
            var oBody=JSON.parse(body);            
            if(oBody.lrc){
                //返回格式化后的数据
                console.log(oBody);
                formatLrcData(oBody.lrc.lyric);
            } else {
                console.log("歌词不存在！ 页面返回："+body);
                rs.send({
                    code:404,
                    mes:"歌词未找到!(^_^)/*！"
                });
            }
            
        }
        
    })
    
    
    //如果有歌词就调用格式化数据函数
    function formatLrcData(lyric){
        lyric=lyric.toString()  //可视情况省略
        var arrLyric=[];
        var stateLyric=lyric.split("[");
        console.log("__________________________");
        //从i=1开始,因为stateLyric[0]='';
        for(var i=1;i<=stateLyric.length-1;i++){
            var oneRowLyric=stateLyric[i].split("]");
            var objLyric={time:oneRowLyric[0],lyric:oneRowLyric[1]};
            arrLyric.push(objLyric);   //if(oneRowLyric[1]=='')可以不加入数组
        }
        rs.send(arrLyric);
    }
})

//导出路由
module.exports=router;
