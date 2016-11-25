/**
 * Created by YUK on 16/11/24.
 */
var express = require("express");
var router = express.Router();

var middleware = require('./../middleware');

router.post('/',middleware.checkLogin,function(req,res){
    req.session.access = true;
    res.send(200);
});

router.get('/',function(req,res){
    var error = "还没有问题";

    res.render('login.html',{ error: error });
});

module.exports = router;