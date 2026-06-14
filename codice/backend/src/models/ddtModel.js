const pool = require('../config/db');

const baseSelect = `
    SELECT ddt.id,
           ddt.spedizione_id,
           spedizioni.ordine_id,
           ddt.numero_ddt,
           ddt.data_ddt,
           ddt.trasportatore,
           ddt.note,
           ddt.created_at,
           ddt.updated_at
    FROM ddt
    JOIN spedizioni ON ddt.spedizione_id = spedizioni.id
`;

const findAll = (client = pool) =>
    client.query(`
        ${baseSelect}
        ORDER BY ddt.id
    `);

const findById = (id, client = pool) =>
    client.query(
        `
        ${baseSelect}
        WHERE ddt.id = $1
        `,
        [id]
    );

const findBySpedizioneId = (spedizione_id, client = pool) =>
    client.query(
        `
        SELECT id, spedizione_id, numero_ddt, data_ddt, trasportatore, note, created_at, updated_at
        FROM ddt
        WHERE spedizione_id = $1
        `,
        [spedizione_id]
    );

const findByNumeroDdt = (numero_ddt, client = pool) =>
    client.query(
        `
        SELECT id, spedizione_id, numero_ddt, data_ddt, trasportatore, note, created_at, updated_at
        FROM ddt
        WHERE numero_ddt = $1
        ORDER BY id
        `,
        [numero_ddt]
    );

const findByDataDdt = (data_ddt, client = pool) =>
    client.query(
        `
        SELECT id, spedizione_id, numero_ddt, data_ddt, trasportatore, note, created_at, updated_at
        FROM ddt
        WHERE data_ddt = $1
        ORDER BY id
        `,
        [data_ddt]
    );

const getNextNumeroDdt = async (client = pool) => {
    const result = await client.query(
        `SELECT nextval('seq_ddt_numero_progressivo')::int AS progressivo`
    );

    const anno = new Date().getFullYear();
    const progressivo = String(result.rows[0].progressivo).padStart(4, '0');

    return `${anno}-${progressivo}`;
};

const create = async ({ spedizione_id, data_ddt, trasportatore, note }, client = pool) => {
    const numero_ddt = await getNextNumeroDdt(client);

    return client.query(
        `
        INSERT INTO ddt (spedizione_id, numero_ddt, data_ddt, trasportatore, note)
        VALUES ($1, $2, COALESCE($3, CURRENT_DATE), $4, $5)
        RETURNING id, spedizione_id, numero_ddt, data_ddt, trasportatore, note, created_at, updated_at
        `,
        [spedizione_id, numero_ddt, data_ddt ?? null, trasportatore ?? null, note ?? null]
    );
};

const update = (id, { data_ddt, trasportatore, note }, client = pool) =>
    client.query(
        `
        UPDATE ddt
        SET data_ddt = COALESCE($1, data_ddt),
            trasportatore = COALESCE($2, trasportatore),
            note = COALESCE($3, note),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id, spedizione_id, numero_ddt, data_ddt, trasportatore, note, created_at, updated_at
        `,
        [data_ddt ?? null, trasportatore ?? null, note ?? null, id]
    );

const remove = (id, client = pool) =>
    client.query(
        `
        DELETE FROM ddt
        WHERE id = $1
        RETURNING id, spedizione_id, numero_ddt, data_ddt, trasportatore, note, created_at, updated_at
        `,
        [id]
    );

module.exports = {
    findAll,
    findById,
    findBySpedizioneId,
    findByNumeroDdt,
    findByDataDdt,
    getNextNumeroDdt,
    create,
    update,
    remove
};