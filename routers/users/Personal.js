/**
 * Created by YUK on 16/12/9.
 */

var express = require("express");
var router = express.Router();
var eventproxy = require("eventproxy");

var User = require("./../../proxy").User;
var News = require("./../../proxy").News;

//页面控制中间件
var pageControl = function (req, res, next) {
    if(!req.session.hasLogin){
        res.render('login.html',{ error:"若要进行该操作,请先登录!"});
    }else{
        next();
    }
};

router.get('/', pageControl, function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();
    ep.fail(next);

    ep.all('user_detail', 'news_list', function(userDetail, newsList){
        res.render('users/personal.html',{ user:userDetail, news:newsList });
    });

    User.getOneById(loc_user._id, function(err,docs){
        ep.emit('user_detail',docs)
    });

    News.findAllByUserName(loc_user.username, function (err, docs) {
        ep.emit('news_list',docs)
    })
});

router.put('/ChangeInfo', pageControl, function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();
    ep.fail(next);

    ep.all('user_detail', function(userDetail){
        userDetail.nickname = req.body.nickname;
        userDetail.sign = req.body.sign;
        userDetail.modify_time = req.body.modify_time;

        User.update(loc_user._id, userDetail, function(err, docs){
            if(err){
                res.send(400);
            }else {
                res.send(200);
            }
        })

        News.createOne({
            "username": loc_user.username,
            "type": 1,
            "content": loc_user.username+" 用户修改了个人信息！" ,
            "create_time": req.body.modify_time
        },function (err, doc) {});
    });

    User.getOneById(loc_user._id, function(err,docs){
        ep.emit('user_detail',docs)
    });
});

router.put('/Apply', pageControl, function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();
    ep.fail(next);

    ep.all('user_detail', function(userDetail){
        userDetail.apply = req.body.apply;

        User.update(loc_user._id, userDetail, function(err, docs){
            if(err){
                res.send(400);
            }else {
                res.send(200);
            }
        })
    });

    User.getOneById(loc_user._id, function(err,docs){
        ep.emit('user_detail',docs)
    });
});

router.put('/ChangePass', pageControl, function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();
    ep.fail(next);

    ep.all('user_finish', function(userDetail){
        userDetail.password = req.body.newPass;

        User.update(loc_user._id, userDetail, function(err, docs){
            if(err){
                res.send(400);
            }else {
                res.send({code:1000,res:"密码修改成功"});
            }
        });

        News.createOne({
            "username": loc_user.username,
            "type": 1,
            "content": loc_user.username+" 用户修改了密码！" ,
            "create_time": req.body.modify_time
        },function (err, doc) {});
    });

    User.getOneById(loc_user._id, function(err,docs){
        if(docs.password == req.body.oldPass){
            ep.emit('user_finish',docs);
        }else{
            res.send({code:-1000,res:"旧密码输入错误"})
        }
    });
});

router.put('/SetSecPass', pageControl, function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();
    ep.fail(next);

    ep.all('user_finish', function(userDetail){
        userDetail.secPassword = req.body.secPass;

        User.update(loc_user._id, userDetail, function(err, docs){
            if(err){
                res.send(400);
            }else {
                res.send({code:1000,res:"密码修改成功"});
            }
        });

        News.createOne({
            "username": loc_user.username,
            "type": 1,
            "content": loc_user.username+" 用户设置了二级密码！" ,
            "create_time": req.body.modify_time
        },function (err, doc) {});
    });

    User.getOneById(loc_user._id, function(err,docs){
        if(req.body.type == "SetSecPass"){
            if(docs.password == req.body.passWord){
                ep.emit('user_finish',docs);
            }else{
                res.send({code:-1000,res:"密码输入错误"})
            }
        }else {
            if(docs.password == req.body.passWord && docs.secPassword == req.body.oldSecPass){
                ep.emit('user_finish',docs);
            }else{
                res.send({code:-1000,res:"密码输入错误"})
            }
        }
    });
});

router.post('/CheckSecPass', pageControl, function(req, res, next){
    var loc_user = req.session.user;

    User.getOneById(loc_user._id, function(err,docs){
        if(docs.secPassword == req.body.secPass){
            res.send(200);
        }else{
            res.send(400);
        }
    });
});

module.exports = router;