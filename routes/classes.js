const express = require('express');
const router = express.Router();
const classController = require('../controllers/classes');
const auth = require('../controllers/auth');

router.put('/', auth, classController.add);
router.get('/', classController.getAll);
//router.get('/:idPath', classController.getClasses);
router.put('/:idClass', auth, classController.edit);
router.get('/:idClass', classController.getOne);
router.delete('/:idClass', auth, classController.delete);
router.get('/findByKeyWord', classController.findByKeyWord);

module.exports = router;
