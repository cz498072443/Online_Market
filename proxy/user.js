/**
 * Created by chen on 2016/11/27.
 */

var User = require("./../models/").User;

exports.getOneByUsername= function(username, callback) {
    News.findOne({username: username}).exec(callback);
};