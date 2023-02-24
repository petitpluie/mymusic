const express=require('express');
const router=express.Router();

router.get('/',function(req,res){
    res.send('管理员页面');
})

router.get('/ii',function(req,res){
    res.send('管理员二级页面');
})

router.get('/iii',function(req,res){
    res.send('管理员三级页面');
})



module.exports=router;