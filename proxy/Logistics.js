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


function verifyParams(params) {
    var result = {
        'orderId': params.orderId || "",
        'userId': params.userId || "",
        'state': params.state || false,
        'content': params.content || []
    };

    return result;
}
