const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds =10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    
    name:{
        type:String,
        maxlength:50
    },
    email:{
        type:String,
        trim: true, // 띄어쓰기 지우기
        unique: 1 // 중복안되게 설정 
    },
    password:{
        type:String,
        minlength:5,
    },
    lastname:{
        type:String,
        maxlength:50
    },
    role:{ // 관리자, 일반 설정 = Number가 1이면 관리자 이런식으로. 
        type:Number,
        default: 0
    },
    point:{
        type: Number,
        default: 0
    },
    tall:{
        type: Number,
        require: true
    },
    weight:{
        type: Number,
        require: true
    },
    image:String,
    token:{
        type:String
    },
    tokenExp:{
        type:Number
    }
})

userSchema.pre('save', function (next) {
    let user = this;
    if (user.isModified('password')) {
        //유저정보를 저장하기 전에 비밀번호를 암호화
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash;
                next();
            });
        });
    }else{
        next()
    }
});

userSchema.methods.comparePassword = function(plainPassword, cb){
    //plainPassword = 입력된 비밀번호
    //입력된 비밀번호와 DB에 있는 암호화된것이랑 비교
    bcrypt.compare(plainPassword, this.password, function (err, isMatch){
        if(err) return cb(err)
        cb(null, isMatch)
    })
}



userSchema.methods.generateToken = function(cb){
    let user = this;
    //JWT이용해서 토큰생성
    let token = jwt.sign(user._id.toHexString(), 'secretToken')
    //user스키마의 token을 위에서생성한 token으로 넣어줌
    user.token = token
    user.save(function(err,user){
        if(err)return cb(err)
        cb(null,user)
    })
}

userSchema.statics.findByToken = function(token, cb){
    let user= this;
    //토큰을 디코드한다
    jwt.verify(token, 'secretToken', function(err,decoded){
        //유저 아이디를 이용해 유저를 찾은다음
        //클러이언트에서 가져온 toekn과 db에 보관된 토큰이 일치하는지확인
        user.findOne({"_id":decoded, "token":token}, function(err,user){
            if(err)return cb(err)
            cb(null,user)
        })
    })
}


const User = mongoose.model('User',userSchema);
module.exports = {User}