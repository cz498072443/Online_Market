/**
 * Created by chen on 2016/11/22.
 */

var path = require("path");
var app = require("./config/server").app;
var server = require("./config/server").server;
var express = require("./config/server").express;
var config = require("./config/config");
var template = require("./common/artTemplate");
var bodyParser = require("body-parser");
var routers = require('./routers/index');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require("connect-mongo")(session);
var logger = require('morgan');
var ueditor = require('ueditor');

app.engine('.html',template.__express);
app.set('view engine','html');

//app.use(bodyParser({limit:'2mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));
app.use(cookieParser());

//ueditor
//这个为了防止冲突要放在multer之前,不然上传会被multer拦截
app.use("/tools/ueditor/ue", ueditor(path.join(__dirname, 'public'), function (req, res, next) {
    // ueditor 客户发起上传图片请求
    if (req.query.action === 'uploadimage') {
        var foo = req.ueditor;
        var date = new Date();
        var imgname = req.ueditor.filename;

        var img_url = '/upload/Goods/body';
        res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
    }

    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = '/upload/Goods/body';
        res.ue_list(dir_url);  // 客户端会列出 dir_url 目录下的所有图片
    }

    // 客户端发起其它请求
    else {
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/tools/ueditor/nodejs/config.json');
    }

}));

app.use(session({
    secret:'onlineMarket',
    store: new MongoStore({
        host: config.session_host,
        port: config.session_port,
        db: config.session_db
    }),
    name:"market.uid",
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:config.session_maxage
    }
}));

app.use(express.static(path.join(__dirname,'public')));

app.use(logger('dev'));

app.use('/',routers);

module.exports = app;
