const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const utentiModel = require('../models/utentiModel');
const ruoliModel = require('../models/ruoliModel');

const throwError = (code, message, details) => {
    const err = new Error(message);
    err.code = code;
    if (details) err.details = details;
    throw err;
};

const normalizeUtente = (utente) => ({
    id: utente.id,
    nome: utente.nome,
    cognome: utente.cognome,
    email: utente.email,
    ruolo_id: utente.ruolo_id,
    ruolo: utente.ruolo,
    ruolo_nome: utente.ruolo,
    attivo: utente.attivo,
    dipendente: utente.dipendente_id
        ? {
            id: utente.dipendente_id,
            nome: utente.dipendente_nome,
            cognome: utente.dipendente_cognome,
            codice_fiscale: utente.dipendente_codice_fiscale,
            ruolo_operativo: utente.dipendente_ruolo_operativo,
        }
        : null,
    created_at: utente.created_at,
    updated_at: utente.updated_at,
});

const getAll = async () => {
    const result = await utentiModel.findAll();
    return result.rows.map(normalizeUtente);
};

const getById = async (id) => {
    const result = await utentiModel.findById(id);
    if (result.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Utente non trovato');
    }
    return normalizeUtente(result.rows[0]);
};

const getRuoli = async () => {
    const result = await ruoliModel.findAll();
    return result.rows;
};

const ensureRuoloExists = async (ruoloId) => {
    if (ruoloId === undefined || ruoloId === null) return;
    const ruoloResult = await ruoliModel.findById(ruoloId);
    if (ruoloResult.rowCount === 0) {
        throwError('RUOLO_NON_VALIDO', 'Ruolo non valido');
    }
};

const ensureEmailAvailable = async (email, currentUserId) => {
    if (!email) return;
    const result = await utentiModel.findByEmail(email);
    if (result.rowCount > 0 && Number(result.rows[0].id) !== Number(currentUserId)) {
        throwError('EMAIL_GIA_ESISTENTE', 'Email già esistente');
    }
};

const RUOLI_ADMIN_IDS = [1, 2];

const wouldRemoveLastAdmin = async (targetId, fields, existing) => {
    const eraAdmin = RUOLI_ADMIN_IDS.includes(Number(existing.ruolo_id)) && existing.attivo === true;
    if (!eraAdmin) return false;

    const restaAdmin =
        (fields.ruolo_id === undefined || RUOLI_ADMIN_IDS.includes(Number(fields.ruolo_id))) &&
        (fields.attivo === undefined || fields.attivo === true);
    if (restaAdmin) return false;

    const countRes = await utentiModel.countAdminAttivi(RUOLI_ADMIN_IDS);
    return Number(countRes.rows[0].cnt) <= 1;
};

const update = async (id, fields, attore = null) => {
    const existingRes = await utentiModel.findById(id);
    if (existingRes.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Utente non trovato');
    }
    const existing = existingRes.rows[0];

    if (attore && Number(attore.id) === Number(id)) {
        if (fields.attivo === false) {
            throwError('VALIDATION_ERROR', 'Non puoi disattivare il tuo stesso account');
        }
        if (fields.ruolo_id !== undefined && Number(fields.ruolo_id) !== Number(existing.ruolo_id)) {
            throwError('VALIDATION_ERROR', 'Non puoi modificare il ruolo del tuo stesso account');
        }
    }

    if (await wouldRemoveLastAdmin(id, fields, existing)) {
        throwError('VALIDATION_ERROR', 'Operazione non consentita: deve restare almeno un Admin attivo');
    }

    const allowedKeys = ['nome', 'cognome', 'email', 'ruolo_id', 'attivo', 'dipendente_id'];
    const hasValidField = allowedKeys.some((key) => Object.prototype.hasOwnProperty.call(fields, key));
    if (!hasValidField) {
        throwError('VALIDATION_ERROR', 'Nessun campo valido da aggiornare');
    }

    await ensureRuoloExists(fields.ruolo_id);
    await ensureEmailAvailable(fields.email, id);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await utentiModel.update(id, {
            nome: fields.nome,
            cognome: fields.cognome,
            email: fields.email,
            ruolo_id: fields.ruolo_id,
            attivo: fields.attivo,
        }, client);

        if (Object.prototype.hasOwnProperty.call(fields, 'dipendente_id')) {
            await utentiModel.unlinkDipendenteFromUtente(id, client);

            if (fields.dipendente_id !== null) {
                const dipendenteResult = await utentiModel.findDipendenteById(fields.dipendente_id, client);
                if (dipendenteResult.rowCount === 0) {
                    throwError('RESOURCE_NOT_FOUND', 'Dipendente non trovato');
                }

                const dipendente = dipendenteResult.rows[0];
                if (dipendente.utente_id && Number(dipendente.utente_id) !== Number(id)) {
                    throwError('DUPLICATE_ENTRY', 'Dipendente già associato a un altro utente');
                }

                await utentiModel.assignDipendenteToUtente(fields.dipendente_id, id, client);
            }
        }

        const updated = await utentiModel.findById(id, client);
        await client.query('COMMIT');
        return normalizeUtente(updated.rows[0]);
    } catch (err) {
        try { await client.query('ROLLBACK'); } catch {}
        throw err;
    } finally {
        client.release();
    }
};

const resetPassword = async (id, password_nuova) => {
    const result = await utentiModel.findById(id);
    if (result.rowCount === 0 || !result.rows[0].attivo) {
        throwError('RESOURCE_NOT_FOUND', 'Utente non trovato');
    }

    const nuovoHash = await bcrypt.hash(password_nuova, 12);
    await utentiModel.updatePassword(id, nuovoHash);
};

const deleteUtente = async (id, attore = null) => {
    const result = await utentiModel.findById(id);
    if (result.rowCount === 0 || !result.rows[0].attivo) {
        throwError('RESOURCE_NOT_FOUND', 'Utente non trovato');
    }
    const existing = result.rows[0];

    if (attore && Number(attore.id) === Number(id)) {
        throwError('VALIDATION_ERROR', 'Non puoi eliminare il tuo stesso account');
    }

    if (RUOLI_ADMIN_IDS.includes(Number(existing.ruolo_id))) {
        const countRes = await utentiModel.countAdminAttivi(RUOLI_ADMIN_IDS);
        if (Number(countRes.rows[0].cnt) <= 1) {
            throwError('VALIDATION_ERROR', 'Operazione non consentita: deve restare almeno un Admin attivo');
        }
    }

    await utentiModel.remove(id);
};

module.exports = {
    getAll,
    getById,
    getRuoli,
    update,
    resetPassword,
    deleteUtente,
};
