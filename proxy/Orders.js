/**
 * Created by YUK on 16/12/5.
 */

var Orders = require("./../models/").Orders;

exports.findAll = function (callback) {
    Orders.find({}).sort({create_time: -1}).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.findAllByCustomer = function (customer, loadIndex, callback) {
    Orders.find({customer: customer}).sort({create_time: -1}).limit(4).skip(loadIndex * 4).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.createOne = function (params, callback) {
    Orders.create(verifyParams(params),callback);
};

exports.getOneById = function(id, callback){
    Orders.findOne({_id: id}).exec(callback);
};

exports.update = function (id, params, callback) {
    Orders.findOneAndUpdate({_id:id}, verifyParams(params)).exec(function(err,doc){
        callback(err,doc);
    });
};

exports.removeById = function(id, callback){
    Orders.findOneAndRemove({_id: id}).exec(callback);
};

exports.removeByCustomer = function(customer, callback){
    Orders.remove({customer: customer}).exec(callback);
};

function verifyParams(params) {
    var result = {
        'customer': params.customer,
        'goodsList': params.goodsList,
        'totalPrice': params.totalPrice
    };
    if(params.create_time !== ""){
        result["create_time"] = new Date(params.create_time);
    }
    return result;
}

