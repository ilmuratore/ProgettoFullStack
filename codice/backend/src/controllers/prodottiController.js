const prodottiService = require('../services/prodottiService');
const importService = require('../services/importService');


const getAll = async (req, res, next) => {
    try {
        const prodotti = await prodottiService.getAll();
        return res.status(200).json({ status: 'success', data: prodotti });
    } catch (err) {
        return next(err);
    }
};


const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const prodotto = await prodottiService.getById(id);
        return res.status(200).json({ status: 'success', data: prodotto });
    } catch (err) {
        return next(err);
    }
};


const create = async (req, res, next) => {
    try {
        const { nome, sku, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, attivo } = req.body;
        const prodotto = await prodottiService.create({
            nome,
            sku,
            descrizione,
            categoria_id,
            unita_misura,
            peso_kg,
            scorta_minima,
            prezzo,
            attivo
        });
        return res.status(201).json({ status: 'success', data: prodotto });
    } catch (err) {
        return next(err);
    }
};


const update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { nome, sku, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, attivo } = req.body;

        const fields = {};
        if (nome         !== undefined) fields.nome         = nome;
        if (sku          !== undefined) fields.sku          = sku;
        if (descrizione  !== undefined) fields.descrizione  = descrizione;
        if (prezzo       !== undefined) fields.prezzo       = prezzo;
        if (categoria_id !== undefined) fields.categoria_id = categoria_id;
        if (unita_misura !== undefined) fields.unita_misura = unita_misura;
        if (peso_kg      !== undefined) fields.peso_kg      = peso_kg;
        if (scorta_minima !== undefined) fields.scorta_minima = scorta_minima;
        if (attivo       !== undefined) fields.attivo       = attivo;

        const prodotto = await prodottiService.update(id, fields);
        return res.status(200).json({ status: 'success', data: prodotto });
    } catch (err) {
        return next(err);
    }
};


const elimina = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        await prodottiService.deleteProdotto(id);
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const importProdotti = async (req, res, next) => {
    try {
        if (!req.file || !req.file.buffer) {
            const err = new Error('File obbligatorio');
            err.code = 'VALIDATION_ERROR';
            err.details = [{ field: 'file', message: 'Caricare un file CSV o XLSX' }];
            throw err;
        }

        const lowerName = (req.file.originalname || '').toLowerCase();
        const rows = lowerName.endsWith('.csv')
            ? await importService.parseCSV(req.file.buffer)
            : await importService.parseXLSX(req.file.buffer);

        const result = await importService.importProdotti(rows);
        return res.status(200).json({ status: 'success', data: result });
    } catch (err) {
        return next(err);
    }
};

const downloadImportTemplate = async (_req, res, next) => {
    try {
        const buffer = await importService.getTemplateCSVBuffer();
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="template-import-prodotti.csv"');
        res.setHeader('Content-Length', buffer.length);
        return res.end(buffer);
    } catch (err) {
        return next(err);
    }
};


module.exports = { getAll, getById, create, update, elimina, importProdotti, downloadImportTemplate };
