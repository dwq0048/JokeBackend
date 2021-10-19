const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Schema = {
    USER : require('../schema/auth/user'),
    SESSION : require('../schema/auth/session.js'),
};

module.exports = {
    USER : require('./user.js')({ Schema, ObjectId }),
    SESSION : require('./session.js')({ Schema, ObjectId }),
}
