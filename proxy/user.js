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

function verifyParams(params) {
    var result = {
        'username': params.username,
        'password': params.password,
        'role': "User",
        "secPassword": "",
        "wallet": params.wallet || 0,
        "favorite": []
    };
    if(params.create_time !== ""){
        result["create_time"] = new Date(params.create_time);
    }
    return result;
}




