if (process.env.NODE_ENV === 'test') {
    require('../../scripts/loadTestEnv');
} else {
    require('dotenv').config();
}
