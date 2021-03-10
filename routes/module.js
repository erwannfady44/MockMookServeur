const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/module');
const auth = require('../controllers/auth');

router.put('/:idModule/resource', auth, moduleController.addResource);
router.post('/:idModule/:idResource', auth, moduleController.editResource);
router.get('/:idModule/:idResource', moduleController.getOneResource);
router.delete('/:idModule/:idResource', auth, moduleController.deleteResource);
router.put('/:idModule/:idResource/clone', auth, moduleController.cloneResource);
router.get('/findByKeyWords', moduleController.findByKeyWord);

module.exports = router;
