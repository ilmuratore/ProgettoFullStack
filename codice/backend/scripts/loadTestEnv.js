const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.test');
const fallbackPath = path.resolve(process.cwd(), '.env.test.example');

const result = dotenv.config({ path: envPath, quiet: true });
if (result.error) {
    dotenv.config({ path: fallbackPath, quiet: true });
}

process.env.NODE_ENV = 'test';
