const pool = require('../config/db');

const BASE_COLS = `
    c.id,
    c.ragione_sociale,
    c.piva_cf,
    c.email,
    c.telefono,
    c.source,
    c.attivo,
    c.created_at,
    c.updated_at
`;

const findAll = () =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   clienti c
         ORDER  BY c.ragione_sociale ASC`
    );

const findAttivi = () =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   clienti c
         WHERE  c.attivo = true
         ORDER  BY c.ragione_sociale ASC`
    );


const findBySource = (source) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   clienti c
         WHERE  c.source = $1
           AND  c.attivo = true
         ORDER  BY c.ragione_sociale ASC`,
        [source]
    );

const findById = (id) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   clienti c
         WHERE  c.id = $1`,
        [id]
    );

const findByPivaCf = (piva_cf) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   clienti c
         WHERE  c.piva_cf = $1`,
        [piva_cf]
    );


const findStorico = (id) =>
    pool.query(
        `SELECT
             -- Dati cliente
             c.id,
             c.ragione_sociale,
             c.piva_cf,
             c.email,
             c.telefono,
             c.source,
             c.attivo,

             -- Destinazioni
             COALESCE(
                 (SELECT json_agg(jsonb_build_object(
                     'id',        d.id,
                     'etichetta', d.etichetta,
                     'indirizzo', d.indirizzo,
                     'citta',     d.citta,
                     'cap',       d.cap,
                     'predefinita', d.predefinita
                 ) ORDER BY d.predefinita DESC, d.id)
                  FROM destinazioni_clienti d WHERE d.cliente_id = c.id),
                 '[]'::json
             ) AS destinazioni,

             -- KPI acquisti
             COUNT(DISTINCT o.id)                                    AS totale_ordini,
             COALESCE(SUM(o.importo_totale), 0)                      AS fatturato_totale,
             MAX(o.data_ordine)                                       AS ultimo_acquisto,

             -- Ultimi 50 ordini
             COALESCE(
                 (SELECT json_agg(ord ORDER BY ord.data_ordine DESC)
                  FROM (
                      SELECT
                          o2.id,
                          o2.stato,
                          o2.stato_picking,
                          o2.importo_totale,
                          o2.data_ordine,
                          o2.data_consegna_richiesta
                      FROM ordini o2
                      WHERE o2.cliente_id = c.id
                      ORDER BY o2.data_ordine DESC
                      LIMIT 50
                  ) ord),
                 '[]'::json
             ) AS ordini_recenti,

             -- Ultime 20 spedizioni
             COALESCE(
                 (SELECT json_agg(sp ORDER BY sp.created_at DESC)
                  FROM (
                      SELECT
                          s.id,
                          s.stato,
                          s.tracking_number,
                          s.created_at
                      FROM spedizioni s
                      WHERE s.cliente_id = c.id
                      ORDER BY s.created_at DESC
                      LIMIT 20
                  ) sp),
                 '[]'::json
             ) AS spedizioni_recenti

         FROM  clienti c
         LEFT JOIN ordini o ON o.cliente_id = c.id
         WHERE c.id = $1
         GROUP BY c.id`,
        [id]
    );


const create = ({ ragione_sociale, piva_cf, email, telefono, source = 'manual', attivo = true }) =>
    pool.query(
        `INSERT INTO clienti (ragione_sociale, piva_cf, email, telefono, source, attivo)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, ragione_sociale, piva_cf, email, telefono, source, attivo`,
        [ragione_sociale, piva_cf, email, telefono, source, attivo]
    );


const update = (id, { ragione_sociale, piva_cf, email, telefono, attivo }) =>
    pool.query(
        `UPDATE clienti
         SET ragione_sociale = COALESCE($1, ragione_sociale),
             piva_cf         = COALESCE($2, piva_cf),
             email           = COALESCE($3, email),
             telefono        = COALESCE($4, telefono),
             attivo          = COALESCE($5, attivo),
             updated_at      = NOW()
         WHERE id = $6
         RETURNING id, ragione_sociale, piva_cf, email, telefono, source, attivo`,
        [ragione_sociale, piva_cf, email, telefono, attivo, id]
    );


const remove = (id) =>
    pool.query(
        `UPDATE clienti
         SET attivo     = false,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id`,
        [id]
    );


module.exports = {
    findAll,
    findAttivi,
    findBySource,
    findById,
    findByPivaCf,
    findStorico,
    create,
    update,
    remove
};
