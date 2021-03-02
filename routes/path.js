const express = require('express');
const router = express.Router();
const pathController = require('../controllers/path');
const auth = require('../controllers/auth');

router.put('/', auth, pathController.add);
router.get('/', pathController.getAll);
router.post('/:idPath', auth, pathController.edit2);
router.get('/:idPath', pathController.getOne);
router.delete('/:idPath', auth, pathController.delete);

router.put('/:idPath/module', auth, pathController.addModule);
router.post('/:idPath/:idModule', auth, pathController.editModule);
router.get('/:idPath/:idModule', pathController.getOneModule);
router.delete('/:idPath/:idModule', auth, pathController.deleteModule);
router.post('/:idPath/:idModule/clone', auth, pathController.cloneModule);

router.put('/:idPath/tag', auth, pathController.addTag);
router.get('/:idPath/tag', auth, pathController.getAllPathTag);
router.post('/:idPath/tag', auth, pathController.editPathTag);
router.delete('/:idPath/tag', auth, pathController.deletePathTag);

router.get('/findByKeyWord', pathController.findByKeyWord);

module.exports = router;

