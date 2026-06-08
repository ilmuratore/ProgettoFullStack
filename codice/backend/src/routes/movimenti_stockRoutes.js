const express = require('express');
const movimentiStockController = require('../controllers/movimenti_stockController');
const auth = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const validate = require('../middleware/validate');

const router = express.Router();

const createBlueprint = {
    prodotto_id: { required: true, type: 'number', integer: true, min: 1 },
    ubicazione_id: { required: false, type: 'number', integer: true, min: 1 },
    ubicazione_da_id: { required: false, type: 'number', integer: true, min: 1 },
    ubicazione_a_id: { required: false, type: 'number', integer: true, min: 1 },
    quantita: { required: true, type: 'number', integer: true, min: 1 },
    movimento_tipo: { required: true, type: 'string' },
    riferimento: { required: false, type: 'string' },
    note: { required: false, type: 'string' }
};


router.get('/', auth, requirePermesso('giacenze:read'), movimentiStockController.getAll);
router.post('/', auth, requirePermesso('giacenze:write'), validate(createBlueprint), movimentiStockController.create);
router.get('/prodotto/:prodotto_id', auth, requirePermesso('giacenze:read'), movimentiStockController.getByProdottoId);
router.get('/ubicazione/:ubicazione_id', auth, requirePermesso('giacenze:read'), movimentiStockController.getByUbicazioneId);
router.get('/tipo/:movimento_tipo', auth, requirePermesso('giacenze:read'), movimentiStockController.getByTipo);
router.get('/riferimento/:riferimento', auth, requirePermesso('giacenze:read'), movimentiStockController.getByRiferimento);
router.get('/:id', auth, requirePermesso('giacenze:read'), movimentiStockController.getById);

module.exports = router;
