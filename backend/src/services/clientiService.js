// ============================================================
// clientiService.js  —  V2
// M04: Anagrafiche "I nostri Clienti"
//
// Business logic:
//   - source forzato a 'manual' alla creazione
//   - PATCH su source='ecosystem' → 403 ACCESS_DENIED (FA Appendix D7)
//   - DELETE → soft delete (attivo=false), storico transazionale preservato (FA Appendix D9)
//   - Nessun SQL diretto: tutte le query delegate a clientiModel
// ============================================================

const clientiModel = require('../models/clientiModel');

// ────────────────────────────────────────────────────────────
// HELPER
// ────────────────────────────────────────────────────────────

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

// ────────────────────────────────────────────────────────────
// SERVICE — lettura
// ────────────────────────────────────────────────────────────

/**
 * GET ALL — lista "I nostri Clienti" (solo attivi).
 * Il campo source viene restituito: il frontend lo usa per mostrare/nascondere
 * il pulsante Modifica.
 */
const getAll = async () => {
    const result = await clientiModel.findAttivi();
    return result.rows;
};

/**
 * GET BY ID — dettaglio cliente (solo attivi).
 * 404 se non esiste o se attivo=false (già eliminato in soft delete).
 */
const getById = async (id) => {
    const result = await clientiModel.findById(id);

    if (result.rowCount === 0 || result.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Cliente non trovato');
    }

    return result.rows[0];
};

// ────────────────────────────────────────────────────────────
// SERVICE — scrittura
// ────────────────────────────────────────────────────────────

/**
 * CREATE — crea nuovo cliente.
 * source è SEMPRE forzato a 'manual': non viene mai accettato dal body utente.
 * Non accettare source come parametro; anche se il body lo include,
 * il controller non lo passa qui (blueprint lo esclude).
 */
const create = async ({ ragione_sociale, piva_cf, email, telefono }) => {
    const result = await clientiModel.create({
        ragione_sociale,
        piva_cf,
        email,
        telefono,
        source: 'manual'  // forza sempre manual — MAI dall'utente
    });

    return result.rows[0];
};

/**
 * UPDATE — PATCH parziale.
 * Regole:
 *  1. Il cliente deve esistere ed essere attivo
 *  2. Se source='ecosystem' → 403 ACCESS_DENIED prima di qualsiasi UPDATE (FA Appendix D7)
 *  3. Il campo source non è mai modificabile (rimosso da fields anche se presente)
 *  4. Almeno un campo valido deve essere presente nel body
 */
const update = async (id, fields) => {
    // 1) Verifica esistenza
    const existing = await clientiModel.findById(id);

    if (existing.rowCount === 0 || existing.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Cliente non trovato');
    }

    // 2) Protezione backend reale: i clienti ecosistema non sono modificabili.
    //    Nascondere il pulsante nel frontend è solo UX — questa è la protezione reale.
    if (existing.rows[0].source === 'ecosystem') {
        throwError('ACCESS_DENIED', 'Cliente ecosistema non modificabile');
    }

    // 3) source non è mai aggiornabile, anche se presente nel body
    delete fields.source;

    // 4) Nessun campo valido → errore
    if (Object.keys(fields).length === 0) {
        throwError('VALIDATION_ERROR', 'Nessun campo valido da aggiornare');
    }

    // 5) Esegui update
    const result = await clientiModel.update(id, fields);
    return result.rows[0];
};

/**
 * DELETE — soft delete.
 * Nessun controllo su source: l'eliminazione è consentita per entrambi i source.
 * Rimuove il cliente da "I nostri Clienti" (attivo=false) ma NON esegue
 * mai una DELETE fisica: tutti i riferimenti in ordini, spedizioni e DDT
 * rimangono intatti per integrità dati (FA Appendix D9).
 */
const deleteCliente = async (id) => {
    const existing = await clientiModel.findById(id);

    if (existing.rowCount === 0 || existing.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Cliente non trovato');
    }

    await clientiModel.remove(id);
    // Ritorna void → controller risponde 204 No Content
};

// ────────────────────────────────────────────────────────────

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteCliente
};
