
const pool = require('./db');

const testConnection = async () => {
    const client = await pool.connect();
    try {
        await client.query('SELECT 1');
    } finally {
        client.release();
    }
};

const autoMigrate = async () => {
    const { default: migrate } = await import('node-pg-migrate');

    await migrate({
        databaseUrl: process.env.DATABASE_URL,
        dir: 'migrations',
        direction: 'up',
        migrationsTable: 'pgmigrations',
        log: (msg) => console.log(`  [migrate] ${msg}`)
    });
};

const logSchemaStatus = async () => {
    const { rows } = await pool.query(`
        SELECT COUNT(*) AS totale
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type   = 'BASE TABLE'
    `);

    const totale = parseInt(rows[0].totale, 10);
    console.log(`  📊 Tabelle presenti nel DB: ${totale} (atteso V2: 28)`);

    if (totale < 27) {
        console.warn(`  ⚠️  Tabelle mancanti — esegui: npm run migrate`);
    }
};

const initDB = async () => {
    const client = await pool.connect();
    try {
        await client.query('SELECT 1');
        console.log('✅ Database connesso');

        const { rows } = await client.query(`
            SELECT COUNT(*) AS n FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        `);
        const n = parseInt(rows[0].n, 10);
        console.log(`📊 Tabelle nel DB: ${n} (atteso: 28)`);
        if (n < 27) console.warn('⚠️  Schema non aggiornato — esegui: npm run migrate');
    } finally {
        client.release();
    }
};

module.exports = { initDB };
