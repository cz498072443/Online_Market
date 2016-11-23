/**
 * Created by chen on 2016/11/22.
 */

var path = require("path");
var app = require("./config/server").app;
var server = require("./config/server").server;
var express = require("./config/server").express;
var template = require("./common/artTemplate");
var bodyParser = require("body-parser");
var routers = require('./routers/index');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');

app.engine('.html',template.__express);
app.set('view engine','html');

app.use(bodyParser({limit:'2mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.use(multer());

app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:1000*60*60
    }
}))

app.use(express.static(path.join(__dirname,'public')));

app.use(logger('dev'));

app.use('/',routers);

module.exports = app;
