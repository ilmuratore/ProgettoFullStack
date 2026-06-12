const pool = require('../config/db');
const spedizioniModel = require('../models/spedizioniModel');
const utentiModel = require('../models/utentiModel');
const notificheModel = require('../models/notificheModel');

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

module.exports = {
    list,
    getById,
    updateStato
};
