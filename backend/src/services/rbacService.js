const ruoliPermessiModel = require('../models/ruoli_permessiModel');

const checkPermesso = async (ruolo_id, codice_permesso) => {
    const result = await ruoliPermessiModel.hasPermesso(ruolo_id, codice_permesso);
    return result.rowCount > 0;
};

module.exports = { checkPermesso };
