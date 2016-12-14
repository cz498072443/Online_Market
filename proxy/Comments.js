/**
 * Created by YUK on 16/12/13.
 */

var Comments = require("./../models/").Comments;

exports.findAll = function (callback) {
    Comments.find({}).sort({create_time: -1}).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.findAllByGoodId = function (goodId, callback) {
    Comments.find({goodId: goodId}).sort({create_time: -1}).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.findOneByGoodAndOrder = function (goodId, orderId, callback) {
    Comments.findOne({$and:[{goodId: goodId},{orderId: orderId}]}).sort({create_time: -1}).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.createOne = function (params, callback) {
    console.log(params);
    Comments.create(verifyParams(params),callback);
};

exports.update = function (id, params, callback) {
    Comments.findOneAndUpdate({_id:id}, verifyParams(params)).exec(function(err,doc){
        callback(err,doc);
    });
};

exports.removeById = function(id, callback){
    Comments.findOneAndRemove({_id: id}).exec(callback);
};

exports.removeByGoodId = function(goodId, callback){
    Comments.remove({goodId: goodId}).exec(callback);
};

function verifyParams(params) {
    var result = {
        'userId': params.userId,
        'goodId': params.goodId,
        'orderId': params.orderId,
        'goodName': params.goodName,
        'customerNickName': params.customerNickName,
        'headSrc': params.headSrc,
        'price': params.price,
        'grade': params.grade,
        'content': params.content,
        'modify_time': new Date(params.modify_time) || new Date
    };
    if(params.create_time !== ""){
        result["create_time"] = new Date(params.create_time);
    }
    return result;
}