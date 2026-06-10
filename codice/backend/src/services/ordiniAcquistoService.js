const pool = require('../config/db');
const ordiniAcquistoModel = require('../models/ordini_acquistoModel');
const righePoModel = require('../models/righe_poModel');
const ricezioniModel = require('../models/ricezioniModel');
const righeRicezioneModel = require('../models/righe_ricezioneModel');
const movimentiStockService = require('./movimenti_stockService');

const VALID_STATES = [
    'BOZZA',
    'INVIATO',
    'CONFERMATO',
    'IN_RICEZIONE',
    'COMPLETATO',
    'ANNULLATO',
];

const assertState = (s) => {
    if (!VALID_STATES.includes(s)) {
        const err = new Error('Stato ordine acquisto non valido');
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
};

const canTransition = (from, to) => {
    if (from === to) return true;
    switch (from) {
        case 'BOZZA': return to === 'INVIATO' || to === 'ANNULLATO';
        case 'INVIATO': return to === 'CONFERMATO' || to === 'ANNULLATO';
        case 'CONFERMATO': return to === 'IN_RICEZIONE' || to === 'ANNULLATO';
        case 'IN_RICEZIONE': return to === 'COMPLETATO' || to === 'ANNULLATO';
        default: return false;
    }
};

const getAll = async (filters = {}) => {
    const { stato, fornitore_id } = filters;
    if (stato) assertState(stato);

    if (stato && fornitore_id) {
        const byState = await ordiniAcquistoModel.findByStato(stato);
        return { rows: byState.rows.filter(r => r.fornitore_id === Number(fornitore_id)) };
    }

    if (stato) return ordiniAcquistoModel.findByStato(stato);
    if (fornitore_id) return ordiniAcquistoModel.findByFornitoreId(fornitore_id);

    return ordiniAcquistoModel.findAll();
};

const getOrdineAcquistoById = async (id) => {
    const dettaglio = await ordiniAcquistoModel.findDettaglioCompleto(id);
    if (!dettaglio.ordine) {
        const err = new Error('Ordine di acquisto non trovato');
        err.code = 'RESOURCE_NOT_FOUND';
        throw err;
    }
    return dettaglio;
};

const createOrdineAcquisto = async (payload) => {
    const { fornitore_id, data_prevista, note, utente_id, righe = [] } = payload;
    if (!fornitore_id || righe.length === 0) {
        const err = new Error('Fornitore e almeno una riga sono obbligatori');
        err.code = 'VALIDATION_ERROR';
        throw err;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const importo_totale = righe.reduce((sum, r) =>
            sum + Number(r.quantita_ordinata || 0) * Number(r.prezzo_unitario || 0), 0);

        const ordineRes = await client.query(
            `INSERT INTO ordini_acquisto (fornitore_id, stato, data_prevista, importo_totale, note, utente_id)
       VALUES ($1, 'BOZZA', $2, $3, $4, $5)
       RETURNING *`,
            [fornitore_id, data_prevista, importo_totale, note, utente_id]
        );

        const ordine = ordineRes.rows[0];
        const righeCreated = [];

        for (const r of righe) {
            const rowRes = await client.query(
                `INSERT INTO righe_po (ordine_acquisto_id, prodotto_id, quantita_ordinata, quantita_ricevuta, prezzo_unitario)
         VALUES ($1, $2, $3, 0, $4)
         RETURNING *`,
                [ordine.id, r.prodotto_id, r.quantita_ordinata, r.prezzo_unitario]
            );
            righeCreated.push(rowRes.rows[0]);
        }

        await client.query('COMMIT');
        return { ordine, righe: righeCreated };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const updateOrdineAcquisto = async (id, payload) => {
    const existingRes = await ordiniAcquistoModel.findById(id);
    if (existingRes.rowCount === 0) {
        const err = new Error('Ordine di acquisto non trovato');
        err.code = 'RESOURCE_NOT_FOUND';
        throw err;
    }

    const existing = existingRes.rows[0];
    if (['COMPLETATO', 'ANNULLATO'].includes(existing.stato)) {
        const err = new Error('Ordine non modificabile nello stato corrente');
        err.code = 'STATE_TRANSITION_INVALID';
        throw err;
    }

    const { fornitore_id, data_prevista, importo_totale, note, utente_id } = payload;

    const res = await ordiniAcquistoModel.update(id, {
        fornitore_id,
        data_prevista,
        importo_totale,
        note,
        utente_id,
    });

    return res.rows[0];
};

const updateStatoOrdineAcquisto = async (id, nuovoStato) => {
    assertState(nuovoStato);

    const existingRes = await ordiniAcquistoModel.findById(id);
    if (existingRes.rowCount === 0) {
        const err = new Error('Ordine di acquisto non trovato');
        err.code = 'RESOURCE_NOT_FOUND';
        throw err;
    }

    const existing = existingRes.rows[0];
    if (!canTransition(existing.stato, nuovoStato)) {
        const err = new Error('Transizione di stato non valida');
        err.code = 'STATE_TRANSITION_INVALID';
        throw err;
    }

    const res = await ordiniAcquistoModel.updateStato(id, nuovoStato);
    return res.rows[0];
};

const addRigaOrdineAcquisto = async (ordineId, rigaPayload) => {
    const existingRes = await ordiniAcquistoModel.findById(ordineId);
    if (existingRes.rowCount === 0) {
        const err = new Error('Ordine di acquisto non trovato');
        err.code = 'RESOURCE_NOT_FOUND';
        throw err;
    }

    const existing = existingRes.rows[0];
    if (!['BOZZA', 'INVIATO', 'CONFERMATO'].includes(existing.stato)) {
        const err = new Error('Non è possibile aggiungere righe nello stato corrente');
        err.code = 'STATE_TRANSITION_INVALID';
        throw err;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const rowRes = await righePoModel.create({
            ordine_acquisto_id: ordineId,
            prodotto_id: rigaPayload.prodotto_id,
            quantita_ordinata: rigaPayload.quantita_ordinata,
            prezzo_unitario: rigaPayload.prezzo_unitario,
        });

        const righeRes = await righePoModel.findByOrdineAcquistoId(ordineId);
        const importo_totale = righeRes.rows.reduce((sum, r) =>
            sum + Number(r.quantita_ordinata || 0) * Number(r.prezzo_unitario || 0), 0);

        await ordiniAcquistoModel.update(ordineId, { importo_totale });

        await client.query('COMMIT');
        return rowRes.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const createRicezione = async (payload) => {
    const { ordine_acquisto_id, data_ricezione, note, utente_id, righe = [] } = payload;

    if (!ordine_acquisto_id || righe.length === 0) {
        const err = new Error('Ordine e almeno una riga ricezione sono obbligatori');
        err.code = 'VALIDATION_ERROR';
        throw err;
    }

    const ordineRes = await ordiniAcquistoModel.findById(ordine_acquisto_id);
    if (ordineRes.rowCount === 0) {
        const err = new Error('Ordine di acquisto non trovato');
        err.code = 'RESOURCE_NOT_FOUND';
        throw err;
    }

    const ordine = ordineRes.rows[0];
    if (!['CONFERMATO', 'IN_RICEZIONE'].includes(ordine.stato)) {
        const err = new Error('Ricezione non consentita nello stato corrente');
        err.code = 'STATE_TRANSITION_INVALID';
        throw err;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const ricezioneRes = await ricezioniModel.create({
            ordine_acquisto_id,
            data_ricezione,
            note,
            utente_id,
        });

        const ricezione = ricezioneRes.rows[0];

        for (const r of righe) {
            await righeRicezioneModel.create({
                ricezione_id: ricezione.id,
                prodotto_id: r.prodotto_id,
                quantita_ricevuta: r.quantita_ricevuta,
                ubicazione_id: r.ubicazione_id,
            });

            const righePo = await righePoModel.findByOrdineAcquistoId(ordine_acquisto_id);
            const target = righePo.rows.find(x => x.prodotto_id === r.prodotto_id);

            if (!target) {
                const err = new Error('Riga ordine non trovata per il prodotto indicato');
                err.code = 'VALIDATION_ERROR';
                throw err;
            }

            const nuovaQuantita = Number(target.quantita_ricevuta || 0) + Number(r.quantita_ricevuta || 0);
            if (nuovaQuantita > Number(target.quantita_ordinata)) {
                const err = new Error('Quantità ricevuta superiore alla quantità ordinata');
                err.code = 'STATE_TRANSITION_INVALID';
                throw err;
            }

            await righePoModel.updateQuantitaRicevuta(target.id, r.quantita_ricevuta);

            await movimentiStockService.create({
                prodotto_id: r.prodotto_id,
                ubicazione_id: r.ubicazione_id,
                quantita: r.quantita_ricevuta,
                movimento_tipo: 'CARICO_ACQUISTO',
                riferimento: `ordine_acquisto:${ordine_acquisto_id}`,
                note: note || null
            }, client);
        }

        const righePoFinal = await righePoModel.findByOrdineAcquistoId(ordine_acquisto_id);
        const tutteCompletate = righePoFinal.rows.every(
            r => Number(r.quantita_ricevuta || 0) >= Number(r.quantita_ordinata || 0)
        );

        const nuovoStato = tutteCompletate ? 'COMPLETATO' : 'IN_RICEZIONE';
        await ordiniAcquistoModel.updateStato(ordine_acquisto_id, nuovoStato);

        await client.query('COMMIT');

        const righeRicezioneRes = await righeRicezioneModel.findByRicezioneId(ricezione.id);

        return {
            ricezione,
            righe: righeRicezioneRes.rows,
            nuovoStatoOrdine: nuovoStato,
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const listRicezioniByOrdine = async (ordine_acquisto_id) => {
    const ricezioniRes = await ricezioniModel.findByOrdineAcquistoId(ordine_acquisto_id);
    const ricezioni = await Promise.all(
        ricezioniRes.rows.map(async (r) => {
            const righeRes = await righeRicezioneModel.findByRicezioneId(r.id);
            return { ...r, righe: righeRes.rows };
        })
    );
    return ricezioni;
};

module.exports = {
    getAll,
    getOrdineAcquistoById,
    createOrdineAcquisto,
    updateOrdineAcquisto,
    updateStatoOrdineAcquisto,
    addRigaOrdineAcquisto,
    createRicezione,
    listRicezioniByOrdine,
};