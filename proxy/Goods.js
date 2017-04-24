/* Created by chen on 2016/11/29 */

var Goods = require("./../models/").Goods;

exports.findAll = function (findNum, skipIndex, callback) {
    Goods.find({}).sort({modify_time: -1}).limit(findNum).skip(skipIndex * findNum).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.findByKeyword = function (keyword, findNum, skipIndex, callback) {
    Goods.find({ $or:[{name: new RegExp(keyword)}, {type: new RegExp(keyword)}, {content: new RegExp(keyword)}] }).limit(findNum).skip(skipIndex * findNum).sort({create_time: -1}).exec(function(err,docs){
        callback(err,docs);
    });
};

exports.getPageNum = function(keyword, findNum, callback){
    if(keyword != ""){
        Goods.count({ $or:[{name: new RegExp(keyword)}, {type: new RegExp(keyword)}, {content: new RegExp(keyword)}] }).exec(function(err, docs){
            callback(err, Math.ceil(docs/findNum));
        })
    }else{
        Goods.count().exec(function(err, docs){
            callback(err, Math.ceil(docs/findNum));
        })
    }
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

exports.autoCompleteSearch = function(keyword, callback){
    Goods.find({
        $or:[{name: new RegExp(keyword)}, {type: new RegExp(keyword)}]
    }).exec(function(err, docs){
        var result = [];
        if(docs.length != 0){
            for(var i=0; i<docs.length; i++){
                result.push({
                    "value" : docs[i].name,
                    "title" : docs[i].name,
                    "url"   :  '/Goods/'+docs[i]._id,
                    "text"  : docs[i].type
                })
            }
        } else {
            result = [{"title":"没有找到哦","url":'/'}]
        }

        callback(err, result);
    })
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
        'sales': params.sales || 0
    };
    if(params.create_time != "" && params.create_time){
        result.create_time = params.create_time;
    }
    if(params.modify_time != "" && params.modify_time){
        result.modify_time = params.modify_time;
    }
    return result;
}

