require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const utentiModel = require('../models/utentiModel');
const ruoliModel = require('../models/ruoliModel');


const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};


const login = async (email, password) => {
    const result = await utentiModel.findByEmail(email);
    const utente = result.rows[0];

    if (!utente) {
        throwError('CREDENZIALI_NON_VALIDE', 'Credenziali non valide');
    }

    if (!utente.attivo) {
        throwError('UTENTE_DISABILITATO', 'Utente disabilitato');
    }

    const passwordValida = await bcrypt.compare(password, utente.password_hash);
    if (!passwordValida) {
        throwError('CREDENZIALI_NON_VALIDE', 'Credenziali non valide');
    }

    const token = jwt.sign(
        {
            id: utente.id,
            email: utente.email,
            ruolo_id: utente.ruolo_id,
            ruolo: utente.ruolo
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
        token,
        utente: {
            id: utente.id,
            nome: utente.nome,
            cognome: utente.cognome,
            email: utente.email,
            ruolo_id: utente.ruolo_id,
            ruolo: utente.ruolo,
            ruolo_nome: utente.ruolo,
        }
    };
};


const RUOLI_PRIVILEGIATI = ['Admin', 'Dev'];

const register = async ({ nome, cognome, email, password, ruolo_id, attivo = true }, attore = null) => {
    const emailEsistente = await utentiModel.findByEmail(email);
    if (emailEsistente.rows.length) {
        throwError('EMAIL_GIA_ESISTENTE', 'Email gia esistente');
    }

    const ruoloResult = await ruoliModel.findById(ruolo_id);
    const ruolo = ruoloResult.rows[0];
    if (!ruolo) {
        throwError('RUOLO_NON_VALIDO', 'Ruolo non valido');
    }

    if (RUOLI_PRIVILEGIATI.includes(ruolo.nome)) {
        const attoreRuolo = attore?.ruolo;
        if (!attoreRuolo || !RUOLI_PRIVILEGIATI.includes(attoreRuolo)) {
            throwError('ACCESS_DENIED', 'Solo Admin o Dev possono assegnare il ruolo ' + ruolo.nome);
        }
    }

    const password_hash = await bcrypt.hash(password, 12);

    const createResult = await utentiModel.create({
        nome,
        cognome,
        email,
        password_hash,
        ruolo_id,
        attivo
    });

    const utenteCreato = createResult.rows[0];
    const utenteCompletoResult = await utentiModel.findById(utenteCreato.id);
    const utenteCompleto = utenteCompletoResult.rows[0];

    return {
        id: utenteCreato.id,
        nome: utenteCreato.nome,
        cognome: utenteCreato.cognome,
        email: utenteCreato.email,
        ruolo_id: utenteCreato.ruolo_id,
        ruolo: utenteCompleto?.ruolo || ruolo.nome,
        ruolo_nome: utenteCompleto?.ruolo || ruolo.nome,
    };
};


const getMe = async (utente_id) => {
    const result = await utentiModel.findById(utente_id);
    const utente = result.rows[0];

    if (!utente) {
        throwError('UTENTE_NON_TROVATO', 'Utente non trovato');
    }

    return {
        id: utente.id,
        nome: utente.nome,
        cognome: utente.cognome,
        email: utente.email,
        ruolo_id: utente.ruolo_id,
        ruolo: utente.ruolo,
        ruolo_nome: utente.ruolo,
    };
};


const changePassword = async (utente_id, password_attuale, password_nuova) => {
    const hashResult = await utentiModel.findPasswordHash(utente_id);
    if (hashResult.rowCount === 0 || !hashResult.rows[0].attivo) {
        throwError('RESOURCE_NOT_FOUND', 'Utente non trovato');
    }

    const valida = await bcrypt.compare(password_attuale, hashResult.rows[0].password_hash);
    if (!valida) {
        throwError('PASSWORD_NON_VALIDA', 'La password attuale non è corretta');
    }

    if (password_attuale === password_nuova) {
        throwError('VALIDATION_ERROR', 'La nuova password deve essere diversa da quella attuale');
    }

    const nuovoHash = await bcrypt.hash(password_nuova, 12);
    await utentiModel.updatePassword(utente_id, nuovoHash);
};


module.exports = {
    login,
    register,
    getMe,
    changePassword,
};
