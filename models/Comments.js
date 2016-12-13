/**
 * Created by YUK on 16/12/13.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var conn = require('./database_market').connection;
var ObjectId = Schema.Types.ObjectId;

var NewsSchema = new Schema({
    'userId': {type: String},
    'goodId': {type: String},
    'orderId': {type: String},
    'goodName': {type: String},
    'headSrc': {type: String},
    'isLike': {type: Number},
    'content': {type: String},
    "create_time": { type: Date, default: Date.parse(new Date()) },
    "modify_time": { type: Date, default: Date.parse(new Date()) }
},{collection:'comments',versionKey:false});

conn.model('comments',NewsSchema);
module.exports = conn.model('comments');