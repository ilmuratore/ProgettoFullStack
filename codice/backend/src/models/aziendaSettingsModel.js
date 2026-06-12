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

module.exports = {
    findActive,
    getActive,
};
