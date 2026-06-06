require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const { initDB } = require('./src/config/initDB');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: { status: 'error', code: 'RATE_LIMIT', message: 'Troppe richieste' }
}));
app.use((req, _res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/', (_req, res) => res.json({ status: 'success', version: '2.0.0' }));

// -----------------------------------------------------------------
// Routes (decommentare man mano che i moduli vengono implementati)
// -----------------------------------------------------------------

// M01 — Auth & RBAC
app.use('/api/v1/auth', require('./src/routes/authRoutes'));
// app.use('/api/v1/utenti',     require('./src/routes/utentiRoutes'));

// M02 — I nostri Prodotti (Listino)
app.use('/api/v1/prodotti', require('./src/routes/prodottiRoutes'));
// app.use('/api/v1/categorie',  require('./src/routes/categorieRoutes'));

// M03 — I nostri Fornitori
app.use('/api/v1/fornitori',  require('./src/routes/fornitoriRoutes'));

// M04 — I nostri Clienti
app.use('/api/v1/clienti',    require('./src/routes/clientiRoutes'));

// M05 — Corrieri & Dipendenti
// app.use('/api/v1/dipendenti', require('./src/routes/dipendentiRoutes'));

// M06 — Magazzino
app.use('/api/v1/magazzini',  require('./src/routes/magazziniRoutes'));
app.use('/api/v1/ubicazioni', require('./src/routes/ubicazioniRoutes'));

// M07 — Giacenze & Movimenti Stock
// app.use('/api/v1/giacenze',         require('./src/routes/giacenzeRoutes'));
// app.use('/api/v1/movimenti-stock',  require('./src/routes/movimentiStockRoutes'));

// M08 — Ordini in Entrata (Purchase Orders)
// app.use('/api/v1/ordini-acquisto',  require('./src/routes/ordiniAcquistoRoutes'));
// app.use('/api/v1/ricezioni',        require('./src/routes/ricezioniRoutes'));

// M09 — Ordini in Uscita (Sales Orders)
// app.use('/api/v1/ordini',           require('./src/routes/ordiniRoutes'));

// M10 — Spedizioni & DDT
// app.use('/api/v1/spedizioni',       require('./src/routes/spedizioniRoutes'));
// app.use('/api/v1/ddt',              require('./src/routes/ddtRoutes'));

// M11 — Notifiche
// app.use('/api/v1/notifiche',        require('./src/routes/notificheRoutes'));

// M12 — Dashboard & KPI
// app.use('/api/v1/dashboard',        require('./src/routes/dashboardRoutes'));

// M13 — Ricerca Globale Ecosistema
// app.use('/api/v1/ecosystem',        require('./src/routes/ecosystemRoutes'));

// M16 — Richieste di Acquisto
// app.use('/api/v1/richieste-acquisto', require('./src/routes/richiesteAcquistoRoutes'));

// -----------------------------------------------------------------
// 404 catch-all
// -----------------------------------------------------------------

app.use((_req, res) => res.status(404).json({ status: 'error', code: 'RESOURCE_NOT_FOUND', message: 'Endpoint non trovato' }));

app.use(errorHandler);

const start = async () => {
    try {
        await initDB();
        app.listen(port, () => console.log(`🚀 LogiChain V2 su http://localhost:${port}`));
    } catch (err) {
        console.error('❌ Avvio fallito:', err.message);
        process.exit(1);
    }
};

start();
