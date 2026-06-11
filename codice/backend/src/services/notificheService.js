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

const markAsRead = async (id, utente_id) => {
    const existing = await notificheModel.findById(id);
    if (existing.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Notifica non trovata', 404);
    }
    if (existing.rows[0].utente_id !== Number(utente_id)) {
        throwError('ACCESS_DENIED', 'Accesso negato', 403);
    }
    const result = await notificheModel.markAsRead(id);
    return result.rows[0];
};

const markAllAsRead = async (utente_id) => {
    const result = await notificheModel.markAllAsRead(utente_id);
    return result.rows;
};

module.exports = {
    listByUtente,
    markAsRead,
    markAllAsRead
};
