const db = require('../config/db');

const BASE_COLS = `
    c.id,
    c.nome,
    c.categoria_padre_id,
    padre.nome  AS categoria_padre_nome,
    COUNT(pr.id)::int AS prodotti_count,
    c.created_at,
    c.updated_at
`;

const findAll = () =>
    db.query(`
        SELECT ${BASE_COLS}
        FROM   categorie c
        LEFT   JOIN categorie padre ON padre.id = c.categoria_padre_id
        LEFT   JOIN prodotti  pr    ON pr.categoria_id = c.id AND pr.attivo = true
        GROUP  BY c.id, padre.nome
        ORDER  BY c.categoria_padre_id NULLS FIRST, c.nome ASC
    `);

const findById = (id) =>
    db.query(`
        SELECT ${BASE_COLS}
        FROM   categorie c
        LEFT   JOIN categorie padre ON padre.id = c.categoria_padre_id
        LEFT   JOIN prodotti  pr    ON pr.categoria_id = c.id AND pr.attivo = true
        WHERE  c.id = $1
        GROUP  BY c.id, padre.nome
    `, [id]);

const findByNome = (nome) =>
    db.query(
        `SELECT id FROM categorie WHERE LOWER(nome) = LOWER($1)`,
        [nome]
    );

const countProdotti = (id) =>
    db.query(
        `SELECT COUNT(*)::int AS cnt FROM prodotti WHERE categoria_id = $1 AND attivo = true`,
        [id]
    );

const countSubcategorie = (id) =>
    db.query(
        `SELECT COUNT(*)::int AS cnt FROM categorie WHERE categoria_padre_id = $1`,
        [id]
    );

const create = ({ nome, categoria_padre_id }) =>
    db.query(
        `INSERT INTO categorie (nome, categoria_padre_id)
         VALUES ($1, $2)
         RETURNING id, nome, categoria_padre_id, created_at, updated_at`,
        [nome, categoria_padre_id ?? null]
    );

const update = (id, fields) => {
    const setClauses = [];
    const values     = [];
    let   idx        = 1;

    if (fields.nome !== undefined) {
        setClauses.push(`nome = $${idx++}`);
        values.push(fields.nome);
    }

    if ('categoria_padre_id' in fields) {
        setClauses.push(`categoria_padre_id = $${idx++}`);
        values.push(fields.categoria_padre_id);
    }

    setClauses.push('updated_at = NOW()');
    values.push(id);

    return db.query(
        `UPDATE categorie
         SET    ${setClauses.join(', ')}
         WHERE  id = $${idx}
         RETURNING id, nome, categoria_padre_id, created_at, updated_at`,
        values
    );
};

const remove = (id) =>
    db.query(`DELETE FROM categorie WHERE id = $1`, [id]);

module.exports = {
    findAll,
    findById,
    findByNome,
    countProdotti,
    countSubcategorie,
    create,
    update,
    remove,
};
