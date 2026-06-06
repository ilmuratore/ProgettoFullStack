const fornitoriModel = require("../models/fornitoriModel");

// ============================================================
// ERROR HELPERS
// ============================================================

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

// ============================================================
// SERVICE — M03: Anagrafiche "I nostri Fornitori"
// ============================================================

/**
 * GET ALL — lista "I nostri Fornitori" (solo attivi).
 * Include il campo source: il frontend lo usa per mostrare/nascondere
 * il pulsante Modifica.
 */
const getAll = async () => {
    const result = await fornitoriModel.findAttivi();
    return result.rows;
};

/**
 * GET BY ID — dettaglio fornitore (solo attivi).
 */
const getById = async (id) => {
    const result = await fornitoriModel.findById(id);

    if (result.rowCount === 0 || result.rows[0].attivo === false) {
        throwError("RESOURCE_NOT_FOUND", "Fornitore non trovato");
    }

    return result.rows[0];
};

/**
 * CREATE — crea nuovo fornitore.
 * source è SEMPRE forzato a 'manual': non viene mai accettato dal body utente.
 */
const create = async ({ ragione_sociale, piva, indirizzo, email, telefono, sito_web, descrizione_aziendale }) => {
    const result = await fornitoriModel.create({
        ragione_sociale,
        piva,
        indirizzo,
        email,
        telefono,
        sito_web,
        descrizione_aziendale,
        source: "manual"
    });

    return result.rows[0];
};

/**
 * UPDATE — PATCH parziale.
 * Regole:
 *  - il fornitore deve esistere ed essere attivo
 *  - se source='ecosystem' → 403 ACCESS_DENIED PRIMA di qualsiasi UPDATE (FA Appendix D7)
 *  - il campo source non è mai modificabile
 *  - almeno un campo valido deve essere presente nel body
 */
const update = async (id, fields) => {
    // 1) Verifica esistenza
    const existing = await fornitoriModel.findById(id);
    if (existing.rowCount === 0 || existing.rows[0].attivo === false) {
        throwError("RESOURCE_NOT_FOUND", "Fornitore non trovato");
    }

    // 2) Protezione backend reale: i fornitori ecosistema non sono modificabili.
    //    Nascondere il pulsante nel frontend è solo cosmesi.
    if (existing.rows[0].source === "ecosystem") {
        throwError("ACCESS_DENIED", "Fornitore ecosistema non modificabile");
    }

    // 3) source non è mai aggiornabile, anche se presente nel body
    delete fields.source;

    // 4) Nessun campo valido → errore
    if (Object.keys(fields).length === 0) {
        throwError("VALIDATION_ERROR", "Nessun campo valido da aggiornare");
    }

    // 5) Esegui update
    const result = await fornitoriModel.update(id, fields);
    return result.rows[0];
};

/**
 * DELETE — soft delete.
 * Nessun controllo su source: l'eliminazione è consentita per entrambi i source.
 * Rimuove il fornitore da "I nostri Fornitori" (attivo=false) ma NON dall'ecosistema globale.
 */
const deleteFornitore = async (id) => {
    const existing = await fornitoriModel.findById(id);
    if (existing.rowCount === 0 || existing.rows[0].attivo === false) {
        throwError("RESOURCE_NOT_FOUND", "Fornitore non trovato");
    }

    await fornitoriModel.remove(id);
    return;
};

// ============================================================

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteFornitore
};
