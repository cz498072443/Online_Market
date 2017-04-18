/**
 * Created by YUK on 16/12/16.
 */

var express = require("express");
var router = express.Router();

var User = require("./../../proxy").User;
var News = require("./../../proxy").News;
var Orders = require("./../../proxy").Orders;
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
    ep.all('user_list','admin_detail','headerBarNews', function(userList, adminDetail, headerBarNews){
        res.render('functions/AuthorityContr.html',{ userList: userList, user: adminDetail, headerBarNews:headerBarNews });
    });

    User.findAll(function(err, docs){
        ep.emit('user_list',docs)
    });

    User.getOneById(loc_user._id, function(err, docs){
        ep.emit('admin_detail',docs)
    });

    News.findNewOne(loc_user.username, function(err,docs){
        ep.emit('headerBarNews',docs)
    });
});

router.get('/GetOne', pageControl, function(req, res, next){
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('user_detail', function(userDetail){
        var ep2 = new eventproxy();
        ep2.all('order_detail', 'new_detail', function(orderDetail, newDetail){
            res.send({res: { user:userDetail, orders: orderDetail, news: newDetail}});
        });

        Orders.findAllByCustomer(userDetail._id, function(err, docs){
            if(err){
                res.send(400);
            } else {
                ep2.emit('order_detail', docs);
            }
        });

        News.findAllByUserName(userDetail.username, function(err, docs){
            if(err){
                res.send(400);
            } else {
                ep2.emit('new_detail', docs);
            }
        })
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

        if(req.body.wallet != undefined){
            docs.wallet = req.body.wallet;
        }
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
        if(req.body.password != undefined && req.body.password == "change"){
            docs.password = "111";
        }

        ep.emit('user_detail',docs);
    });
});

router.delete('/DeleteOne', function(req, res, next){
    var userId = req.body.userId;
    var loc_user = req.session.user;
    var remove_user;
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('removeUser', 'removeNews', 'removeOrders', function(){
        res.send(200);

        News.createOne({
            "username": loc_user.username,
            "type": 1,
            "content": "超级管理员 "+loc_user.username+" 删除了 "+remove_user.username+" 的账号! ",
            "create_time": req.body.create_time
        },function (err, doc) {});
    });

    User.getOneById(userId, function(err, docs){
        if(err){
            res.send(400);
        }else{
            remove_user = docs;

            News.removeByOwner(docs.username, function(err, docs){
                if(err){
                    res.send(400);
                } else {
                    ep.emit('removeNews');
                }
            });

            Orders.removeByCustomer(userId, function(err, docs){
                if(err){
                    res.send(400);
                } else {
                    ep.emit('removeOrders');
                }
            });

            User.removeById(userId, function(err, docs){
                if(err){
                    res.send(400);
                } else {
                    ep.emit('removeUser');
                }
            });
        }


    });



});

module.exports = router;