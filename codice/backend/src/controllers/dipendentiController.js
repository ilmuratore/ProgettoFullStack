const dipendentiService = require('../services/dipendentiService');

// GET /api/v1/dipendenti
const getAll = async (req, res, next) => {
    try {
        const dipendenti = await dipendentiService.getAll();
        return res.status(200).json({ status: 'success', data: dipendenti });
    } catch (err) {
        return next(err);
    }
};

// GET /api/v1/dipendenti/:id
const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const dipendente = await dipendentiService.getById(id);
        return res.status(200).json({ status: 'success', data: dipendente });
    } catch (err) {
        return next(err);
    }
};

// POST /api/v1/dipendenti
const create = async (req, res, next) => {
    try {
        const { nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id } = req.body;
        const dipendente = await dipendentiService.create({
            nome,
            cognome,
            codice_fiscale,
            ruolo_operativo,
            data_assunzione,
            utente_id
        });
        return res.status(201).json({ status: 'success', data: dipendente });
    } catch (err) {
        return next(err);
    }
};

// PATCH /api/v1/dipendenti/:id
const update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id } = req.body;

        const fields = {};
        if (nome            !== undefined) fields.nome            = nome;
        if (cognome         !== undefined) fields.cognome         = cognome;
        if (codice_fiscale  !== undefined) fields.codice_fiscale  = codice_fiscale;
        if (ruolo_operativo !== undefined) fields.ruolo_operativo = ruolo_operativo;
        if (data_assunzione !== undefined) fields.data_assunzione = data_assunzione;
        if (utente_id       !== undefined) fields.utente_id       = utente_id;

        const dipendente = await dipendentiService.update(id, fields);
        return res.status(200).json({ status: 'success', data: dipendente });
    } catch (err) {
        return next(err);
    }
};

// DELETE /api/v1/dipendenti/:id
const elimina = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        await dipendentiService.deleteDipendente(id);
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

module.exports = { getAll, getById, create, update, elimina };
