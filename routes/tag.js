const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tag');
const auth = require('../controllers/auth');

router.get('/findByKeyWords', tagController.findByKeyWords);

module.exports = router;
