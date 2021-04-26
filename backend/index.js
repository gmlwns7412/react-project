const express = require('express');
const app = express();
const port = 4000;
const bodyParser = require('body-parser');
const { User } = require('./models/User');


app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose.connect('mongodb://HU:BLl1234@localhost:27017/admin',{
    useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology:true, useFindAndModify:false
}).then(()=>console.log('hello mongoDB'))
.catch(err => console.log(err));

app.get('/', (req, res) => res.send('이건 서버인데 ㅡㅡ?'));

app.post('/register', (req, res) =>{
    //회원 가입 할때 필요한 정보들을 client에서 가져오면 DB에 넣어준다.

    const user = new User(req.body)

    user.save((err, doc) => {
        if(err) return res.json({ success: false, err});
        return res.status(200).json({
            success: true
        });
    });
});


app.listen(port, () => console.log(`이야아앙락! 포트번호 ${port}에서 열었다`))