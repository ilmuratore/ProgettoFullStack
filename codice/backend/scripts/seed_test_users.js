require('./loadTestEnv');

const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

const TEST_PASSWORD = 'Test123!';

const USERS = [
    { nome: 'Test', cognome: 'Supporto', email: 'supporto@test.local', ruolo: 'Supporto' },
    { nome: 'Test', cognome: 'Resp Azienda', email: 'resp.azienda@test.local', ruolo: 'Resp. Azienda' },
    { nome: 'Test', cognome: 'HR', email: 'resp.hr@test.local', ruolo: 'Resp. HR' },
    { nome: 'Test', cognome: 'Vendite', email: 'resp.vendite@test.local', ruolo: 'Resp. Vendite' },
    { nome: 'Test', cognome: 'Acquisti', email: 'resp.acquisti@test.local', ruolo: 'Resp. Acquisti' },
    { nome: 'Test', cognome: 'Magazzino', email: 'resp.magazzino@test.local', ruolo: 'Resp. Magazzino' },
    { nome: 'Test', cognome: 'Operatore', email: 'operatore@test.local', ruolo: 'Operatore' },
    { nome: 'Test', cognome: 'Corriere', email: 'corriere@test.local', ruolo: 'Corriere' },
];

const seedTestUsers = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const ruoloResult = await client.query('SELECT id, nome FROM ruoli');
        const ruoliByNome = Object.fromEntries(ruoloResult.rows.map((r) => [r.nome, r.id]));
        const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);

        for (const user of USERS) {
            const ruoloId = ruoliByNome[user.ruolo];
            if (!ruoloId) {
                throw new Error(`Ruolo non trovato per utente test: ${user.ruolo}`);
            }
            await client.query(
                `INSERT INTO utenti (nome, cognome, email, password_hash, ruolo_id, attivo)
                 VALUES ($1, $2, $3, $4, $5, true)
                 ON CONFLICT (email) DO UPDATE SET
                    nome = EXCLUDED.nome,
                    cognome = EXCLUDED.cognome,
                    password_hash = EXCLUDED.password_hash,
                    ruolo_id = EXCLUDED.ruolo_id,
                    attivo = true,
                    updated_at = NOW()`,
                [user.nome, user.cognome, user.email, passwordHash, ruoloId]
            );
        }

        await client.query('COMMIT');
        console.log(`✅ Utenti test seedati: ${USERS.length}. Password comune: ${TEST_PASSWORD}`);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
};

if (require.main === module) {
    seedTestUsers().catch((err) => {
        console.error('❌ Seed utenti test fallito:', err.message);
        process.exit(1);
    });
}

module.exports = { seedTestUsers, TEST_PASSWORD, USERS };
