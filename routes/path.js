const express = require('express');
const router = express.Router();
const pathController = require('../controllers/path');
const auth = require('../controllers/auth');

router.put('/', auth, pathController.add);
router.get('/', pathController.getAll);
router.put('/:idPath', auth, pathController.edit);
router.get('/:idPath', pathController.getOne);
router.delete('/:idPath', auth, pathController.delete);
router.get('/findByKeyWord', pathController.findByKeyWord);

module.exports = router;

