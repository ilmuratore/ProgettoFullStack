
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


const cors = require('cors');

const app = express();
const port = process.env.PORT;



app.use(express.json());

app.use(helmet());

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiterGlobale = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: { successo: false, errore: 'Troppe richieste, riprova tra qualche minuto' }
});

app.use(limiterGlobale);


app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});


app.get('/', (req, res) => {
    res
        .status(200)
        .json({
            message: 'Backend avviato: OK',
            status: '200'
        });
});


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
        process.exit(1);
    }
};

const printConsoleSuccess = () => {
    console.log('✅ Database connesso e tabelle sincronizzate');
};

start();