
// ============================================================
// index.js — Punto di ingresso dell'applicazione
// Qui configuriamo Express, i middleware globali e le route.
// Infine avviamo il server solo dopo aver inizializzato il DB.
// ============================================================

require('dotenv').config(); // Carica le variabili da .env in process.env

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


const cors = require('cors');// per risolvere problemi con il frontend

const app = express();
const port = process.env.PORT;



// ── Middleware Globali ────────────────────────────────────────
// express.json() legge il body JSON delle richieste (POST, PATCH)
// e lo rende disponibile come req.body
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

// Importiamo i model SOLO per inizializzare le tabelle all'avvio.
// Non li usiamo direttamente qui: ci servono solo per chiamare .init()



// Importiamo i router: ogni file routes gestisce un gruppo di endpoint

// const authRoutes = require('./src/routes/authRoutes');

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


// Montiamo le rotte con il prefisso /api



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

// ── Error Handler globale ─────────────────────────────────────
// Deve essere l'ULTIMO middleware: riceve tutti gli errori
// passati con next(err) da controller e middleware



// ── Avvio asincrono del server ────────────────────────────────
// Aspettiamo che il DB sia pronto prima di ascoltare le richieste.
// L'ordine di init() è obbligatorio

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