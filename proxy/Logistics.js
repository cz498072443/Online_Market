/**
 * Created by YUK on 17/3/30.
 */

var Logistics = require("./../models/").Logistics;

exports.findAll = function (callback) {
    Logistics.find({"state":false}).sort({create_time: -1}).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.createOne = function (params, callback) {
    Logistics.create(verifyParams(params),callback);
};

exports.findSome = function (loadIndex, callback) {
    Logistics.find({"state":false}).sort({create_time: -1}).limit(4).skip(loadIndex * 4).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.getOneById = function(id, callback){
    Logistics.findOne({_id: id}).exec(callback);
};

exports.getOneByOrder = function(orderId, callback){
    Logistics.findOne({orderId: orderId}).exec(callback);
};

exports.removeByOrder = function (orderId, callback) {
    Logistics.remove({orderId: orderId}).exec(callback);
};

exports.removeByUser = function (userId, callback) {
    Logistics.remove({userId: userId}).exec(callback);
};

exports.update = function (id, params, callback) {
    Logistics.findOneAndUpdate({_id:id}, verifyParams(params)).exec(function(err,doc){
        callback(err,doc);
    });
};

function verifyParams(params) {
    var result = {
        'orderId': params.orderId || "",
        'userId': params.userId || "",
        'state': params.state || false,
        'content': params.content || []
    };
    if(params.create_time !== ""){
        result["create_time"] = new Date(params.create_time);
    }
    return result;
}
