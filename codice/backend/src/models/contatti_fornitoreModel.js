const pool = require('../config/db');


const findById = (id) =>
    pool.query(
        `SELECT contatti_fornitori.id,
                contatti_fornitori.fornitore_id,
                fornitori.ragione_sociale AS fornitore,
                contatti_fornitori.nome,
                contatti_fornitori.ruolo,
                contatti_fornitori.email,
                contatti_fornitori.telefono,
                contatti_fornitori.created_at,
                contatti_fornitori.updated_at
         FROM contatti_fornitori
         JOIN fornitori ON contatti_fornitori.fornitore_id = fornitori.id
         WHERE contatti_fornitori.id = $1`,
        [id]
    );

const findByFornitoreId = (fornitore_id) =>
    pool.query(
        `SELECT id, fornitore_id, nome, ruolo, email, telefono, created_at, updated_at
         FROM contatti_fornitori
         WHERE fornitore_id = $1
         ORDER BY id`,
        [fornitore_id]
    );

const create = ({ fornitore_id, nome, ruolo, email, telefono }) =>
    pool.query(
        `INSERT INTO contatti_fornitori (fornitore_id, nome, ruolo, email, telefono)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, fornitore_id, nome, ruolo, email, telefono, created_at, updated_at`,
        [fornitore_id, nome, ruolo, email, telefono]
    );

const update = (id, { nome, ruolo, email, telefono }) =>
    pool.query(
        `UPDATE contatti_fornitori
         SET nome = COALESCE($1, nome),
             ruolo = COALESCE($2, ruolo),
             email = COALESCE($3, email),
             telefono = COALESCE($4, telefono),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, fornitore_id, nome, ruolo, email, telefono, created_at, updated_at`,
        [nome, ruolo, email, telefono, id]
    );


module.exports = {
    findById,
    findByFornitoreId,
    create,
    update
};
