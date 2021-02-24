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
router.delete('/:idPath/:idModule', auth, pathController.deleteModule);
router.get('/:idPath/:idModule', auth, pathController.getOneModule);

router.put('/:idModule/ressource', auth, pathController.addRessource);

router.get('/:idPath/:idModule', pathController.getOneModule);
router.get('/findByKeyWord', pathController.findByKeyWord);

module.exports = router;

