const express = require('express');
const ordiniController = require('../controllers/ordiniController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const createBlueprint = {
    cliente_id: { required: true, type: 'number', integer: true, min: 1 },
    destinazione_id: { required: true, type: 'number', integer: true, min: 1 },
    data_consegna_richiesta: { required: false, type: 'string' }
};

const updateBlueprint = {
    data_consegna_richiesta: { required: false, type: 'string' }
};

const statoBlueprint = {
    stato: { required: true, type: 'string', enum: ['BOZZA', 'CONFERMATO', 'SPEDITO', 'ANNULLATO'] }
};

const pickingBlueprint = {
    stato_picking: { required: true, type: 'string', enum: ['NON_AVVIATO', 'IN_PICKING', 'PICKING_COMPLETATO'] }
};

const validateRighe = (req, res, next) => {
    const { righe } = req.body;
    if (!Array.isArray(righe) || righe.length === 0) {
        const err = new Error('Errore di validazione');
        err.code = 'VALIDATION_ERROR';
        err.status = 400;
        err.details = [{ field: 'righe', message: 'righe deve essere un array non vuoto' }];
        return next(err);
    }
    for (const r of righe) {
        if (typeof r.prodotto_id !== 'number' || typeof r.quantita !== 'number' || r.quantita <= 0) {
            const err = new Error('Errore di validazione');
            err.code = 'VALIDATION_ERROR';
            err.status = 400;
            err.details = [{ field: 'righe', message: 'ogni riga richiede prodotto_id e quantita > 0' }];
            return next(err);
        }
    }
    next();
};

// GET /api/v1/ordini
router.get('/', auth, requirePermesso('ordini:read'), ordiniController.getAll);

// GET /api/v1/ordini/export
router.get('/export', auth, requirePermesso('ordini:read'), ordiniController.exportExcel);

// GET /api/v1/ordini/disponibilita/:prodotto_id
router.get('/disponibilita/:prodotto_id', auth, requirePermesso('ordini:read'), ordiniController.getDisponibilita);

// GET /api/v1/ordini/:id
router.get('/:id', auth, requirePermesso('ordini:read'), ordiniController.getById);

// POST /api/v1/ordini
router.post('/', auth, requirePermesso('ordini:write'), validate(createBlueprint), validateRighe, ordiniController.create);

// PATCH /api/v1/ordini/:id
router.patch('/:id', auth, requirePermesso('ordini:write'), validate(updateBlueprint), ordiniController.update);

// PATCH /api/v1/ordini/:id/stato
router.patch('/:id/stato', auth, requirePermesso('ordini:approve'), validate(statoBlueprint), ordiniController.updateStato);

// PATCH /api/v1/ordini/:id/picking
router.patch('/:id/picking', auth, requirePermesso('ordini:approve'), validate(pickingBlueprint), ordiniController.updateStatoPicking);

module.exports = router;
