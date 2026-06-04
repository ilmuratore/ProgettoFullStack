
// ============================================================
// index.js — Punto di ingresso dell'applicazione
// Qui configuriamo Express, i middleware globali e le route.
// Infine avviamo il server solo dopo aver inizializzato il DB.
// ============================================================

require('dotenv').config(); // Carica le variabili da .env in process.env

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


const cors = require('cors');

const app = express();
const port = process.env.PORT;



// ── Middleware Globali ────────────────────────────────────────

app.use(express.json());
// helmet aggiunge header HTTP di sicurezza (anti-XSS, clickjacking, ecc.)
app.use(helmet());

// Cors controlla quali origini esterne possono chiamare le nostre API.
// Da commentare/decommentare in base a quando il frontend è attivo.
app.use(cors({
    origin: 'http://localhost:5173', // URL esatto del frontend 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Rate Limiter Globale ──────────────────────────────────────
// Limita ogni IP a 100 richieste ogni 15 minuti.
// Protegge da attacchi di tipo brute-force e DDoS basilari.
const limiterGlobale = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: { successo: false, errore: 'Troppe richieste, riprova tra qualche minuto' }
});

app.use(limiterGlobale);

// Log di debug delle richieste nel terminale
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});







// ── Route di test ─────────────────────────────────────────────
// Endpoint rapido per verificare che il server sia raggiungibile
app.get('/', (req, res) => {
    res
        .status(200)
        .json({
            message: 'Backend avviato: OK',
            status: '200'
        });
});






// ── Catch-all 404 ────────────────────────────────────────────
// Se nessuna route sopra ha risposto, l'endpoint richiesto non esiste.
app.use((req, res) => {
    res
        .status(404)
        .json({
            successo: false,
            errore: 'Endpoint non trovato'
        });
});





const start = async () => {
    try {


        printConsoleSuccess();

        app.listen(port, () =>
            console.log(`🚀 Server in ascolto su http://localhost:${port}`)
        );
    } catch (err) {
        console.error('❌ Errore di avvio backend:', err);
        process.exit(1); // Usciamo con codice errore se qualcosa va storto
    }
};

const printConsoleSuccess = () => {
    console.log('✅ Database connesso e tabelle sincronizzate');
};

start();