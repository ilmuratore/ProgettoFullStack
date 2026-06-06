const pool = require('../config/db');

// CREATE
const create = (data) => {
    const {
        cliente_id,
        destinazione_id,
        data_consegna_richiesta,
        note,
        utente_id
    } = data;

    return pool.query(
        `
        INSERT INTO ordini
        (cliente_id, destinazione_id, data_consegna_richiesta, note, utente_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `,
        [cliente_id, destinazione_id, data_consegna_richiesta, note, utente_id]
    );
};

// FIND ALL
const findAll = () => {
    return pool.query(`
        SELECT *
        FROM ordini
        ORDER BY data_ordine DESC;
    `);
};

// FIND BY ID
const findById = (id) => {
    return pool.query(
        `SELECT * FROM ordini WHERE id = $1;`,
        [id]
    );
};

// UPDATE (solo campi modificabili)
const update = (id, data) => {
    const { data_consegna_richiesta, note } = data;

    return pool.query(
        `
        UPDATE ordini
        SET data_consegna_richiesta = $1,
            note = $2
        WHERE id = $3
        RETURNING *;
        `,
        [data_consegna_richiesta, note, id]
    );
};

// UPDATE STATO COMMERCIALE
const updateStato = (id, stato) => {
    return pool.query(
        `
        UPDATE ordini
        SET stato = $1
        WHERE id = $2
        RETURNING *;
        `,
        [stato, id]
    );
};

// UPDATE STATO PICKING
const updateStatoPicking = (id, stato_picking) => {
    return pool.query(
        `
        UPDATE ordini
        SET stato_picking = $1
        WHERE id = $2
        RETURNING *;
        `,
        [stato_picking, id]
    );
};

// DELETE (hard delete)
const remove = (id) => {
    return pool.query(
        `
        DELETE FROM ordini
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
    updateStato,
    updateStatoPicking,
    remove
};
