const pool = require('../config/db');

const findAll = () =>
    pool.query(
        `SELECT
                ruoli_permessi.ruolo_id,
                ruoli.nome AS ruolo,
                ruoli_permessi.permesso_id,
                permessi.codice AS permesso,
                ruoli_permessi.created_at,
                ruoli_permessi.updated_at
     FROM ruoli_permessi
     JOIN ruoli ON ruoli_permessi.ruolo_id = ruoli.id
     JOIN permessi ON ruoli_permessi.permesso_id = permessi.id
     ORDER BY ruoli_permessi.ruolo_id, ruoli_permessi.permesso_id`
    );


const findByRuoloId = (ruolo_id) =>
    pool.query(
        `SELECT
                ruoli_permessi.ruolo_id,
                ruoli.nome AS ruolo,
                ruoli_permessi.permesso_id,
                permessi.codice AS permesso,
                ruoli_permessi.created_at,
                ruoli_permessi.updated_at
     FROM ruoli_permessi
     JOIN ruoli ON ruoli_permessi.ruolo_id = ruoli.id
     JOIN permessi ON ruoli_permessi.permesso_id = permessi.id
     WHERE ruoli_permessi.ruolo_id = $1
     ORDER BY ruoli_permessi.permesso_id`,
        [ruolo_id]
    );

const findByPermessoId = (permesso_id) =>
    pool.query(
        `SELECT
                ruoli_permessi.ruolo_id,
                ruoli.nome AS ruolo,
                ruoli_permessi.permesso_id,
                permessi.codice AS permesso,
                ruoli_permessi.created_at,
                ruoli_permessi.updated_at
     FROM ruoli_permessi
     JOIN ruoli ON ruoli_permessi.ruolo_id = ruoli.id
     JOIN permessi ON ruoli_permessi.permesso_id = permessi.id
     WHERE ruoli_permessi.permesso_id = $1
     ORDER BY ruoli_permessi.ruolo_id`,
        [permesso_id]
    );


const create = ({ ruolo_id, permesso_id }) =>
    pool.query(
        `INSERT INTO ruoli_permessi (ruolo_id, permesso_id)
     VALUES ($1, $2)
     RETURNING ruolo_id, permesso_id, created_at, updated_at`,
        [ruolo_id, permesso_id]
    );

const remove = ({ ruolo_id, permesso_id }) =>
    pool.query(
        `DELETE FROM ruoli_permessi
     WHERE ruolo_id = $1 AND permesso_id = $2
     RETURNING ruolo_id, permesso_id, created_at, updated_at`,
        [ruolo_id, permesso_id]
    );

const hasPermesso = (ruolo_id, codice_permesso) => {
    return pool.query(
        `
        SELECT 1
        FROM ruoli_permessi rp
        JOIN permessi p ON p.id = rp.permesso_id
        WHERE rp.ruolo_id = $1
        AND p.codice = $2
        LIMIT 1;
        `,
        [ruolo_id, codice_permesso]
    );
};


module.exports = {
    findAll,
    findByRuoloId,
    findByPermessoId,
    create,
    remove,
    hasPermesso
};
