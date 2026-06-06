const pool = require('../config/db');


const findAll = () =>
    pool.query(
        `SELECT ubicazioni.id,
                ubicazioni.magazzino_id,
                magazzini.codice AS codice_magazzino,
                magazzini.nome   AS magazzino,
                ubicazioni.corsia,
                ubicazioni.scaffale,
                ubicazioni.codice,
                ubicazioni.attivo,
                ubicazioni.temperatura_controllata,
                ubicazioni.descrizione
         FROM   ubicazioni
         JOIN   magazzini ON ubicazioni.magazzino_id = magazzini.id
         ORDER  BY magazzini.nome, ubicazioni.corsia, ubicazioni.scaffale`
    );


const findById = (id) =>
    pool.query(
        `SELECT ubicazioni.id,
                ubicazioni.magazzino_id,
                magazzini.codice AS codice_magazzino,
                magazzini.nome   AS magazzino,
                ubicazioni.corsia,
                ubicazioni.scaffale,
                ubicazioni.codice,
                ubicazioni.attivo,
                ubicazioni.temperatura_controllata,
                ubicazioni.descrizione
         FROM   ubicazioni
         JOIN   magazzini ON ubicazioni.magazzino_id = magazzini.id
         WHERE  ubicazioni.id = $1`,
        [id]
    );

const findByMagazzinoId = (magazzino_id) =>
    pool.query(
        `SELECT id, magazzino_id, corsia, scaffale, codice, attivo, temperatura_controllata, descrizione
         FROM   ubicazioni
         WHERE  magazzino_id = $1
         ORDER  BY corsia, scaffale`,
        [magazzino_id]
    );

const findAttive = () =>
    pool.query(
        `SELECT ubicazioni.id,
                ubicazioni.magazzino_id,
                magazzini.codice AS codice_magazzino,
                magazzini.nome   AS magazzino,
                ubicazioni.corsia,
                ubicazioni.scaffale,
                ubicazioni.codice,
                ubicazioni.attivo,
                ubicazioni.temperatura_controllata,
                ubicazioni.descrizione
         FROM   ubicazioni
         JOIN   magazzini ON ubicazioni.magazzino_id = magazzini.id
         WHERE  ubicazioni.attivo = true
         ORDER  BY magazzini.nome, ubicazioni.corsia, ubicazioni.scaffale`
    );

const findByCodice = (codice) =>
    pool.query(
        `SELECT ubicazioni.id,
                ubicazioni.magazzino_id,
                magazzini.codice AS codice_magazzino,
                magazzini.nome   AS magazzino,
                ubicazioni.corsia,
                ubicazioni.scaffale,
                ubicazioni.codice,
                ubicazioni.attivo,
                ubicazioni.temperatura_controllata,
                ubicazioni.descrizione
         FROM   ubicazioni
         JOIN   magazzini ON ubicazioni.magazzino_id = magazzini.id
         WHERE  ubicazioni.codice = $1`,
        [codice]
    );

const findByMagazzinoIdAndSlot = (magazzino_id, corsia, scaffale) =>
    pool.query(
        `SELECT id, magazzino_id, corsia, scaffale, codice, attivo, temperatura_controllata, descrizione
         FROM   ubicazioni
         WHERE  magazzino_id = $1 AND corsia = $2 AND scaffale = $3`,
        [magazzino_id, corsia, scaffale]
    );


const create = ({ magazzino_id, corsia, scaffale, codice, attivo = true, temperatura_controllata = false, descrizione }) =>
    pool.query(
        `INSERT INTO ubicazioni (magazzino_id, corsia, scaffale, codice, attivo, temperatura_controllata, descrizione)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, magazzino_id, corsia, scaffale, codice, attivo, temperatura_controllata, descrizione`,
        [magazzino_id, corsia, scaffale, codice, attivo, temperatura_controllata, descrizione]
    );

// Aggiorna solo temperatura_controllata — M06
const updateTemperatura = (id, temperatura_controllata) =>
    pool.query(
        `UPDATE ubicazioni
         SET    temperatura_controllata = $1,
                updated_at = CURRENT_TIMESTAMP
         WHERE  id = $2
         RETURNING id, magazzino_id, corsia, scaffale, codice, attivo, temperatura_controllata, descrizione`,
        [temperatura_controllata, id]
    );

// Inverte il flag attivo senza accettare un valore dal body — M06
const toggleAttivo = (id) =>
    pool.query(
        `UPDATE ubicazioni
         SET    attivo     = NOT attivo,
                updated_at = CURRENT_TIMESTAMP
         WHERE  id = $1
         RETURNING id, magazzino_id, corsia, scaffale, codice, attivo, temperatura_controllata, descrizione`,
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
