const express = require('express');
const spedizioniController = require('../controllers/spedizioniController');
const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');

const router = express.Router();

router.get('/', auth, requirePermesso('spedizioni:read'), spedizioniController.getAll);
router.get('/:id', auth, requirePermesso('spedizioni:read'), spedizioniController.getById);

module.exports = router;
