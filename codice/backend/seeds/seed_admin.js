require('dotenv').config();

const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

const ADMIN_RUOLO_ID = 1;

const seedAdmin = async () => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const nome = process.env.ADMIN_NOME || 'Admin';
    const cognome = process.env.ADMIN_COGNOME || 'LogiChain';

    if (!email || !password) {
        console.error('ADMIN_EMAIL e ADMIN_PASSWORD devono essere definiti nel .env');
        process.exitCode = 1;
        return;
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const ruolo = await client.query(
            'SELECT id FROM ruoli WHERE id = $1',
            [ADMIN_RUOLO_ID]
        );

        if (ruolo.rowCount === 0) {
            throw new Error(
                'Ruolo Admin (id=1) non trovato - esegui prima: npm run seed_ruoli_permessi'
            );
        }

        const password_hash = await bcrypt.hash(password, 12);

        const result = await client.query(
            `INSERT INTO utenti (nome, cognome, email, password_hash, ruolo_id, attivo)
             VALUES ($1, $2, $3, $4, $5, true)
             ON CONFLICT (email) DO NOTHING
             RETURNING id, email`,
            [nome, cognome, email, password_hash, ADMIN_RUOLO_ID]
        );

        await client.query('COMMIT');

        if (result.rowCount > 0) {
            console.log(`Admin creato: ${result.rows[0].email} (id=${result.rows[0].id})`);
        } else {
            console.log(`Admin gia presente (${email}) - nessuna azione`);
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Errore durante il seed admin:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
};

if (require.main === module) {
    seedAdmin();
}

module.exports = { seedAdmin };
