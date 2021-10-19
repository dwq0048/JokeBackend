const mongoose = require('mongoose');

const User = new mongoose.Schema({
    userid : { type : String, unique  : true }, // 아이디
    password : { type : String }, // 비밀번호
    username : { type : String }, // 사용자 이름
    nickname : { type : String }, // 사용자 닉네임
    email : { type : String, unique : true }, // 이메일
    type : { type : String, default : 0 }, // 가입경로 (일반, 페이스북, 구글, ...)
    info : { 
        sex : { type : String, default : 0 }, // 성별
        number : { type : String, default : 0 }, // 번호
        address : { type : String, default : 0 }, // 주소
        auth : { type : Number, default : 0 }, // 관리 권한
        // 모든 권한 404
        // 최강 개발자 : 203
        // 개발자 : 202
        // 관리자 : 201
        // 부 관리자 : 200
        
        // 기업 : 4
        // 상점 사장 : 3
        // 상점 직원 : 2
        // 일반유저 : 1
        // 비유저 : 0
        rank : { type : Number, default : 0 }, // 사용자 권한
        experience : { type : Number, default : 0 }, // 사용자 경험치
        point : { type : Number, default : 0 }, // 사용자 포인트
        check : { type : Number, default : 0 }, // 이메일 등등 인증
        state : { type : String, default : 0 }, // 일반, 휴먼, 탈퇴 등등..
        first_join : { type : String, default : Date }, // 가입날짜
        last_login : { type : String, default : Date } // 최근 로그인
    },
    meta : { type : Object, default : {} },
}, { collection: 'gl_user', versionKey: false });

User.methods.verify = function(password){
    return this.password == password
}

module.exports = mongoose.model('User', User, true)
