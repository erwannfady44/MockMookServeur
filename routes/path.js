const express = require('express');
const router = express.Router();
const pathController = require('../controllers/path');
const auth = require('../controllers/auth');

router.put('/', auth, pathController.add);
router.get('/', pathController.getAll);
router.post('/:idPath', auth, pathController.edit);
router.get('/:idPath', pathController.getOne);
router.delete('/:idPath', auth, pathController.delete);

router.put('/:idPath/module', auth, pathController.addModule);
router.post('/:idPath/:idModule', auth, pathController.editModule);
router.get('/:idPath/:idModule', pathController.getOneModule);
router.delete('/:idPath/:idModule', auth, pathController.deleteModule);

router.put('/:idModule/resource', auth, pathController.addResource);
router.post('/:idModule/:idResource', auth, pathController.editResource);
router.get('/:idModule/:idResource', pathController.getOneResource);
router.get('/:idModule/:idResource', auth, pathController.deleteResource);

router.get('/findByKeyWord', pathController.findByKeyWord);

module.exports = router;

