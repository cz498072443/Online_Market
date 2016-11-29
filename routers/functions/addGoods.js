/**
 * Created by YUK on 16/11/29.
 */
var express = require("express");
var router = express.Router();

router.get('/addGoods',function(req,res){
    if(req.session.hasLogin){
        var loc_user = req.session.user;
        if(loc_user.role == "User"){
            res.redirect("/");
        }else{
            res.render('functions/addGoods.html',{ user:loc_user.username,role:loc_user.role });
        }
    }else{
        res.render('login.html',{ error:"若要进行该操作,请先登录!"});
    }
});

module.exports = router;