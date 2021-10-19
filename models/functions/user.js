const User = ({ Schema, ObjectId }) => {
	return {
		// Read // 같은 닉네임 조회
		JoinNick : (data) => {
			return new Promise((resolve, reject) => {
				Schema.USER.aggregate([
					{
						"$match" : { nickname : data }
					}
				], function(rr, ra){
					if(ra){ resolve(ra) }else{ reject({ status : 'fail' }) }
				});
			});
		},
		// Read // 같은 이메일 조회
		JoinEmail : (data) => {
			return new Promise((resolve, reject) => {
				Schema.USER.aggregate([
					{
						"$match" : { email : data }
					}
				], function(rr, ra){
					if(ra){ resolve(ra) }else{ reject({ status : 'fail' }) }
				});
			});
		},
		// Read // 이메일 조회
        FindByID : (data) => {
            return new Promise((resolve, reject) => {
                try {                
                    Schema.USER.findOne(data).then((req) => {
                        if(typeof req == 'object'){
                            resolve(req);
                        }else{
                            reject({ message : 'fail' });
                        }
                    }).catch((err) => {
                        reject(err);
                    })
                }catch(err){
                    throw new Error(err.message);
                }
            });
        },
		// Write // 회원가입
		Join : (data) => {
			return new Promise((resolve, reject) => {
				Schema.USER.create(data).then((req) => {
					resolve(req);
				}).catch((err) => {
					reject(err);
				})
			})
		},
	}
};

module.exports = User
