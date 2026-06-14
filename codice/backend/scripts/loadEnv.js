const path = require('path');
const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'test') {
    require('./loadTestEnv');
} else {
    dotenv.config({
        path: path.resolve(__dirname, '../.env')
    });
}