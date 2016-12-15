/* Created by chen on 2016/11/29 */

var Goods = require("./../models/").Goods;

exports.findAll = function (callback) {
    Goods.find({}).sort({create_time: -1}).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.createOne = function (params, callback) {
    Goods.create(verifyParams(params),callback);
};

exports.update = function (id, params, callback) {
    Goods.findOneAndUpdate({_id:id}, verifyParams(params)).exec(function(err,doc){
        callback(err,doc);
    });
};

exports.getOneById = function(id, callback){
    Goods.findOne({_id: id}).exec(callback);
};

exports.removeById = function(id, callback){
    Goods.findOneAndRemove({_id: id}).exec(callback);
};

function verifyParams(params) {
    var result = {
        'name': params.name,
        'type': params.type,
        'content': params.content,
        'headSrc': params.headSrc,
        'totalNum': params.totalNum,
        'resNum': params.resNum,
        'price': params.price,
        'sales': params.sales || 0,
    };
    if(params.create_time !== ""){
        result["create_time"] = new Date(params.create_time);
    }
    return result;
}

