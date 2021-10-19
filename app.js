const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const middleware = require('./controllers/middleware/index.middleware');
middleware.app({ app : app });
/* const admin = require("firebase-admin");
admin.initializeApp({
	credential: admin.credential.cert(require("./codeboard-4d4ad-firebase-adminsdk-503nw-0a6e954fc8.json")),
	storageBucket: "codeboard-4d4ad.appspot.com"
}); */

// routes
//app.use('/', indexRouter);
app.use('/api/v1/auth/', require('./routes/api/v1/auth.js'));

module.exports = app;
