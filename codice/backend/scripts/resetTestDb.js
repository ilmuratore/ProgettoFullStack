require('./loadTestEnv');

const { Pool } = require('pg');

const buildConfig = (database) => ({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

const qIdent = (value) => `"${String(value).replace(/"/g, '""')}"`;

const resetTestDb = async () => {
    const testDbName = process.env.DB_NAME;
    if (!testDbName) {
        throw new Error('DB_NAME non configurato per i test');
    }
    if (!/test/i.test(testDbName)) {
        throw new Error(`DB_NAME=${testDbName} non sembra un database di test. Operazione bloccata.`);
    }

    const adminDbName = process.env.DB_ADMIN_DATABASE || 'postgres';
    const adminPool = new Pool(buildConfig(adminDbName));

    try {
        const exists = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [testDbName]);
        if (exists.rowCount === 0) {
            await adminPool.query(`CREATE DATABASE ${qIdent(testDbName)}`);
            console.log(`✅ Database di test creato: ${testDbName}`);
        }
    } finally {
        await adminPool.end();
    }

    const testPool = new Pool(buildConfig(testDbName));
    try {
        await testPool.query('DROP SCHEMA IF EXISTS public CASCADE');
        await testPool.query('CREATE SCHEMA public');
        await testPool.query('GRANT ALL ON SCHEMA public TO public');
        console.log(`✅ Schema public resettato su ${testDbName}`);
    } finally {
        await testPool.end();
    }
};

if (require.main === module) {
    resetTestDb().catch((err) => {
        console.error('❌ Reset database test fallito:', err.message);
        process.exit(1);
    });
}

module.exports = { resetTestDb };
