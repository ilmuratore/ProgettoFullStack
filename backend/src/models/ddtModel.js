const pool = require('../config/db');


const findAll = () =>
    pool.query(
        `SELECT ddt.id,
                ddt.spedizione_id,
                spedizioni.ordine_id,
                ddt.numero_ddt,
                ddt.data_ddt,
                ddt.trasportatore,
                ddt.note,
                ddt.created_at,
                ddt.updated_at
     FROM ddt
     JOIN spedizioni ON ddt.spedizione_id = spedizioni.id
     ORDER BY ddt.id`
    );


const findById = (id) =>
    pool.query(
        `SELECT ddt.id,
                ddt.spedizione_id,
                spedizioni.ordine_id,
                ddt.numero_ddt,
                ddt.data_ddt,
                ddt.trasportatore,
                ddt.note,
                ddt.created_at,
                ddt.updated_at
     FROM ddt
     JOIN spedizioni ON ddt.spedizione_id = spedizioni.id
     WHERE ddt.id = $1`,
        [id]
    );

const findBySpedizioneId = (spedizione_id) =>
    pool.query(
        `SELECT id, spedizione_id, numero_ddt, data_ddt, trasportatore, note, created_at, updated_at
     FROM ddt
     WHERE spedizione_id = $1`,
        [spedizione_id]
    );

const findByNumeroDdt = (numero_ddt) =>
    pool.query(
        `SELECT id, spedizione_id, numero_ddt, data_ddt, trasportatore, note, created_at, updated_at
     FROM ddt
     WHERE numero_ddt = $1
     ORDER BY id`,
        [numero_ddt]
    );

const findByDataDdt = (data_ddt) =>
    pool.query(
        `SELECT id, spedizione_id, numero_ddt, data_ddt, trasportatore, note, created_at, updated_at
     FROM ddt
     WHERE data_ddt = $1
     ORDER BY id`,
        [data_ddt]
    );


const create = ({ spedizione_id, numero_ddt, data_ddt, trasportatore, note }) =>
    pool.query(
        `INSERT INTO ddt (spedizione_id, numero_ddt, data_ddt, trasportatore, note)
     VALUES ($1, $2, COALESCE($3, CURRENT_DATE), $4, $5)
     RETURNING id, spedizione_id, numero_ddt, data_ddt, trasportatore, note, created_at, updated_at`,
        [spedizione_id, numero_ddt, data_ddt, trasportatore, note]
    );

const update = (id, { spedizione_id, numero_ddt, data_ddt, trasportatore, note }) =>
    pool.query(
        `UPDATE ddt
     SET spedizione_id = COALESCE($1, spedizione_id),
         numero_ddt = COALESCE($2, numero_ddt),
         data_ddt = COALESCE($3, data_ddt),
         trasportatore = COALESCE($4, trasportatore),
         note = COALESCE($5, note),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING id, spedizione_id, numero_ddt, data_ddt, trasportatore, note, created_at, updated_at`,
        [spedizione_id, numero_ddt, data_ddt, trasportatore, note, id]
    );


const updateNumeroDdt = (id, numero_ddt) =>
    pool.query(
        `UPDATE ddt
     SET numero_ddt = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, numero_ddt, updated_at`,
        [numero_ddt, id]
    );

const updateDataDdt = (id, data_ddt) =>
    pool.query(
        `UPDATE ddt
     SET data_ddt = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, data_ddt, updated_at`,
        [data_ddt, id]
    );

const remove = (id) =>
    pool.query(
        `DELETE FROM ddt
     WHERE id = $1
     RETURNING id, spedizione_id, numero_ddt, data_ddt, trasportatore, note, created_at, updated_at`,
        [id]
    );


module.exports = {
    findAll, findById, findBySpedizioneId, findByNumeroDdt, findByDataDdt,
    create, update, updateNumeroDdt, updateDataDdt, remove
};
