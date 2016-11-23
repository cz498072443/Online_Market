/**
 * Created by chen on 2016/11/22.
 */

var express = require("express");
var app = express();
var server = require('http').createServer(app);

server.listen(4000,function(){
    console.log("Server Listen On Port ",4000);
})

module.exports.express = express;
module.exports.app = app;
module.exports.server = server;