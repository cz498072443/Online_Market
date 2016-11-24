/**
 * Created by chen on 2016/11/22.
 */


var express = require("express");
var router = express.Router();
var moment = require("moment");

var middleware = require('./../middleware');

var login = require("./login");
var signUp = require("./signUp");

router.get('/',function(req,res){
    var error = req.session.error;
    req.session.error = null;
    res.render('index.html',{ error: error });
});

router.use('/login',login);
router.use('/signUp',signUp);

//router.use(middleware.checkLogin);
//
//router.get('/accessin',function(req,res){
//    res.render("accessin.html");
//});

module.exports = router;