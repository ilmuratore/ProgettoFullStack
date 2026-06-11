const notificheModel = require('../models/notificheModel');

const throwError = (code, message, status) => {
    const err = new Error(message);
    err.code = code;
    if (status) err.status = status;
    throw err;
};

const listByUtente = async (utente_id) => {
    const result = await notificheModel.findByUtenteId(utente_id);
    return result.rows;
};

const listNonLetteByUtente = async (utente_id) => {
    const result = await notificheModel.findNonLette(utente_id);
    return result.rows;
};

const countNonLetteByUtente = async (utente_id) => {
    const result = await notificheModel.countNonLette(utente_id);
    return { count: Number(result.rows[0]?.count ?? 0) };
};

const getById = async (id, utente_id) => {
    const result = await notificheModel.findById(id);
    if (result.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Notifica non trovata', 404);
    }
    if (result.rows[0].utente_id !== Number(utente_id)) {
        throwError('ACCESS_DENIED', 'Accesso negato', 403);
    }
    return result.rows[0];
};

const markAsRead = async (id, utente_id) => {
    await getById(id, utente_id);
    const result = await notificheModel.markAsRead(id);
    return result.rows[0];
};

const markAllAsRead = async (utente_id) => {
    const result = await notificheModel.markAllAsRead(utente_id);
    return result.rows;
};

module.exports = {
    listByUtente,
    listNonLetteByUtente,
    countNonLetteByUtente,
    getById,
    markAsRead,
    markAllAsRead
};
