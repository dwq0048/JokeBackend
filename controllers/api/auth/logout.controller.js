const logout = (req, res, next) => {
	const onResponse = (item) => {
		try {
            res.clearCookie('_sctk' ,{ path: '/', expires: new Date(0) }).status(200).json({ status: 'success', issued : false });
		}catch(err){
			onError(err)
		}
	};
	const onError = (err) => { console.log(err);res.clearCookie('_sctk' ,{ path: '/', expires: new Date(0) }).json({ status: 'fail', message: err.message }) };

	const RunCommand = async () => {
		try{
			onResponse();
		}catch(err){
			onError(err);
		}
	}
	RunCommand();
}

module.exports = logout;
