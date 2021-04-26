const express = require('express');
const app = express();
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {auth} =require('./middleware/auth');
const {User} = require('./models/User');
const config = require('./config/key');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require ('mongoose');
mongoose.connect(config.mongoURI,{
    useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false
})
.then(()=>console.log('MONGO HHIHIHIH!!!!!'))
.catch(err => console.log(err))



app.get('/', (req,res)=>res.send('hiddd'))

app.get('/api/hello',(req,res)=>{
    res.send('ㅎㅇㅎㅇ')
})
//====================================회원가입============================
app.post('/api/users/register',(req,res)=>{
    //회원가입시 필요한 정보를 client로 가져오면 DB에 넣어주는것
    const user =new User(req.body);
    user.save((err,userInfo)=>{
        if(err) return res.json({success:false,err})
        return res.status(200).json({
            success:true
        })
    })
})


//====================================로그인============================
app.post('/api/users/login', (req, res) => {
    //요청된 이메일이 DB에 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user) => {
        console.log('user', user);
        console.log('user', req.body.email);
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: '이메일에 해당하는 유저가 없습니다.',
            });
        }
        //이메일이 있다면 비번이 맞는지 확인
        user.comparePassword(req.body.password, (err, isMatch) => {
            //isMatch는 Models/User.js에서 정의한다.
            if (!isMatch) return res.json({ loginSuccess: false, message: '비밀번호가 틀렸습니다.' });
            //비번이 맞다면 토큰생성
            user.generateToken((err, user) => {
                //generateToken Models/User.js에서 정의한다.
                if (err) return res.status(400).send(err);
                //토큰을 저장해야하는데 쿠키, 로컬스토리지등이 있다.
                res.cookie('x_auth', user.token).status(200).json({ loginSuccess: true, userId: user._id });
            });
        });
    });
});

//=========================auth=================================
app.get('/api/users/auth',auth, (req, res) =>{

    //여기까지오면 auth가 true다.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false:true, //role이 0이면 일반유저 나머지는 관리자
        isAuth:true,
        email:req.user.email,
        name:req.user.name,
        lastname:req.user.lastname,
        role:req.user.role,
        image:req.user.image
    })
})

//=========================로그아웃=================================
app.get('/api/users/logout',auth, (req, res) =>{
    User.findOneAndUpdate({_id:req.user._id},
        {token:""}
        ,(err,user)=>{
            if(err)return res.json({success:false, err});
            return res.status(200).send({
                success:true
            })
        })
})




app.listen(port, ()=>console.log(`gogo port ${port}!`))