const express = require('express');
const giacenzeController = require('../controllers/giacenzeController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');

const router = express.Router();

router.get('/', auth, requirePermesso('giacenze:read'), giacenzeController.getAll);
router.get('/export', auth, requirePermesso('giacenze:read'), giacenzeController.exportExcel);
router.get('/:prodotto_id', auth, requirePermesso('giacenze:read'), giacenzeController.getByProdottoId);

module.exports = router;
