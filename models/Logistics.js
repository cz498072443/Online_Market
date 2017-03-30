/**
 * Created by YUK on 17/3/30.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var conn = require('./database_market').connection;
var ObjectId = Schema.Types.ObjectId;

var LogisticsSchema = new Schema({
    'orderId': {type: String},
    'userId': {type: String},
    'state': {type: Boolean},
    'content': {type: Array},
},{collection:'Logistics',versionKey:false});

conn.model('Logistics',LogisticsSchema);
module.exports = conn.model('Logistics');
