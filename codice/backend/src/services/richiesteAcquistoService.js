const pool = require('../config/db');
const richiesteModel = require('../models/richieste_acquistoModel');
const righeRichiestaModel = require('../models/righe_richiestaModel');
const fornitoriModel = require('../models/fornitoriModel');
const prodottiModel = require('../models/prodottiModel');

const throwError = (code, message, status = 400) => {
    const err = new Error(message);
    err.code = code;
    err.status = status;
    throw err;
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
    const fResult = await fornitoriModel.findById(fornitore_id);
    if (!fResult || fResult.rowCount === 0) throwError('RESOURCE_NOT_FOUND', 'Fornitore non trovato', 404);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const rResult = await richiesteModel.create({ fornitore_id, note, utente_id });
        const richiesta = rResult.rows[0];
        if (righe && righe.length > 0) {
            for (const riga of righe) {
                const pResult = await prodottiModel.findById(riga.prodotto_id);
                if (!pResult || pResult.rowCount === 0)
                    throwError('RESOURCE_NOT_FOUND', `Prodotto ${riga.prodotto_id} non trovato`, 404);
            }
            await righeRichiestaModel.createBulk(richiesta.id, righe);
        }
        await client.query('COMMIT');
        return getById(richiesta.id);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally { client.release(); }
};

const updateStato = async (id, stato) => {
    const richiesta = await getById(id);
    const ammesse = richiesteModel.TRANSIZIONI_AMMESSE[richiesta.stato] || [];
    if (!ammesse.includes(stato))
        throwError('INVALID_TRANSITION', `Transizione ${richiesta.stato} → ${stato} non ammessa`);
    const r = await richiesteModel.updateStato(id, stato);
    return r.rows[0];
};

const updateNote = async (id, note) => {
    const richiesta = await getById(id);
    if (richiesta.stato !== 'BOZZA') throwError('INVALID_STATE', 'Note modificabili solo in stato BOZZA');
    const r = await richiesteModel.updateNote(id, note);
    return r.rows[0];
};

const remove = async (id) => {
    const richiesta = await getById(id);
    if (richiesta.stato !== 'BOZZA') throwError('INVALID_STATE', 'Eliminazione consentita solo in stato BOZZA');
    await richiesteModel.remove(id);
};

const addRiga = async (richiesta_id, data) => {
    const richiesta = await getById(richiesta_id);
    if (richiesta.stato !== 'BOZZA') throwError('INVALID_STATE', 'Righe modificabili solo in stato BOZZA');
    const pResult = await prodottiModel.findById(data.prodotto_id);
    if (!pResult || pResult.rowCount === 0) throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato', 404);
    const r = await righeRichiestaModel.create({ richiesta_id, ...data });
    return r.rows[0];
};

const updateRiga = async (richiesta_id, riga_id, quantita_richiesta) => {
    const richiesta = await getById(richiesta_id);
    if (richiesta.stato !== 'BOZZA') throwError('INVALID_STATE', 'Righe modificabili solo in stato BOZZA');
    const rigaRes = await righeRichiestaModel.findById(riga_id);
    if (rigaRes.rowCount === 0 || rigaRes.rows[0].richiesta_id !== parseInt(richiesta_id))
        throwError('RESOURCE_NOT_FOUND', 'Riga non trovata', 404);
    const r = await righeRichiestaModel.updateQuantita(riga_id, quantita_richiesta);
    return r.rows[0];
};

const removeRiga = async (richiesta_id, riga_id) => {
    const richiesta = await getById(richiesta_id);
    if (richiesta.stato !== 'BOZZA') throwError('INVALID_STATE', 'Righe modificabili solo in stato BOZZA');
    const rigaRes = await righeRichiestaModel.findById(riga_id);
    if (rigaRes.rowCount === 0 || rigaRes.rows[0].richiesta_id !== parseInt(richiesta_id))
        throwError('RESOURCE_NOT_FOUND', 'Riga non trovata', 404);
    await righeRichiestaModel.remove(riga_id);
};

module.exports = { getAll, getById, create, updateStato, updateNote, remove, addRiga, updateRiga, removeRiga };
