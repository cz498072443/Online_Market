/**
 * Created by YUK on 16/12/13.
 */

var express = require("express");
var router = express.Router();
var eventproxy = require("eventproxy");

var User = require("./../../proxy").User;
var Goods = require("./../../proxy").Goods;
var Orders = require("./../../proxy").Orders;
var Comment = require("./../../proxy").Comments;

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
    ep.all('good_detail','user_detail', function(goodDetail, userDetail){
        res.render('functions/GoodsContr.html',{ user:userDetail,goodList:goodList });
    });

    Goods.getOneById(req.body.goodId, function(err, doc){
        if(err){
            res.send(400);
        }
        ep.emit("good_detail", doc)
    });

    Orders.getOneById(req.body.orderId, function(err, doc){
        if(err){
            res.send(400);
        }else if(String(loc_user) == doc.customer){

        }
    })
});

module.exports = router;