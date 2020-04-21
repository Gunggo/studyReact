
/** 인증처리
 * 클라이언트 쿠키에서 토큰 조회
 * 가져온 토큰 복호화 후 유저 찾기
 * 유저 있을시 인증 OK
 * 없을시 No
 * */ 

const { User } = require('../models/User');

let auth = (req, res, next) => {
    
    let token = req.cookies.x_auth;

    User.findByToken(token, (err, user) => {
        if(err) throw err;
        if(!user) return res.json({ isAuth: false, error: true })

        req.token = token;
        req.user = user;
        next();

    }) 

}

module.exports = { auth };