/* Created by chen on 2016/11/29 */

var Goods = require("./../models/").Goods;

exports.findAll = function (callback) {
    Goods.find({}).sort({index:-1}).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.getOneByUsername= function(username, callback) {
    Goods.findOne({username: username}).exec(callback);
};

exports.createOne = function (params, callback) {
    Goods.create(verifyParams(params),callback);
};

exports.update = function (id, params, callback) {
    Goods.findOneAndUpdate({_id:id}, params).exec(function(err,doc){

        callback(err,doc);
    });
};

function verifyParams(params) {
    var result = {
        'name': params.name,
        'type': params.type,
        'content': params.content,
        'headSrc': params.headSrc,
        'totalNum': params.totalNum,
        'resNum': params.resNum
    };
    if(params.create_time !== ""){
        result["create_time"] = new Date(params.create_time);
    }
    return result;
}

