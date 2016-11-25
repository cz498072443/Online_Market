/**
 * Created by YUK on 16/10/13.
 */

var User = require('./../models').User;

var admin = {
    username:"21232f297a57a5a743894a0e4a801fc3",
    password:"4f10fae53c1cf8556b16d6b061ddf295"
};


module.exports={
    checkAccess:function(req,res,next){
        if(req.session.hasLogin){
            next();
        }else{
            if(req.session.user){
                User.findOne({username: req.session.user.username},function(err,user){
                    if(err){
                        return next(err);
                    }
                    req.user = user;
                    res.locals.user = user;
                    if(user){
                        req.session.hasLogin = true;
                        console.log("完成登记")
                        next();
                    }else{
                        res.redirect('/lose');
                    }
                })
            }else {
                req.session.hasLogin = false;
                next();
            }
        }
    },
    checkLogin:function(req,res,next){
        User.findOne({username: req.body.username},function(err,doc){
            console.log(doc);

            if(err){
                return next(err);
            }
            if(doc){
                if(req.body.password == doc.password){
                    req.session.hasLogin = true;
                    req.session.user = doc;
                    next();
                }else{
                    console.log("密码错误");
                    req.session.error = "密码错误!";
                    res.send(400);
                }
            }else{
                console.log("用户错误");
                req.session.error = "用户名错误!";
                res.send(400);
            }
        })
    },
}