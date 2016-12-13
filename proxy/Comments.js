/**
 * Created by YUK on 16/12/13.
 */

var Comments = require("./../models/").Comments;

exports.findAll = function (callback) {
    Comments.find({}).sort({create_time: -1}).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.findAllByGoodAndOrder = function (customer, callback) {
    Comments.find({customer: customer}).sort({create_time: -1}).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.createOne = function (params, callback) {
    Comments.create(verifyParams(params),callback);
};

exports.removeById = function(id, callback){
    Comments.findOneAndRemove({_id: id}).exec(callback);
};

function verifyParams(params) {
    var result = {
        'userId': params.userId,
        'goodId': params.goodId,
        'orderId': params.orderId,
        'goodName': params.orderId,
        'headSrc': params.headSrc
    };
    if(params.create_time !== ""){
        result["create_time"] = new Date(params.create_time);
    }
    return result;
}