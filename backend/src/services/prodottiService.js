const prodottiModel = require("../models/prodottiModel");

// ============================================================
// ERROR HELPERS
// ============================================================

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

// ============================================================
// SERVICE
// ============================================================

/**
 * GET ALL — Listino Prezzi (solo attivi)
 */
const getAll = async () => {
    const result = await prodottiModel.findListino();
    return result.rows;
};

/**
 * GET BY ID — dettaglio prodotto (solo attivi)
 */
const getById = async (id) => {
    const result = await prodottiModel.findById(id);

    if (result.rowCount === 0 || result.rows[0].attivo === false) {
        throwError("RESOURCE_NOT_FOUND", "Prodotto non trovato");
    }

    return result.rows[0];
};

/**
 * CREATE — crea nuovo prodotto
 * Regole:
 *  - SKU univoco
 *  - prezzo > 0 (validato anche dal controller/validate)
 */
const create = async (data) => {
    const { sku, prezzo } = data;

    // SKU univoco
    const existing = await prodottiModel.findBySku(sku);
    if (existing.rowCount > 0 && existing.rows[0].attivo === true) {
        throwError("DUPLICATE_ENTRY", "SKU già esistente");
    }

    // Prezzo valido
    if (prezzo <= 0) {
        throwError("VALIDATION_ERROR", "Il prezzo deve essere maggiore di zero");
    }

    const result = await prodottiModel.create(data);
    return result.rows[0];
};

/**
 * UPDATE — PATCH parziale
 * Regole:
 *  - prodotto deve esistere
 *  - SKU univoco (escludendo se stesso)
 *  - almeno un campo valido deve essere presente
 *  - prezzo > 0 se presente
 */
const update = async (id, fields) => {
    // 1) Verifica esistenza prodotto
    const existing = await prodottiModel.findById(id);
    if (existing.rowCount === 0 || existing.rows[0].attivo === false) {
        throwError("RESOURCE_NOT_FOUND", "Prodotto non trovato");
    }

    // 2) Se SKU presente → verifica unicità
    if (fields.sku) {
        const skuCheck = await prodottiModel.findBySku(fields.sku);

        if (
            skuCheck.rowCount > 0 &&
            skuCheck.rows[0].id !== Number(id) &&
            skuCheck.rows[0].attivo === true
        ) {
            throwError("DUPLICATE_ENTRY", "SKU già utilizzato da un altro prodotto");
        }
    }

    // 3) Prezzo valido
    if (fields.prezzo !== undefined && fields.prezzo <= 0) {
        throwError("VALIDATION_ERROR", "Il prezzo deve essere maggiore di zero");
    }

    // 4) Nessun campo valido → errore
    if (Object.keys(fields).length === 0) {
        throwError("VALIDATION_ERROR", "Nessun campo valido da aggiornare");
    }

    // 5) Esegui update
    const result = await prodottiModel.update(id, fields);
    return result.rows[0];
};

/**
 * DELETE — soft delete
 */
const deleteProdotto = async (id) => {
    // Verifica esistenza
    const existing = await prodottiModel.findById(id);
    if (existing.rowCount === 0 || existing.rows[0].attivo === false) {
        throwError("RESOURCE_NOT_FOUND", "Prodotto non trovato");
    }

    await prodottiModel.softDelete(id);
    return;
};

// ============================================================

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteProdotto
};
