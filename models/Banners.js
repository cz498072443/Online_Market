/**
 * Created by YUK on 16/12/29.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var conn = require('./database_market').connection;
var ObjectId = Schema.Types.ObjectId;

var BannersSchema = new Schema({
    "title": {type: String},
    "description": {type: String},
    "image": {type: String},
    "url": {type: String},
    "create_time": { type: Date, default: Date.parse(new Date()) },
    "modify_time": { type: Date, default: Date.parse(new Date()) }
},{collection:'banners',versionKey:false});

conn.model('banners',BannersSchema);
module.exports = conn.model('banners');