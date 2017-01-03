/**
 * Created by YUK on 16/12/28.
 */

var express = require("express");
var router = express.Router();
var middleware = require('./../../middleware');

var User = require("./../../proxy/index").User;
var News = require("./../../proxy/index").News;
var Banners = require("./../../proxy/index").Banners;

var levels = require("./../../public/json/levels");

var eventproxy = require("eventproxy");

//页面控制中间件
var pageControl = function (req, res, next) {
    User.getOneById(req.session.user._id, function(err, docs){
        var userRole = docs.role;

        if(!req.session.hasLogin){
            res.render('login.html',{ error:"若要进行该操作,请先登录!"});
        }else if(userRole != "SuperAdmin"){
            res.redirect("/");
        }else{
            next();
        }
    });
};

router.get('/', pageControl, function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('admin_detail', function(adminDetail){
        res.render('homePage/HomeConfig.html',{ user: adminDetail });
    });

    User.getOneById(loc_user._id, function(err, docs){
        ep.emit('admin_detail',docs)
    });


});

//文件上传
router.post('/upload', middleware.Multer, function(req, res) {
    try {
        console.log(req.files);

        res.send({data:"wocao"})
        res.json(200);
    } catch (e) {
        console.log(e);
    }
});

//文件上传成功
router.post('/uploadSecceed', function(req, res, next){
    var loc_user = req.session.user;
    var title = req.body.title;

    var ep = new eventproxy();

    ep.fail(next);
    ep.all('create_banner', function(){
        res.send(200);

        News.createOne({
            "username": loc_user.username,
            "type": 6,
            "content": "超级管理员 "+loc_user.username+" 添加了主页banner: "+ title +"！" ,
            "create_time": req.body.create_time
        },function (err, doc) {});
    });

    Banners.createOne({
        "title": title,
        "description": req.body.description,
        "image": req.body.image ,
        "url": "/upload/index/slider_banner/" + req.body.image,
        "create_time": req.body.create_time
    },function (err, doc) {
        if(err){
            res.send(400);
        } else {
            ep.emit('create_banner');
        }
    });
});

module.exports = router;