const spedizioniModel = require('../models/spedizioniModel');
const destinazioniClientiModel = require('../models/destinazioniclientiModel');
const clientiModel = require('../models/clientiModel');

const getAll = async () => {
    const result = await spedizioniModel.findAll();
    return result.rows;
};

const getById = async (id) => {
    const result = await spedizioniModel.findById(id);
    if (result.rowCount === 0) {
        throw {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Spedizione non trovata',
            status: 404
        };
    }
    return result.rows[0];
};

const create = async (data) => {
    const {
        ordine_id,
        cliente_id,
        destinazione_id,
        corriere_id,
        stato,
        tracking_number
    } = data;

    // Verifica cliente
    const cliente = await clientiModel.findById(cliente_id);
    if (cliente.rowCount === 0) {
        throw {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Cliente non trovato',
            status: 404
        };
    }

    // Verifica destinazione
    const dest = await destinazioniClientiModel.findById(destinazione_id);
    if (dest.rowCount === 0) {
        throw {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Destinazione non trovata',
            status: 404
        };
    }

    const d = dest.rows[0];

    // Costruzione snapshot JSON
    const indirizzoSnapshot = JSON.stringify({
        etichetta: d.etichetta,
        indirizzo: d.indirizzo,
        cap: d.cap,
        citta: d.citta,
        provincia: d.provincia,
        paese: d.paese
    });

    // Creazione spedizione
    const result = await spedizioniModel.create({
        ordine_id,
        cliente_id,
        destinazione_id,
        corriere_id,
        stato,
        tracking_number,
        indirizzo_snapshot: indirizzoSnapshot
    });

    return result.rows[0];
};

module.exports = {
    getAll,
    getById,
    create
};
