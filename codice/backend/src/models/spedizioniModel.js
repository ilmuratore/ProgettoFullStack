const pool = require('../config/db');


const findAll = () =>
    pool.query(
        `SELECT spedizioni.id,
                spedizioni.ordine_id,
                spedizioni.cliente_id,
                clienti.ragione_sociale AS cliente,
                spedizioni.destinazione_id,
                destinazioni_clienti.etichetta AS destinazione,
                spedizioni.corriere_id,
                corrieri.nome AS corriere,
                corrieri.codice AS codice_corriere,
                spedizioni.stato,
                spedizioni.tracking_number,
                spedizioni.created_at,
                spedizioni.updated_at
     FROM spedizioni
     JOIN clienti ON spedizioni.cliente_id = clienti.id
     JOIN destinazioni_clienti ON spedizioni.destinazione_id = destinazioni_clienti.id
     LEFT JOIN corrieri ON spedizioni.corriere_id = corrieri.id
     ORDER BY spedizioni.id`
    );


const findById = (id) =>
    pool.query(
        `SELECT spedizioni.id,
                spedizioni.ordine_id,
                spedizioni.cliente_id,
                clienti.ragione_sociale AS cliente,
                spedizioni.destinazione_id,
                destinazioni_clienti.etichetta AS destinazione,
                spedizioni.corriere_id,
                corrieri.nome AS corriere,
                corrieri.codice AS codice_corriere,
                spedizioni.stato,
                spedizioni.tracking_number,
                spedizioni.created_at,
                spedizioni.updated_at
     FROM spedizioni
     JOIN clienti ON spedizioni.cliente_id = clienti.id
     JOIN destinazioni_clienti ON spedizioni.destinazione_id = destinazioni_clienti.id
     LEFT JOIN corrieri ON spedizioni.corriere_id = corrieri.id
     WHERE spedizioni.id = $1`,
        [id]
    );

const findByOrdineId = (ordine_id) =>
    pool.query(
        `SELECT id, ordine_id, cliente_id, destinazione_id, corriere_id, stato, tracking_number, created_at, updated_at
     FROM spedizioni
     WHERE ordine_id = $1
     ORDER BY id`,
        [ordine_id]
    );

const findByClienteId = (cliente_id) =>
    pool.query(
        `SELECT id, ordine_id, cliente_id, destinazione_id, corriere_id, stato, tracking_number, created_at, updated_at
     FROM spedizioni
     WHERE cliente_id = $1
     ORDER BY id`,
        [cliente_id]
    );

const findByDestinazioneId = (destinazione_id) =>
    pool.query(
        `SELECT id, ordine_id, cliente_id, destinazione_id, corriere_id, stato, tracking_number, created_at, updated_at
     FROM spedizioni
     WHERE destinazione_id = $1
     ORDER BY id`,
        [destinazione_id]
    );

const findByCorriereId = (corriere_id) =>
    pool.query(
        `SELECT id, ordine_id, cliente_id, destinazione_id, corriere_id, stato, tracking_number, created_at, updated_at
     FROM spedizioni
     WHERE corriere_id = $1
     ORDER BY id`,
        [corriere_id]
    );

const findByStato = (stato) =>
    pool.query(
        `SELECT id, ordine_id, cliente_id, destinazione_id, corriere_id, stato, tracking_number, created_at, updated_at
     FROM spedizioni
     WHERE stato = $1
     ORDER BY id`,
        [stato]
    );


const create = ({ ordine_id, cliente_id, destinazione_id, corriere_id, stato = 'IN_PREPARAZIONE', tracking_number }) =>
    pool.query(
        `INSERT INTO spedizioni (ordine_id, cliente_id, destinazione_id, corriere_id, stato, tracking_number)
     VALUES ($1, $2, $3, $4, $5::shipping_state, $6)
     RETURNING id, ordine_id, cliente_id, destinazione_id, corriere_id, stato, tracking_number, created_at, updated_at`,
        [ordine_id, cliente_id, destinazione_id, corriere_id, stato, tracking_number]
    );

const update = (id, { tracking_number }) =>
    pool.query(
        `
        UPDATE spedizioni
        SET tracking_number = COALESCE($1, tracking_number),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, ordine_id, cliente_id, destinazione_id, corriere_id, stato, tracking_number, created_at, updated_at
        `,
        [tracking_number, id]
    );



const updateStato = (id, stato, client) =>
    (client || pool).query(
        `UPDATE spedizioni
     SET stato = $1::shipping_state,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, stato, updated_at`,
        [stato, id]
    );

const updateTrackingNumber = (id, tracking_number) =>
    pool.query(
        `UPDATE spedizioni
     SET tracking_number = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, tracking_number, updated_at`,
        [tracking_number, id]
    );

const remove = (id) =>
    pool.query(
        `DELETE FROM spedizioni
     WHERE id = $1
     RETURNING id, ordine_id, cliente_id, destinazione_id, corriere_id, stato, tracking_number, created_at, updated_at`,
        [id]
    );


module.exports = {
    findAll, findById, findByOrdineId, findByClienteId, findByDestinazioneId, findByCorriereId, findByStato,
    create, update, updateStato, updateTrackingNumber, remove
};
