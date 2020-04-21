// MongoDB
const mongoose = require('mongoose');

// bcrypt 암호화
const bcrypt = require('bcrypt');
const saltRounds = 10;

// 토큰 생성
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema( {
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        tpye: Number,
    }
});

userSchema.pre('save', function (next) {
    let user = this;

    if (user.isModified('password')) {
        //비밀번호 암호화
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err)


            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

// 비밀번호 확인 메서드
userSchema.methods.chkPwd = function(plainPassword, cb) {

    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch);
    })
}

// 웹 토큰 생성 메서드
userSchema.methods.generateToken = function(cb) {

    let user = this;
    let token = jwt.sign(user._id.toHexString(), 'secretToken')

    user.token = token;
    user.save(function(err, user) {
        if(err) return cb(err);
        cb(null, user);
    })
}

// 토큰 비교 메서드
userSchema.statics.findByToken = function(token, cb) {
    
    let user = this;

    // 토큰 decode
    // 클라이언트 토큰과 DB 토큰 비교
    jwt.verify(token, 'secretToken', function(err, decode) {
        user.findOne({"_id": decode, "token": token }, function(err, user) {
            if (err) return cb(err);
            cb(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema);

module.exports = {User};