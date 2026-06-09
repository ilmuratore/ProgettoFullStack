const bcrypt = require('bcryptjs');
const utentiModel = require('../models/utentiModel');

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const resetPassword = async (id, password_nuova) => {
    const result = await utentiModel.findById(id);
    if (result.rowCount === 0 || !result.rows[0].attivo) {
        throwError('RESOURCE_NOT_FOUND', 'Utente non trovato');
    }

    const nuovoHash = await bcrypt.hash(password_nuova, 12);
    await utentiModel.updatePassword(id, nuovoHash);
};

module.exports = { resetPassword };
