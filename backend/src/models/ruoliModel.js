const pool = require('../config/db');

const findAll = () =>
    pool.query(
        'SELECT id, nome, descrizione, created_at, updated_at FROM ruoli ORDER BY id'
    );


const findById = (id) =>
    pool.query(
        'SELECT id, nome, descrizione, created_at, updated_at FROM ruoli WHERE id = $1',
        [id]
    );

const findByNome = (nome) =>
    pool.query('SELECT * FROM ruoli WHERE nome = $1', [nome]);


const create = ({ nome, descrizione }) =>
    pool.query(
        `INSERT INTO ruoli (nome, descrizione)
     VALUES ($1, $2)
     RETURNING id, nome, descrizione, created_at, updated_at`,
        [nome, descrizione]
    );

const update = (id, { nome, descrizione }) =>
    pool.query(
        `UPDATE ruoli
     SET nome = COALESCE($1, nome),
         descrizione = COALESCE($2, descrizione),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id, nome, descrizione, created_at, updated_at`,
        [nome, descrizione, id]
    );


const remove = (id) =>
    pool.query('DELETE FROM ruoli WHERE id = $1 RETURNING id, nome, descrizione, created_at, updated_at', [id]);


module.exports = {
    findAll, findById, findByNome,
    create, update, remove
};
