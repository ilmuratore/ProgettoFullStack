const categorieModel = require('../models/categorieModel');

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────

const getAll = async () => {
    const result = await categorieModel.findAll();
    return result.rows;
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────

const getById = async (id) => {
    const result = await categorieModel.findById(id);
    if (result.rowCount === 0) throwError('RESOURCE_NOT_FOUND', 'Categoria non trovata');
    return result.rows[0];
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

const create = async ({ nome, categoria_padre_id }) => {
    // nome univoco (case-insensitive)
    const existing = await categorieModel.findByNome(nome);
    if (existing.rowCount > 0) throwError('DUPLICATE_ENTRY', 'Nome categoria già esistente');

    // Se è specificato un padre, deve esistere e non può essere già una sottocategoria
    // (vincolo max 2 livelli: radice → sottocategoria)
    if (categoria_padre_id !== undefined && categoria_padre_id !== null) {
        const padre = await categorieModel.findById(categoria_padre_id);
        if (padre.rowCount === 0) throwError('RESOURCE_NOT_FOUND', 'Categoria padre non trovata');

        if (padre.rows[0].categoria_padre_id !== null) {
            throwError(
                'VALIDATION_ERROR',
                'Non è possibile creare sottocategorie di una sottocategoria (massimo 2 livelli)'
            );
        }
    }

    const inserted = await categorieModel.create({ nome, categoria_padre_id });
    // findById restituisce la vista arricchita (con padre_nome e prodotti_count)
    return (await categorieModel.findById(inserted.rows[0].id)).rows[0];
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────

const update = async (id, fields) => {
    await getById(id); // 404 guard

    if (Object.keys(fields).length === 0) {
        throwError('VALIDATION_ERROR', 'Nessun campo valido da aggiornare');
    }

    // nome univoco (escludendo sé stesso)
    if (fields.nome !== undefined) {
        const existing = await categorieModel.findByNome(fields.nome);
        if (existing.rowCount > 0 && existing.rows[0].id !== Number(id)) {
            throwError('DUPLICATE_ENTRY', 'Nome categoria già esistente');
        }
    }

    // Validazioni su categoria_padre_id
    if ('categoria_padre_id' in fields && fields.categoria_padre_id !== null) {
        const nuovoPadreId = Number(fields.categoria_padre_id);

        // No auto-riferimento
        if (nuovoPadreId === Number(id)) {
            throwError('VALIDATION_ERROR', 'Una categoria non può essere padre di se stessa');
        }

        // Padre deve esistere
        const padre = await categorieModel.findById(nuovoPadreId);
        if (padre.rowCount === 0) throwError('RESOURCE_NOT_FOUND', 'Categoria padre non trovata');

        // Max 2 livelli: il padre non può essere già una sottocategoria
        if (padre.rows[0].categoria_padre_id !== null) {
            throwError(
                'VALIDATION_ERROR',
                'Non è possibile creare sottocategorie di una sottocategoria (massimo 2 livelli)'
            );
        }

        // Una categoria con sottocategorie non può diventare essa stessa una sottocategoria
        const subCount = await categorieModel.countSubcategorie(id);
        if (subCount.rows[0].cnt > 0) {
            throwError(
                'VALIDATION_ERROR',
                'Una categoria con sottocategorie non può diventare essa stessa una sottocategoria'
            );
        }
    }

    const updated = await categorieModel.update(id, fields);
    return (await categorieModel.findById(updated.rows[0].id)).rows[0];
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

const deleteCategoria = async (id) => {
    await getById(id); // 404 guard

    // Blocco FK: prodotti attivi associati
    const prodotti = await categorieModel.countProdotti(id);
    if (prodotti.rows[0].cnt > 0) {
        throwError(
            'CATEGORIA_CON_PRODOTTI',
            `Impossibile eliminare: la categoria ha ${prodotti.rows[0].cnt} prodotto/i associato/i. Riassegnali prima di procedere.`
        );
    }

    // Blocco FK: sottocategorie
    const sub = await categorieModel.countSubcategorie(id);
    if (sub.rows[0].cnt > 0) {
        throwError(
            'CATEGORIA_CON_SOTTOCATEGORIE',
            `Impossibile eliminare: la categoria ha ${sub.rows[0].cnt} sottocategoria/e. Eliminale prima di procedere.`
        );
    }

    await categorieModel.remove(id);
};

module.exports = { getAll, getById, create, update, deleteCategoria };
