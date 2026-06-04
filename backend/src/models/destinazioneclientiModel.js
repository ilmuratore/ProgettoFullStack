const pool = require('../config/db');

const create = (data) => {
    const {
        cliente_id,
        etichetta,
        indirizzo,
        cap,
        citta,
        provincia,
        paese,
        predefinita
    } = data;

    return pool.query(
        `
        INSERT INTO destinazioni_clienti
        (cliente_id, etichetta, indirizzo, cap, citta, provincia, paese, predefinita)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
        `,
        [cliente_id, etichetta, indirizzo, cap, citta, provincia, paese, predefinita]
    );
};

const findByCliente = (cliente_id) => {
    return pool.query(
        `
        SELECT *
        FROM destinazioni_clienti
        WHERE cliente_id = $1
        ORDER BY predefinita DESC, etichetta;
        `,
        [cliente_id]
    );
};

const findById = (id) => {
    return pool.query(
        `
        SELECT *
        FROM destinazioni_clienti
        WHERE id = $1;
        `,
        [id]
    );
};

const update = (id, data) => {
    const {
        etichetta,
        indirizzo,
        cap,
        citta,
        provincia,
        paese,
        predefinita
    } = data;

    return pool.query(
        `
        UPDATE destinazioni_clienti
        SET etichetta = $1,
            indirizzo = $2,
            cap = $3,
            citta = $4,
            provincia = $5,
            paese = $6,
            predefinita = $7
        WHERE id = $8
        RETURNING *;
        `,
        [etichetta, indirizzo, cap, citta, provincia, paese, predefinita, id]
    );
};

const remove = (id) => {
    return pool.query(
        `
        DELETE FROM destinazioni_clienti
        WHERE id = $1
        RETURNING id;
        `,
        [id]
    );
};

module.exports = {
    create,
    findByCliente,
    findById,
    update,
    remove
};
