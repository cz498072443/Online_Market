/**
 * Created by YUK on 16/12/5.
 */

var express = require("express");
var router = express.Router();

var User = require("./../../proxy").User;
var Orders = require("./../../proxy").Orders;
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
    ep.all('user_detail', 'orders_list', function(userDetail, ordersList){
        res.render('functions/OrdersContr.html',{ user: userDetail, ordersList: ordersList });
    });

    User.getOneById(loc_user._id, function(err, docs){
        ep.emit('user_detail', docs);
    });

    Orders.findAllByCustomer(loc_user._id, function(err, docs){
        ep.emit('orders_list', docs);
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




