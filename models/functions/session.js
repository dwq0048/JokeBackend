const Session = ({ Schema, ObjectId }) => {
	return {
        // Write // Session Inser
        SessionTemp : (data) => {
            return new Promise((resolve, reject) => {
                Schema.SESSION.create(data).then((req) => {
                    resolve(req);
                }).catch((err) => {
                    reject(err);
                });
            })
        },
        // Write // Session Update after Success
        SessionUpdate : ({ session, index }) => {
            return new Promise((resolve, reject) => {
                const filter = {
                    $or : [
                        { $and : [ { _id: new ObjectId(index)  }, ] },
                    ],
                };
                let update = {$set: {}};
                (session.access) ? update.$set.access = session.access : undefined;
                (session.refresh) ? update.$set.refresh = session.refresh : undefined;
                (session.userAgent) ? update.$set.userAgent = session.userAgent : undefined;
                (session.uuid) ? update.$set.uuid = session.uuid : undefined;
                (session.visitorId) ? update.$set.visitorId = session.visitorId : undefined;
                (session.iat) ? update.$set.iat = session.iat : undefined;
                (session.exp) ? update.$set.exp = session.exp : undefined;
                (session.state) ? update.$set.state = session.state : undefined;
                const options = { upsert : false, new : true };

                Schema.SESSION.findOneAndUpdate(filter, update, options).then((req) => {
                    resolve(req);
                }).catch((err) => {
                    reject(err);
                })
            });
        },
        // Read // 재발급전 확인절차
        SessionFind : (data) => {
            return new Promise((resolve, reject) => {
                try{
                    Schema.SESSION.aggregate([
                        { "$match" : { "$and" : [ { "_id" : new ObjectId(data.index) }, { "access" : data.token } ] } },
                        {
                            "$lookup" : {
                                "from" : Schema.USER.collection.name,
                                "localField" : "index",
                                "foreignField" : "_id",
                                "as" : "user"
                            }
                        },
                    ],function(rr, ra){
                        if(ra){
                            try{
                                if(ra.length > 0){
                                    (ra[0].user.length > 0) ? ra[0].user = ra[0].user[0] : undefined;
                                    resolve(ra[0]);
                                }else{
                                    reject(false);
                                }
                            }catch(e){
                                console.log(e);
                                reject(false);
                            }
                        }
                    });
                }catch(e){
                    reject(e);
                }
            })
        }
    }
};

module.exports = Session
