const mongoose = require('mongoose');

const Session = new mongoose.Schema({
    index : { type : mongoose.Schema.Types.ObjectId },
    access: { type: String, default : 0 },
    refresh : { type: String, default : 0 },
    userAgent : { type: String, default : 0 },
    uuid : { type: String, default : 0 },
    visitorId : { type : Object, default : 0 },
    iat : { type : Date, default : 0 },
    exp : { type : Date, default : 0 },
    state : { type : Boolean, default : false },
    meta : { type : Object, default : {} },
}, { collection: '_session', versionKey: false });

module.exports = mongoose.model('Session', Session, true)
