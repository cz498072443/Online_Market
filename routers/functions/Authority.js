/**
 * Created by YUK on 16/12/16.
 */

var express = require("express");
var router = express.Router();

var User = require("./../../proxy").User;
var News = require("./../../proxy").News;
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
    ep.all('user_list','admin_detail', function(userList, adminDetail){
        res.render('functions/AuthorityContr.html',{ userList: userList, user: adminDetail });
    });

    User.findAll(function(err, docs){
        ep.emit('user_list',docs)
    });

    User.getOneById(loc_user._id, function(err, docs){
        ep.emit('admin_detail',docs)
    });
});

router.get('/GetOne', pageControl, function(req, res, next){
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('user_detail', function(userDetail){
        res.send({res: userDetail});
    });

    User.getOneById(req.query.userId, function(err, docs){
        ep.emit('user_detail',docs)
    });
});

router.put('/ChangeOne', pageControl, function(req, res, next){
    var userId = req.body.userId;
    var loc_user = req.session.user;
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('user_detail', function(userDetail){
        User.update(userId, userDetail, function(err, docs){
            if(err){
                res.send(400);
            }else{
                res.send(200);
            }
        });

        News.createOne({
            "username": loc_user.username,
            "type": 1,
            "content": "超级管理员 "+loc_user.username+" 修改了 "+userDetail.username+" 的个人信息！" ,
            "create_time": req.body.create_time
        },function (err, doc) {});

        News.createOne({
            "username": userDetail.username,
            "type": 1,
            "content": userDetail.username+" 的个人信息被超级管理员 "+loc_user.username+" 修改了! ",
            "create_time": req.body.create_time
        },function (err, doc) {});
    });

    User.getOneById(userId, function(err, docs){
        //如果申请用户身份和提交的修改身份相同则清空申请内容
        if(req.body.role == docs.apply || req.body.role == "SuperAdmin"){
            docs.apply = ""
        }
        docs.role = req.body.role || docs.role;

        if(req.body.level != undefined){
            docs.level.discount = levels[parseInt(req.body.level)].discount;
            docs.level.num = parseInt(req.body.level);
        }
        if(req.body.nickname != undefined){
            docs.nickname = req.body.nickname;
        }
        if(req.body.sign != undefined){
            docs.sign = req.body.sign;
        }
        if(req.body.secPassword != undefined){
            docs.secPassword = req.body.secPassword;
        }

        ep.emit('user_detail',docs);
    });
});

module.exports = router;