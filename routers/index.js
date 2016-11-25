/**
 * Created by chen on 2016/11/22.
 */


var express = require("express");
var router = express.Router();
var moment = require("moment");

var middleware = require('./../middleware');

var login = require("./login");
var signUp = require("./signUp");

router.get('/',middleware.checkAccess,function(req,res){
    if(req.session.hasLogin){
        var loc_user = req.session.user;
        res.render('index.html',{ user:loc_user.username});
    }else{
        res.render('index.html',{ user:"未登录"});
    }
});

//登陆控制
router.use('/login',login);
router.use('/signUp',signUp);
router.get('/lose',function(req,res){
    req.session.destroy(function(){
        res.redirect('/login');
    })
});
router.get('/logout',function(req,res){
    res.render('index.html',{user:"未登录"})
});

module.exports = router;