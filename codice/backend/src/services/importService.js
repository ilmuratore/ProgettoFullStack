const ExcelJS = require('exceljs');
const { Readable } = require('stream');
const pool = require('../config/db');
const prodottiModel = require('../models/prodottiModel');
const categorieModel = require('../models/categorieModel');

const throwError = (code, message, details) => {
    const err = new Error(message);
    err.code = code;
    if (details) err.details = details;
    throw err;
};

const normalizeBoolean = (value) => {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value === 'boolean') return value;
    const lowered = String(value).trim().toLowerCase();
    if (['true', '1', 'si', 'sì', 'yes'].includes(lowered)) return true;
    if (['false', '0', 'no'].includes(lowered)) return false;
    return null;
};

const normalizeNumber = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const normalized = Number(String(value).replace(',', '.'));
    return Number.isFinite(normalized) ? normalized : null;
};

const normalizeInteger = (value) => {
    const number = normalizeNumber(value);
    return number !== null && Number.isInteger(number) ? number : null;
};

const normalizeString = (value) => {
    if (value === undefined || value === null) return '';
    return String(value).trim();
};

const normalizeCellValue = (value) => {
    if (value === undefined || value === null) return '';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value !== 'object') return value;
    if (Object.prototype.hasOwnProperty.call(value, 'result')) return normalizeCellValue(value.result);
    if (Object.prototype.hasOwnProperty.call(value, 'text')) return normalizeCellValue(value.text);
    if (Object.prototype.hasOwnProperty.call(value, 'hyperlink')) return normalizeCellValue(value.hyperlink);
    if (Array.isArray(value.richText)) return value.richText.map((part) => part.text || '').join('');
    return String(value);
};

const isEmptyRow = (row) =>
    Object.values(row).every((value) => normalizeString(value) === '');

const worksheetToObjects = (worksheet) => {
    if (!worksheet || worksheet.rowCount === 0) {
        throwError('VALIDATION_ERROR', 'File vuoto');
    }

    const headers = [];
    worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
        headers[colNumber] = normalizeString(normalizeCellValue(cell.value)).toLowerCase();
    });

    if (!headers.some(Boolean)) {
        throwError('VALIDATION_ERROR', 'Intestazioni mancanti nel file import');
    }

    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return;

        const obj = {};
        let hasValue = false;

        headers.forEach((header, colNumber) => {
            if (!header) return;
            const value = normalizeCellValue(row.getCell(colNumber).value);
            obj[header] = value;
            if (normalizeString(value) !== '') hasValue = true;
        });

        if (hasValue) rows.push(obj);
    });

    return rows;
};

const parseCSV = async (buffer) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = await workbook.csv.read(Readable.from(buffer));
    return worksheetToObjects(worksheet);
};

const parseXLSX = async (buffer) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
        throwError('VALIDATION_ERROR', 'File XLSX vuoto');
    }
    return worksheetToObjects(worksheet);
};

const buildProdottoPayload = async (rawRow, client) => {
    const sku = normalizeString(rawRow.sku);
    const nome = normalizeString(rawRow.nome);
    const descrizione = normalizeString(rawRow.descrizione) || null;
    const unita_misura = normalizeString(rawRow.unita_misura) || null;
    const prezzo = normalizeNumber(rawRow.prezzo);
    const peso_kg = normalizeNumber(rawRow.peso_kg);
    const scorta_minima = normalizeInteger(rawRow.scorta_minima);
    const attivo = normalizeBoolean(rawRow.attivo);

    if (!sku) throwError('VALIDATION_ERROR', 'SKU obbligatorio');
    if (!nome) throwError('VALIDATION_ERROR', 'Nome obbligatorio');
    if (prezzo === null || prezzo <= 0) throwError('VALIDATION_ERROR', 'Prezzo obbligatorio e maggiore di zero');
    if (peso_kg !== null && peso_kg < 0) throwError('VALIDATION_ERROR', 'Peso non valido');
    if (scorta_minima !== null && scorta_minima < 0) throwError('VALIDATION_ERROR', 'Scorta minima non valida');
    if (attivo === null) throwError('VALIDATION_ERROR', 'Valore attivo non valido');

    let categoria_id = normalizeInteger(rawRow.categoria_id);
    const categoriaNome = normalizeString(rawRow.categoria);

    if (categoria_id === null && categoriaNome) {
        const categoriaRes = await categorieModel.findByNome(categoriaNome, client);
        if (categoriaRes.rowCount === 0) {
            throwError('VALIDATION_ERROR', `Categoria "${categoriaNome}" non trovata`);
        }
        categoria_id = Number(categoriaRes.rows[0].id);
    }

    return {
        sku,
        nome,
        descrizione,
        categoria_id,
        unita_misura,
        peso_kg,
        scorta_minima: scorta_minima ?? 0,
        prezzo,
        attivo
    };
};

const importProdotti = async (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
        throwError('VALIDATION_ERROR', 'Il file non contiene righe importabili');
    }

    const client = await pool.connect();
    let importati = 0;
    let saltati = 0;
    const errori = [];

    try {
        await client.query('BEGIN');

        for (let index = 0; index < rows.length; index++) {
            const rowNumber = index + 2;
            const rawRow = rows[index];

            if (isEmptyRow(rawRow)) {
                saltati++;
                continue;
            }

            try {
                const payload = await buildProdottoPayload(rawRow, client);
                const existingRes = await prodottiModel.findBySku(payload.sku, client);

                if (existingRes.rowCount > 0) {
                    await prodottiModel.update(existingRes.rows[0].id, payload, client);
                } else {
                    await prodottiModel.create(payload, client);
                }

                importati++;
            } catch (err) {
                errori.push({ riga: rowNumber, motivo: err.message || 'Errore import riga' });
            }
        }

        const processedRows = importati + saltati + errori.length;
        if (processedRows === 0) {
            throwError('VALIDATION_ERROR', 'Il file non contiene righe valide');
        }

        if (errori.length > processedRows / 2) {
            await client.query('ROLLBACK');
            return { importati: 0, saltati: 0, errori };
        }

        await client.query('COMMIT');
        return { importati, saltati, errori };
    } catch (err) {
        try { await client.query('ROLLBACK'); } catch {}
        throw err;
    } finally {
        client.release();
    }
};

const getTemplateCSVBuffer = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('template-prodotti');
    worksheet.addRow(['sku', 'nome', 'descrizione', 'categoria_id', 'unita_misura', 'peso_kg', 'scorta_minima', 'prezzo', 'attivo']);
    worksheet.addRow(['SKU-001', 'Prodotto demo A', 'Prodotto esempio', 1, 'pezzo', 1.25, 10, 12.50, true]);
    worksheet.addRow(['SKU-002', 'Prodotto demo B', 'Secondo esempio', 2, 'kg', 0.75, 5, 8.90, true]);
    const buffer = await workbook.csv.writeBuffer();
    return Buffer.from(buffer);
};

module.exports = {
    parseCSV,
    parseXLSX,
    importProdotti,
    getTemplateCSVBuffer
};
