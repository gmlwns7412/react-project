const { User } = require("../models/User");


let auth =(req,res,next) =>{
    //인증처리하는곳

    //쿠키에서 토큰을 가져온다.
    let token = req.cookies.x_auth;
    //토큰을 복호화해서 유저찾기
    User.findByToken(token,(err,user)=>{
        if(err)throw err;
        if(!user) return res.json({isAuth:false,error:true})
        req.token = token;
        req.user = user;
        next();
    });
    //유저가있으면 인증 okey

    //유저가없으면 nono
}

module.exports = {auth}