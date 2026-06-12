const pool = require('../config/db');

const BASE_SELECT = `
    id,
    ordine_acquisto_id,
    utente_id,
    destinatario,
    cc,
    bcc,
    subject,
    body,
    stato,
    provider_message_id,
    errore,
    allegato_ordine_filename,
    allegato_contabile_filename,
    allegato_contabile_mime,
    allegato_contabile_size,
    sent_at,
    created_at,
    updated_at
`;

const create = (data, client = pool) => {
    const executor = client || pool;
    return executor.query(
        `INSERT INTO ordini_acquisto_email_log
            (ordine_acquisto_id,
             utente_id,
             destinatario,
             cc,
             bcc,
             subject,
             body,
             stato,
             provider_message_id,
             errore,
             allegato_ordine_filename,
             allegato_contabile_filename,
             allegato_contabile_mime,
             allegato_contabile_size,
             sent_at)
         VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING ${BASE_SELECT}`,
        [
            data.ordine_acquisto_id,
            data.utente_id || null,
            data.destinatario,
            data.cc || null,
            data.bcc || null,
            data.subject,
            data.body || null,
            data.stato,
            data.provider_message_id || null,
            data.errore || null,
            data.allegato_ordine_filename || null,
            data.allegato_contabile_filename || null,
            data.allegato_contabile_mime || null,
            data.allegato_contabile_size || null,
            data.sent_at || null,
        ]
    );
};

const findByOrdineAcquistoId = (ordineAcquistoId, client = pool) => {
    const executor = client || pool;
    return executor.query(
        `SELECT ${BASE_SELECT}
         FROM ordini_acquisto_email_log
         WHERE ordine_acquisto_id = $1
         ORDER BY created_at DESC`,
        [ordineAcquistoId]
    );
};

module.exports = {
    create,
    findByOrdineAcquistoId,
};
