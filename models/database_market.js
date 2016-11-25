/**
 * Created by YUK on 16/11/25.
 */

var config = require('./../config/config');
var mongoose = require('mongoose');
var connection = mongoose.createConnection(config.db.market);

connection.on('error',function(err){
    console.log(err);
    process.exit(1);
});

process.on('SIGINT',function(){
    mongoose.connection.close(function(){
        console.log('Mongoose disconnected through app termination');
        process.exit(0);
    });
});

exports.connection = connection;