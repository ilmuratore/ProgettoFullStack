require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const utentiModel = require('../models/utentiModel');
const ruoliModel = require('../models/ruoliModel');


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
            ruolo: utente.ruolo
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
        ruolo: utenteCompleto?.ruolo || ruolo.nome
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
        ruolo: utente.ruolo
    };
};


module.exports = {
    login,
    register,
    getMe
};
