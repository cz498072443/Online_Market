/**
 * Created by YUK on 16/12/29.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var conn = require('./database_market').connection;
var ObjectId = Schema.Types.ObjectId;

var NewsSchema = new Schema({
    "title": {title: String},
    "intro": {title: String},
    "image": {title: String},
    "url": {title: String},
    "create_time": { type: Date, default: Date.parse(new Date()) },
    "modify_time": { type: Date, default: Date.parse(new Date()) }
},{collection:'banners',versionKey:false});

conn.model('banners',NewsSchema);
module.exports = conn.model('banners');