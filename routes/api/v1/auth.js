const express = require('express');
const router = express.Router();

const Middleware = {
	TOKEN : require('../../../controllers/middleware/token.middleware'),
	DATA : require('../../../controllers/middleware/data.middleware'),
}

router.post('/security', Middleware.DATA(), require('../../../controllers/api/auth/security.controller'));
router.post('/login', Middleware.DATA(), require('../../../controllers/api/auth/login.controller'));
router.post('/join', Middleware.DATA(), require('../../../controllers/api/auth/join.controller'));
router.post('/logout', Middleware.DATA(), require('../../../controllers/api/auth/logout.controller'));

module.exports = router;
