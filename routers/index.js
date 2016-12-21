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
var Authority = require("./functions").Authority;
var Comment = require("./functions").Comment;
var GoodsPage = require("./goods").GoodsPage;
var Personal = require("./users").Personal;

var Goods = require("./../proxy").Goods;
var User = require("./../proxy").User;

router.get('/', middleware.checkAccess, function(req,res,next){
    var ep = new eventproxy();
    var keyword = req.query.keyword;
    ep.fail(next);

    ep.all('good_list',function(goodList){
        if(req.session.hasLogin){
            var loc_user = req.session.user;

            User.getOneById(loc_user._id, function(err,userDetail){
                res.render('index.html',{
                    user: userDetail,
                    goodList: goodList,
                    autocompleteTemplate: '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">{{~items}}<li><a href="{{$item.url}}"> <b> {{$item.title}}</b><div class="uk-float-right">{{{$item.text}}}</div></a></li>{{/items}}</ul>',
                    keyword: keyword
                });
            });
        }else{
            res.render('index.html',{
                user:"未登录",
                goodList:goodList,
                autocompleteTemplate:'<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">{{~items}}<li><a href="{{$item.url}}"> <b> {{$item.title}}</b><div class="uk-float-right">{{{$item.text}}}</div></a></li>{{/items}}</ul>',
                keyword: keyword
            });
        }
    });

    if(keyword && keyword != ""){
        Goods.findByKeyword(keyword, function(err, docs){
            ep.emit('good_list', docs);
        });
    } else {
        Goods.findAll(function(err,docs){
            ep.emit('good_list', docs);
        });
    }
});

//自动完成搜索
router.use('/search', function(req, res){
    Goods.autoCompleteSearch(req.body.search, function(err, docs){
        res.send(docs);
    })
});

//登陆控制
router.use('/login', login);
router.use('/signUp', signUp);
router.get('/lose', function(req,res){
    req.session.destroy(function(){
        res.redirect('/login');
    })
});
router.get('/logout', function(req,res){
    res.render('index.html', {user:"未登录"})
});

//功能
router.use('/GoodsContr', GoodsContr);
router.use('/Orders', OrdersContr);
router.use('/ShoppingCart', ShoppingCart);
router.use('/Comment', Comment);
router.use('/Authority', Authority);

//商品
router.use('/Goods', GoodsPage);

//用户
router.use('/Personal', Personal);


module.exports = router;