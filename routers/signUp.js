/**
 * Created by YUK on 16/11/24.
 */

var express = require("express");
var router = express.Router();
var News = require("./../proxy").News;

var middleware = require('./../middleware');

router.post('/',middleware.signUp,function(req,res){
    News.createOne({
        "username": req.body.username,
        "type": 1,
        "content": req.body.username+" 用户注册了账号！" ,
        "create_time": req.body.create_time
    },function (err, doc) {
        req.session.error = "注册成功，请登录!";
        res.send(200);
    });
});

router.get('/',function(req,res){
    res.render('signUp.html');
});

module.exports = router;