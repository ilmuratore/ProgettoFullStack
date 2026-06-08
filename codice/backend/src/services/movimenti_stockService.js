const movimentiStockModel = require('../models/movimenti_stockModel');
const giacenzeModel = require('../models/giacenzeModel');
const prodottiModel = require('../models/prodottiModel');
const ubicazioniModel = require('../models/ubicazioniModel');
const pool = require('../config/db');


const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const getAll = async () => {
    const result = await movimentiStockModel.findAll();
    return result.rows;
};

const getById = async (id) => {
    const result = await movimentiStockModel.findById(id);

    if (result.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Movimento stock non trovato');
    }

    return result.rows[0];
};

const getByProdottoId = async (prodotto_id) => {
    const prodottoResult = await prodottiModel.findById(prodotto_id);

    if (prodottoResult.rowCount === 0 || prodottoResult.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato');
    }

    const result = await movimentiStockModel.findByProdottoId(prodotto_id);
    return result.rows;
};

const getByUbicazioneId = async (ubicazione_id) => {
    const ubicazioneResult = await ubicazioniModel.findById(ubicazione_id);

    if (ubicazioneResult.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ubicazione non trovata');
    }

    const result = await movimentiStockModel.findByUbicazioneId(ubicazione_id);
    return result.rows;
};

const getByTipo = async (movimento_tipo) => {
    const result = await movimentiStockModel.findByTipo(movimento_tipo);
    return result.rows;
};

const getByRiferimento = async (riferimento) => {
    const result = await movimentiStockModel.findByRiferimento(riferimento);
    return result.rows;
};

const create = async ({ prodotto_id, ubicazione_id, ubicazione_da_id, ubicazione_a_id, quantita, movimento_tipo, riferimento, note }) => {
    const prodottoResult = await prodottiModel.findById(prodotto_id);
    if (prodottoResult.rowCount === 0 || prodottoResult.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato');
    }

    if (quantita === undefined || quantita <= 0) {
        throwError('VALIDATION_ERROR', 'La quantita deve essere maggiore di zero');
    }

    if (movimento_tipo === 'RETTIFICA_POSITIVA' || movimento_tipo === 'RETTIFICA_NEGATIVA') {
        if (note === undefined || note === null || note.trim() === '') {
            throwError('VALIDATION_ERROR', 'Le note sono obbligatorie per le rettifiche');
        }
    }

    if (movimento_tipo === 'SPOSTAMENTO') {
        if (ubicazione_da_id === undefined || ubicazione_a_id === undefined) {
            throwError('VALIDATION_ERROR', 'Per lo spostamento servono ubicazione_da_id e ubicazione_a_id');
        }

        if (ubicazione_da_id === ubicazione_a_id) {
            throwError('VALIDATION_ERROR', 'Le ubicazioni di partenza e arrivo devono essere diverse');
        }

        const ubicazioneDaResult = await ubicazioniModel.findById(ubicazione_da_id);
        if (ubicazioneDaResult.rowCount === 0) {
            throwError('RESOURCE_NOT_FOUND', 'Ubicazione di partenza non trovata');
        }

        const ubicazioneAResult = await ubicazioniModel.findById(ubicazione_a_id);
        if (ubicazioneAResult.rowCount === 0) {
            throwError('RESOURCE_NOT_FOUND', 'Ubicazione di arrivo non trovata');
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const firstUbicazioneId = ubicazione_da_id < ubicazione_a_id ? ubicazione_da_id : ubicazione_a_id;
            const secondUbicazioneId = ubicazione_da_id < ubicazione_a_id ? ubicazione_a_id : ubicazione_da_id;

            const firstGiacenza = await giacenzeModel.findByProdottoIdAndUbicazioneId(prodotto_id, firstUbicazioneId, client);
            if (firstGiacenza.rowCount > 0) {
                await giacenzeModel.lockByProdottoIdAndUbicazioneId(prodotto_id, firstUbicazioneId, client);
            }

            const secondGiacenza = await giacenzeModel.findByProdottoIdAndUbicazioneId(prodotto_id, secondUbicazioneId, client);
            if (secondGiacenza.rowCount > 0) {
                await giacenzeModel.lockByProdottoIdAndUbicazioneId(prodotto_id, secondUbicazioneId, client);
            }

            const scaricoGiacenzaResult = await giacenzeModel.incrementaQuantita(prodotto_id, ubicazione_da_id, -quantita, client);
            if (scaricoGiacenzaResult.rowCount === 0) {
                throwError('INSUFFICIENT_STOCK', 'Giacenza insufficiente per completare lo spostamento');
            }

            await giacenzeModel.incrementaQuantita(prodotto_id, ubicazione_a_id, quantita, client);

            const scaricoResult = await movimentiStockModel.create({
                prodotto_id,
                ubicazione_id: ubicazione_da_id,
                quantita,
                movimento_tipo,
                riferimento,
                note
            }, client);

            const caricoResult = await movimentiStockModel.create({
                prodotto_id,
                ubicazione_id: ubicazione_a_id,
                quantita,
                movimento_tipo,
                riferimento,
                note
            }, client);

            await client.query('COMMIT');

            return [
                scaricoResult.rows[0],
                caricoResult.rows[0]
            ];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    if (ubicazione_id === undefined) {
        throwError('VALIDATION_ERROR', 'Ubicazione non specificata');
    }

    const ubicazioneResult = await ubicazioniModel.findById(ubicazione_id);
    if (ubicazioneResult.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ubicazione non trovata');
    }

    let delta = quantita;

    if (movimento_tipo === 'SCARICO_VENDITA' || movimento_tipo === 'RETTIFICA_NEGATIVA') {
        delta = -quantita;
    } else if (
        movimento_tipo !== 'CARICO_ACQUISTO' &&
        movimento_tipo !== 'RETTIFICA_POSITIVA' &&
        movimento_tipo !== 'RESO'
    ) {
        throwError('VALIDATION_ERROR', 'Tipo movimento non valido');
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const giacenza = await giacenzeModel.findByProdottoIdAndUbicazioneId(prodotto_id, ubicazione_id, client);
        if (giacenza.rowCount > 0) {
            await giacenzeModel.lockByProdottoIdAndUbicazioneId(prodotto_id, ubicazione_id, client);
        }

        const giacenzaResult = await giacenzeModel.incrementaQuantita(prodotto_id, ubicazione_id, delta, client);
        if (giacenzaResult.rowCount === 0) {
            throwError('INSUFFICIENT_STOCK', 'Giacenza insufficiente per completare il movimento');
        }

        const result = await movimentiStockModel.create({
            prodotto_id,
            ubicazione_id,
            quantita,
            movimento_tipo,
            riferimento,
            note
        }, client);

        await client.query('COMMIT');

        return result.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};


module.exports = {
    getAll,
    getById,
    getByProdottoId,
    getByUbicazioneId,
    getByTipo,
    getByRiferimento,
    create
};
