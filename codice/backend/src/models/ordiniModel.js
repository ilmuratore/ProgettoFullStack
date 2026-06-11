const pool = require('../config/db');

const LIST_SELECT = `
       ordini.id,
       ordini.cliente_id,
       ordini.destinazione_id,
       ordini.data_ordine,
       ordini.data_consegna_richiesta,
       COALESCE(ordini.importo_totale, SUM(righe_ordine.quantita * righe_ordine.prezzo_unitario), 0)::numeric AS importo_totale,
       ordini.stato,
       ordini.stato_picking,
       ordini.utente_id,
       ordini.created_at,
       ordini.updated_at,
       clienti.ragione_sociale AS cliente,
       destinazioni_clienti.etichetta AS destinazione,
       CONCAT(utenti.nome, ' ', utenti.cognome) AS utente
`;

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
        SELECT ${LIST_SELECT}
        FROM ordini
        JOIN clienti ON ordini.cliente_id = clienti.id
        LEFT JOIN destinazioni_clienti ON ordini.destinazione_id = destinazioni_clienti.id
        LEFT JOIN utenti ON ordini.utente_id = utenti.id
        LEFT JOIN righe_ordine ON righe_ordine.ordine_id = ordini.id
        GROUP BY ordini.id, clienti.ragione_sociale, destinazioni_clienti.etichetta, utenti.nome, utenti.cognome
        ORDER BY ordini.data_ordine DESC;
    `);

const findByStato = (stato) =>
    pool.query(
        `
        SELECT ${LIST_SELECT}
        FROM ordini
        JOIN clienti ON ordini.cliente_id = clienti.id
        LEFT JOIN destinazioni_clienti ON ordini.destinazione_id = destinazioni_clienti.id
        LEFT JOIN utenti ON ordini.utente_id = utenti.id
        LEFT JOIN righe_ordine ON righe_ordine.ordine_id = ordini.id
        WHERE ordini.stato = $1::sales_order_state
        GROUP BY ordini.id, clienti.ragione_sociale, destinazioni_clienti.etichetta, utenti.nome, utenti.cognome
        ORDER BY ordini.data_ordine DESC;
        `,
        [stato]
    );

const findByClienteId = (cliente_id) =>
    pool.query(
        `
        SELECT ${LIST_SELECT}
        FROM ordini
        JOIN clienti ON ordini.cliente_id = clienti.id
        LEFT JOIN destinazioni_clienti ON ordini.destinazione_id = destinazioni_clienti.id
        LEFT JOIN utenti ON ordini.utente_id = utenti.id
        LEFT JOIN righe_ordine ON righe_ordine.ordine_id = ordini.id
        WHERE ordini.cliente_id = $1
        GROUP BY ordini.id, clienti.ragione_sociale, destinazioni_clienti.etichetta, utenti.nome, utenti.cognome
        ORDER BY ordini.data_ordine DESC;
        `,
        [cliente_id]
    );

const findByStatoPicking = (stato_picking) =>
    pool.query(
        `
        SELECT ${LIST_SELECT}
        FROM ordini
        JOIN clienti ON ordini.cliente_id = clienti.id
        LEFT JOIN destinazioni_clienti ON ordini.destinazione_id = destinazioni_clienti.id
        LEFT JOIN utenti ON ordini.utente_id = utenti.id
        LEFT JOIN righe_ordine ON righe_ordine.ordine_id = ordini.id
        WHERE ordini.stato_picking = $1::sales_order_picking_state
        GROUP BY ordini.id, clienti.ragione_sociale, destinazioni_clienti.etichetta, utenti.nome, utenti.cognome
        ORDER BY ordini.data_ordine DESC;
        `,
        [stato_picking]
    );

const findById = (id, client) =>
    (client || pool).query(
        `
        SELECT ${LIST_SELECT}
        FROM ordini
        JOIN clienti ON ordini.cliente_id = clienti.id
        LEFT JOIN destinazioni_clienti ON ordini.destinazione_id = destinazioni_clienti.id
        LEFT JOIN utenti ON ordini.utente_id = utenti.id
        LEFT JOIN righe_ordine ON righe_ordine.ordine_id = ordini.id
        WHERE ordini.id = $1
        GROUP BY ordini.id, clienti.ragione_sociale, destinazioni_clienti.etichetta, utenti.nome, utenti.cognome
        `,
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
    findByStatoPicking,
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
