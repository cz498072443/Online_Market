/**
 * Created by YUK on 16/11/29.
 */
var express = require("express");
var router = express.Router();
var Goods = require("./../../proxy").Goods;
var eventproxy = require("eventproxy");

//页面控制中间件
var pageControl = function (req, res, next) {
    if(!req.session.hasLogin){
        res.render('login.html',{ error:"若要进行该操作,请先登录!"});
    }else if(req.session.user.role == "User"){
        res.redirect("/");
    }else{
        next();
    }
};

router.get('/',pageControl,function(req,res,next){
    var loc_user = req.session.user;
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('good_list',function(goodList){
        res.render('functions/GoodsContr.html',{ user:loc_user.username,role:loc_user.role,goodList:goodList });
    });
    Goods.findAll(function(err,docs){
        console.log(docs);
        ep.emit('good_list',docs);
    })

});

router.get('/add',pageControl,function(req,res){
    var loc_user = req.session.user;
    res.render('functions/GoodsContrAdd.html',{ user:loc_user.username,role:loc_user.role });
});

router.post('/add',pageControl,function(req,res){
    Goods.createOne(req.body,function (err, doc) {
        if(err){
            req.session.error = "注册失败!";
            res.send(400);
        }else {
            res.send(200);
        }
    })
});

module.exports = router;