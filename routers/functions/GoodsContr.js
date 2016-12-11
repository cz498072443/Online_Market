/**
 * Created by YUK on 16/11/29.
 */
var express = require("express");
var router = express.Router();
var Goods = require("./../../proxy").Goods;
var User = require("./../../proxy").User;
var News = require("./../../proxy").News;

var eventproxy = require("eventproxy");

//页面控制中间件
var pageControl = function (req, res, next) {
    if(!req.session.hasLogin){
        res.render('login.html',{ error:"若要进行该操作,请先登录!"});
    }else if(req.session.user.role == "User"){
        res.redirect("/");
    }else{
        next();
    }
};

router.get('/',pageControl,function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('good_list','user_detail', function(goodList, userDetail){
        res.render('functions/GoodsContr.html',{ user:userDetail,goodList:goodList });
    });

    Goods.findAll(function(err,docs){
        ep.emit('good_list',docs);
    });

    User.getOneById(loc_user._id, function(err, docs){
        ep.emit('user_detail',docs)
    });

});

router.get('/add',pageControl,function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('user_detail',function(userDetail){
        res.render('functions/GoodsContrAdd.html',{ user:userDetail });
    });

    User.getOneById(loc_user._id, function(err, docs){
        ep.emit('user_detail',docs)
    });
});

router.post('/add',pageControl,function(req, res){
    var loc_user = req.session.user;

    Goods.createOne(req.body,function (err, doc) {
        if(err){
            res.send(400);
        }else {
            News.createOne({
                "username": loc_user.username,
                "type": 3,
                "content": loc_user.username+" 添加了商品:" + req.body.name ,
                "create_time": req.body.create_time
            },function (err, doc) {});

            res.send(200);
        }
    })
});

router.get('/edit/:id',pageControl,function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();
    ep.fail(next);

    ep.all('good_detail','user_detail', function(goodDetail, userDetail){
        res.render('functions/GoodsContrEdit.html',{ user:userDetail,goodDetail:goodDetail });
    });

    Goods.getOneById(req.params.id, function(err,docs){
        ep.emit('good_detail',docs);
    });

    User.getOneById(loc_user._id, function(err, docs){
        ep.emit('user_detail',docs)
    });
});

router.put('/edit/:id',pageControl,function(req, res, next){
    var loc_user = req.session.user;

    Goods.update(req.params.id, req.body, function(err, doc){
        if(err){
            res.send(400);
        }else{
            News.createOne({
                "username": loc_user.username,
                "type": 3,
                "content": loc_user.username+" 修改了商品:" + req.body.name ,
                "create_time": req.body.modify_time
            },function (err, doc) {});

            res.send(200);
        }
    })
});

router.delete('/delete',pageControl,function(req, res){
    var loc_user = req.session.user;

    Goods.removeById(req.body.id, function(err, doc){
        if(err){
            res.send(400);
        }else{
            News.createOne({
                "username": loc_user.username,
                "type": 3,
                "content": loc_user.username+" 删除了商品:id = " + req.body.id ,
                "create_time": new Date()
            },function (err, doc) {});

            res.send(200);
        }
    })
});

module.exports = router;