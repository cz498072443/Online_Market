/**
 * Created by YUK on 16/11/24.
 */

var express = require("express");
var router = express.Router();

router.post('/',function(req,res){
    req.session.access = true;
    res.send(200);
});

router.get('/',function(req,res){
    res.render('signUp.html');
});

module.exports = router;