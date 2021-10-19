const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Schema = require('../../../models/functions/index');
const secretToken = require('../../../models/helpers/secret-token.js');
const AuthMiddleware = require('../../middleware/auth.middleware.js');

const login = (req, res, next) => {
	const secret = req.app.get('jwt-secret');
	const ReSecret = req.app.get('jwt-resecret');
	const uuidKey = (req.cookies.GUEST_UD == undefined) ? false : true;
	const UserAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress);
	const LocalReal = () => { if(process.env.SWEET == "dev"){ return { httpOnly: true } }else{ return { secure: true } } };

	let UUID = false;
	if(!uuidKey){
		UUID = {
			uuid : uuidv4().toString(),
			visitorId : req.body.visitorId,
			cookie : (req.body.cookie) ? true : false,
			session : (req.body.session) ? true : false,
			local : (req.body.local) ? true : false,
		}
	}else{
		UUID = JSON.parse(secretToken.decorative(req.cookies.GUEST_UD));
	}

	const onResponse = (item) => {
		try {
			if(!uuidKey){
				res.cookie('_sctk', secretToken.encryption(item.payload), LocalReal()).cookie('GUEST_UD', secretToken.encryption(JSON.stringify(UUID))).status(200).json({ status: 'success', issued : true, user : item.user });
			}else{
				res.cookie('_sctk', secretToken.encryption(item.payload), LocalReal()).status(200).json({ status: 'success', issued : false, user : item.user });
			}
		}catch(err){
			onError(err)
		}
	};
	const onError = (err) => { console.log(err);res.status(200).json({ status: 'fail', message: err.message }) };

	const client = { userAgent : req.headers["user-agent"] || req.get('User-Agent') };
	let data = {
		email : req.body.USER_EMAIL,
		password : req.body.USER_PASSWORD,
	};

	const VerifiAuth = () => {
		// 이메일 오류
		if(!data.email || data.email == ""){
			throw new Error('Email Error');
		}

		// 비밀번호 오류
		if(!data.password || data.password == ""){
			throw new Error('Password Empty');
		}
	};

	const TempSession = (user) => {
		if(user){
			if(user.verify(data.password)){
				return new Promise((resolve, reject) => {
					Schema.SESSION.SessionTemp({ index : user._id }).then((item) => {
						SchemaInner = true;
						resolve({ user, item });
					}).catch((err) => {
						reject(err);
					});
				})
			}else{
				throw new Error('User Wrong');
			}
		}else{
			throw new Error('User Wrong');
		}
	};

	const onToken = ({ user, item }) => {
		return new Promise((resolve, reject) => {
			const object = {
				state : true,
				index : item._id,
				userIx : user._id,
				userAgent : (typeof client.userAgent == 'string') ? client.userAgent : client,
				uuid : UUID.uuid,
				visitorId : UUID.visitorId,
				info : {
					auth: user.info.auth,
					rank: user.info.rank,
					point: user.info.point,
					check: user.info.check,
					experience: user.info.experience
				},
				meta : {
					thumbnail : (typeof user.meta.thumbnail == 'string' || typeof user.meta.thumbnail == 'object') ? user.meta.thumbnail : false,
					description : (typeof user.meta.description == 'string') ? user.meta.description : false,
				},
			};
			AuthMiddleware(req, object).then((item) => {
				resolve({data: item, object: object});
			}).catch((err) => {
				reject(err);
			});
		});
	};

	const onSession = async ({ data, object }) => {
		return new Promise((resolve, reject) => {
			try{
				const user = { info : object.info, meta : object.meta };
				jwt.verify(data.access, secret, (err, decoded) => {
					if(err){ reject(err) };
					let time = {
						iat : new Date(decoded.iat*1000),
						exp : new Date(decoded.exp*1000),
					}
					jwt.verify(data.access, secret, (err, decoded) => {
						if(err){ reject(err) };
						const session = {
							access : data.access,
							refresh : data.refresh,
							userAgent : object.userAgent,
							uuid : object.uuid,
							visitorId : object.visitorId,
							iat : time.iat,
							exp : time.exp,
							state : true,
						};
						Schema.SESSION.SessionUpdate({ session, index : object.index }).then((item) => {
							resolve({ payload : JSON.stringify({ token : data.access, index : object.index }), user : user });
						}).catch((err) => {
							reject(err);
						});
					});
				});
			}catch(e){
				reject(e);
			}

		});
	};

	const RunCommand = async () => {
		try{
			VerifiAuth();
			Schema.USER.FindByID({ email : data.email }).then(TempSession).then(onToken).then(onSession).then(onResponse).catch(onError);
		}catch(err){
			onError(err);
		}
	}
	RunCommand();
}

module.exports = login;
