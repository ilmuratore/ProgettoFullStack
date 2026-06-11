const pool = require('../config/db');

const create = ({ cliente_id, destinazione_id, data_consegna_richiesta, utente_id }, client) =>
    (client || pool).query(
        `
        INSERT INTO ordini
        (cliente_id, destinazione_id, data_consegna_richiesta, utente_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `,
        [cliente_id, destinazione_id, data_consegna_richiesta, utente_id]
    );

const findAll = () =>
    pool.query(`
        SELECT ordini.*,
               clienti.ragione_sociale AS cliente
        FROM ordini
        JOIN clienti ON ordini.cliente_id = clienti.id
        ORDER BY ordini.data_ordine DESC;
    `);

const findByStato = (stato) =>
    pool.query(
        `
        SELECT ordini.*,
               clienti.ragione_sociale AS cliente
        FROM ordini
        JOIN clienti ON ordini.cliente_id = clienti.id
        WHERE ordini.stato = $1::sales_order_state
        ORDER BY ordini.data_ordine DESC;
        `,
        [stato]
    );

const findByClienteId = (cliente_id) =>
    pool.query(
        `
        SELECT ordini.*,
               clienti.ragione_sociale AS cliente
        FROM ordini
        JOIN clienti ON ordini.cliente_id = clienti.id
        WHERE ordini.cliente_id = $1
        ORDER BY ordini.data_ordine DESC;
        `,
        [cliente_id]
    );

const findById = (id, client) =>
    (client || pool).query(
        `SELECT * FROM ordini WHERE id = $1;`,
        [id]
    );

const findByIdForUpdate = (id, client) =>
    (client || pool).query(
        `
        SELECT *
        FROM ordini
        WHERE id = $1
        FOR UPDATE
        `,
        [id]
    );

const update = (id, { data_consegna_richiesta }, client) =>
    (client || pool).query(
        `
        UPDATE ordini
        SET data_consegna_richiesta = COALESCE($1, data_consegna_richiesta),
            updated_at              = NOW()
        WHERE id = $2
        RETURNING *;
        `,
        [data_consegna_richiesta, id]
    );

const updateStato = (id, stato, client) =>
    (client || pool).query(
        `
        UPDATE ordini
        SET stato = $1::sales_order_state,
            updated_at = NOW()
        WHERE id = $2
        RETURNING *;
        `,
        [stato, id]
    );

const updateStatoPicking = (id, stato_picking, client) =>
    (client || pool).query(
        `
        UPDATE ordini
        SET stato_picking = $1::sales_order_picking_state,
            updated_at = NOW()
        WHERE id = $2
        RETURNING *;
        `,
        [stato_picking, id]
    );

const getImpegnatoByProdotto = (prodotto_id, client) =>
    (client || pool).query(
        `
        SELECT COALESCE(SUM(righe_ordine.quantita), 0)::int AS impegnato
        FROM righe_ordine
        JOIN ordini ON righe_ordine.ordine_id = ordini.id
        WHERE righe_ordine.prodotto_id = $1
          AND ordini.stato = 'CONFERMATO'
          AND ordini.stato_picking <> 'PICKING_COMPLETATO';
        `,
        [prodotto_id]
    );

const lockGiacenzeByProdottoIds = (prodotto_ids, client) =>
    (client || pool).query(
        `
        SELECT id, prodotto_id, ubicazione_id, quantita
        FROM giacenze
        WHERE prodotto_id = ANY($1::int[])
        ORDER BY prodotto_id, ubicazione_id
        FOR UPDATE
        `,
        [prodotto_ids]
    );

const findOrdiniBozzaPrecedentiConStessiProdotti = (ordine_id, prodotto_ids, data_ordine, client) =>
    (client || pool).query(
        `
        SELECT o.id, o.data_ordine
        FROM ordini o
        WHERE o.id <> $1
          AND o.stato = 'BOZZA'
          AND o.data_ordine < $2
          AND EXISTS (
              SELECT 1
              FROM righe_ordine r
              WHERE r.ordine_id = o.id
                AND r.prodotto_id = ANY($3::int[])
          )
        ORDER BY o.data_ordine, o.id
        FOR UPDATE OF o
        `,
        [ordine_id, data_ordine, prodotto_ids]
    );

const remove = (id) =>
    pool.query(
        `DELETE FROM ordini WHERE id = $1 RETURNING id;`,
        [id]
    );

module.exports = {
    create,
    findAll,
    findByStato,
    findByClienteId,
    findById,
    findByIdForUpdate,
    update,
    updateStato,
    updateStatoPicking,
    getImpegnatoByProdotto,
    lockGiacenzeByProdottoIds,
    findOrdiniBozzaPrecedentiConStessiProdotti,
    remove
};
