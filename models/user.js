/**
 * Created by YUK on 16/11/25.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var conn = require('./database_market').connection;
var ObjectId = Schema.Types.ObjectId;

var UserSchema = new Schema({
    "username": { type: String },
    "role": { type: String },
    "password": { type: String },
    "secPassword": { type: String },
    "wallet": { type: String },
    "favorite": { type: Array },
    "tel": {type: Number},
    "shoppingCart": { type: Array },
    "address": {type: String},
    "level": { type: Object },
    "cost": {type: Number},
    "nickname": {type: String},
    "sign": {type: String},
    "apply": {type: String},
    "create_time": { type:Date, default: new Date() },
    "modify_time": { type:Date, default: new Date() }
},{collection:'user',versionKey:false});

conn.model('user',UserSchema);
module.exports = conn.model('user');