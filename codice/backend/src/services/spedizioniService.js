const pool = require('../config/db');
const spedizioniModel = require('../models/spedizioniModel');
const utentiModel = require('../models/utentiModel');
const notificheModel = require('../models/notificheModel');
const ordiniModel = require('../models/ordiniModel');
const clientiModel = require('../models/clientiModel');
const destinazioniModel = require('../models/destinazioneclientiModel');
const corrieriModel = require('../models/corrieriModel');

const STATI_VALIDI = ['IN_PREPARAZIONE', 'SPEDITA', 'CONSEGNATA', 'PROBLEMA'];
const PERMESSI_NOTIFICA_SPEDIZIONE = ['spedizioni:read', 'notifiche:read'];

const throwError = (code, message, status) => {
    const err = new Error(message);
    err.code = code;
    if (status) err.status = status;
    throw err;
};

const canTransitionStato = (from, to) => {
    if (from === to) return true;
    if (to === 'PROBLEMA') return true;

    switch (from) {
        case 'IN_PREPARAZIONE': return to === 'SPEDITA';
        case 'SPEDITA': return to === 'CONSEGNATA';
        default: return false;
    }
};

const list = async () => {
    const result = await spedizioniModel.findAll();
    return result.rows;
};

const getById = async (id) => {
    const result = await spedizioniModel.findById(id);
    if (result.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Spedizione non trovata', 404);
    }
    return result.rows[0];
};

const create = async ({ ordine_id, cliente_id, destinazione_id, corriere_id, tracking_number }) => {
    const ordineRes = await ordiniModel.findById(ordine_id);
    if (ordineRes.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ordine non trovato', 404);
    }

    const ordine = ordineRes.rows[0];
    if (Number(ordine.cliente_id) !== Number(cliente_id)) {
        throwError('VALIDATION_ERROR', 'Il cliente non corrisponde all ordine indicato', 400);
    }
    if (Number(ordine.destinazione_id) !== Number(destinazione_id)) {
        throwError('VALIDATION_ERROR', 'La destinazione non corrisponde all ordine indicato', 400);
    }

    const clienteRes = await clientiModel.findById(cliente_id);
    if (clienteRes.rowCount === 0 || clienteRes.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Cliente non trovato', 404);
    }

    const destinazioneRes = await destinazioniModel.findById(destinazione_id);
    if (destinazioneRes.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Destinazione non trovata', 404);
    }
    if (Number(destinazioneRes.rows[0].cliente_id) !== Number(cliente_id)) {
        throwError('VALIDATION_ERROR', 'La destinazione non appartiene al cliente indicato', 400);
    }

    if (corriere_id !== undefined && corriere_id !== null) {
        const corriereRes = await corrieriModel.findById(corriere_id);
        if (corriereRes.rowCount === 0 || corriereRes.rows[0].attivo === false) {
            throwError('RESOURCE_NOT_FOUND', 'Corriere non trovato', 404);
        }
    }

    const existingSpedizioniRes = await spedizioniModel.findByOrdineId(ordine_id);
    if (existingSpedizioniRes.rowCount > 0) {
        throwError('DUPLICATE_ENTRY', 'Esiste gia una spedizione per questo ordine', 409);
    }

    const result = await spedizioniModel.create({
        ordine_id,
        cliente_id,
        destinazione_id,
        corriere_id: corriere_id ?? null,
        tracking_number: tracking_number ?? null
    });

    return result.rows[0];
};

const updateStato = async (id, stato) => {
    if (!STATI_VALIDI.includes(stato)) {
        throwError('VALIDATION_ERROR', `Stato non valido. Valori ammessi: ${STATI_VALIDI.join(', ')}`, 400);
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const spedizioneResult = await spedizioniModel.findById(id);
        if (spedizioneResult.rowCount === 0) {
            throwError('RESOURCE_NOT_FOUND', 'Spedizione non trovata', 404);
        }

        const spedizione = spedizioneResult.rows[0];

        if (!canTransitionStato(spedizione.stato, stato)) {
            throwError('STATE_TRANSITION_INVALID', `Transizione ${spedizione.stato} -> ${stato} non consentita`, 400);
        }

        const updateResult = await spedizioniModel.updateStato(id, stato, client);
        const spedizioneAggiornata = { ...spedizione, ...updateResult.rows[0] };

        if (spedizione.stato !== stato) {
            const destinatariResult = await utentiModel.findAttiviByPermessi(PERMESSI_NOTIFICA_SPEDIZIONE, client);
            const tracking = spedizione.tracking_number ? ` Tracking: ${spedizione.tracking_number}.` : '';
            const messaggio = `Spedizione #${spedizione.id} ordine #${spedizione.ordine_id} per ${spedizione.cliente} aggiornata a ${stato}.${tracking}`;

            for (const utente of destinatariResult.rows) {
                await notificheModel.create({
                    utente_id: utente.id,
                    tipo: notificheModel.TIPI.CAMBIO_STATO_SPEDIZIONE,
                    messaggio,
                    riferimento_tipo: 'spedizione',
                    riferimento_id: Number(spedizione.id)
                }, client);
            }
        }

        await client.query('COMMIT');
        return spedizioneAggiornata;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const ddtModel = require('../models/ddtModel');
const { buildDdtPdf } = require('../pdf/ddtPdf');

const updateTracking = async (id, tracking_number) => {
    await getById(id);
    const r = await spedizioniModel.updateTrackingNumber(id, tracking_number);
    return r.rows[0];
};

const getDdt = async (spedizione_id) => {
    await getById(spedizione_id);
    const r = await ddtModel.findBySpedizioneId(spedizione_id);
    return r.rows[0] || null;
};

const createDdt = async (spedizione_id, data) => {
    await getById(spedizione_id);
    const existing = await ddtModel.findBySpedizioneId(spedizione_id);
    if (existing.rowCount > 0) throwError('DUPLICATE_ENTRY', 'DDT già esistente per questa spedizione', 409);
    const r = await ddtModel.create({ spedizione_id, ...data });
    return r.rows[0];
};

const updateDdt = async (spedizione_id, data) => {
    await getById(spedizione_id);
    const existing = await ddtModel.findBySpedizioneId(spedizione_id);
    if (existing.rowCount === 0) throwError('RESOURCE_NOT_FOUND', 'DDT non trovato', 404);
    const r = await ddtModel.update(existing.rows[0].id, data);
    return r.rows[0];
};

const generaPdfDdt = async (spedizione_id) => {
    const spedizione = await getById(spedizione_id);
    const ddtResult = await ddtModel.findBySpedizioneId(spedizione_id);
    if (ddtResult.rowCount === 0) throwError('RESOURCE_NOT_FOUND', 'DDT non trovato per questa spedizione', 404);
    const ddt = ddtResult.rows[0];
    const righeResult = await pool.query(
        `SELECT ro.prodotto_id, p.sku, p.nome AS prodotto, ro.quantita, NULL AS note
         FROM ordini o
         JOIN righe_ordine ro ON ro.ordine_id = o.id
         JOIN prodotti p ON p.id = ro.prodotto_id
         WHERE o.id = $1 ORDER BY ro.id`,
        [spedizione.ordine_id]
    );
    return buildDdtPdf({ ddt, spedizione, righe: righeResult.rows });
};

module.exports = {
    list,
    getById,
    create,
    updateStato,
    updateTracking,
    getDdt,
    createDdt,
    updateDdt,
    generaPdfDdt
};
