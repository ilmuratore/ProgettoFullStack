const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.test');
const fallbackPath = path.resolve(process.cwd(), '.env.test.example');

const result = dotenv.config({ path: envPath, quiet: true });
if (result.error) {
    dotenv.config({ path: fallbackPath, quiet: true });
}

process.env.NODE_ENV = 'test';

const encode = (value) => encodeURIComponent(String(value || ''));

const buildDatabaseUrl = (databaseName) => {
    const user = encode(process.env.DB_USER || 'postgres');
    const password = encode(process.env.DB_PASSWORD || '');
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';

    const auth = password ? `${user}:${password}` : user;
    return `postgres://${auth}@${host}:${port}/${databaseName}`;
};

const normalizeTestDatabaseEnv = () => {
    const dbName = process.env.DB_NAME || 'logichain_test';

    if (!/test/i.test(dbName)) {
        throw new Error(`DB_NAME=${dbName} non sembra un database di test. Operazione bloccata.`);
    }

    process.env.DB_NAME = dbName;

    // node-pg-migrate usa DATABASE_URL come sorgente principale.
    // Nei test la rigeneriamo dai campi DB_* per evitare mismatch tipo:
    // DB_PASSWORD aggiornato ma DATABASE_URL rimasto con change_me.
    process.env.DATABASE_URL = buildDatabaseUrl(dbName);
};

normalizeTestDatabaseEnv();

module.exports = {
    buildDatabaseUrl,
    normalizeTestDatabaseEnv,
};
