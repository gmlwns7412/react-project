const express = require('express');
const app = express();
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {auth} =require('./middleware/auth');
const {User} = require('./models/User');
const config = require('./config/key');
const client = require('./routes/mysql');



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

// ======================자유 게시판 작성===============================
app.post('/api/board/write', function(req, res){
    client.query('INSERT INTO HealthK_board (title, content, writer) values (?,?,?)',
    [req.body.title, req.body.content, req.body.writer], function(err, data){
        if(err) throw res.json({success:false, err});        
        res.send({success:true})
    })
});

// ======================장터 게시판 작성===============================
app.post('/api/market/write', function(req, res){
    client.query('INSERT INTO HealthK_Market (title, content, writer) values (?,?,?)',
    [req.body.title, req.body.content, req.body.writer], function(err, data){
        if(err) throw res.json({success:false, err});        
        res.send({success:true})
    })
});

// ======================자유 게시판 목록===============================
app.get('/api/board', function(req, res){
    client.query('SELECT * FROM HealthK_board LIMIT 10', function(err, data){
        if(err) throw res.json({success:false,err});
    res.status(200).send(data)
    });
});

// ======================장터 게시판 목록===============================
app.get('/api/market', function(req, res){
    client.query('SELECT * FROM HealthK_Market LIMIT 10', function(err, data){
        if(err) throw res.json({success:false,err});
    res.status(200).send(data)
    });
});

// ======================자유 게시판 댓글 작성===========================
app.post('/api/board/reply_write', function(req, res){
    client.query('INSERT INTO HealthK_board_reply (board_no, reply_writer, reply_content) values (?,?,?)',
    [req.body.board_no, req.body.writer, req.body.reply_content], function(err, data){
        if(err) throw res.json({success:false, err});
        res.status(200).send({success:true});
    });
});

// ======================장터 게시판 댓글 작성===========================
app.post('/api/market/reply_write', function(req, res){
    client.query('INSERT INTO HealthK_Market_reply (board_no, reply_writer, reply_content) values (?,?,?)',
    [req.body.board_no, req.body.writer, req.body.reply_content], function(err, data){
        if(err) throw res.json({success:false, err});
        res.status(200).send({success:true});
    });
});

// ======================자유 게시판 게시글 보기 ==========================
app.get('/api/board/view/:board_no', function(req, res){
    client.query(`UPDATE HealthK_board SET views=views+1 WHERE no=${req.params.board_no}`)
    client.query(`SELECT * FROM HealthK_board WHERE no=${req.params.board_no}`, function(err, content){
        client.query(`SELECT * FROM HealthK_board_reply WHERE board_no=${req.params.board_no}`, function(err1, reply){
            if(err) throw res.json({success:false, err});
            else if(err1) throw res.json({success:false, err1});
            res.status(200).send({success:true, content , reply})
        });
    });
});

// ======================장터 게시판 게시글 보기 ==========================
app.get('/api/market/view/:board_no', function(req, res){
    client.query(`UPDATE HealthK_Market SET views=views+1 WHERE no=${req.params.board_no}`)
    client.query(`SELECT * FROM HealthK_Market WHERE no=${req.params.board_no}`, function(err, content){
        client.query(`SELECT * FROM HealthK_Market_reply WHERE board_no=${req.params.board_no}`, function(err1, reply){
            if(err) throw res.json({success:false, err});
            else if(err1) throw res.json({success:false, err1});
            res.status(200).send({success:true, content , reply})
        });
    });
});

// ======================자유 게시판 게시글 삭제 ==========================
app.delete('/api/board/delete/:board_no', function(req, res){
    client.query(`DELETE FROM HealthK_board WHERE no=${req.params.board_no}`, function(err, data){
        client.query(`DELETE FROM HealthK_board_reply where board_no=${req.params.board_no}`, function(err1, data1){
            if(err) throw res.json({success:false, err});
            else if(err1) throw res.json({success:false, err1});
            res.status(200).send({success:true})
        });
    });
});

// ======================장터 게시판 게시글 삭제 ==========================
app.delete('/api/market/delete/:board_no', function(req, res){
    client.query(`DELETE FROM HealthK_Market WHERE no=${req.params.board_no}`, function(err, data){
        client.query(`DELETE FROM HealthK_Market_reply where board_no=${req.params.board_no}`, function(err1, data1){
            if(err) throw res.json({success:false, err});
            else if(err1) throw res.json({success:false, err1});
            res.status(200).send({success:true})
        })
    })
})

// ======================유저 몸무게 업데이트 =============================
app.post('/api/users/change_weight')

app.listen(port, ()=>console.log(`gogo port ${port}!`))