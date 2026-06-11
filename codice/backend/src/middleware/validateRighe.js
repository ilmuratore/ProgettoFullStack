const buildValidationError = (field, message) => {
    const err = new Error('Errore di validazione');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    err.details = [{ field, message }];
    return err;
};

function validateRighe(req, _res, next) {
    const righe = req.body.righe;
    const isRicezione = req.originalUrl.includes('/ordini-acquisto/ricezioni');

    if (!Array.isArray(righe) || righe.length === 0) {
        return next(buildValidationError('righe', 'Il campo righe deve essere un array non vuoto'));
    }

    for (const r of righe) {
        if (!r.prodotto_id || typeof r.prodotto_id !== 'number' || r.prodotto_id <= 0) {
            return next(buildValidationError('righe.prodotto_id', 'Ogni riga deve contenere un prodotto_id valido'));
        }

        if (isRicezione) {
            if (typeof r.quantita_ricevuta !== 'number' || r.quantita_ricevuta <= 0) {
                return next(buildValidationError('righe.quantita_ricevuta', 'quantita_ricevuta deve essere un numero > 0'));
            }

            if (!r.ubicazione_id || typeof r.ubicazione_id !== 'number' || r.ubicazione_id <= 0) {
                return next(buildValidationError('righe.ubicazione_id', 'ubicazione_id deve essere un numero > 0'));
            }

            continue;
        }

        const quantitaOrdinata = r.quantita_ordinata ?? r.quantita;

        if (typeof quantitaOrdinata !== 'number' || quantitaOrdinata <= 0) {
            return next(buildValidationError('righe.quantita_ordinata', 'quantita_ordinata deve essere un numero > 0'));
        }

        if (typeof r.prezzo_unitario !== 'number' || r.prezzo_unitario < 0) {
            return next(buildValidationError('righe.prezzo_unitario', 'prezzo_unitario deve essere un numero >= 0'));
        }
    }

    next();
}

module.exports = { validateRighe };
