/**
 * Created by YUK on 16/12/9.
 */

var express = require("express");
var router = express.Router();
var eventproxy = require("eventproxy");

var User = require("./../../proxy").User;

//页面控制中间件
var pageControl = function (req, res, next) {
    if(!req.session.hasLogin){
        res.render('login.html',{ error:"若要进行该操作,请先登录!"});
    }else{
        next();
    }
};

router.get('/', pageControl, function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();
    ep.fail(next);

    ep.all('user_detail',function(userDetail){
        res.render('users/personal.html',{ user:userDetail });
    });

    User.getOneById(loc_user._id, function(err,docs){
        ep.emit('user_detail',docs)
    });
});

module.exports = router;