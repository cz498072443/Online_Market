/**
 * Created by YUK on 16/12/5.
 */

var Orders = require("./../models/").Orders;

exports.findAll = function (callback) {
    Orders.find({}).sort({create_time: -1}).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.findAllByCustomer = function (customer, callback) {
    Orders.find({customer: customer}).sort({create_time: -1}).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.createOne = function (params, callback) {
    Orders.create(verifyParams(params),callback);
};

exports.removeById = function(id, callback){
    Orders.findOneAndRemove({_id: id}).exec(callback);
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

