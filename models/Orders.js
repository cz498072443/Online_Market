/**
 * Created by YUK on 16/12/5.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var conn = require('./database_market').connection;
var ObjectId = Schema.Types.ObjectId;

var GoodsSchema = new Schema({
    'customer': {type: String},
    'goodsList': {type: Array},
    'totalPrice': {type: Number},
    "create_time": { type: Date, default: Date.parse(new Date()) },
},{collection:'orders',versionKey:false});

conn.model('orders',GoodsSchema);
module.exports = conn.model('orders');