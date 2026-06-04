const pool = require('../config/db');

const create = (data) => {
    const { ragione_sociale, piva_cf, email, telefono } = data;

    return pool.query(
        `
        INSERT INTO clienti (ragione_sociale, piva_cf, email, telefono)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `,
        [ragione_sociale, piva_cf, email, telefono]
    );
};

const findAll = () => {
    return pool.query(
        `
        SELECT *
        FROM clienti
        ORDER BY ragione_sociale;
        `
    );
};

const findById = (id) => {
    return pool.query(
        `
        SELECT *
        FROM clienti
        WHERE id = $1;
        `,
        [id]
    );
};

const update = (id, data) => {
    const { ragione_sociale, piva_cf, email, telefono, attivo } = data;

    return pool.query(
        `
        UPDATE clienti
        SET ragione_sociale = $1,
            piva_cf = $2,
            email = $3,
            telefono = $4,
            attivo = $5
        WHERE id = $6
        RETURNING *;
        `,
        [ragione_sociale, piva_cf, email, telefono, attivo, id]
    );
};

const disable = (id) => {
    return pool.query(
        `
        UPDATE clienti
        SET attivo = FALSE
        WHERE id = $1
        RETURNING id;
        `,
        [id]
    );
};

module.exports = {
    create,
    findAll,
    findById,
    update,
    disable
};
