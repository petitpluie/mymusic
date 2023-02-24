//读取json数据，返回json对象
const fs=require('fs');

function readJson(path){
    var data=fs.readFileSync(path);
    data=data.toString();
    return JSON.parse(data);
}

module.exports=readJson;