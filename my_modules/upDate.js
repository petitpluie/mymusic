//服务器启动时，或管理员更新数据时执行
const request=require('request');
const fs=require('fs');

//各步骤方法及中间数据放入source对象
var source={
    //配置request请求
    reqOptions : {
        method:'GET',
        url:'https://api.imjad.cn/cloudmusic',
        qs: { 
            type: 'artist', 
            id: '' 
        },
        headers:{
            'Cache-Control': 'no-cache'
        }
    },
    
    arrSinger:null,
    loaddata:function(){
        return new Promise(function(reslove,reject){
            //sourceData中存放 歌手 和 视频
            var sourceData=JSON.parse(fs.readFileSync('./data/sourceData.json'));
            source.arrSinger=sourceData.singer;
            console.log('loaddata完成');
            reslove();
        })
    },
    
    arrSingerData:[],
    request:function(){
        return new Promise(function(reslove,reject){
            //定义发起单页面请求的函数
            function reqOnePage(Singer){
                return new Promise(function(reslove,reject){
                    source.reqOptions.qs.id=Singer.id;
                    request(source.reqOptions,function(err,res,body){
                        if(err){
                            console.error(err);
                        } else {
                            body=JSON.parse(body);
                            if(body.artist){
                                source.arrSingerData.push(body);
                                console.log("->成功获取歌手"+Singer.name+"的数据。");
                                reslove();
                            } else {
                                console.log("->歌手"+Singer.name+"的数据不存在！页面返回："+res.body);
                                reslove();
                            }
                        }
                    })
                })
            }
            
            //按顺序请求歌手信息
            async function start(){
                for(var i=0;i<source.arrSinger.length;i++){
                    await reqOnePage(source.arrSinger[i]);
                }
                console.log('request完成');
                reslove();
            }
            start();
        })
    },
    
    arrAllSingerData:[],
    dealdata:function(){
        return new Promise(function(reslove,reject){   
            
            
            //遍历所有歌手
            source.arrSingerData.forEach(function(value,i){
                
                var arrMusicData=[];
                //遍历某个歌手的热门歌曲
                value.hotSongs.forEach(function(value,i){
                    //获取某首歌曲相关信息
                    var usefulData={
                        "name":value.name,
                        "id":value.id,
						"url":`http://music.163.com/song/media/outer/url?id=${value.id}.mp3`,
                        "number":i+1,
                        "musician":value.ar[0].name,
                        "alImg":value.al.picUrl,
                        "dt":value.dt
                    }
                    arrMusicData.push(usefulData);
                })
                //获取某歌手相关信息
                var objSingerData={
                    "name":value.artist.name,
                    "id":value.artist.id,
                    "songs":arrMusicData
                };
                source.arrAllSingerData.push(objSingerData);
                
            });
            
            console.log('dealdata完成')
            reslove();
        })
    },
    
    storagedata:function(){
        return new Promise(function(reslove,reject){
            fs.writeFile('./data/musicData.json',JSON.stringify(source.arrAllSingerData),function(){
                console.log('storagedata完成')
                reslove();
            })
        })
    },
    
}

module.exports=async function(){
    await source.loaddata();
    await source.request();
    await source.dealdata();
    await source.storagedata();
}