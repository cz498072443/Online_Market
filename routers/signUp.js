/**
 * Created by YUK on 16/11/24.
 */

var express = require("express");
var router = express.Router();

var middleware = require('./../middleware');

router.post('/',middleware.signUp,function(req,res){
    req.session.error = "注册成功，请登录!";
    res.send(200);
});

router.get('/',function(req,res){
    res.render('signUp.html');
});

module.exports = router;