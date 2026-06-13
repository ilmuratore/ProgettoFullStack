const pool = require('../config/db');

const STATI = Object.freeze({
    BOZZA:          'BOZZA',
    INVIATA:        'INVIATA',
    IN_VALUTAZIONE: 'IN_VALUTAZIONE',
    ACCETTATA:      'ACCETTATA',
    RIFIUTATA:      'RIFIUTATA'
});

const TRANSIZIONI_AMMESSE = Object.freeze({
    BOZZA:          ['INVIATA'],
    INVIATA:        ['IN_VALUTAZIONE'],
    IN_VALUTAZIONE: ['ACCETTATA', 'RIFIUTATA'],
    ACCETTATA:      [],
    RIFIUTATA:      []
});

const BASE_COLS = `
    ra.id,
    ra.fornitore_id,
    f.ragione_sociale AS fornitore_nome,
    ra.stato,
    ra.data_richiesta,
    ra.note,
    ra.utente_id,
    ra.created_at,
    ra.updated_at
`;

const findByUtenteId = (utente_id) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   richieste_acquisto ra
         JOIN   fornitori f ON f.id = ra.fornitore_id
         WHERE  ra.utente_id = $1
         ORDER  BY ra.data_richiesta DESC`,
        [utente_id]
    );

const findByFornitoreId = (fornitore_id) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   richieste_acquisto ra
         JOIN   fornitori f ON f.id = ra.fornitore_id
         WHERE  ra.fornitore_id = $1
         ORDER  BY ra.data_richiesta DESC`,
        [fornitore_id]
    );

const findByStato = (stato) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   richieste_acquisto ra
         JOIN   fornitori f ON f.id = ra.fornitore_id
         WHERE  ra.stato = $1
         ORDER  BY ra.data_richiesta DESC`,
        [stato]
    );

const findById = (id) =>
    pool.query(
        `SELECT
             ra.id,
             ra.fornitore_id,
             f.ragione_sociale       AS fornitore_nome,
             f.email                 AS fornitore_email,
             f.telefono              AS fornitore_telefono,
             ra.stato,
             ra.data_richiesta,
             ra.note,
             ra.utente_id,
             ra.created_at,
             ra.updated_at,
             -- Righe come array JSON
             COALESCE(
                 json_agg(
                     jsonb_build_object(
                         'id',                  rr.id,
                         'prodotto_id',         rr.prodotto_id,
                         'prodotto_sku',        p.sku,
                         'prodotto_nome',       p.nome,
                         'quantita_richiesta',  rr.quantita_richiesta
                     )
                     ORDER BY rr.id
                 ) FILTER (WHERE rr.id IS NOT NULL),
                 '[]'::json
             ) AS righe
         FROM  richieste_acquisto ra
         JOIN  fornitori f         ON f.id  = ra.fornitore_id
         LEFT JOIN righe_richiesta rr ON rr.richiesta_id = ra.id
         LEFT JOIN prodotti p         ON p.id = rr.prodotto_id
         WHERE ra.id = $1
         GROUP BY ra.id, f.id`,
        [id]
    );

const create = ({ fornitore_id, note, utente_id }, client) =>
    (client || pool).query(
        `INSERT INTO richieste_acquisto (fornitore_id, stato, note, utente_id)
         VALUES ($1, 'BOZZA', $2, $3)
         RETURNING id, fornitore_id, stato, data_richiesta, note, utente_id, created_at`,
        [fornitore_id, note, utente_id]
    );

const findByIdForUpdate = (id, client) =>
    (client || pool).query(
        `SELECT * FROM richieste_acquisto WHERE id = $1 FOR UPDATE`,
        [id]
    );

const updateStato = (id, stato, client) =>
    (client || pool).query(
        `UPDATE richieste_acquisto
         SET stato      = $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING id, fornitore_id, stato, utente_id, updated_at`,
        [stato, id]
    );

const updateNote = (id, note) =>
    pool.query(
        `UPDATE richieste_acquisto
         SET note       = $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING id, stato, note`,
        [note, id]
    );

const remove = (id) =>
    pool.query(
        `DELETE FROM richieste_acquisto
         WHERE id = $1
         RETURNING id`,
        [id]
    );


module.exports = {
    STATI,
    TRANSIZIONI_AMMESSE,
    findByUtenteId,
    findByFornitoreId,
    findByStato,
    findById,
    create,
    findByIdForUpdate,
    updateStato,
    updateNote,
    remove
};
