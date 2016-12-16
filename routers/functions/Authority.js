/**
 * Created by YUK on 16/12/16.
 */

var express = require("express");
var router = express.Router();
//var Goods = require("./../../proxy").Goods;
var User = require("./../../proxy").User;
//var News = require("./../../proxy").News;
//var Comments = require("./../../proxy").Comments;

var eventproxy = require("eventproxy");

//页面控制中间件
var pageControl = function (req, res, next) {
    if(!req.session.hasLogin){
        res.render('login.html',{ error:"若要进行该操作,请先登录!"});
    }else if(req.session.user.role != "SuperAdmin"){
        res.redirect("/");
    }else{
        next();
    }
};

router.get('/', pageControl, function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('user_list','admin_detail', function(userList, adminDetail){
        res.render('functions/AuthorityContr.html',{ userList: userList, user: adminDetail });
    });

    User.findAll(function(err, docs){
        ep.emit('user_list',docs)
    });

    User.getOneById(loc_user._id, function(err, docs){
        ep.emit('admin_detail',docs)
    });
});

module.exports = router;