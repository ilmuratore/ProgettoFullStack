const pool = require('../config/db');
const ordiniAcquistoModel = require('../models/ordini_acquistoModel');
const righePoModel = require('../models/righe_poModel');
const righeRicezioneModel = require('../models/righe_ricezioneModel');
const ricezioniModel = require('../models/ricezioniModel');
const movimentiStockService = require('./movimenti_stockService');

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};


const getAll = async (query) => {
    const result = await ordiniAcquistoModel.findAll();
    return result;
};


const getOrdineAcquistoById = async (id) => {
    const result = await ordiniAcquistoModel.findDettaglioCompleto(id);
    if (!result.ordine) {
        throwError('RESOURCE_NOT_FOUND', 'Ordine di acquisto non trovato');
    }
    return result;
};


const createOrdineAcquisto = async (data) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { fornitore_id, data_prevista, note, utente_id, righe } = data;

        if (!righe || righe.length === 0) {
            throwError('VALIDATION_ERROR', 'Un ordine deve contenere almeno una riga');
        }

        // Calcolo importo totale
        const importo_totale = righe.reduce(
            (acc, r) => acc + (Number(r.quantita) * Number(r.prezzo_unitario)),
            0
        );

        const ordineRes = await ordiniAcquistoModel.create(
            { fornitore_id, data_prevista, importo_totale, note, utente_id },
            client
        );

        const ordine = ordineRes.rows[0];

        for (const r of righe) {
            await righePoModel.create({
                ordine_acquisto_id: ordine.id,
                prodotto_id: r.prodotto_id,
                quantita_ordinata: r.quantita,
                prezzo_unitario: r.prezzo_unitario
            }, client);
        }

        await client.query('COMMIT');
        return ordine;

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};


const updateOrdineAcquisto = async (id, data) => {
    const result = await ordiniAcquistoModel.update(id, data);
    if (result.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ordine non trovato');
    }
    return result.rows[0];
};


const updateStatoOrdineAcquisto = async (id, stato) => {
    const result = await ordiniAcquistoModel.updateStato(id, stato);
    if (result.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ordine non trovato');
    }
    return result.rows[0];
};

/* 
 * ADD RIGA ORDINE (fix transazione)
*/
const addRigaOrdineAcquisto = async (ordineId, data) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { prodotto_id, quantita, prezzo_unitario } = data;

        await righePoModel.create({
            ordine_acquisto_id: ordineId,
            prodotto_id,
            quantita_ordinata: quantita,
            prezzo_unitario
        }, client);

        const righeRes = await righePoModel.findByOrdineAcquistoId(ordineId, client);

        const importo_totale = righeRes.rows.reduce(
            (acc, r) => acc + (Number(r.quantita_ordinata) * Number(r.prezzo_unitario)),
            0
        );

        await ordiniAcquistoModel.update(
            ordineId,
            { importo_totale },
            client
        );

        await client.query('COMMIT');
        return { ordine_id: ordineId };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

/* 
 * CREATE RICEZIONE (fix transazione + over-receipt)
 */
const createRicezione = async (payload) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { ordine_acquisto_id, data_ricezione, note, utente_id, righe } = payload;

        const ordineRes = await ordiniAcquistoModel.findById(ordine_acquisto_id, client);
        if (ordineRes.rowCount === 0) {
            throwError('RESOURCE_NOT_FOUND', 'Ordine non trovato');
        }

        const ordine = ordineRes.rows[0];

        if (!['CONFERMATO', 'IN_RICEZIONE'].includes(ordine.stato)) {
            throwError('STATE_TRANSITION_INVALID', 'Ordine non in stato valido per ricezione');
        }

        // CREA RICEZIONE
        const ricezioneRes = await ricezioniModel.create({
            ordine_acquisto_id,
            data_ricezione,
            note,
            utente_id
        }, client);

        const ricezione = ricezioneRes.rows[0];

        // LEGGI RIGHE PO UNA SOLA VOLTA
        const righePoRes = await righePoModel.findByOrdineAcquistoId(ordine_acquisto_id, client);
        const righePo = righePoRes.rows;

        // CREA MAPPA prodotto → riga_po
        const mappa = new Map();
        for (const r of righePo) {
            mappa.set(r.prodotto_id, r);
        }

        // PROCESSA RIGHE RICEZIONE
        for (const r of righe) {

            await righeRicezioneModel.create({
                ricezione_id: ricezione.id,
                prodotto_id: r.prodotto_id,
                quantita_ricevuta: r.quantita_ricevuta,
                ubicazione_id: r.ubicazione_id
            }, client);

            const target = mappa.get(r.prodotto_id);
            if (!target) {
                throwError('VALIDATION_ERROR', 'Riga ordine non trovata per il prodotto indicato');
            }

            const nuovaQuantita = Number(target.quantita_ricevuta) + Number(r.quantita_ricevuta);
            if (nuovaQuantita > Number(target.quantita_ordinata)) {
                throwError('STATE_TRANSITION_INVALID', 'Quantità ricevuta superiore all’ordinato');
            }

            target.quantita_ricevuta = nuovaQuantita;

            await righePoModel.updateQuantitaRicevuta(
                target.id,
                r.quantita_ricevuta,
                client
            );

            await movimentiStockService.create({
                prodotto_id: r.prodotto_id,
                ubicazione_id: r.ubicazione_id,
                quantita: r.quantita_ricevuta,
                movimento_tipo: 'CARICO_ACQUISTO',
                riferimento: `ordine_acquisto:${ordine_acquisto_id}`,
                note: note || null
            }, client);
        }

        // RICALCOLA STATO ORDINE
        const righePoFinal = await righePoModel.findByOrdineAcquistoId(ordine_acquisto_id, client);

        const tutteCompletate = righePoFinal.rows.every(
            r => Number(r.quantita_ricevuta) >= Number(r.quantita_ordinata)
        );

        const nuovoStato = tutteCompletate ? 'COMPLETATO' : 'IN_RICEZIONE';

        await ordiniAcquistoModel.updateStato(
            ordine_acquisto_id,
            nuovoStato,
            client
        );

        await client.query('COMMIT');
        return ricezione;

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};


const listRicezioniByOrdine = async (ordineId) => {
    const res = await ricezioniModel.findByOrdineAcquistoId(ordineId);
    return res.rows;
};

module.exports = {
    getAll,
    getOrdineAcquistoById,
    createOrdineAcquisto,
    updateOrdineAcquisto,
    updateStatoOrdineAcquisto,
    addRigaOrdineAcquisto,
    createRicezione,
    listRicezioniByOrdine
};
