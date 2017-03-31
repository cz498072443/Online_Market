/**
 * Created by YUK on 17/3/30.
 */

var express = require("express");
var router = express.Router();

var User = require("./../../proxy").User;
var News = require("./../../proxy").News;
var Orders = require("./../../proxy").Orders;
var Logistics = require("./../../proxy").Logistics;
var eventproxy = require("eventproxy");

//页面控制中间件
var pageControl = function (req, res, next) {
    User.getOneById(req.session.user._id, function(err, docs){
        var userRole = docs.role;

        if(!req.session.hasLogin){
            res.render('login.html',{ error:"若要进行该操作,请先登录!"});
        }else if(userRole == "User"){
            res.redirect("/");
        }else{
            next();
        }
    });
};

router.get('/',pageControl,function(req, res, next){
    var loc_user = req.session.user;
    var logisticsArray = [];
    var ep = new eventproxy();

    ep.fail(next);
    //先找出所有的物流信息
    ep.all('logistics_list','user_detail','headerBarNews', function(logisticsList, userDetail, headerBarNews){
        var ep2 = new eventproxy();
        //根据物流信息上的订单号找到所有订单
        ep2.after('all_order',logisticsList.length,function(){
            var ep3 = new eventproxy();
            //根据物流信息上的userId找到所有消费者
            ep3.after('all_customer',logisticsList.length,function(){
                console.log(logisticsArray)
                res.render('functions/LogisticsContr.html',{ user:userDetail,logisticsArray:logisticsArray,headerBarNews:headerBarNews });
            });
            for(var i = 0;i < logisticsList.length;i ++){
                User.getOneById(logisticsList[i].userId,test(i));

                function test(i){
                    return (function(err, docs){
                        if(err){
                            res.send(400);
                        } else {
                            logisticsArray[i].user = docs;
                            ep3.emit('all_customer');
                        }
                    })
                }
            }
        });

        for(var i = 0;i < logisticsList.length;i ++){
            var Obj = {_id:""+logisticsList[i]._id,orderId:logisticsList[i].orderId,userId:logisticsList[i].userId,content:logisticsList[i].content,state:logisticsList[i].state,order:"",user:{}};
            logisticsArray.push(Obj);

            Orders.getOneById(logisticsList[i].orderId,test(i));
            //作用域链....不是这样的话i找不到值
            function test(i){
                return (function (err, docs){
                    if(err){
                        res.send(400);
                    } else {
                        logisticsArray[i].order = docs;
                        ep2.emit('all_order');
                    }
                })
            }
        }
    });

    User.getOneById(loc_user._id, function(err, docs){
        ep.emit('user_detail',docs)
    });

    Logistics.findAll(function(err,docs){
        ep.emit('logistics_list',docs);
    });

    News.findNewOne(function(err,docs){
        ep.emit('headerBarNews',docs)
    });
});

router.put('/update',function(req, res){
    var ep = new eventproxy();
    ep.all('findLogistics', function(newLogistics){
        var newLogisticsObj = {main: req.body.newLogistics, create_date: req.body.date}
        newLogistics.content.push(newLogisticsObj);

        Logistics.update(req.body.id,newLogistics,function(err, doc){
            if(err){
                res.send(400);
            } else {
                res.send(doc);
            }
        })
    });

    Logistics.getOneById(req.body.id,function(err, doc){
        if(err){
            res.send(400);
        } else {
            ep.emit('findLogistics',doc)
        }
    })
});

router.get('/ConfirmReceive',function(req,res){
    var ep = new eventproxy();
    ep.all('findLogistics', function(newLogistics){
        var newLogisticsObj = {main: "已确认收货", create_date: req.query.create_time}
        newLogistics.content.push(newLogisticsObj);
        newLogistics.state = true;

        Logistics.update(req.query.id,newLogistics,function(err, doc){
            if(err){
                res.send(400);
            } else {
                res.send(200);
            }
        })
    });

    Logistics.getOneById(req.query.id,function(err, doc){
        if(err){
            res.send(400);
        } else {
            ep.emit('findLogistics',doc)
        }
    })
});

module.exports = router;