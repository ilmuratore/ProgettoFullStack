const pool = require('../config/db');

const findAll = async (client = pool) => {
    const executor = client || pool;
    const query = `
        SELECT
            o.*,
            COALESCE(SUM(r.quantita_ordinata * r.prezzo_unitario), 0) AS importo_calcolato
        FROM ordini_acquisto o
        LEFT JOIN righe_po r ON r.ordine_acquisto_id = o.id
        GROUP BY o.id
        ORDER BY o.id DESC
    `;
    return executor.query(query);
};

const findAllFiltered = async ({ stato, fornitore_id }, client = pool) => {
    const executor = client || pool;
    const params = [];
    const conditions = [];

    if (stato) {
        params.push(stato);
        conditions.push(`o.stato = $${params.length}`);
    }

    if (fornitore_id) {
        params.push(fornitore_id);
        conditions.push(`o.fornitore_id = $${params.length}`);
    }

    const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    const query = `
        SELECT
            o.*,
            COALESCE(SUM(r.quantita_ordinata * r.prezzo_unitario), 0) AS importo_calcolato
        FROM ordini_acquisto o
        LEFT JOIN righe_po r ON r.ordine_acquisto_id = o.id
        ${whereClause}
        GROUP BY o.id
        ORDER BY o.id DESC
    `;

    return executor.query(query, params);
};

const findDettaglioCompleto = async (id, client = pool) => {
    const executor = client || pool;
    const ordineRes = await executor.query(
        'SELECT * FROM ordini_acquisto WHERE id = $1',
        [id]
    );

    if (ordineRes.rowCount === 0) {
        return { ordine: null, righe: [] };
    }

    const righeRes = await executor.query(
        'SELECT * FROM righe_po WHERE ordine_acquisto_id = $1 ORDER BY id',
        [id]
    );

    return {
        ordine: ordineRes.rows[0],
        righe: righeRes.rows
    };
};

const findById = async (id, client = pool) => {
    const executor = client || pool;
    return executor.query(
        'SELECT * FROM ordini_acquisto WHERE id = $1',
        [id]
    );
};

const create = async (data, client = pool) => {
    const executor = client || pool;
    const {
        fornitore_id,
        data_prevista,
        importo_totale,
        note,
        utente_id
    } = data;

    const query = `
        INSERT INTO ordini_acquisto
            (fornitore_id, data_prevista, importo_totale, note, utente_id, stato)
        VALUES ($1, $2, $3, $4, $5, 'BOZZA')
        RETURNING *
    `;

    const values = [
        fornitore_id,
        data_prevista || null,
        importo_totale,
        note || null,
        utente_id
    ];

    return executor.query(query, values);
};

const update = async (id, data, client = pool) => {
    const executor = client || pool;

    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx += 1;
    }

    if (fields.length === 0) {
        return executor.query('SELECT * FROM ordini_acquisto WHERE id = $1', [id]);
    }

    values.push(id);

    const query = `
        UPDATE ordini_acquisto
        SET ${fields.join(', ')}
        WHERE id = $${values.length}
        RETURNING *
    `;

    return executor.query(query, values);
};

const updateStato = async (id, stato, client = pool) => {
    const executor = client || pool;
    return executor.query(
        'UPDATE ordini_acquisto SET stato = $1 WHERE id = $2 RETURNING *',
        [stato, id]
    );
};

module.exports = {
    findAll,
    findAllFiltered,
    findDettaglioCompleto,
    findById,
    create,
    update,
    updateStato
};
