/**
 * Created by YUK on 16/12/29.
 */

var Banners = require("./../models/").Banners;

exports.findAll = function (callback) {
    Banners.find({}).sort({create_time: -1}).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.findOneById = function (id, callback) {
    Banners.findOne({_id: id}).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.createOne = function (params, callback) {
    Banners.create(verifyParams(params),callback);
};

exports.update = function (id, params, callback) {
    Banners.findOneAndUpdate({_id:id}, verifyParams(params)).exec(function(err,doc){
        callback(err,doc);
    });
};

exports.removeById = function(id, callback){
    Banners.findOneAndRemove({_id: id}).exec(callback);
};

function verifyParams(params) {
    var result = {
        "title": params.title,
        "intro": params.intro,
        "image": params.image,
        "url": params.url
    };
    if(params.create_time !== ""){
        result["create_time"] = new Date(params.create_time);
    }
    return result;
}