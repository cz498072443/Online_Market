/**
 * Created by YUK on 16/12/6.
 */
var express = require("express");
var router = express.Router();

var User = require("./../../proxy").User;
var Goods = require("./../../proxy").Goods;
var Orders = require("./../../proxy").Orders;
var News = require("./../../proxy").News;
var Logistics = require("./../../proxy").Logistics;
var levels = require("./../../public/json/levels");

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

router.get("/", pageControl, function(req, res, next){
    var loc_user = req.session.user;

    User.getOneById(loc_user._id, function(err, docs){
        res.send({res:docs});
    });

});

router.post("/", pageControl, function(req, res, next){
    var loc_user = req.session.user;
    var ShoppingCartObj = JSON.parse(req.body.ShoppingCartObj);    //要转回来!!!!!!!!!!!!!!!
    var ShoppingCartIndex = 0;  //控制异步回调
    var totalPrice = 0;  //总价格

    var ep = new eventproxy();
    var orderObj = { customer:"",goodsList:[],totalPrice:0,create_time:req.body.create_time };

    ep.fail(next);

    //支付准备阶段(获取用户信息和计算购物车总价)
    ep.all('user_detail', 'price_finish', function(userDetail){
        var ep2 = new eventproxy();

        //支付许可阶段(判断用户余额是否足够,若足够则对商品数量进行变动)
        ep2.all('good_finish',function(userDetail){
            var ep3 = new eventproxy();

            //支付完成阶段(更新支付过后的用户信息,并生成订单和物流信息)
            ep3.all('user_finish','order_Logistics_finish',function(){
                News.createOne({
                    "username": loc_user.username,
                    "type": 2,
                    "content": loc_user.username+" 清空了购物车,总计"+totalPrice+"元" ,
                    "create_time": req.body.create_time
                },function (err, doc) {});

                res.send(200);
            });

            //支付成功后清空购物车
            userDetail.shoppingCart = [];

            //检查一下是否可以升级
            var thisLevel = checkLevels(userDetail.cost);
            if (thisLevel > userDetail.level.num) {
                userDetail.level.num      = thisLevel;
                userDetail.level.discount = levels[thisLevel].discount;

                News.createOne({
                    "username": userDetail.username,
                    "type": 1,
                    "content": userDetail.username + " 用户等级提升至 LV" + userDetail.level.num,
                    "create_time": req.body.create_time
                }, function (err, doc) {
                });
            }

            //更新用户信息
            User.update(userDetail._id, userDetail, function (err, doc) {
                if (err) {
                    res.send(400);
                } else {
                    ep3.emit("user_finish");
                }
            });

            //生成订单
            orderObj["customer"]   = userDetail._id;
            orderObj["totalPrice"] = totalPrice;

            Orders.createOne(orderObj, function (err, doc) {
                if (err) {
                    res.send(400);
                } else {
                    ////生成物流信息
                    Logistics.createOne({
                        orderId: doc._id,
                        userId:  userDetail._id,
                        state: false,
                    },function(err, doc){
                        if(err){
                            res.send(400);
                        } else {
                            ep3.emit("order_Logistics_finish");
                        }
                    });
                }
            });
        });

        //价格算上折扣
        totalPrice = Math.ceil(totalPrice * userDetail.level.discount);

        //更新个人信息(钱包)
        userDetail.wallet -= totalPrice;
        userDetail.cost += totalPrice;

        //如果钱不够就别闹了
        if(userDetail.wallet < 0){
            res.send(400);
        }else {
            //够钱买啦,然后处理一下商品余量问题顺便构建一下订单
            for(var x in ShoppingCartObj){
                Goods.getOneById(x, test(x));
                //呵呵作用域链,如果不这样的话,下面那个x在使用时,for循环早就结束了...
                function test(x){
                    return (function(err,docs){
                        var getOne = docs;
                        getOne.resNum -= ShoppingCartObj[x].buyNum;
                        getOne.sales += ShoppingCartObj[x].buyNum;

                        if(getOne.resNum < 0){
                            res.send(400)
                        }else{
                            //构建订单的商品一栏(简直乱得一逼,其实是懒得再写了)
                            var goodObj = {};
                            goodObj["id"] = String(getOne._id);
                            goodObj["name"] = getOne.name;
                            goodObj["type"] = getOne.type;
                            goodObj["headSrc"] = getOne.headSrc;
                            goodObj["price"] = getOne.price;
                            goodObj["buyNum"] = ShoppingCartObj[x].buyNum;
                            goodObj["comment"] = { grade:-1, content:"" };
                            orderObj["goodsList"].push(goodObj);

                            Goods.update(getOne._id, getOne, function(err, doc){
                                if(err){
                                    res.send(400);
                                }else{
                                    ShoppingCartIndex ++;
                                    if(ShoppingCartIndex == Object.getOwnPropertyNames(ShoppingCartObj).length){
                                        ep2.emit('good_finish', userDetail);
                                    }
                                }
                            });
                        }
                    });
                }
            }
        }
    });

    //处理一下个人信息问题
    User.getOneById(loc_user._id, function(err,docs){
        ep.emit('user_detail',docs);
    });

    //算总价看看够不够钱买
    for(var x in ShoppingCartObj){
        Goods.getOneById(x, test(x));
        //呵呵作用域链,如果不这样的话,下面那个x在使用时,for循环早就结束了...
        function test(x){
            return (function(err,docs){
                totalPrice += ShoppingCartObj[x].buyNum * docs.price;
                ShoppingCartIndex ++;
                if(ShoppingCartIndex == Object.getOwnPropertyNames(ShoppingCartObj).length){
                    ShoppingCartIndex = 0;
                    ep.emit('price_finish');
                }
            });
        }
    }

});

