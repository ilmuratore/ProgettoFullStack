const pool = require('../config/db');

const findAll = () =>
    pool.query(
        'SELECT id, codice, descrizione FROM permessi ORDER BY id'
    );


const findById = (id) =>
    pool.query(
        'SELECT id, codice, descrizione FROM permessi WHERE id = $1',
        [id]
    );

const findByCodice = (codice) =>
    pool.query('SELECT * FROM permessi WHERE codice = $1', [codice]);


const create = ({ codice, descrizione }) =>
    pool.query(
        `INSERT INTO permessi (codice, descrizione)
     VALUES ($1, $2)
     RETURNING id, codice, descrizione`,
        [codice, descrizione]
    );

const update = (id, { codice, descrizione }) =>
    pool.query(
        `UPDATE permessi
     SET codice = COALESCE($1, codice),
         descrizione = COALESCE($2, descrizione),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id, codice, descrizione`,
        [codice, descrizione, id]
    );


const remove = (id) =>
    pool.query('DELETE FROM permessi WHERE id = $1 RETURNING id', [id]);


module.exports = {
    findAll, findById, findByCodice,
    create, update, remove
};
