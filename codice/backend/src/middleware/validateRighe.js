function validateRighe(req, res, next) {
    const righe = req.body.righe;

    // Deve essere un array non vuoto
    if (!Array.isArray(righe) || righe.length === 0) {
        return res.status(400).json({
            status: 'error',
            error: 'Il campo righe è obbligatorio e deve essere un array non vuoto'
        });
    }

    for (const r of righe) {

        // prodotto_id obbligatorio
        if (!r.prodotto_id || typeof r.prodotto_id !== 'number') {
            return res.status(400).json({
                status: 'error',
                error: 'Ogni riga deve contenere un prodotto_id valido'
            });
        }

        // quantità per ordini
        if (r.quantita !== undefined) {
            if (typeof r.quantita !== 'number' || r.quantita <= 0) {
                return res.status(400).json({
                    status: 'error',
                    error: 'quantita deve essere un numero > 0'
                });
            }
        }

        // quantità per ricezioni
        if (r.quantita_ricevuta !== undefined) {
            if (typeof r.quantita_ricevuta !== 'number' || r.quantita_ricevuta <= 0) {
                return res.status(400).json({
                    status: 'error',
                    error: 'quantita_ricevuta deve essere un numero > 0'
                });
            }
        }

        // almeno uno dei due deve esistere
        if (r.quantita === undefined && r.quantita_ricevuta === undefined) {
            return res.status(400).json({
                status: 'error',
                error: 'Ogni riga deve contenere quantita oppure quantita_ricevuta'
            });
        }
    }

    next();
}

module.exports = { validateRighe };
