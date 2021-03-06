/**
 * Created by YUK on 16/12/1.
 */

var express = require("express");
var router = express.Router();
var Goods = require("./../../proxy").Goods;
var User = require("./../../proxy").User;
var Orders = require("./../../proxy").Orders;
var News = require("./../../proxy").News;
var Comments = require("./../../proxy").Comments;
var levels = require("./../../public/json/levels");
var Logistics = require("./../../proxy").Logistics;

var eventproxy = require("eventproxy");

var checkLevels = function(cost){
    var i = 0;
    while (i < levels.length && cost > levels[i].left){
        i++
    }
    return i - 1;
};

//页面控制中间件
var pageControl = function (req, res, next) {
    if(!req.session.hasLogin){
        res.render('login.html',{ error:"若要进行该操作,请先登录!"});
    }else{
        next();
    }
};

router.get("/:id",pageControl,function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();
    ep.fail(next);

    ep.all('good_detail', 'user_detail', 'comment_detail','headerBarNews', function(goodDetail, userDetail, commentDetail,headerBarNews){
        res.render('goods/GoodDetail.html',{ user: userDetail, goodDetail: goodDetail, commentDetail: commentDetail, levels: levels, headerBarNews:headerBarNews});
    });

    Goods.getOneById(req.params.id, function(err,docs){
        ep.emit('good_detail', docs);
    });

    User.getOneById(loc_user._id, function(err,docs){
        ep.emit('user_detail', docs)
    });

    Comments.findAllByGoodId(req.params.id, function(err,docs){
        ep.emit('comment_detail', docs)
    });

    News.findNewOne(loc_user.username, function(err,docs){
        ep.emit('headerBarNews',docs)
    });
});

router.post("/",pageControl,function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();
    ep.fail(next);

    ep.all('good_detail', 'user_detail',function(goodDetail, userDetail){
        //消费后的各种数值变动
        var totalPrice = Math.ceil(goodDetail.price * req.body.buyNum * userDetail.level.discount);
        userDetail.wallet = userDetail.wallet - totalPrice;
        userDetail.cost += totalPrice;
        goodDetail.resNum = goodDetail.resNum - req.body.buyNum;
        goodDetail.sales += parseInt(req.body.buyNum);

        //检查一下是否可以升级
        var thisLevel = checkLevels(userDetail.cost);
        if(thisLevel > userDetail.level.num){
            userDetail.level.num = thisLevel;
            userDetail.level.discount = levels[thisLevel].discount;
            User.update(userDetail._id, userDetail, function(err, doc){});

            News.createOne({
                "username": userDetail.username,
                "type": 1,
                "content": userDetail.username+" 用户等级提升至 LV"+ userDetail.level.num,
                "create_time": req.body.create_time
            },function (err, doc) {});
        };

        //余额不足||商品余量不足
        if (userDetail.wallet < 0 || goodDetail.resNum < 0){
            res.send(400);
        }else {
            //更新个人信息(钱包信息)
            User.update(userDetail._id, userDetail, function(err, doc){
                if(err){
                    res.send(400);
                }else{
                    res.send(200);
                }
            });
            //更新商品信息(余量信息)
            Goods.update(goodDetail._id, goodDetail, function(err, doc){
                if(err){
                    res.send(400);
                }else{
                    res.send(200);
                }
            });
            //生成订单
            var orderObj = { customer:"",goodsList:[],totalPrice:0,create_time:req.body.create_time };
            orderObj["customer"] = userDetail._id;
            var goodObj = {};
            goodObj["id"] = String(goodDetail._id);
            goodObj["name"] = goodDetail.name;
            goodObj["type"] = goodDetail.type;
            goodObj["headSrc"] = goodDetail.headSrc;
            goodObj["price"] = goodDetail.price;
            goodObj["buyNum"] = parseInt(req.body.buyNum);
            goodObj["comment"] = { grade:-1, content:"" };

            orderObj["goodsList"].push(goodObj);
            orderObj["totalPrice"] = totalPrice;

            Orders.createOne( orderObj, function(err, doc){
                if(err){
                    res.send(400);
                }else{
                    ////生成物流信息
                    Logistics.createOne({
                        orderId: doc._id,
                        userId: userDetail._id,
                        state: false,
                        create_time: req.body.create_time
                    },function(err, doc){
                        if(err){
                            res.send(400);
                        } else {
                            res.send(200);
                        }
                    });
                }
            });

            News.createOne({
                "username": loc_user.username,
                "type": 2,
                "content": loc_user.username+" 购买了"+req.body.buyNum+"个"+goodDetail.name+",总计"+totalPrice+"元" ,
                "create_time": req.body.create_time
            },function (err, doc) {
            });
        }
    });

    Goods.getOneById(req.body.goodId, function(err,docs){
        ep.emit('good_detail',docs)
    });

    User.getOneById(loc_user._id, function(err,docs){
        ep.emit('user_detail',docs)
    });
});

router.get('/paySucceed/:id',pageControl,function(req, res, next){
    var loc_user = req.session.user;
    res.render("goods/BuySucceed.html",{ userId:loc_user._id,goodId:req.params.id })
});

module.exports = router;