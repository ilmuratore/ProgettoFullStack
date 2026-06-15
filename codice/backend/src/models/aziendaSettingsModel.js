const pool = require('../config/db');

const findActive = (client = pool) => {
    const executor = client || pool;
    return executor.query(
        `SELECT id,
                ragione_sociale,
                piva,
                codice_fiscale,
                indirizzo,
                citta,
                provincia,
                cap,
                nazione,
                email,
                pec,
                telefono,
                sito_web,
                iban,
                sdi,
                logo_url,
                created_at,
                updated_at
         FROM azienda_settings
         WHERE attivo = true
         ORDER BY id ASC
         LIMIT 1`
    );
};

const getActive = async (client = pool) => {
    const result = await findActive(client);
    return result.rows[0] || null;
};


const ALLOWED_FIELDS = [
    'ragione_sociale', 'piva', 'codice_fiscale', 'indirizzo', 'citta',
    'provincia', 'cap', 'nazione', 'email', 'pec', 'telefono',
    'sito_web', 'iban', 'sdi', 'logo_url'
];

const update = (id, fields, client = pool) => {
    const executor = client || pool;
    const keys = Object.keys(fields).filter((k) => ALLOWED_FIELDS.includes(k));
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = keys.map((k) => fields[k]);
    return executor.query(
        `UPDATE azienda_settings
         SET ${setClause}
         WHERE id = $1
         RETURNING id, ragione_sociale, piva, codice_fiscale, indirizzo, citta,
                   provincia, cap, nazione, email, pec, telefono, sito_web,
                   iban, sdi, logo_url, created_at, updated_at`,
        [id, ...values]
    );
};

module.exports = {
    findActive,
    getActive,
    update,
};
