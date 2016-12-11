/**
 * Created by YUK on 16/10/13.
 */

var User = require('./../proxy').User;

module.exports={
    checkAccess:function(req,res,next){
        if(req.session.hasLogin){
            next();
        }else{
            if(req.session.user){
                User.getOneByUsername(req.session.user.username,function(err,user){
                    if(err){
                        return next(err);
                    }
                    req.user = user;
                    res.locals.user = user;
                    if(user){
                        req.session.hasLogin = true;
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
        User.getOneByUsername(req.body.username,function(err,doc){
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
                req.session.error = "不存在该用户名!";
                res.send(400);
            }
        })
    },
    signUp:function (req, res, next) {
        User.createOne(req.body,function (err, doc) {
            if(err){
                req.session.error = "注册失败!";
                res.send(400);
            }else {
                next();
            }
        });
    }
}