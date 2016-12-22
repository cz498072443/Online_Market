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
    var keyword = req.query.keyword || "";
    var findNum = 4;
    var skipIndex = req.query.skipIndex || 0;

    var ep = new eventproxy();
    ep.fail(next);

    ep.all('good_list', 'page_num', function(goodList, pageNum){
        if(req.session.hasLogin){
            var loc_user = req.session.user;

            User.getOneById(loc_user._id, function(err,userDetail){
                res.render('index.html',{
                    user: userDetail,
                    goodList: goodList,
                    autocompleteTemplate: '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">{{~items}}<li><a href="{{$item.url}}"> <b> {{$item.title}}</b><div class="uk-float-right">{{{$item.text}}}</div></a></li>{{/items}}</ul>',
                    keyword: keyword,
                    pageNum: pageNum,
                    skipIndex: skipIndex
                });
            });
        }else{
            res.render('index.html',{
                user:"未登录",
                goodList:goodList,
                autocompleteTemplate:'<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">{{~items}}<li><a href="{{$item.url}}"> <b> {{$item.title}}</b><div class="uk-float-right">{{{$item.text}}}</div></a></li>{{/items}}</ul>',
                keyword: keyword,
                pageNum: pageNum,
                skipIndex: skipIndex
            });
        }
    });

    if(keyword && keyword != ""){
        Goods.findByKeyword(keyword, findNum, skipIndex, function(err, docs){
            ep.emit('good_list', docs);
        });

        Goods.getPageNum(keyword, findNum, function(err, docs){
            console.log(docs);
            ep.emit('page_num', docs);
        })
    } else {
        Goods.findAll(findNum, skipIndex, function(err,docs){
            ep.emit('good_list', docs);
        });

        Goods.getPageNum(keyword, findNum, function(err, docs){
            console.log(docs);
            ep.emit('page_num', docs);
        })
    }
});

//自动完成搜索
router.use('/search', function(req, res){
    Goods.autoCompleteSearch(req.body.search, function(err, docs){
        res.send(docs);
    })
});

//主页中的页面控制
router.use('/MoreGoodsPage', function(req, res, next){
    var keyword = req.query.keyword;
    var skipIndex = req.query.pageIndex;
    var findNum = 4;

    var ep = new eventproxy();
    ep.fail(next);

    ep.all('good_list', function(goodList){
        res.send({res: goodList});
    });

    if(keyword && keyword != ""){
        Goods.findByKeyword(keyword, findNum, skipIndex, function(err, docs){
            ep.emit('good_list', docs);
        });

    } else {
        Goods.findAll(findNum, skipIndex, function(err,docs){
            ep.emit('good_list', docs);
        });
    }
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