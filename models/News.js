/**
 * Created by chen on 2016/12/11.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var conn = require('./database_market').connection;
var ObjectId = Schema.Types.ObjectId;

var NewsSchema = new Schema({
    'username': {type: String},
    'type': {type: Number},
    'content': {type: String},
    "create_time": { type: Date, default: Date.parse(new Date()) },
},{collection:'news',versionKey:false});

conn.model('news',NewsSchema);
module.exports = conn.model('news');