router.put('/add',pageControl,function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('user_detail', 'good_detail', function(userDetail, goodDetail){
        var isRepeat = false;
        var ShoppingCart = {};
        var AllShoppingCart = userDetail.shoppingCart;

        //若添加商品重复则直接buyNum+1即可
        for(var i = 0;i < AllShoppingCart.length;i ++){
            if(AllShoppingCart[i]._id == String(goodDetail._id)){
                AllShoppingCart[i].buyNum += req.body.buyNum || 1;
                isRepeat = true;
                break;
            }
        }
        //如果不重复则新建
        if(!isRepeat){
            ShoppingCart["_id"] = String(goodDetail._id);
            ShoppingCart["name"] = goodDetail.name;
            ShoppingCart["price"] = goodDetail.price;
            ShoppingCart["resNum"] = goodDetail.resNum;
            ShoppingCart["headSrc"] = goodDetail.headSrc;
            ShoppingCart["type"] = goodDetail.type;
            ShoppingCart["buyNum"] = req.body.buyNum || 1;
            AllShoppingCart.push(ShoppingCart);
        }

        User.updateShoppingCart(loc_user._id, AllShoppingCart, function(err,docs){
            if(err){
                res.send(400);
            }else{
                res.send(200);
            }
        });
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

router.delete('/delete',pageControl,function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('user_detail', function(userDetail){
        var AllShoppingCart = userDetail.shoppingCart;

        for(var i = 0;i < AllShoppingCart.length;i ++){
            if(AllShoppingCart[i]._id == req.body.id){
                AllShoppingCart.splice(i,1);
                break;
            }
        }

        User.updateShoppingCart(loc_user._id, AllShoppingCart, function(err,docs){
            if(err){
                res.send(400);
            }else{
                res.send(200);
            }
        })
    });

    User.getOneById(loc_user._id, function(err, docs){
        if(err){
            res.send(400);
        }else {
            ep.emit('user_detail',docs)
        }
    });
});

//更新购物车
router.put('/update', function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();
    var ShoppingCartObj = JSON.parse(req.body.ShoppingCartObj);    //要转回来!!!!!!!!!!!!!!!
    var Index = 0;  //控制异步回调的哨兵
    var thisShoppingCartObj = [];

    ep.fail(next);
    ep.all('shoppingCartFinish', function(){
        User.updateShoppingCart(loc_user._id, thisShoppingCartObj, function(err,docs){
            if(err){
                res.send(400);
            }else{
                res.send(200);
            }
        });
    });

    //根据新的订单获取新的商品数据(尤其是商品余量)
    if(!ShoppingCartObj){
        ep.emit('shoppingCartFinish');
    }else{
        for(var x in ShoppingCartObj){
            Goods.getOneById(x,test(x));
            //作用域链你大爷
            function test(x){
                return (function(err,docs){
                    var goodObj = {};
                    goodObj["_id"] = x;
                    goodObj["name"] = docs.name;
                    goodObj["price"] = docs.price;
                    goodObj["resNum"] = docs.resNum;
                    goodObj["headSrc"] = docs.headSrc;
                    goodObj["type"] = docs.type;
                    goodObj["buyNum"] = ShoppingCartObj[x].buyNum;

                    thisShoppingCartObj.push(goodObj);
                    Index++;
                    if(Index == Object.getOwnPropertyNames(ShoppingCartObj).length){
                        ep.emit('shoppingCartFinish');
                    }
                })
            }

        }
    }
});

router.get('/paySucceed', function(req, res){
    var loc_user = req.session.user;
    res.render("goods/BuySucceed.html",{ userId:loc_user._id,goodId:"" })
});

module.exports = router;

