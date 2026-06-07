const pool = require('../config/db');

const COLS = `
    ubicazioni.id,
    ubicazioni.magazzino_id,
    magazzini.codice AS codice_magazzino,
    magazzini.nome   AS magazzino,
    ubicazioni.corsia,
    ubicazioni.scaffale,
    ubicazioni.codice,
    ubicazioni.attivo,
    ubicazioni.temperatura_controllata
`;

const COLS_SOLO = `
    id, magazzino_id, corsia, scaffale, codice, attivo, temperatura_controllata
`;

const findAll = () =>
    pool.query(
        `SELECT ${COLS}
         FROM   ubicazioni
         JOIN   magazzini ON ubicazioni.magazzino_id = magazzini.id
         ORDER  BY magazzini.nome, ubicazioni.corsia, ubicazioni.scaffale`
    );

const findById = (id) =>
    pool.query(
        `SELECT ${COLS}
         FROM   ubicazioni
         JOIN   magazzini ON ubicazioni.magazzino_id = magazzini.id
         WHERE  ubicazioni.id = $1`,
        [id]
    );

const findByMagazzinoId = (magazzino_id) =>
    pool.query(
        `SELECT ${COLS_SOLO}
         FROM   ubicazioni
         WHERE  magazzino_id = $1
         ORDER  BY corsia, scaffale`,
        [magazzino_id]
    );

const findAttive = () =>
    pool.query(
        `SELECT ${COLS}
         FROM   ubicazioni
         JOIN   magazzini ON ubicazioni.magazzino_id = magazzini.id
         WHERE  ubicazioni.attivo = true
         ORDER  BY magazzini.nome, ubicazioni.corsia, ubicazioni.scaffale`
    );

const findByCodice = (codice) =>
    pool.query(
        `SELECT ${COLS}
         FROM   ubicazioni
         JOIN   magazzini ON ubicazioni.magazzino_id = magazzini.id
         WHERE  ubicazioni.codice = $1`,
        [codice]
    );

const findByMagazzinoIdAndSlot = (magazzino_id, corsia, scaffale) =>
    pool.query(
        `SELECT ${COLS_SOLO}
         FROM   ubicazioni
         WHERE  magazzino_id = $1 AND corsia = $2 AND scaffale = $3`,
        [magazzino_id, corsia, scaffale]
    );

const create = ({ magazzino_id, corsia, scaffale, codice, attivo = true, temperatura_controllata = false }) =>
    pool.query(
        `INSERT INTO ubicazioni (magazzino_id, corsia, scaffale, codice, attivo, temperatura_controllata)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${COLS_SOLO}`,
        [magazzino_id, corsia, scaffale, codice, attivo, temperatura_controllata]
    );

const updateTemperatura = (id, temperatura_controllata) =>
    pool.query(
        `UPDATE ubicazioni
         SET    temperatura_controllata = $1,
                updated_at = CURRENT_TIMESTAMP
         WHERE  id = $2
         RETURNING ${COLS_SOLO}`,
        [temperatura_controllata, id]
    );

const toggleAttivo = (id) =>
    pool.query(
        `UPDATE ubicazioni
         SET    attivo     = NOT attivo,
                updated_at = CURRENT_TIMESTAMP
         WHERE  id = $1
         RETURNING ${COLS_SOLO}`,
        [id]
    );

const remove = (id) =>
    pool.query(
        `UPDATE ubicazioni
         SET    attivo     = false,
                updated_at = CURRENT_TIMESTAMP
         WHERE  id = $1
         RETURNING id`,
        [id]
    );

module.exports = {
    findAll, findById, findByMagazzinoId, findAttive, findByCodice, findByMagazzinoIdAndSlot,
    create, updateTemperatura, toggleAttivo, remove
};