if (process.env.NODE_ENV === 'test') {
    require('./loadTestEnv');
} else {
    require('dotenv').config();
}
