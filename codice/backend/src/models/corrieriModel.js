
const pool = require('../config/db');

const COLS = `id, codice, nome, telefono, email, attivo, created_at, updated_at`;

const findAll = () =>
    pool.query(
        `SELECT ${COLS}
         FROM   corrieri
         WHERE  attivo = true
         ORDER  BY nome ASC`
    );

const findById = (id) =>
    pool.query(
        `SELECT ${COLS}
         FROM   corrieri
         WHERE  id = $1`,
        [id]
    );

const create = ({ codice, nome, telefono, email }) =>
    pool.query(
        `INSERT INTO corrieri (codice, nome, telefono, email)
         VALUES ($1, $2, $3, $4)
         RETURNING ${COLS}`,
        [codice, nome, telefono, email]
    );


const update = (id, { codice, nome, telefono, email }) =>
    pool.query(
        `UPDATE corrieri
         SET codice     = COALESCE($1, codice),
             nome       = COALESCE($2, nome),
             telefono   = COALESCE($3, telefono),
             email      = COALESCE($4, email),
             updated_at = NOW()
         WHERE id = $5
           AND attivo = true
         RETURNING ${COLS}`,
        [codice, nome, telefono, email, id]
    );

const remove = (id) =>
    pool.query(
        `UPDATE corrieri
         SET attivo     = false,
             updated_at = NOW()
         WHERE id = $1
           AND attivo = true
         RETURNING id`,
        [id]
    );


module.exports = { findAll, findById, create, update, remove };
