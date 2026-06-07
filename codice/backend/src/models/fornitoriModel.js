
const pool = require('../config/db');

const BASE_COLS = `
    f.id,
    f.ragione_sociale,
    f.piva,
    f.indirizzo,
    f.email,
    f.telefono,
    f.lead_time_giorni,
    f.source,
    f.sito_web,
    f.descrizione_aziendale,
    f.attivo,
    f.created_at,
    f.updated_at
`;

const findAll = () =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   fornitori f
         ORDER  BY f.ragione_sociale ASC`
    );

const findAttivi = () =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   fornitori f
         WHERE  f.attivo = true
         ORDER  BY f.ragione_sociale ASC`
    );


const findBySource = (source) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   fornitori f
         WHERE  f.source = $1
           AND  f.attivo = true
         ORDER  BY f.ragione_sociale ASC`,
        [source]
    );

const findEcosistema = () => findBySource('ecosystem');

const findManuali = () => findBySource('manual');

const findById = (id) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   fornitori f
         WHERE  f.id = $1`,
        [id]
    );

const findByPiva = (piva) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   fornitori f
         WHERE  f.piva = $1`,
        [piva]
    );

const findSchedaEcosistema = (id) =>
    pool.query(
        `SELECT
             f.id,
             f.ragione_sociale,
             f.piva,
             f.indirizzo,
             f.email,
             f.telefono,
             f.sito_web,
             f.descrizione_aziendale,
             f.lead_time_giorni,
             f.source,
             -- Prodotti del catalogo (distinti, tramite ordini_acquisto)
             COALESCE(
                 json_agg(
                     DISTINCT jsonb_build_object(
                         'id',           p.id,
                         'sku',          p.sku,
                         'nome',         p.nome,
                         'prezzo',       p.prezzo,
                         'attivo',       p.attivo
                     )
                 ) FILTER (WHERE p.id IS NOT NULL),
                 '[]'::json
             ) AS catalogo_prodotti
         FROM  fornitori f
         LEFT JOIN ordini_acquisto oa ON oa.fornitore_id = f.id
         LEFT JOIN righe_po rp       ON rp.ordine_acquisto_id = oa.id
         LEFT JOIN prodotti p        ON p.id = rp.prodotto_id AND p.attivo = true
         WHERE f.id = $1
         GROUP BY f.id`,
        [id]
    );

const search = (q) =>
    pool.query(
        `SELECT
             f.id,
             f.ragione_sociale,
             f.piva,
             f.source,
             f.attivo
         FROM   fornitori f
         WHERE  f.attivo = true
           AND  (f.ragione_sociale ILIKE $1 OR f.piva ILIKE $1)
         ORDER  BY f.ragione_sociale ASC
         LIMIT  20`,
        [`%${q}%`]
    );

const findContattiByFornitoreId = (fornitore_id) =>
    pool.query(
        `SELECT id, fornitore_id, nome, ruolo, email, telefono
         FROM   contatti_fornitori
         WHERE  fornitore_id = $1
         ORDER  BY id`,
        [fornitore_id]
    );

const create = ({ ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni,
                  source = 'manual', sito_web, descrizione_aziendale, attivo = true }) =>
    pool.query(
        `INSERT INTO fornitori
             (ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni,
              source, sito_web, descrizione_aziendale, attivo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, ragione_sociale, piva, indirizzo, email, telefono,
                   lead_time_giorni, source, sito_web, descrizione_aziendale, attivo`,
        [ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni,
         source, sito_web, descrizione_aziendale, attivo]
    );

const update = (id, { ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni,
                      sito_web, descrizione_aziendale, attivo }) =>
    pool.query(
        `UPDATE fornitori
         SET ragione_sociale      = COALESCE($1,  ragione_sociale),
             piva                 = COALESCE($2,  piva),
             indirizzo            = COALESCE($3,  indirizzo),
             email                = COALESCE($4,  email),
             telefono             = COALESCE($5,  telefono),
             lead_time_giorni     = COALESCE($6,  lead_time_giorni),
             sito_web             = COALESCE($7,  sito_web),
             descrizione_aziendale= COALESCE($8,  descrizione_aziendale),
             attivo               = COALESCE($9,  attivo),
             updated_at           = NOW()
         WHERE id = $10
         RETURNING id, ragione_sociale, piva, indirizzo, email, telefono,
                   lead_time_giorni, source, sito_web, descrizione_aziendale, attivo`,
        [ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni,
         sito_web, descrizione_aziendale, attivo, id]
    );

const remove = (id) =>
    pool.query(
        `UPDATE fornitori
         SET attivo     = false,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id`,
        [id]
    );

const createContatto = ({ fornitore_id, nome, ruolo, email, telefono }) =>
    pool.query(
        `INSERT INTO contatti_fornitori (fornitore_id, nome, ruolo, email, telefono)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, fornitore_id, nome, ruolo, email, telefono`,
        [fornitore_id, nome, ruolo, email, telefono]
    );

const updateContatto = (id, { nome, ruolo, email, telefono }) =>
    pool.query(
        `UPDATE contatti_fornitori
         SET nome       = COALESCE($1, nome),
             ruolo      = COALESCE($2, ruolo),
             email      = COALESCE($3, email),
             telefono   = COALESCE($4, telefono),
             updated_at = NOW()
         WHERE id = $5
         RETURNING id, fornitore_id, nome, ruolo, email, telefono`,
        [nome, ruolo, email, telefono, id]
    );

const removeContatto = (id) =>
    pool.query('DELETE FROM contatti_fornitori WHERE id = $1 RETURNING id', [id]);


module.exports = {
    findAll,
    findAttivi,
    findBySource,
    findEcosistema,
    findManuali,
    findById,
    findByPiva,
    findSchedaEcosistema,
    search,
    findContattiByFornitoreId,
    create,
    update,
    remove,
    createContatto,
    updateContatto,
    removeContatto
};
