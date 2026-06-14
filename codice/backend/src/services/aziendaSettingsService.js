const aziendaSettingsModel = require('../models/aziendaSettingsModel');

const SETTINGS_ID = 1;

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const get = async () => {
    const settings = await aziendaSettingsModel.getActive();
    if (!settings) {
        throwError('RESOURCE_NOT_FOUND', 'Impostazioni azienda non configurate');
    }
    return settings;
};

const update = async (fields) => {
    const current = await aziendaSettingsModel.getActive();
    if (!current) {
        throwError('RESOURCE_NOT_FOUND', 'Impostazioni azienda non configurate');
    }
    if (fields.ragione_sociale !== undefined && String(fields.ragione_sociale).trim() === '') {
        throwError('VALIDATION_ERROR', 'La ragione sociale non puo essere vuota');
    }
    const result = await aziendaSettingsModel.update(current.id || SETTINGS_ID, fields);
    return result.rows[0];
};

module.exports = {
    get,
    update,
};
