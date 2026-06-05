exports.up = (pgm) => {
    // -------------------------
    // TABELLA PRODOTTI
    // -------------------------
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
        scorta_minima: { type: 'integer', notNull: true, default: 0 },
        attivo: { type: 'boolean', notNull: true, default: true },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    // Trigger updated_at
    pgm.createTrigger('prodotti', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('prodotti');

};