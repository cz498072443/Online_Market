/**
 * Created by YUK on 16/11/25.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var conn = require('./database_market').connection;
var ObjectId = Schema.Types.ObjectId;

var UserSchema = new Schema({
    "username": {type: String},
    "role": {type: String},
    "password": {type: String},
    "secPassword": {type: String},
    "wallet": {type: Number},
    "favorite": {type: Array},
    "create_time": { type:Date, default: new Date() },
    "modify_time": { type:Date, default: new Date() }
},{collection:'user',versionKey:false});

conn.model('user',UserSchema);
module.exports = conn.model('user');