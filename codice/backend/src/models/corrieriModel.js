const pool = require("../config/db");

const COLS = `id, codice, nome, telefono, email, utente_id, attivo, created_at, updated_at`;

const findAll = () =>
  pool.query(
    `SELECT ${COLS}
         FROM   corrieri
         WHERE  attivo = true
         ORDER  BY nome ASC`,
  );

const findById = (id) =>
  pool.query(
    `SELECT ${COLS}
         FROM   corrieri
         WHERE  id = $1`,
    [id],
  );

const findByUtenteId = (utente_id, client = pool) =>
  client.query(
    `SELECT ${COLS}
         FROM corrieri
         WHERE utente_id = $1
           AND attivo = true`,
    [utente_id],
  );

const create = ({ codice, nome, telefono, email, utente_id }) =>
  pool.query(
    `INSERT INTO corrieri (codice, nome, telefono, email, utente_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING ${COLS}`,
    [codice, nome, telefono, email, utente_id ?? null],
  );

const update = (id, { codice, nome, telefono, email, utente_id }) =>
  pool.query(
    `UPDATE corrieri
         SET codice     = COALESCE($1, codice),
             nome       = COALESCE($2, nome),
             telefono   = COALESCE($3, telefono),
             email      = COALESCE($4, email),
             utente_id  = COALESCE($5, utente_id),
             updated_at = NOW()
         WHERE id = $6
           AND attivo = true
         RETURNING ${COLS}`,
    [codice, nome, telefono, email, utente_id, id],
  );

const remove = (id) =>
  pool.query(
    `UPDATE corrieri
         SET attivo     = false,
             updated_at = NOW()
         WHERE id = $1
           AND attivo = true
         RETURNING id`,
    [id],
  );

module.exports = { findAll, findById, create, update, remove, findByUtenteId };
