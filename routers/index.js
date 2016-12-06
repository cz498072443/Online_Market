/**
 * Created by chen on 2016/11/22.
 */


var express = require("express");
var router = express.Router();
var moment = require("moment");
var eventproxy = require("eventproxy");

var middleware = require('./../middleware');

var login = require("./login");
var signUp = require("./signUp");

var GoodsContr = require("./functions").GoodsContr;
var OrdersContr = require("./functions").OrdersContr;
var ShoppingCart = require("./functions").ShoppingCart;
var GoodsPage = require("./goods").GoodsPage;

var Goods = require("./../proxy").Goods;
var User = require("./../proxy").User;

router.get('/',middleware.checkAccess,function(req,res,next){
    var ep = new eventproxy();
    ep.fail(next);

    ep.all('good_list',function(goodList){
        if(req.session.hasLogin){
            var loc_user = req.session.user;

            User.getOneById(loc_user._id, function(err,userDetail){
                res.render('index.html',{ user:userDetail, goodList:goodList });
            });
        }else{
            res.render('index.html',{ user:"未登录"});
        }
    });

    Goods.findAll(function(err,docs){
        ep.emit('good_list', docs);
    });
});

//登陆控制
router.use('/login',login);
router.use('/signUp',signUp);
router.get('/lose',function(req,res){
    req.session.destroy(function(){
        res.redirect('/login');
    })
});
router.get('/logout',function(req,res){
    res.render('index.html',{user:"未登录"})
});

//功能
router.use('/GoodsContr',GoodsContr);
router.use('/Orders',OrdersContr);
router.use('/ShoppingCart',ShoppingCart);

//商品
router.use('/Goods',GoodsPage);


module.exports = router;