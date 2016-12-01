/**
 * Created by YUK on 16/12/1.
 */

var express = require("express");
var router = express.Router();
var Goods = require("./../../proxy").Goods;
var eventproxy = require("eventproxy");

router.get("/:id",function(req, res, next){
    var loc_user = req.session.user;
    var ep = new eventproxy();
    ep.fail(next);

    ep.all('good_detail',function(goodDetail){
        res.render('goods/GoodDetail.html',{ user:loc_user.username,role:loc_user.role,goodDetail:goodDetail });
    });

    Goods.getOneById(req.params.id, function(err,docs){
        ep.emit('good_detail',docs);
    })
});

module.exports = router;