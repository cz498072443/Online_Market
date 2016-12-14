/**
 * Created by YUK on 16/12/13.
 */

var express = require("express");
var router = express.Router();
var eventproxy = require("eventproxy");

var User = require("./../../proxy").User;
var News = require("./../../proxy").News;
var Goods = require("./../../proxy").Goods;
var Orders = require("./../../proxy").Orders;
var Comments = require("./../../proxy").Comments;

//页面控制中间件
var pageControl = function (req, res, next) {
    if(!req.session.hasLogin){
        res.render('login.html',{ error:"若要进行该操作,请先登录!"});
    }else{
        next();
    }
};

router.post('/add', function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('good_detail','get_orderChange', 'user_detail', function(goodDetail, orderChange, userDetail){
        var ep2 = new eventproxy();
        ep2.all('commentAdd', 'orderChange', function(){
            res.send(200);
        });

        if(loc_user.nickname == ""){
            var this_nickname = userDetail.username
        }else{
            var this_nickname = userDetail.nickname
        }

        Comments.createOne({
            userId: String(loc_user._id),
            goodId: String(goodDetail._id),
            orderId: req.body.orderId,
            goodName: goodDetail.name,
            customerNickName: this_nickname,
            headSrc: goodDetail.headSrc,
            price: goodDetail.price,
            grade: parseInt(req.body.grade),
            content: req.body.content,
            create_time: req.body.create_time
        },function(err, doc){
            if(err){
                res.send(400);
            }else{
                ep2.emit("commentAdd");
            }
        });

        Orders.update(req.body.orderId, orderChange, function(err, doc){
            if(err){
                res.send(400);
            }else{
                ep2.emit("orderChange");
            }
        });

        News.createOne({
            "username": loc_user.username,
            "type": 5,
            "content": loc_user.username+" 对商品:" + goodDetail.name +" 进行了评价" ,
            "create_time": req.body.create_time
        },function (err, doc) {

        });
    });

    Goods.getOneById(req.body.goodId, function(err, doc){
        if(err){
            res.send(400);
        }
        ep.emit("good_detail", doc);
    });

    Orders.getOneById(req.body.orderId, function(err, doc){
        if(err){
            res.send(400);
        }else if(String(loc_user._id) == doc.customer){
            var this_goodsList = doc.goodsList;
            for(var i = 0;i < this_goodsList.length;i ++){
                if(this_goodsList[i].id == req.body.goodId){
                    this_goodsList[i].comment["grade"] = parseInt(req.body.grade);
                    this_goodsList[i].comment["content"] = req.body.content;
                }
            }
            doc.goodsList = this_goodsList;
            ep.emit("get_orderChange", doc);
        }
    });

    User.getOneById(loc_user._id, function(err, docs){
        ep.emit('user_detail',docs)
    });
});

router.put('/update', function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('comment_detail','get_orderChange', function(commentDetail, orderChange){
        var ep2 = new eventproxy();
        ep2.all('commentUpdate', 'orderChange', function(){
            res.send(200);
        });

        Comments.update(commentDetail._id, commentDetail,function(err, doc){
            if(err){
                res.send(400);
            }else{
                ep2.emit("commentUpdate");
            }
        });

        Orders.update(req.body.orderId, orderChange, function(err, doc){
            if(err){
                res.send(400);
            }else{
                ep2.emit("orderChange");
            }
        });

        News.createOne({
            "username": loc_user.username,
            "type": 5,
            "content": loc_user.username+" 对商品:" + commentDetail.goodName +" 修改了评价" ,
            "create_time": req.body.modify_time
        },function (err, doc) {});
    });

    Comments.findOneByGoodAndOrder(req.body.goodId, req.body.orderId, function (err, doc){
        if(err || doc == null){
            res.send(400);
        } else {
            doc["grade"] = parseInt(req.body.grade);
            doc["content"] = req.body.content;
            doc["modify_time"] = req.body.modify_time;

            ep.emit("comment_detail", doc);
        }
    });

    Orders.getOneById(req.body.orderId, function(err, doc){
        if(err){
            res.send(400);
        }else if(String(loc_user._id) == doc.customer){
            var this_goodsList = doc.goodsList;
            for(var i = 0;i < this_goodsList.length;i ++){
                if(this_goodsList[i].id == req.body.goodId){
                    this_goodsList[i].comment["grade"] = parseInt(req.body.grade);
                    this_goodsList[i].comment["content"] = req.body.content;
                }
            }
            doc.goodsList = this_goodsList;
            ep.emit("get_orderChange", doc);
        }
    })
});

module.exports = router;