/**
 * Created by chen on 2016/11/27.
 */

var User = require("./../models/").User;

exports.getOneByUsername= function(username, callback) {
    User.findOne({username: username}).exec(callback);
};

exports.getOneById= function(id, callback) {
    User.findOne({_id: id}).exec(callback);
};

exports.createOne = function (params, callback) {
    User.create(verifyParams(params),callback);
};

exports.update = function (id, params, callback) {
    User.findOneAndUpdate({_id:id}, verifyParams(params)).exec(function(err,doc){
        callback(err,doc);
    });
};

exports.updateShoppingCart = function (id, shoppingCart, callback){
    User.update({_id:id}, {'$set':{'shoppingCart': shoppingCart}}).exec(function(err,doc){
        callback(err,doc);
    });
};

function verifyParams(params) {
    var result = {
        'username': params.username,
        'password': params.password,
        'role': params.role || "User",
        "secPassword": params.secPassword || "",
        "wallet": params.wallet || 0,
        "favorite": params.favorite || [],
        "shoppingCart": params.shoppingCart || [],
        "level": params.level || { num: 0, discount: 1 },
        "cost": params.cost || 0,
        "nickname": params.nickname || "",
        "sign": params.sign || "",
        "apply": params.apply || ""
    };
    if(params.create_time !== ""){
        result["create_time"] = new Date(params.create_time);
    }
    return result;
}




