require('dotenv').config();

const createApp = require('./src/app');
const { initDB } = require('./src/config/initDB');

const app = createApp();
const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await initDB();
        app.listen(port, () => console.log(`🚀 LogiChain V2 su http://localhost:${port}`));
    } catch (err) {
        console.error('❌ Avvio fallito:', err.message);
        process.exit(1);
    }
};

if (require.main === module) {
    start();
}

module.exports = app;
