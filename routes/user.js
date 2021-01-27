var express = require('express');
var router = express.Router();
const userController = require('../controllers/user');

router.post('/login', userController.login);
router.post('/signup', userController.signup);

module.exports = router;
