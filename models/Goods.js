/**
 * Created by chen on 2016/11/29.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var conn = require('./database_market').connection;
var ObjectId = Schema.Types.ObjectId;

var GoodsSchema = new Schema({
    "name": {type: String},
    "type": {type: String},
    "content": {type: String},
    "headSrc": {type: String},
    "totalNum": {type: Number},
    "resNum": {type: Number},
    "price": {type: Number},
    "sales": {type: Number},
    "create_time": { type:Date, default: new Date() },
    "modify_time": { type:Date, default: new Date() }
},{collection:'goods',versionKey:false});

conn.model('goods',GoodsSchema);
module.exports = conn.model('goods');

