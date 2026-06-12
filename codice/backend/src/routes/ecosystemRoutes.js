const express = require('express');
const router = express.Router();
const ecosystemController = require('../controllers/ecosystemController');
const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');

router.get('/search',                     auth, requirePermesso('ecosystem:read'), ecosystemController.search);
router.get('/fornitori/:id',              auth, requirePermesso('ecosystem:read'), ecosystemController.getSchedaFornitore);
router.get('/fornitori/:id/catalogo',     auth, requirePermesso('ecosystem:read'), ecosystemController.getCatalogoFornitore);
router.get('/prodotti/:id',               auth, requirePermesso('ecosystem:read'), ecosystemController.getSchedaProdotto);
router.get('/prodotti/:id/disponibilita', auth, requirePermesso('ecosystem:read'), ecosystemController.getDisponibilitaProdotto);

module.exports = router;
