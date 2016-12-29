/**
 * Created by YUK on 16/12/28.
 */

var express = require("express");
var router = express.Router();

var User = require("./../../proxy/index").User;
var News = require("./../../proxy/index").News;

var levels = require("./../../public/json/levels");

var eventproxy = require("eventproxy");

//页面控制中间件
var pageControl = function (req, res, next) {
    User.getOneById(req.session.user._id, function(err, docs){
        var userRole = docs.role;

        if(!req.session.hasLogin){
            res.render('login.html',{ error:"若要进行该操作,请先登录!"});
        }else if(userRole != "SuperAdmin"){
            res.redirect("/");
        }else{
            next();
        }
    });
};

router.get('/', pageControl, function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();

    ep.fail(next);
    ep.all('admin_detail', function(adminDetail){
        res.render('homePage/HomeConfig.html',{ user: adminDetail });
    });

    User.getOneById(loc_user._id, function(err, docs){
        ep.emit('admin_detail',docs)
    });
});

module.exports = router;