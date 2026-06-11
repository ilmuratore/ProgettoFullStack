function validateRighe(req, res, next) {
    const righe = req.body.righe;
    const isRicezione = req.originalUrl.includes('/ordini-acquisto/ricezioni');

    if (!Array.isArray(righe) || righe.length === 0) {
        return res.status(400).json({
            status: 'error',
            error: 'Il campo righe è obbligatorio e deve essere un array non vuoto'
        });
    }

    for (const r of righe) {
        if (!r.prodotto_id || typeof r.prodotto_id !== 'number' || r.prodotto_id <= 0) {
            return res.status(400).json({
                status: 'error',
                error: 'Ogni riga deve contenere un prodotto_id valido'
            });
        }

        if (isRicezione) {
            if (typeof r.quantita_ricevuta !== 'number' || r.quantita_ricevuta <= 0) {
                return res.status(400).json({
                    status: 'error',
                    error: 'quantita_ricevuta deve essere un numero > 0'
                });
            }

            if (!r.ubicazione_id || typeof r.ubicazione_id !== 'number' || r.ubicazione_id <= 0) {
                return res.status(400).json({
                    status: 'error',
                    error: 'ubicazione_id deve essere un numero > 0'
                });
            }

            continue;
        }

        if (typeof r.quantita !== 'number' || r.quantita <= 0) {
            return res.status(400).json({
                status: 'error',
                error: 'quantita deve essere un numero > 0'
            });
        }

        if (typeof r.prezzo_unitario !== 'number' || r.prezzo_unitario < 0) {
            return res.status(400).json({
                status: 'error',
                error: 'prezzo_unitario deve essere un numero >= 0'
            });
        }
    }

    next();
}

module.exports = { validateRighe };
