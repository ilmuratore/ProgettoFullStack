const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const { errorHandler } = require('./middleware/errorHandler');
const { mountSwagger } = require('./config/swagger');

const createApp = () => {
    const app = express();

    app.use(express.json());
    app.use(helmet());
    app.use(cors({
        origin: [process.env.CORS_ORIGIN || 'http://localhost:5173', 'http://127.0.0.1:5173'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: Number(process.env.RATE_LIMIT_MAX || 10000),
        message: { status: 'error', code: 'RATE_LIMIT', message: 'Troppe richieste' },
        skip: () => process.env.NODE_ENV === 'test'
    }));

    if (process.env.NODE_ENV !== 'test') {
        app.use((req, _res, next) => {
            console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
            next();
        });
    }

    app.get('/', (_req, res) => res.json({ status: 'success', version: '2.0.0' }));

    mountSwagger(app);

    // M01 — Auth & RBAC
    app.use('/api/v1/auth', require('./routes/authRoutes'));
    app.use('/api/v1/utenti', require('./routes/utentiRoutes'));

    // M02 — I nostri Prodotti (Listino) + Categorie
    app.use('/api/v1/prodotti', require('./routes/prodottiRoutes'));
    app.use('/api/v1/categorie', require('./routes/categorieRoutes'));

    // M03 — I nostri Fornitori
    app.use('/api/v1/fornitori', require('./routes/fornitoriRoutes'));

    // M04 — I nostri Clienti
    app.use('/api/v1/clienti', require('./routes/clientiRoutes'));

    // M05 — Corrieri & Dipendenti
    app.use('/api/v1/dipendenti', require('./routes/dipendentiRoutes'));
    app.use('/api/v1/corrieri', require('./routes/corrieriRoutes'));

    // M06 — Magazzino
    app.use('/api/v1/magazzini', require('./routes/magazziniRoutes'));
    app.use('/api/v1/ubicazioni', require('./routes/ubicazioniRoutes'));

    // M07 — Giacenze & Movimenti Stock
    app.use('/api/v1/giacenze', require('./routes/giacenzeRoutes'));
    app.use('/api/v1/movimenti-stock', require('./routes/movimenti_stockRoutes'));

    // M08 — Ordini in Entrata (Purchase Orders)
    app.use('/api/v1/ordini-acquisto', require('./routes/ordini_acquistoRoutes'));
    app.use('/api/v1/ricezioni', require('./routes/ricezioniRoutes'));

    // M09 — Ordini in Uscita (Sales Orders)
    app.use('/api/v1/ordini', require('./routes/ordiniRoutes'));

    // M10 — Spedizioni & DDT
    app.use('/api/v1/spedizioni', require('./routes/spedizioniRoutes'));

    // M11 — Notifiche
    app.use('/api/v1/notifiche', require('./routes/notificheRoutes'));

    // M13 — Ricerca Globale Ecosistema
    app.use('/api/v1/ecosystem', require('./routes/ecosystemRoutes'));

    // M16 — Richieste di Acquisto
    app.use('/api/v1/richieste-acquisto', require('./routes/richiesteAcquistoRoutes'));

    app.use('/api/v1/azienda-settings', require('./routes/aziendaSettingsRoutes'));

    app.use((_req, res) => res.status(404).json({
        status: 'error',
        code: 'RESOURCE_NOT_FOUND',
        message: 'Endpoint non trovato'
    }));

    app.use(errorHandler);

    return app;
};

module.exports = createApp;
