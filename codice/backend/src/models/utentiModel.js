const pool = require('../config/db');

const PUBLIC_COLS = `
    utenti.id,
    utenti.nome,
    utenti.cognome,
    utenti.email,
    utenti.ruolo_id,
    ruoli.nome AS ruolo,
    utenti.attivo,
    utenti.created_at,
    utenti.updated_at
`;

const WITH_DIPENDENTE_COLS = `
    ${PUBLIC_COLS},
    d.id AS dipendente_id,
    d.nome AS dipendente_nome,
    d.cognome AS dipendente_cognome,
    d.codice_fiscale AS dipendente_codice_fiscale,
    d.ruolo_operativo AS dipendente_ruolo_operativo
`;

const findAll = (client = pool) =>
    client.query(
        `SELECT ${WITH_DIPENDENTE_COLS}
         FROM utenti
         JOIN ruoli ON utenti.ruolo_id = ruoli.id
         LEFT JOIN dipendenti d ON d.utente_id = utenti.id
         ORDER BY utenti.id`
    );

const findById = (id, client = pool) =>
    client.query(
        `SELECT ${WITH_DIPENDENTE_COLS}
         FROM utenti
         JOIN ruoli ON utenti.ruolo_id = ruoli.id
         LEFT JOIN dipendenti d ON d.utente_id = utenti.id
         WHERE utenti.id = $1`,
        [id]
    );

const findByEmail = (email, client = pool) =>
    client.query(
        `SELECT utenti.*, ruoli.nome AS ruolo
         FROM utenti
         JOIN ruoli ON utenti.ruolo_id = ruoli.id
         WHERE utenti.email = $1`,
        [email]
    );

const findAttiviByPermessi = (codiciPermesso, client = pool) =>
    client.query(
        `SELECT ${PUBLIC_COLS}
         FROM utenti
         JOIN ruoli ON utenti.ruolo_id = ruoli.id
         JOIN ruoli_permessi rp ON rp.ruolo_id = utenti.ruolo_id
         JOIN permessi p ON p.id = rp.permesso_id
         WHERE utenti.attivo = true
           AND p.codice = ANY($1::text[])
         GROUP BY utenti.id, utenti.nome, utenti.cognome, utenti.email, utenti.ruolo_id, ruoli.nome, utenti.attivo, utenti.created_at, utenti.updated_at
         HAVING COUNT(DISTINCT p.codice) = $2
         ORDER BY utenti.id`,
        [codiciPermesso, codiciPermesso.length]
    );

const findPasswordHash = (id, client = pool) =>
    client.query(
        `SELECT id, password_hash, attivo FROM utenti WHERE id = $1`,
        [id]
    );

const create = ({ nome, cognome, email, password_hash, ruolo_id, attivo = true }, client = pool) =>
    client.query(
        `INSERT INTO utenti (nome, cognome, email, password_hash, ruolo_id, attivo)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, nome, cognome, email, ruolo_id, attivo, created_at, updated_at`,
        [nome, cognome, email, password_hash, ruolo_id, attivo]
    );

const update = (id, { nome, cognome, email, ruolo_id, attivo }, client = pool) =>
    client.query(
        `UPDATE utenti
         SET nome       = COALESCE($1, nome),
             cognome    = COALESCE($2, cognome),
             email      = COALESCE($3, email),
             ruolo_id   = COALESCE($4, ruolo_id),
             attivo     = COALESCE($5, attivo),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING id, nome, cognome, email, ruolo_id, attivo, created_at, updated_at`,
        [nome, cognome, email, ruolo_id, attivo, id]
    );

const updatePassword = (id, hashedPassword, client = pool) =>
    client.query(
        `UPDATE utenti
         SET password_hash = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, updated_at`,
        [hashedPassword, id]
    );

const remove = (id, client = pool) =>
    client.query(
        `UPDATE utenti
         SET attivo = false,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING id, attivo, updated_at`,
        [id]
    );

const findDipendenteById = (dipendenteId, client = pool) =>
    client.query(
        `SELECT id, nome, cognome, codice_fiscale, ruolo_operativo, utente_id
         FROM dipendenti
         WHERE id = $1`,
        [dipendenteId]
    );

const unlinkDipendenteFromUtente = (utenteId, client = pool) =>
    client.query(
        `UPDATE dipendenti
         SET utente_id = NULL,
             updated_at = NOW()
         WHERE utente_id = $1
         RETURNING id`,
        [utenteId]
    );

const assignDipendenteToUtente = (dipendenteId, utenteId, client = pool) =>
    client.query(
        `UPDATE dipendenti
         SET utente_id = $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING id, nome, cognome, codice_fiscale, ruolo_operativo, utente_id`,
        [utenteId, dipendenteId]
    );

module.exports = {
    findAll,
    findById,
    findByEmail,
    findPasswordHash,
    findAttiviByPermessi,
    create,
    update,
    updatePassword,
    remove,
    findDipendenteById,
    unlinkDipendenteFromUtente,
    assignDipendenteToUtente,
};
