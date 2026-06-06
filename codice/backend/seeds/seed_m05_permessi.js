
require('dotenv').config();

const pool = require('../src/config/db');

const nuoviPermessi = [
    { codice: 'corrieri:read',      descrizione: 'Visualizza corrieri' },
    { codice: 'corrieri:write',     descrizione: 'Crea/modifica corrieri' },
    { codice: 'corrieri:delete',    descrizione: 'Elimina corrieri' },
    { codice: 'dipendenti:read',    descrizione: 'Visualizza dipendenti' },
    { codice: 'dipendenti:write',   descrizione: 'Crea/modifica dipendenti' },
    { codice: 'dipendenti:delete',  descrizione: 'Elimina dipendenti' }
];

const seed = async () => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (const p of nuoviPermessi) {
            await client.query(
                `INSERT INTO permessi (codice, descrizione)
                 VALUES ($1, $2)
                 ON CONFLICT (codice) DO NOTHING`,
                [p.codice, p.descrizione]
            );
        }

        const ruoloResult = await client.query(
            `SELECT id FROM ruoli WHERE nome = 'Admin' LIMIT 1`
        );

        if (ruoloResult.rowCount === 0) {
            throw new Error('Ruolo Admin non trovato — eseguire seed_ruoli_permessi prima.');
        }

        const adminId = ruoloResult.rows[0].id;

        for (const p of nuoviPermessi) {
            await client.query(
                `INSERT INTO ruoli_permessi (ruolo_id, permesso_id)
                 SELECT $1, id FROM permessi WHERE codice = $2
                 ON CONFLICT (ruolo_id, permesso_id) DO NOTHING`,
                [adminId, p.codice]
            );
        }

        await client.query('COMMIT');

        console.log('✅ seed_m05_permessi completato:');
        console.log(`   Permessi aggiunti: ${nuoviPermessi.map(p => p.codice).join(', ')}`);
        console.log(`   Assegnati al ruolo Admin (id=${adminId})`);

        const check = await client.query(
            `SELECT COUNT(*) AS totale
             FROM ruoli_permessi rp
             JOIN permessi p ON rp.permesso_id = p.id
             WHERE rp.ruolo_id = $1
               AND p.codice = ANY($2::text[])`,
            [adminId, nuoviPermessi.map(p => p.codice)]
        );

        console.log(`   Verifica: ${check.rows[0].totale}/6 permessi assegnati ad Admin ✓`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Errore seed_m05_permessi:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
};

if (require.main === module) {
    seed();
}

module.exports = { seed };