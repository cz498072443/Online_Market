/**
 * Created by YUK on 16/12/5.
 */

var express = require("express");
var router = express.Router();

var User = require("./../../proxy").User;
var Orders = require("./../../proxy").Orders;
var News = require("./../../proxy").News;
var Logistics = require("./../../proxy").Logistics;
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
    ep.all('user_detail', 'orders_list', 'headerBarNews', function(userDetail, ordersList, headerBarNews){
        var ordersArray = [];
        var ep2 = new eventproxy();
        ep2.after('find_logistics', ordersList.length, function(){
            console.log(ordersArray)
            res.render('functions/OrdersContr.html',{ user: userDetail, ordersList: ordersArray, headerBarNews:headerBarNews });
        });

        for(var i = 0;i < ordersList.length;i ++){
            var Obj = {_id:""+ordersList[i]._id,customer:ordersList[i].customer,totalPrice:ordersList[i].totalPrice,create_time:ordersList[i].create_time,goodsList:ordersList[i].goodsList,logistics:{}}
            ordersArray.push(Obj);

            Logistics.getOneByOrder(ordersList[i]._id,test(i));
            //万恶的作用域链
            function test(i){
                return (function(err, doc){
                    if(err){
                        res.res(400);
                    } else {
                        ordersArray[i].logistics = doc;
                        ep2.emit('find_logistics')
                    }
                })
            }
        }

    });

    User.getOneById(loc_user._id, function(err, docs){
        ep.emit('user_detail', docs);
    });

    Orders.findSomeByCustomer(loc_user._id, 0, function(err, docs){
        ep.emit('orders_list', docs);
    });

    News.findNewOne(loc_user.username, function(err,docs){
        ep.emit('headerBarNews',docs)
    });
});

router.delete('/delete',pageControl,function(req, res){
    var loc_user = req.session.user;

    Orders.removeById(req.body.id, function(err, doc){
        if(err){
            res.send(400);
        }else{
            News.createOne({
                "username": loc_user.username,
                "type": 4,
                "content": loc_user.username+" 删除了订单,订单号为 "+req.body.id ,
                "create_time": req.body.create_time
            },function (err, doc) {});

            Logistics.removeByOrder(req.body.id, function(err, doc){
                if(err){
                    res.send(400);
                }else{
                    res.send(200);
                }
            });
        }
    });
});

router.get('/loadMore', pageControl, function(req, res){
    var loc_user = req.session.user;

    Orders.findSomeByCustomer(loc_user._id, req.query.loadIndex, function(err, docs){
        if(err){
            res.send({code:-100, res:"没有更多数据了..."});
        } else {

            var ep = new eventproxy();
            ep.after('find_logistics', docs.length, function(){
                console.log(docs);
                res.send({code:100, res:docs});
            });

            for(var i = 0;i < docs.length;i ++){
                Logistics.getOneByOrder(docs[i]._id,test(i));
                //万恶的作用域链
                function test(i){
                    return (function(err, doc){
                        if(err){
                            res.res(400);
                        } else {
                            docs[i].logistics = doc;
                            ep.emit('find_logistics')
                        }
                    })
                }
            }
        }
    });
});

module.exports = router;




