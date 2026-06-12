const richiesteService = require('../services/richiesteAcquistoService');

const getAll = async (req, res, next) => {
    try { res.json({ status: 'success', data: await richiesteService.getAll(req.query) }); }
    catch (err) { next(err); }
};
const getById = async (req, res, next) => {
    try { res.json({ status: 'success', data: await richiesteService.getById(req.params.id) }); }
    catch (err) { next(err); }
};
const create = async (req, res, next) => {
    try { res.status(201).json({ status: 'success', data: await richiesteService.create(req.body, req.user.id) }); }
    catch (err) { next(err); }
};
const updateStato = async (req, res, next) => {
    try { res.json({ status: 'success', data: await richiesteService.updateStato(req.params.id, req.body.stato) }); }
    catch (err) { next(err); }
};
const updateNote = async (req, res, next) => {
    try { res.json({ status: 'success', data: await richiesteService.updateNote(req.params.id, req.body.note) }); }
    catch (err) { next(err); }
};
const remove = async (req, res, next) => {
    try { await richiesteService.remove(req.params.id); res.status(204).send(); }
    catch (err) { next(err); }
};
const addRiga = async (req, res, next) => {
    try { res.status(201).json({ status: 'success', data: await richiesteService.addRiga(req.params.id, req.body) }); }
    catch (err) { next(err); }
};
const updateRiga = async (req, res, next) => {
    try { res.json({ status: 'success', data: await richiesteService.updateRiga(req.params.id, req.params.riga_id, req.body.quantita_richiesta) }); }
    catch (err) { next(err); }
};
const removeRiga = async (req, res, next) => {
    try { await richiesteService.removeRiga(req.params.id, req.params.riga_id); res.status(204).send(); }
    catch (err) { next(err); }
};

module.exports = { getAll, getById, create, updateStato, updateNote, remove, addRiga, updateRiga, removeRiga };
