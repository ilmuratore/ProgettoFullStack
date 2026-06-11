const pool = require('../config/db');

const create = ({ cliente_id, destinazione_id, data_consegna_richiesta, importo_totale, utente_id }, client) =>
    (client || pool).query(
        `
        INSERT INTO ordini
        (cliente_id, destinazione_id, data_consegna_richiesta, importo_totale, utente_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `,
        [cliente_id, destinazione_id, data_consegna_richiesta, importo_totale, utente_id]
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

const update = (id, { data_consegna_richiesta, importo_totale }, client) =>
    (client || pool).query(
        `
        UPDATE ordini
        SET data_consegna_richiesta = COALESCE($1, data_consegna_richiesta),
            importo_totale          = COALESCE($2, importo_totale),
            updated_at              = NOW()
        WHERE id = $3
        RETURNING *;
        `,
        [data_consegna_richiesta, importo_totale, id]
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
    update,
    updateStato,
    updateStatoPicking,
    getImpegnatoByProdotto,
    remove
};
