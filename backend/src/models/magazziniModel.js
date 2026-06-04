const pool = require('../config/db');


const findAll = () =>
    pool.query(
        `SELECT id,
                codice,
                nome,
                indirizzo,
                cap,
                citta,
                provincia,
                paese,
                attiva,
                descrizione
     FROM magazzini
     ORDER BY id`
    );


const findById = (id) =>
    pool.query(
        `SELECT id,
                codice,
                nome,
                indirizzo,
                cap,
                citta,
                provincia,
                paese,
                attiva,
                descrizione
     FROM magazzini
     WHERE id = $1`,
        [id]
    );

const findByCodice = (codice) =>
    pool.query(
        `SELECT id,
                codice,
                nome,
                indirizzo,
                cap,
                citta,
                provincia,
                paese,
                attiva,
                descrizione
     FROM magazzini
     WHERE codice = $1`,
        [codice]
    );

const findAttivi = () =>
    pool.query(
        `SELECT id,
                codice,
                nome,
                indirizzo,
                cap,
                citta,
                provincia,
                paese,
                attiva,
                descrizione
     FROM magazzini
     WHERE attiva = true
     ORDER BY nome`
    );


const create = ({ codice, nome, indirizzo, cap, citta, provincia, paese, attiva = true, descrizione }) =>
    pool.query(
        `INSERT INTO magazzini (codice, nome, indirizzo, cap, citta, provincia, paese, attiva, descrizione)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, codice, nome, indirizzo, cap, citta, provincia, paese, attiva, descrizione`,
        [codice, nome, indirizzo, cap, citta, provincia, paese, attiva, descrizione]
    );

const update = (id, { codice, nome, indirizzo, cap, citta, provincia, paese, attiva, descrizione }) =>
    pool.query(
        `UPDATE magazzini
     SET codice = COALESCE($1, codice),
         nome = COALESCE($2, nome),
         indirizzo = COALESCE($3, indirizzo),
         cap = COALESCE($4, cap),
         citta = COALESCE($5, citta),
         provincia = COALESCE($6, provincia),
         paese = COALESCE($7, paese),
         attiva = COALESCE($8, attiva),
         descrizione = COALESCE($9, descrizione),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $10
     RETURNING id, codice, nome, indirizzo, cap, citta, provincia, paese, attiva, descrizione`,
        [codice, nome, indirizzo, cap, citta, provincia, paese, attiva, descrizione, id]
    );


const remove = (id) =>
    pool.query(
        `UPDATE magazzini
     SET attiva = false,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id`,
        [id]
    );


module.exports = {
    findAll, findById, findByCodice, findAttivi,
    create, update, remove
};
