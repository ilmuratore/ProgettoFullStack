const pool = require('../config/db');


const findAll = () =>
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
     ORDER BY contatti_fornitori.id`
    );


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

const update = (id, { fornitore_id, nome, ruolo, email, telefono }) =>
    pool.query(
        `UPDATE contatti_fornitori
     SET fornitore_id = COALESCE($1, fornitore_id),
         nome = COALESCE($2, nome),
         ruolo = COALESCE($3, ruolo),
         email = COALESCE($4, email),
         telefono = COALESCE($5, telefono),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING id, fornitore_id, nome, ruolo, email, telefono, created_at, updated_at`,
        [fornitore_id, nome, ruolo, email, telefono, id]
    );


const remove = (id) =>
    pool.query('DELETE FROM contatti_fornitori WHERE id = $1 RETURNING id', [id]);


module.exports = {
    findAll, findById, findByFornitoreId,
    create, update, remove
};
