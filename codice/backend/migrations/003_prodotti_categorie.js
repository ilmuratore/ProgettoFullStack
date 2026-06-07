const TRIGGER = { when: 'BEFORE', operation: 'UPDATE', level: 'ROW', function: 'fn_set_updated_at' };

exports.up = (pgm) => {

    pgm.createTable('categorie', {
        id:                 'id',
        nome:               { type: 'text', notNull: true, unique: true },
        categoria_padre_id: { type: 'integer', references: 'categorie', onDelete: 'NO ACTION' },
        created_at:         { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:         { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('categorie', 'set_updated_at', TRIGGER);
    pgm.createIndex('categorie', 'categoria_padre_id', { name: 'categorie_categoria_padre_id_index' });
    pgm.createIndex('categorie', 'nome',               { name: 'categorie_nome_index' });

    pgm.createTable('prodotti', {
        id:              'id',
        sku:             { type: 'text', notNull: true, unique: true },
        nome:            { type: 'text', notNull: true },
        descrizione:     'text',
        categoria_id:    { type: 'integer', references: 'categorie', onDelete: 'NO ACTION' },
        unita_misura:    'text',
        peso_kg:         'numeric',
        scorta_minima:   { type: 'integer', notNull: true, default: 0 },
        prezzo:          { type: 'numeric(12,2)', notNull: true, default: 0 },
        data_agg_prezzo: { type: 'timestamptz', default: pgm.func('NOW()') },
        attivo:          { type: 'boolean', notNull: true, default: true },
        created_at:      { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:      { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('prodotti', 'set_updated_at', TRIGGER);

    pgm.createTrigger('prodotti', 'trg_data_agg_prezzo', {
        when: 'BEFORE', operation: 'UPDATE', level: 'ROW',
        function: 'fn_set_data_agg_prezzo'
    });

    pgm.createIndex('prodotti', 'categoria_id', { name: 'prodotti_categoria_id_index' });
    pgm.createIndex('prodotti', 'nome',          { name: 'prodotti_nome_index' });
    pgm.createIndex('prodotti', 'sku',            { name: 'prodotti_sku_index' });
    pgm.createIndex('prodotti', 'prezzo',         { name: 'idx_prodotti_prezzo' });
    pgm.createIndex('prodotti', 'attivo',         { name: 'idx_prodotti_attivo' });
};

exports.down = (pgm) => {
    pgm.dropTable('prodotti');
    pgm.dropTable('categorie');
};