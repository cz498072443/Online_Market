/**
 * Created by YUK on 16/10/13.
 */

var admin = {
    username:"21232f297a57a5a743894a0e4a801fc3",
    password:"4f10fae53c1cf8556b16d6b061ddf295"
};


module.exports={
    checkAccess:function(req,res,next){
        if(req.session.user){
            User.findOne({userName: req.session.user.userName},function(err,user){
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
    },
    checkLogin:function(req,res,next){
        User.findOne({userName: req.body.username},function(err,user){

        })
    },
    checkUser:function(req,res,next){
        if(req.body.username == admin.username && req.body.password == admin.password){
            if(req.body.remember){
                console.log("yes");
                req.session.cookie.maxAge = 1000*60*24*7;
                next();
            } else {
                next();
            }
        }else {
            req.session.access = false;
            req.session.loginWrong = true;
            res.redirect('/');
        }
    }
}