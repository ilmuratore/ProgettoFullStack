const pool = require('../config/db');


const findAll = () =>
    pool.query(
        `SELECT movimenti_stock.id,
                movimenti_stock.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                movimenti_stock.ubicazione_da_id,
                ubicazione_da.codice AS ubicazione_da,
                movimenti_stock.ubicazione_a_id,
                ubicazione_a.codice AS ubicazione_a,
                movimenti_stock.quantita,
                movimenti_stock.tipo,
                movimenti_stock.utente_id,
                CONCAT(utenti.nome, ' ', utenti.cognome) AS utente,
                movimenti_stock.riferimento_tipo,
                movimenti_stock.riferimento_id,
                movimenti_stock.note,
                movimenti_stock.created_at
     FROM movimenti_stock
     JOIN prodotti ON movimenti_stock.prodotto_id = prodotti.id
     LEFT JOIN ubicazioni AS ubicazione_da ON movimenti_stock.ubicazione_da_id = ubicazione_da.id
     LEFT JOIN ubicazioni AS ubicazione_a ON movimenti_stock.ubicazione_a_id = ubicazione_a.id
     LEFT JOIN utenti ON movimenti_stock.utente_id = utenti.id
     ORDER BY movimenti_stock.created_at DESC`
    );


const findById = (id) =>
    pool.query(
        `SELECT movimenti_stock.id,
                movimenti_stock.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                movimenti_stock.ubicazione_da_id,
                ubicazione_da.codice AS ubicazione_da,
                movimenti_stock.ubicazione_a_id,
                ubicazione_a.codice AS ubicazione_a,
                movimenti_stock.quantita,
                movimenti_stock.tipo,
                movimenti_stock.utente_id,
                CONCAT(utenti.nome, ' ', utenti.cognome) AS utente,
                movimenti_stock.riferimento_tipo,
                movimenti_stock.riferimento_id,
                movimenti_stock.note,
                movimenti_stock.created_at
     FROM movimenti_stock
     JOIN prodotti ON movimenti_stock.prodotto_id = prodotti.id
     LEFT JOIN ubicazioni AS ubicazione_da ON movimenti_stock.ubicazione_da_id = ubicazione_da.id
     LEFT JOIN ubicazioni AS ubicazione_a ON movimenti_stock.ubicazione_a_id = ubicazione_a.id
     LEFT JOIN utenti ON movimenti_stock.utente_id = utenti.id
     WHERE movimenti_stock.id = $1`,
        [id]
    );

const findByProdottoId = (prodotto_id) =>
    pool.query(
        `SELECT id, prodotto_id, ubicazione_da_id, ubicazione_a_id, quantita,
                tipo, utente_id, riferimento_tipo, riferimento_id, note, created_at
     FROM movimenti_stock
     WHERE prodotto_id = $1
     ORDER BY created_at DESC`,
        [prodotto_id]
    );

const findByUbicazioneId = (ubicazione_id) =>
    pool.query(
        `SELECT id, prodotto_id, ubicazione_da_id, ubicazione_a_id, quantita,
                tipo, utente_id, riferimento_tipo, riferimento_id, note, created_at
     FROM movimenti_stock
     WHERE ubicazione_da_id = $1
        OR ubicazione_a_id = $1
     ORDER BY created_at DESC`,
        [ubicazione_id]
    );

const findByTipo = (tipo) =>
    pool.query(
        `SELECT id, prodotto_id, ubicazione_da_id, ubicazione_a_id, quantita,
                tipo, utente_id, riferimento_tipo, riferimento_id, note, created_at
     FROM movimenti_stock
     WHERE tipo = $1
     ORDER BY created_at DESC`,
        [tipo]
    );

const findByRiferimento = (riferimento_tipo, riferimento_id) =>
    pool.query(
        `SELECT id, prodotto_id, ubicazione_da_id, ubicazione_a_id, quantita,
                tipo, utente_id, riferimento_tipo, riferimento_id, note, created_at
     FROM movimenti_stock
     WHERE riferimento_tipo = $1
       AND riferimento_id = $2
     ORDER BY created_at DESC`,
        [riferimento_tipo, riferimento_id]
    );


const create = ({ prodotto_id, ubicazione_da_id, ubicazione_a_id, quantita, tipo, utente_id, riferimento_tipo, riferimento_id, note }) =>
    pool.query(
        `INSERT INTO movimenti_stock (prodotto_id, ubicazione_da_id, ubicazione_a_id, quantita, tipo, utente_id, riferimento_tipo, riferimento_id, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, prodotto_id, ubicazione_da_id, ubicazione_a_id, quantita, tipo, utente_id, riferimento_tipo, riferimento_id, note, created_at`,
        [prodotto_id, ubicazione_da_id, ubicazione_a_id, quantita, tipo, utente_id, riferimento_tipo, riferimento_id, note]
    );


const registraCaricoAcquisto = ({ prodotto_id, ubicazione_a_id, quantita, utente_id, riferimento_tipo, riferimento_id, note }) =>
    create({
        prodotto_id,
        ubicazione_da_id: null,
        ubicazione_a_id,
        quantita,
        tipo: 'CARICO_ACQUISTO',
        utente_id,
        riferimento_tipo,
        riferimento_id,
        note
    });

const registraScaricoVendita = ({ prodotto_id, ubicazione_da_id, quantita, utente_id, riferimento_tipo, riferimento_id, note }) =>
    create({
        prodotto_id,
        ubicazione_da_id,
        ubicazione_a_id: null,
        quantita,
        tipo: 'SCARICO_VENDITA',
        utente_id,
        riferimento_tipo,
        riferimento_id,
        note
    });

const registraSpostamento = ({ prodotto_id, ubicazione_da_id, ubicazione_a_id, quantita, utente_id, riferimento_tipo, riferimento_id, note }) =>
    create({
        prodotto_id,
        ubicazione_da_id,
        ubicazione_a_id,
        quantita,
        tipo: 'SPOSTAMENTO',
        utente_id,
        riferimento_tipo,
        riferimento_id,
        note
    });

const registraRettificaPositiva = ({ prodotto_id, ubicazione_a_id, quantita, utente_id, riferimento_tipo, riferimento_id, note }) =>
    create({
        prodotto_id,
        ubicazione_da_id: null,
        ubicazione_a_id,
        quantita,
        tipo: 'RETTIFICA_POSITIVA',
        utente_id,
        riferimento_tipo,
        riferimento_id,
        note
    });

const registraRettificaNegativa = ({ prodotto_id, ubicazione_da_id, quantita, utente_id, riferimento_tipo, riferimento_id, note }) =>
    create({
        prodotto_id,
        ubicazione_da_id,
        ubicazione_a_id: null,
        quantita,
        tipo: 'RETTIFICA_NEGATIVA',
        utente_id,
        riferimento_tipo,
        riferimento_id,
        note
    });

const registraReso = ({ prodotto_id, ubicazione_a_id, quantita, utente_id, riferimento_tipo, riferimento_id, note }) =>
    create({
        prodotto_id,
        ubicazione_da_id: null,
        ubicazione_a_id,
        quantita,
        tipo: 'RESO',
        utente_id,
        riferimento_tipo,
        riferimento_id,
        note
    });


module.exports = {
    findAll, findById, findByProdottoId, findByUbicazioneId, findByTipo, findByRiferimento,
    create, registraCaricoAcquisto, registraScaricoVendita,
    registraSpostamento, registraRettificaPositiva, registraRettificaNegativa, registraReso
};
