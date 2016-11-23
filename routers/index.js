/**
 * Created by chen on 2016/11/22.
 */


var express = require("express");
var router = express.Router();
var moment = require("moment");

var middleware = require('./../middleware');

router.get('/',middleware.checkAccess,function(req,res){
    var error = req.session.error;
    req.session.error = null;

    res.render('index.html',{ error: error });
});

router.post('/',middleware.checkUser,function(req,res){
    req.session.access = true;
    res.send(200);
});



router.use(middleware.checkLogin);

router.get('/accessin',function(req,res){
    res.render("accessin.html");
});

module.exports = router;