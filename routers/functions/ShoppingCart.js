/**
 * Created by YUK on 16/12/6.
 */
var express = require("express");
var router = express.Router();

var User = require("./../../proxy").User;
var Goods = require("./../../proxy").Goods;
var eventproxy = require("eventproxy");

//页面控制中间件
var pageControl = function (req, res, next) {
    if(!req.session.hasLogin){
        res.render('login.html',{ error:"若要进行该操作,请先登录!"});
    }else{
        next();
    }
};

router.get("/", pageControl, function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('user_detail', function(userDetail){
        res.render('functions/ShoppingCart.html',{ user: userDetail });
    });

    User.getOneById(loc_user._id, function(err, docs){
        ep.emit('user_detail', docs);
    });

});

router.put('/add',pageControl,function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('user_detail', 'good_detail', function(userDetail, goodDetail){
        var ShoppingCart = {};
        var AllShoppingCart = userDetail.shoppingCart;

        ShoppingCart["_id"] = String(goodDetail._id);
        ShoppingCart["name"] = goodDetail.name;
        ShoppingCart["price"] = goodDetail.price;
        ShoppingCart["resNum"] = goodDetail.resNum;
        ShoppingCart["headSrc"] = goodDetail.headSrc;
        ShoppingCart["buyNum"] = 1;

        AllShoppingCart.push(ShoppingCart);

        User.updateShoppingCart(loc_user._id, AllShoppingCart, function(err,docs){
            if(err){
                res.send(400);
            }else{
                res.send(200);
            }
        })
    });

    Goods.getOneById(req.body.goodId, function(err,docs){
        if(err){
            res.send(400);
        }else {
            ep.emit('good_detail',docs);
        }
    });

    User.getOneById(loc_user._id, function(err, docs){
        if(err){
            res.send(400);
        }else {
            ep.emit('user_detail',docs)
        }
    });
});

router.delete('/delete',pageControl,function(req, res){
    Orders.removeById(req.body.id, function(err, doc){
        if(err){
            res.send(400);
        }else{
            res.send(200);
        }
    })
});

module.exports = router;

