const db = require('../config/db');

module.exports = {
    findAll() {
        return db.query(`
      SELECT id, nome, categoria_padre_id
      FROM categorie
      ORDER BY nome ASC
    `);
    },

    findById(id) {
        return db.query(
            `SELECT * FROM categorie WHERE id = $1`,
            [id]
        );
    },

    create({ nome, categoria_padre_id }) {
        return db.query(
            `INSERT INTO categorie (nome, categoria_padre_id)
       VALUES ($1, $2)
       RETURNING *`,
            [nome, categoria_padre_id]
        );
    },

    update(id, { nome, categoria_padre_id }) {
        return db.query(
            `UPDATE categorie
       SET nome = $1,
           categoria_padre_id = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
            [nome, categoria_padre_id, id]
        );
    },

    remove(id) {
        return db.query(
            `DELETE FROM categorie WHERE id = $1`,
            [id]
        );
    }
};

