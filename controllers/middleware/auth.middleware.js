const jwt = require('jsonwebtoken');
const secretToken = require('../../models/helpers/secret-token.js');

const Auth = (req, { state, index, userIx, userAgent, uuid, visitorId, info, meta }) => {
    const secret = req.app.get('jwt-secret');
    const ReSecret = req.app.get('jwt-resecret');
    return new Promise((resolve, reject) => {
        try {
            let object = {};
            object.access = jwt.sign( { index : index, userIx : userIx, userAgent : userAgent, uuid : uuid, visitorId : visitorId, info : info, meta : meta }, secret, { expiresIn: secretToken.AccessTime });
            (state) ? object.refresh = jwt.sign( { index : index, userIx : userIx, userAgent : userAgent, uuid : uuid, visitorId : visitorId }, ReSecret, { expiresIn: secretToken.RefreshTime }) : undefined;
            resolve(object);
        } catch (e){
            reject(e);
        }
    })
};

module.exports = Auth;
