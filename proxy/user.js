/**
 * Created by chen on 2016/11/27.
 */

var User = require("./../models/").User;

exports.getOneByUsername= function(username, callback) {
    User.findOne({username: username}).exec(callback);
};

exports.createOne = function (params, callback) {
    User.create(verifyParams(params),callback);
};

function verifyParams(params) {
    var result = {
        'username': params.username,
        'password': params.password,
        'role': "User"
    };
    if(params.create_time !== ""){
        result["create_time"] = new Date(params.create_time);
    }
    return result;
}




