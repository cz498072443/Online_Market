/**
 * Created by chen on 2016/12/11.
 */

var News = require("./../models/").News;

exports.findAll = function (callback) {
    News.find({}).sort({create_time: -1}).limit(12).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.findAllByUserName = function (username, callback) {
    News.find({username: username}).sort({create_time: -1}).limit(12).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.createOne = function (params, callback) {
    News.create(verifyParams(params),callback);
};

function verifyParams(params) {
    var result = {
        'username': params.username || "",
        'type': params.type || 0,
        'content': params.content
    };
    if(params.create_time !== ""){
        result["create_time"] = new Date(params.create_time);
    }
    return result;
}