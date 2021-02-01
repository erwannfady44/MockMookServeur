const express = require('express');
const router = express.Router();
const pathController = require('../controllers/path');
const auth = require('../controllers/auth');

router.put('/', auth, pathController.add);
router.get('/', pathController.getAll);
router.put('/:idClass', auth, pathController.edit);
router.get('/:idClass', pathController.getOne);
router.delete('/:idClass', auth, pathController.delete);
router.get('/findByKeyWord', pathController.findByKeyWord);

module.exports = router;

