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
        throw new Error('CREDENZIALI_NON_VALIDE');
    }

    if (!utente.attivo) {
        throw new Error('UTENTE_DISABILITATO');
    }

    const passwordValida = await bcrypt.compare(password, utente.password_hash);
    if (!passwordValida) {
        throw new Error('CREDENZIALI_NON_VALIDE');
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
            ruolo_nome: utente.ruolo,
        }
    };
};


const register = async ({ nome, cognome, email, password, ruolo_id, attivo = true }) => {
    const emailEsistente = await utentiModel.findByEmail(email);
    if (emailEsistente.rows.length) {
        throw new Error('EMAIL_GIA_ESISTENTE');
    }

    const ruoloResult = await ruoliModel.findById(ruolo_id);
    const ruolo = ruoloResult.rows[0];
    if (!ruolo) {
        throw new Error('RUOLO_NON_VALIDO');
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
        ruolo_nome: utenteCompleto?.ruolo || ruolo.nome,
    };
};


const getMe = async (utente_id) => {
    const result = await utentiModel.findById(utente_id);
    const utente = result.rows[0];

    if (!utente) {
        throw new Error('UTENTE_NON_TROVATO');
    }

    return {
        id: utente.id,
        nome: utente.nome,
        cognome: utente.cognome,
        email: utente.email,
        ruolo_id: utente.ruolo_id,
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