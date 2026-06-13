const pool = require('../config/db');
const ordiniAcquistoModel = require('../models/ordini_acquistoModel');
const righePoModel = require('../models/righe_poModel');
const righeRicezioneModel = require('../models/righe_ricezioneModel');
const ricezioniModel = require('../models/ricezioniModel');
const movimentiStockService = require('./movimenti_stockService');
const prodottiModel = require('../models/prodottiModel');
const notificheModel = require('../models/notificheModel');
const utentiModel = require('../models/utentiModel');
const aziendaSettingsModel = require('../models/aziendaSettingsModel');

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const getTodayDateString = () => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}).format(new Date());

const normalizeDateOnly = (value) => {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        const isoMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
        if (isoMatch) {
            return isoMatch[1];
        }
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const addDaysToDateOnly = (dateOnly, days) => {
    const date = new Date(`${dateOnly}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return normalizeDateOnly(date);
};

const STATI_VALIDI = ['BOZZA', 'INVIATO', 'CONFERMATO', 'IN_RICEZIONE', 'COMPLETATO', 'ANNULLATO'];
const PERMESSI_NOTIFICA_PO_IN_RITARDO = ['acquisti:read', 'notifiche:read'];
const STATI_NOTIFICA_PO_IN_RITARDO = ['INVIATO', 'CONFERMATO', 'IN_RICEZIONE'];

const canTransitionStato = (from, to) => {
    switch (from) {
        case 'BOZZA': return to === 'INVIATO' || to === 'ANNULLATO';
        case 'INVIATO': return to === 'CONFERMATO' || to === 'ANNULLATO';
        case 'CONFERMATO': return to === 'IN_RICEZIONE' || to === 'ANNULLATO';
        case 'IN_RICEZIONE': return false;
        case 'COMPLETATO': return false;
        case 'ANNULLATO': return false;
        default: return false;
    }
};

const createNotificaCambioEsitoOrdineAcquisto = async ({ ordine, nuovoStato, client }) => {
    if (ordine.utente_id == null || ordine.stato !== 'INVIATO') {
        return;
    }

    let tipo;
    let messaggio;

    if (nuovoStato === 'CONFERMATO') {
        tipo = notificheModel.TIPI.RICHIESTA_ACCETTATA;
        messaggio = `Ordine di acquisto #${ordine.id} per ${ordine.fornitore} accettato.`;
    } else if (nuovoStato === 'ANNULLATO') {
        tipo = notificheModel.TIPI.RICHIESTA_RIFIUTATA;
        messaggio = `Ordine di acquisto #${ordine.id} per ${ordine.fornitore} rifiutato.`;
    } else {
        return;
    }

    await notificheModel.create({
        utente_id: ordine.utente_id,
        tipo,
        messaggio,
        riferimento_tipo: 'ordine_acquisto',
        riferimento_id: Number(ordine.id)
    }, client);
};

const isOrdineAcquistoInRitardo = (ordine) =>
    Boolean(
        normalizeDateOnly(ordine?.data_prevista) &&
        normalizeDateOnly(ordine.data_prevista) < normalizeDateOnly(getTodayDateString()) &&
        STATI_NOTIFICA_PO_IN_RITARDO.includes(ordine.stato)
    );

const getDestinatariNotificaPoInRitardo = async (ordine, client) => {
    if (ordine.utente_id != null) {
        return [{ id: ordine.utente_id }];
    }

    const destinatariResult = await utentiModel.findAttiviByPermessi(PERMESSI_NOTIFICA_PO_IN_RITARDO, client);
    return destinatariResult.rows;
};

const createNotificaPoInRitardoIfNeeded = async (ordine, client) => {
    if (!isOrdineAcquistoInRitardo(ordine)) {
        return;
    }

    const destinatari = await getDestinatariNotificaPoInRitardo(ordine, client);
    const dataPrevista = normalizeDateOnly(ordine.data_prevista);
    const messaggio = `Ordine di acquisto #${ordine.id} per ${ordine.fornitore} in ritardo. Data prevista ${dataPrevista}.`;

    for (const utente of destinatari) {
        const existing = await notificheModel.findByUtenteTipoRiferimento(
            utente.id,
            notificheModel.TIPI.PO_IN_RITARDO,
            'ordine_acquisto',
            Number(ordine.id),
            client
        );

        if (existing.rowCount > 0) {
            continue;
        }

        await notificheModel.create({
            utente_id: utente.id,
            tipo: notificheModel.TIPI.PO_IN_RITARDO,
            messaggio,
            riferimento_tipo: 'ordine_acquisto',
            riferimento_id: Number(ordine.id)
        }, client);
    }
};

const getAll = async (query) => {
    const { stato, fornitore_id } = query || {};
    const result = await ordiniAcquistoModel.findAllFiltered({ stato, fornitore_id });
    for (const ordine of result.rows) {
        await createNotificaPoInRitardoIfNeeded(ordine);
    }
    return result.rows;
};

const getOrdineAcquistoById = async (id) => {
    const result = await ordiniAcquistoModel.findDettaglioCompleto(id);
    if (!result.ordine) {
        throwError('RESOURCE_NOT_FOUND', 'Ordine di acquisto non trovato');
    }
    await createNotificaPoInRitardoIfNeeded(result.ordine);
    return result;
};

const createOrdineAcquisto = async (data) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { fornitore_id, data_prevista, note, utente_id, righe } = data;

        if (!data_prevista || !String(data_prevista).trim()) {
            throwError('VALIDATION_ERROR', 'Data consegna prevista obbligatoria');
        }
        if (normalizeDateOnly(data_prevista) < normalizeDateOnly(getTodayDateString())) {
            throwError('VALIDATION_ERROR', 'Data consegna prevista non puo essere precedente a oggi');
        }

        if (!righe || righe.length === 0) {
            throwError('VALIDATION_ERROR', 'Un ordine deve contenere almeno una riga');
        }

        const importo_totale = righe.reduce(
            (acc, r) => acc + (Number(r.quantita_ordinata ?? r.quantita) * Number(r.prezzo_unitario)),
            0
        );

        const ordineRes = await ordiniAcquistoModel.create(
            { fornitore_id, data_prevista, importo_totale, note, utente_id },
            client
        );

        const ordine = ordineRes.rows[0];

        for (const r of righe) {
            const prodottoRes = await prodottiModel.findById(r.prodotto_id);
            if (prodottoRes.rowCount === 0) {
                throwError('RESOURCE_NOT_FOUND', `Prodotto ${r.prodotto_id} non trovato`);
            }

            await righePoModel.create({
                ordine_acquisto_id: ordine.id,
                prodotto_id: r.prodotto_id,
                quantita_ordinata: r.quantita_ordinata ?? r.quantita,
                prezzo_unitario: r.prezzo_unitario
            }, client);
        }

        const ordineCompletoRes = await ordiniAcquistoModel.findById(ordine.id, client);
        await createNotificaPoInRitardoIfNeeded(ordineCompletoRes.rows[0], client);

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
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const ordineRes = await ordiniAcquistoModel.findById(id, client);
        if (ordineRes.rowCount === 0) {
            throwError('RESOURCE_NOT_FOUND', 'Ordine non trovato');
        }

        if (ordineRes.rows[0].stato !== 'BOZZA') {
            throwError('STATE_TRANSITION_INVALID', 'Ordine modificabile solo in stato BOZZA');
        }

        const righeRes = await righePoModel.findByOrdineAcquistoId(id, client);
        const importo_totale = righeRes.rows.reduce(
            (acc, r) => acc + (Number(r.quantita_ordinata) * Number(r.prezzo_unitario)),
            0
        );

        const payload = { ...data };
        delete payload.importo_totale;

        const result = await ordiniAcquistoModel.update(
            id,
            { ...payload, importo_totale },
            client
        );

        const ordineAggiornatoRes = await ordiniAcquistoModel.findById(id, client);
        await createNotificaPoInRitardoIfNeeded(ordineAggiornatoRes.rows[0], client);

        await client.query('COMMIT');
        return result.rows[0];

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const updateStatoOrdineAcquisto = async (id, stato) => {
    if (!STATI_VALIDI.includes(stato)) {
        throwError('VALIDATION_ERROR', 'Stato non valido');
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const ordineRes = await ordiniAcquistoModel.findById(id, client);
        if (ordineRes.rowCount === 0) {
            throwError('RESOURCE_NOT_FOUND', 'Ordine non trovato');
        }

        const ordine = ordineRes.rows[0];
        if (!canTransitionStato(ordine.stato, stato)) {
            throwError('STATE_TRANSITION_INVALID', `Transizione ${ordine.stato} -> ${stato} non consentita`);
        }

        const result = await ordiniAcquistoModel.updateStato(id, stato, client);
        if (result.rowCount === 0) {
            throwError('RESOURCE_NOT_FOUND', 'Ordine non trovato');
        }

        await createNotificaCambioEsitoOrdineAcquisto({
            ordine,
            nuovoStato: stato,
            client
        });

        const ordineAggiornatoRes = await ordiniAcquistoModel.findById(id, client);
        await createNotificaPoInRitardoIfNeeded(ordineAggiornatoRes.rows[0], client);

        await client.query('COMMIT');
        return result.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const addRigaOrdineAcquisto = async (ordineId, data) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { prodotto_id, quantita_ordinata, quantita, prezzo_unitario } = data;

        const ordineCheck = await ordiniAcquistoModel.findById(ordineId, client);
        if (ordineCheck.rowCount === 0) {
            throwError('RESOURCE_NOT_FOUND', 'Ordine non trovato');
        }
        if (ordineCheck.rows[0].stato !== 'BOZZA') {
            throwError('STATE_TRANSITION_INVALID', 'Righe aggiungibili solo su ordini in stato BOZZA');
        }

        const prodottoRes = await prodottiModel.findById(prodotto_id);
        if (prodottoRes.rowCount === 0) {
            throwError('RESOURCE_NOT_FOUND', `Prodotto ${prodotto_id} non trovato`);
        }

        await righePoModel.create({
            ordine_acquisto_id: ordineId,
            prodotto_id,
            quantita_ordinata: quantita_ordinata ?? quantita,
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

        const ricezioneRes = await ricezioniModel.create({
            ordine_acquisto_id,
            data_ricezione,
            note,
            utente_id
        }, client);

        const ricezione = ricezioneRes.rows[0];

        const righePoRes = await righePoModel.findByOrdineAcquistoId(ordine_acquisto_id, client);
        const righePo = righePoRes.rows;

        const mappa = new Map();
        for (const r of righePo) {
            mappa.set(r.prodotto_id, r);
        }

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

const { buildOrdineAcquistoPdf } = require('../pdf/ordiniAcquistoPdf');

const generaPdfOrdineAcquisto = async (id) => {
    const dettaglio = await getOrdineAcquistoById(id);
    const righeRes = await righePoModel.findByOrdineAcquistoId(id);
    const azienda = await aziendaSettingsModel.getActive();
    return buildOrdineAcquistoPdf({ ordine: dettaglio.ordine, righe: righeRes.rows, azienda });
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
    generaPdfOrdineAcquisto
};
