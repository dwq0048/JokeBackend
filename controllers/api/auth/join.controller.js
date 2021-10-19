const Schema = require('../../../models/functions/index');

const join = async (req, res, next) => {
	const onResponse = () => { try { res.status(200).json({ status: 'success' }) }catch(err){ onError(err) } };
	const onError = (err) => { console.log(err);res.status(200).json({ status: 'fail', message: err.message }) };

	const LocalToken = res.locals.token;
	let data = {
		name : req.body.USER_NAME,
		email : req.body.USER_EMAIL,
		password : req.body.USER_PASSWORD,
		agree : req.body.USER_AGREE
	};

	const VerifiAuth = () => {
		const Reg = {
			Special : /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi,
			Email : /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i
		};

		// 닉네임 오류
		if(!data.name || data.name == ""){
			throw new Error('Name Empty');
		}
		if(data.name.length < 2 || data.name.length > 12){
			throw new Error('Name Length');
		}
		if(Reg.Special.test(data.name)){
			throw new Error('Name Spacial');
		}

		// 이메일 오류
		if(!data.email || data.email == ""){
			throw new Error('Email Error');
		}
		if(!Reg.Email.test(data.email)){
			throw new Error('Email Special');
		}

		// 비밀번호 오류
		if(!data.password || data.password == ""){
			throw new Error('Password Empty');
		}
		if(data.password.length < 6){
			throw new Error('Password Length');
		}

		// 정보 동의 오류
		if(data.agree == false || data.agree == 'false'){
			throw new Error('Agree Empty');
		}
	}

	const OverlapNick = async () => {
		return new Promise((resolve, reject) => {
			Schema.USER.JoinNick(data.name).then((req) => {
				if(req.length > 0){ reject({ message : 'Name Same' }) }else{ resolve(true) };
			}).catch(() => {
				reject('db Error');
			});
		});
	}

	const OverlapEmail = async () => {
		return new Promise((resolve, reject) => {
			Schema.USER.JoinEmail(data.email).then((req) => {
				if(req.length > 0){ reject({ message : 'Email Same' }) }else{ resolve(true) };
			}).catch(() => {
				reject('db Error');
			});
		});
	}

	const RunCommand = async () => {
		try{
			await VerifiAuth();
			await OverlapNick();
			await OverlapEmail();
			Schema.USER.Join({
				userid : '',
				password : data.password,
				username : '',
				nickname : data.name,
				email : data.email, 
				info : { auth : 1 },
				meta : {
					thumbnail : '',
					description : '',
				}
			}).then(onResponse).catch(onError);
		}catch(err){
			onError(err);
		}
	}
	RunCommand();
}

module.exports = join;
