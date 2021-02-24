const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/module');
const auth = require('../controllers/auth');

router.put('/:idModule', auth, moduleController.clone);
router.get('/', moduleController.getAll);
//router.get('/:idPath', moduleController.getModules);
router.get('/findByKeyWord', moduleController.findByKeyWord);

module.exports = router;
