const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Schema = require('../../../models/functions/index');
const secretToken = require('../../../models/helpers/secret-token');
const AuthMiddleware = require('../../middleware/auth.middleware.js');

const Auth = async (req, res, next) => {
    const secret = req.app.get('jwt-secret');
    const ReSecret = req.app.get('jwt-resecret');
	const uuidKey = (req.cookies.GUEST_UD == undefined) ? false : true;
	const authKey = (req.cookies._sctk == undefined) ? false : true;
	const client = { userAgent : req.headers["user-agent"] || req.get('User-Agent') };
	const LocalReal = () => { if(process.env.SWEET == "dev"){ return { httpOnly: true } }else{ return { secure: true } } };
	
	const onResponse = (data) => {
		try {
			const ReqData = JSON.stringify({
				uuid : uuidv4().toString(),
				visitorId : req.body.visitorId,
				cookie : (req.body.cookie) ? true : false,
				session : (req.body.session) ? true : false,
				local : (req.body.local) ? true : false,
			});
			const UUID = secretToken.encryption(ReqData);
			if(!uuidKey){
				// UUID키가 없을 경우에 발급
				if(data.state == 'onlyUUID'){
					res.clearCookie('_sctk' ,{ path: '/', expires: new Date(0) }).cookie('GUEST_UD', UUID).status(200).json({ status : 'success',  issued : true });
				}
			}else{
				// UUID키가 있을 경우에 발급하지 않음
				if(data.state == 'token'){
					console.log("재발급함");
					res.cookie('_sctk', secretToken.encryption(data.payload), LocalReal()).status(200).json({ status : 'success', issued : false, user : data.user });
				}else if(data.state == 'onToken'){
					console.log("토큰 문제 없음");
					res.status(200).json({ status: 'success', issued : false, user : { info : data.decoded.info, meta : data.decoded.meta } });
				}else if(data.state == 'noToken'){
					res.clearCookie('_sctk' ,{ path: '/', expires: new Date(0) }).status(200).json({ status: 'noToken', message: err.message });
				}else{
					console.log("비 로그인 유저");
					res.clearCookie('_sctk' ,{ path: '/', expires: new Date(0) }).status(200).json({ status: 'success', issued : false });
				}
			}
		}catch(err){
			onError(err);
		}
	};
	const onError = (err) => {
		console.log(err);
		res.clearCookie('_sctk' ,{ path: '/', expires: new Date(0) }).status(200).json({ status: 'fail', message: err.message });
	};

	// 재발급
	const Reissuance = (Token) => {
		return new Promise((resolve, reject) => {
			Schema.SESSION.SessionFind(Token).then((item) => {
				try{
					jwt.verify(item.refresh, ReSecret, (err, decoded) => {
						if(err){
							console.log("재발급 토큰 만료됨");
							reject({ status : 'noToken' });
						}else{
							const object = {
								state : false,
								index : decoded.index,
								userIx : decoded.userIx,
								userAgent : decoded.userAgent,
								uuid : decoded.uuid,
								visitorId : decoded.visitorId,
								info : {
									auth: item.user.info.auth,
									rank: item.user.info.rank,
									point: item.user.info.point,
									check: item.user.info.check,
									experience: item.user.info.experience
								},
								meta : {
									thumbnail : (typeof item.user.meta.thumbnail == 'string' || typeof item.user.meta.thumbnail == 'object') ? item.user.meta.thumbnail : false,
									description : (typeof item.user.meta.description == 'string') ? item.user.meta.description : false,
								},
							};
							AuthMiddleware(req, object).then((item) => {
								const session = item;
								Schema.SESSION.SessionUpdate({ session, index : object.index }).then((item) => {
									resolve({ payload : JSON.stringify({ token : item.access, index : object.index }), user : { info : object.info, meta : object.meta } });
								}).catch((err) => {
									reject(err);
								});
							}).catch((err) => {
								reject(err);
							});
						}
					});
				}catch(e){
					reject(e);
				}
			}).catch((err) => {
				reject(err);
			});
		});
	}

	const onToken = () => {
		return new Promise((resolve, reject) => {
			if(authKey){
				try{
					const Token = JSON.parse(secretToken.decorative(req.cookies._sctk));
					const UUID = JSON.parse(secretToken.decorative(req.cookies.GUEST_UD));
					jwt.verify(Token.token, secret, (err, decoded) => {
						if(err){
							switch(err.message){
								case 'jwt expired':
									console.log('jwt expired');
									// 재발급 절차 해야됩니다.
									Reissuance(Token).then((req) => {
										resolve({ state : 'token', payload : req.payload, user : req.user });
									}).catch((err) => {
										if(typeof err.status == 'string'){
											if(err.status == 'noToken'){
												resolve({ status : 'noToken' });
											}
										}
										reject(err);
									});
									break;
								default:
									reject(err);
							}
						}else{
							// 유효성 체크
							(decoded.userAgent != client.userAgent) ? reject({ message: 'userAgent' }): undefined;
							(decoded.uuid != UUID.uuid) ? reject({ message : 'uuid' }) : undefined;
							(decoded.visitorId != UUID.visitorId) ? reject({ message: 'visitorId' }) : undefined;
							resolve({ state : 'onToken', decoded});
						}
					})
				}catch(err){
					throw new Error(err);
				}
			}else{
				resolve({ state: 'onlyUUID' })
			}
		})
	};

	const RunCommand = async () => {
		onToken().then(onResponse).catch(onError);
	}
	RunCommand();
}

module.exports = Auth
