const express=require('express');
const bodyParser=require('body-parser');
const path=require('path');
const moment=require('moment');
const art=require('express-art-template');

//加载我的模块
let readJson=require("./my_modules/readJson");
let upDate=require("./my_modules/upDate");

//加载曲库数据
var musicData=readJson('./data/musicData.json');

const app=express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use('/',function(req,res,next){
    console.log(`${moment().format('YYYY-MM-DD dddd HH:mm:ss')} --> [${req.method}] ${req.originalUrl}`);
    /*
    console.log({
        '主机名':req.hostname,
        '请求url路径':req.path,
        '查询字符串对象':req.query,
        '请求的远程IP地址':req.ip,
        '请求方法':req.method
    });
    */
    next();
});

//处理nodeBUG
app.get('/favicon.ico',function(req,res){});

//使用art-template模板引擎
app.set('view engine', 'art');                    //使用模板引擎art-template
app.set('views', path.join(__dirname, 'views'));  //模板存放位置
app.engine('html',art);                           //注册指定扩展名的模板引擎



//普通用户
let user=require('./routes/user');
app.use('/user',user);


//管理员
let admin=require('./routes/admin.js');
app.use('/admin',admin);

//待增加管理员更新曲库的路由
//upDate();

//静态文件服务中间件
app.use(express.static(path.join(__dirname,'public')));


//错误处理中间件，参数是4个
app.use(function(err,req,res,next){
    console.log(err);
    console.log(req.url);
    res.end(err);
})


//监听端口
app.listen(2020,function(){
    console.info(`server is running on localhost:2020`);
})
