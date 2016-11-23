/**
 * Created by YUK on 16/10/13.
 */

var admin = {
    username:"21232f297a57a5a743894a0e4a801fc3",
    password:"4f10fae53c1cf8556b16d6b061ddf295"
};


module.exports={
    checkLogin:function(req,res,next){
        if(req.session.access){
            next();
        }else {
            req.session.error = "请先登录!";
            if(req.session.loginWrong){
                req.session.error = "账号密码错误!";
                req.session.loginWrong = false;
            }
            res.redirect('/');
        }
    },
    checkAccess:function(req,res,next){
        if(req.session.access){
            res.redirect('accessin')
        }else {
            next();
        }
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