var express = require('express');
var router = express.Router();
const classController = require('../controllers/classes');

router.put('/', classController.add);
router.get('/', classController.getAll);
router.put('/:idClass', classController.edit);
router.get('/:idClass', classController.getOne);
router.delete('/:idClass', classController.delete);
router.get('/findByKeyWord', classController.findByKeyWord);

module.exports = router;
