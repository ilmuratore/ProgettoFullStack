const pool = require('../config/db');
const richiesteModel = require('../models/richieste_acquistoModel');
const righeRichiestaModel = require('../models/righe_richiestaModel');
const fornitoriModel = require('../models/fornitoriModel');
const prodottiModel = require('../models/prodottiModel');
const notificheModel = require('../models/notificheModel');

const throwError = (code, message, status = 400) => {
    const err = new Error(message);
    err.code = code;
    err.status = status;
    throw err;
};

const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

const assertRigheValide = (righe) => {
    if (righe === undefined || righe === null) return;

    if (!Array.isArray(righe)) {
        throwError('VALIDATION_ERROR', 'righe deve essere un array', 400);
    }

    if (righe.length === 0) {
        throwError('VALIDATION_ERROR', 'righe non puo essere un array vuoto', 400);
    }

    for (const [index, riga] of righe.entries()) {
        if (!isPositiveInteger(riga?.prodotto_id)) {
            throwError('VALIDATION_ERROR', `righe[${index}].prodotto_id deve essere un intero positivo`, 400);
        }

        if (!isPositiveInteger(riga?.quantita_richiesta)) {
            throwError('VALIDATION_ERROR', `righe[${index}].quantita_richiesta deve essere un intero positivo`, 400);
        }
    }
};

const getAll = async (filters = {}) => {
    if (filters.stato) { const r = await richiesteModel.findByStato(filters.stato); return r.rows; }
    if (filters.fornitore_id) { const r = await richiesteModel.findByFornitoreId(filters.fornitore_id); return r.rows; }
    if (filters.utente_id) { const r = await richiesteModel.findByUtenteId(filters.utente_id); return r.rows; }
    const r = await pool.query(
        `SELECT ra.id, ra.fornitore_id, f.ragione_sociale AS fornitore_nome,
                ra.stato, ra.data_richiesta, ra.note, ra.utente_id, ra.created_at, ra.updated_at
         FROM richieste_acquisto ra JOIN fornitori f ON f.id = ra.fornitore_id
         ORDER BY ra.data_richiesta DESC`
    );
    return r.rows;
};

const getById = async (id) => {
    const r = await richiesteModel.findById(id);
    if (r.rowCount === 0) throwError('RESOURCE_NOT_FOUND', 'Richiesta acquisto non trovata', 404);
    return r.rows[0];
};

const create = async (data, utente_id) => {
    const { fornitore_id, note, righe } = data;
    assertRigheValide(righe);

    const fResult = await fornitoriModel.findById(fornitore_id);
    if (!fResult || fResult.rowCount === 0) throwError('RESOURCE_NOT_FOUND', 'Fornitore non trovato', 404);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const rResult = await richiesteModel.create({ fornitore_id, note, utente_id }, client);
        const richiesta = rResult.rows[0];

        if (Array.isArray(righe) && righe.length > 0) {
            for (const riga of righe) {
                const pResult = await prodottiModel.findById(riga.prodotto_id);
                if (!pResult || pResult.rowCount === 0) {
                    throwError('RESOURCE_NOT_FOUND', `Prodotto ${riga.prodotto_id} non trovato`, 404);
                }
            }

            await righeRichiestaModel.createBulk(richiesta.id, righe, client);
        }

        await client.query('COMMIT');
        return getById(richiesta.id);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally { client.release(); }
};

const createNotificaEsitoRichiesta = async ({ richiesta, nuovoStato, client }) => {
    if (!['ACCETTATA', 'RIFIUTATA'].includes(nuovoStato) || !richiesta.utente_id) {
        return;
    }

    const tipo = nuovoStato === 'ACCETTATA'
        ? notificheModel.TIPI.RICHIESTA_ACCETTATA
        : notificheModel.TIPI.RICHIESTA_RIFIUTATA;

    const esito = nuovoStato === 'ACCETTATA' ? 'accettata' : 'rifiutata';

    await notificheModel.create({
        utente_id: richiesta.utente_id,
        tipo,
        messaggio: `La richiesta di acquisto #${richiesta.id} e stata ${esito}.`,
        riferimento_tipo: 'richiesta_acquisto',
        riferimento_id: Number(richiesta.id)
    }, client);
};

const updateStato = async (id, stato) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const locked = await richiesteModel.findByIdForUpdate(id, client);
        if (locked.rowCount === 0) throwError('RESOURCE_NOT_FOUND', 'Richiesta acquisto non trovata', 404);

        const richiesta = locked.rows[0];
        const ammesse = richiesteModel.TRANSIZIONI_AMMESSE[richiesta.stato] || [];
        if (!ammesse.includes(stato)) {
            throwError('INVALID_TRANSITION', `Transizione ${richiesta.stato} → ${stato} non ammessa`, 409);
        }

        const r = await richiesteModel.updateStato(id, stato, client);
        const richiestaAggiornata = r.rows[0];

        await createNotificaEsitoRichiesta({ richiesta, nuovoStato: stato, client });

        await client.query('COMMIT');
        return richiestaAggiornata;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const updateNote = async (id, note) => {
    const richiesta = await getById(id);
    if (richiesta.stato !== 'BOZZA') throwError('INVALID_STATE', 'Note modificabili solo in stato BOZZA', 409);
    const r = await richiesteModel.updateNote(id, note);
    return r.rows[0];
};

const remove = async (id) => {
    const richiesta = await getById(id);
    if (richiesta.stato !== 'BOZZA') throwError('INVALID_STATE', 'Eliminazione consentita solo in stato BOZZA', 409);
    await richiesteModel.remove(id);
};

const addRiga = async (richiesta_id, data) => {
    const richiesta = await getById(richiesta_id);
    if (richiesta.stato !== 'BOZZA') throwError('INVALID_STATE', 'Righe modificabili solo in stato BOZZA', 409);
    const pResult = await prodottiModel.findById(data.prodotto_id);
    if (!pResult || pResult.rowCount === 0) throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato', 404);
    const r = await righeRichiestaModel.create({ richiesta_id, ...data });
    return r.rows[0];
};

const updateRiga = async (richiesta_id, riga_id, quantita_richiesta) => {
    const richiesta = await getById(richiesta_id);
    if (richiesta.stato !== 'BOZZA') throwError('INVALID_STATE', 'Righe modificabili solo in stato BOZZA', 409);
    const rigaRes = await righeRichiestaModel.findById(riga_id);
    if (rigaRes.rowCount === 0 || rigaRes.rows[0].richiesta_id !== parseInt(richiesta_id)) {
        throwError('RESOURCE_NOT_FOUND', 'Riga non trovata', 404);
    }
    const r = await righeRichiestaModel.updateQuantita(riga_id, quantita_richiesta);
    return r.rows[0];
};

const removeRiga = async (richiesta_id, riga_id) => {
    const richiesta = await getById(richiesta_id);
    if (richiesta.stato !== 'BOZZA') throwError('INVALID_STATE', 'Righe modificabili solo in stato BOZZA', 409);
    const rigaRes = await righeRichiestaModel.findById(riga_id);
    if (rigaRes.rowCount === 0 || rigaRes.rows[0].richiesta_id !== parseInt(richiesta_id)) {
        throwError('RESOURCE_NOT_FOUND', 'Riga non trovata', 404);
    }
    await righeRichiestaModel.remove(riga_id);
};

module.exports = { getAll, getById, create, updateStato, updateNote, remove, addRiga, updateRiga, removeRiga };
