const Schema = require('../../models/functions/index');
const jwt = require('jsonwebtoken');
const secretToken = require('../../models/helpers/secret-token');

const Token = (req, res, next) => {
    const secret = req.app.get('jwt-secret');
    const ReSecret = req.app.get('jwt-resecret');
    const token = secretToken.decorative(req.cookies._SESSION);

    const onError = async (err) => {
        err = (typeof err == 'object' || typeof err == 'string') ? err : {};
        (typeof err.message != 'string') ? err.message = false : undefined;
        console.log(err);
        res.locals.token = { status : false, error : err.message };
        next();
    }

    // 클라이언트 정보
    const client = { userAgent : req.headers["user-agent"] || req.get('User-Agent') }

    // 엑세스 토큰 검증
    const Access = async () => {
        if(!token){ throw new Error('Token is empty') };
        return new Promise((resolve, reject) => {
            try{
                jwt.verify(token.access, secret, (err, decoded) => {
                    if(err){
                        switch(err.message){
                            case 'jwt expired':
                                TokenEexpired().then(VerificationRe).then(Issued).then(onSession).then(ReResponse).catch(onError);
                                break;
                            default:
                                reject(err);
                        }
                    }else{
                        resolve(decoded);
                    }
                })
            }catch(err){
                throw new Error(err.message);
            }
        })
    }

    const Verification = async (data) => {
        Schema.SESSION.Read.Verification({ access : token.access, type : false }).then((req) => {
            const payload = {
                status: 'success',
                message: 'Token authentication complete',
                info : {
                    index : req.users._id,
                    userid : req.users.userid,
                    nickname : req.users.nickname,
                    meta : {
                        thumbnail : (typeof req.users.meta.thumbnail == 'string' || typeof req.users.meta.thumbnail == 'object') ? req.users.meta.thumbnail : false,
                        description : (typeof req.users.meta.description == 'string') ? req.users.meta.description : false,
                    },
                    access : {
                        auth: req.users.info.auth,
                        rank: req.users.info.rank,
                        point: req.users.info.point,
                        check: req.users.info.check,
                        experience: req.users.info.experience
                    }
                }
            };

            console.log("토큰 인증됨");
            res.locals.token = payload;
            next();
        }).catch((err) => {
            throw new Error(err.message);
        })
    }

    const ReResponse = (req) => {
        console.log("재발급됨");
        if(process.env.USERNAME == "Luochi"){
            res.cookie('_SESSION', secretToken.encryption(req.token), { httpOnly: true });
        }else{
            res.cookie('_SESSION', secretToken.encryption(req.token), { secure: true });
        }
        const payload = {
            status: 'success',
            message: 'Token reissuance success',
            info : req.info
        };

        res.locals.token = payload;
        next();
    }

    // 리플래시 검증
    const VerificationRe = async (data) => {
        return new Promise((resolve, reject) => {
            Schema.SESSION.Read.Verification({ access : token.access, refresh : token.refresh, type : false }).then((req) => {
                resolve(req);
            }).catch((err) => {
                reject(err);
            })
        });
    }

    const Issued = async (req) => {
        return new Promise((resolve, reject) => {
            try {
                const data = {
                    token : {
                        access : jwt.sign( { _id: req.index }, secret, { expiresIn: secretToken.AccessTime, }),
                        refresh : jwt.sign( { _id: req.index }, ReSecret, { expiresIn: secretToken.RefreshTime, })    
                    },
                    info : {
                        index : req.users._id,
                        userid : req.users.userid,
                        nickname : req.users.nickname,
                        meta : {
                            thumbnail : (typeof req.users.meta.thumbnail == 'string' || typeof req.users.meta.thumbnail == 'object') ? req.users.meta.thumbnail : false,
                            description : (typeof req.users.meta.description == 'string') ? req.users.meta.description : false,
                        },
                        access : {
                            auth: req.users.info.auth,
                            rank: req.users.info.rank,
                            point: req.users.info.point,
                            check: req.users.info.check,
                            experience: req.users.info.experience
                        }
                    }
                };
                resolve(data);
            }catch(err){
                reject(err);
            }
        });
    }

    const onSession = async (req) => {
        try {
            return new Promise((resolve, reject) => {
                const data = {
                    index: req.info.index,
                    client: JSON.stringify(client),
                    access: req.token.access,
                    refresh: req.token.refresh
                }

                Schema.SESSION.Write.Create(data).then(() => {
                    resolve(req);
                }).catch(() => {
                    reject('db error');
                })
            })
        } catch(e){
            throw new Error('db error');
        }
    }

    // 토큰기간 만료
    const TokenEexpired = async () => {
        return new Promise((resolve, reject) => {
            jwt.verify(token.refresh, ReSecret, (err, decoded) => {
                if(err){
                    reject(err);
                }else{
                    resolve({ decode: decoded })
                }
            });
        });
    }

    Access().then(Verification).catch(onError);
}

module.exports = Token;
