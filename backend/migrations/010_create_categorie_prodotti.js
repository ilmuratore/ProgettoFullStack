exports.up = (pgm) => {
    pgm.createTable('categorie', {
        id: 'id',
        nome: { type: 'text', notNull: true, unique: true },
        categoria_padre_id: {
            type: 'integer',
            references: 'categorie',
            onDelete: 'NO ACTION'
        },
        created_at: { type: 'timestamptz', default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', default: pgm.func('NOW()') }
    });

    pgm.createTable('prodotti', {
        id: 'id',
        sku: { type: 'text', notNull: true, unique: true },
        nome: { type: 'text', notNull: true },
        descrizione: 'text',
        categoria_id: {
            type: 'integer',
            references: 'categorie',
            onDelete: 'NO ACTION'
        },
        unita_misura: 'text',
        peso_kg: 'numeric',
        scorta_minima: { type: 'integer', default: 0 },
        attivo: { type: 'boolean', default: true },
        created_at: { type: 'timestamptz', default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', default: pgm.func('NOW()') }
    });

    pgm.createIndex('prodotti', 'categoria_id');
    pgm.createIndex('prodotti', 'sku');
};
