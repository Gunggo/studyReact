const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// db설정
const config = require('./key');

const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//applcation/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected..'))
.catch(err => console.log(err))

// index 페이지
app.get('/', (req, res) => res.send('Hello World!~~ 안녕하세요'))

app.get('/api/hello', (req,res) => {
    res.send("안녕하세요 ~")
})

// 회원가입 요청
app.post('/api/user/register', (req, res) => {

    // 회원 가입 할때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터 베이스에 넣어준다.
    const user = new User(req.body);

    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, err})
        return res.status(200).json({
            success: true
        });
    });
});

// 로그인 요청 (id, pw 검증 및 토큰발급 (쿠키) )
app.post('/api/user/login', (req, res) => {
    
    //요청된 이메일 select
    User.findOne({ email: req.body.email}, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "존재하지않는 이메일입니다."
            })
        }

        //요청된 비밀번호 select
        user.chkPwd(req.body.password, (err, isMatch) => {
            if(!isMatch) {
                return res.json({ loginSuccess: false, message: "비밀번호가 일치하지 않습니다."})
            }

            //로그인 성공(Token 발급)
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);

                // 발급한 토큰 저장
                res.cookie("x_auth", user.token)
                .status(200)
                .json({ loginSuccess: true, userId: user._id })

            })
            
        })
    })
})

app.get('/api/user/auth', auth, (req,res) => {
    
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/user/logout', auth, (req, res) => {

    User.findOneAndUpdate({_id: req.user._id},
        {token: ""},
        (err, user) => {
            if(err) return res.json({ success: false, err});
            return res.status(200).send({
                success: true
            })
        })
})

// 접속 포트 log찍기
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))