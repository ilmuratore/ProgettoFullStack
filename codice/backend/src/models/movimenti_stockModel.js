const pool = require('../config/db');

let hasDirezioneColumnCache = null;

const hasDirezioneColumn = async (client = pool) => {
    if (hasDirezioneColumnCache !== null) {
        return hasDirezioneColumnCache;
    }

    const result = await client.query(
        `SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'movimenti_stock'
              AND column_name = 'direzione'
        ) AS exists`
    );

    hasDirezioneColumnCache = result.rows[0]?.exists === true;
    return hasDirezioneColumnCache;
};

const direzioneSelect = (enabled, tableAlias = 'movimenti_stock') =>
    enabled ? `${tableAlias}.direzione` : `NULL::char(3) AS direzione`;

const findAll = async (client = pool) => {
    const includeDirezione = await hasDirezioneColumn(client);

    return client.query(
        `SELECT movimenti_stock.id,
                movimenti_stock.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                movimenti_stock.ubicazione_id,
                ubicazioni.codice AS ubicazione,
                movimenti_stock.quantita,
                movimenti_stock.tipo,
                ${direzioneSelect(includeDirezione)},
                movimenti_stock.riferimento,
                movimenti_stock.note,
                movimenti_stock.created_at
         FROM movimenti_stock
         JOIN prodotti ON movimenti_stock.prodotto_id = prodotti.id
         JOIN ubicazioni ON movimenti_stock.ubicazione_id = ubicazioni.id
         ORDER BY movimenti_stock.created_at DESC`
    );
};

const findById = async (id, client = pool) => {
    const includeDirezione = await hasDirezioneColumn(client);

    return client.query(
        `SELECT movimenti_stock.id,
                movimenti_stock.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                movimenti_stock.ubicazione_id,
                ubicazioni.codice AS ubicazione,
                movimenti_stock.quantita,
                movimenti_stock.tipo,
                ${direzioneSelect(includeDirezione)},
                movimenti_stock.riferimento,
                movimenti_stock.note,
                movimenti_stock.created_at
         FROM movimenti_stock
         JOIN prodotti ON movimenti_stock.prodotto_id = prodotti.id
         JOIN ubicazioni ON movimenti_stock.ubicazione_id = ubicazioni.id
         WHERE movimenti_stock.id = $1`,
        [id]
    );
};

const findByProdottoId = async (prodotto_id, client = pool) => {
    const includeDirezione = await hasDirezioneColumn(client);

    return client.query(
        `SELECT id, prodotto_id, ubicazione_id, quantita,
                tipo, ${includeDirezione ? 'direzione' : 'NULL::char(3) AS direzione'}, riferimento, note, created_at
         FROM movimenti_stock
         WHERE prodotto_id = $1
         ORDER BY created_at DESC`,
        [prodotto_id]
    );
};

const findByUbicazioneId = async (ubicazione_id, client = pool) => {
    const includeDirezione = await hasDirezioneColumn(client);

    return client.query(
        `SELECT id, prodotto_id, ubicazione_id, quantita,
                tipo, ${includeDirezione ? 'direzione' : 'NULL::char(3) AS direzione'}, riferimento, note, created_at
         FROM movimenti_stock
         WHERE ubicazione_id = $1
         ORDER BY created_at DESC`,
        [ubicazione_id]
    );
};

const findByTipo = async (movimento_tipo, client = pool) => {
    const includeDirezione = await hasDirezioneColumn(client);

    return client.query(
        `SELECT id, prodotto_id, ubicazione_id, quantita,
                tipo, ${includeDirezione ? 'direzione' : 'NULL::char(3) AS direzione'}, riferimento, note, created_at
         FROM movimenti_stock
         WHERE tipo = $1
         ORDER BY created_at DESC`,
        [movimento_tipo]
    );
};

const findByRiferimento = async (riferimento, client = pool) => {
    const includeDirezione = await hasDirezioneColumn(client);

    return client.query(
        `SELECT id, prodotto_id, ubicazione_id, quantita,
                tipo, ${includeDirezione ? 'direzione' : 'NULL::char(3) AS direzione'}, riferimento, note, created_at
         FROM movimenti_stock
         WHERE riferimento = $1
         ORDER BY created_at DESC`,
        [riferimento]
    );
};

const create = async ({ prodotto_id, ubicazione_id, quantita, movimento_tipo, direzione = null, riferimento, note }, client = pool) => {
    const includeDirezione = await hasDirezioneColumn(client);

    if (includeDirezione) {
        return client.query(
            `INSERT INTO movimenti_stock (prodotto_id, ubicazione_id, quantita, tipo, direzione, riferimento, note)
             VALUES ($1, $2, $3, $4::movimento_tipo, $5, $6, $7)
             RETURNING id, prodotto_id, ubicazione_id, quantita, tipo, direzione, riferimento, note, created_at`,
            [prodotto_id, ubicazione_id, quantita, movimento_tipo, direzione, riferimento, note]
        );
    }

    return client.query(
        `INSERT INTO movimenti_stock (prodotto_id, ubicazione_id, quantita, tipo, riferimento, note)
         VALUES ($1, $2, $3, $4::movimento_tipo, $5, $6)
         RETURNING id, prodotto_id, ubicazione_id, quantita, tipo, NULL::char(3) AS direzione, riferimento, note, created_at`,
        [prodotto_id, ubicazione_id, quantita, movimento_tipo, riferimento, note]
    );
};

module.exports = {
    findAll, findById, findByProdottoId, findByUbicazioneId, findByTipo, findByRiferimento,
    create
};
