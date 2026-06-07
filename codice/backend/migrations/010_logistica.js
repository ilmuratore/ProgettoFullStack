const TRIGGER = { when: 'BEFORE', operation: 'UPDATE', level: 'ROW', function: 'fn_set_updated_at' };

exports.up = (pgm) => {

    pgm.createTable('corrieri', {
        id:         'id',
        codice:     { type: 'text', notNull: true, unique: true },
        nome:       { type: 'text', notNull: true },   // NON unique
        telefono:   'text',
        email:      'text',
        attivo:     { type: 'boolean', notNull: true, default: true },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('corrieri', 'set_updated_at', TRIGGER);

    pgm.createSequence('seq_ddt_numero_progressivo', {
        startWith: 1, incrementBy: 1, cache: 1
    });

    pgm.createTable('spedizioni', {
        id:              'id',
        ordine_id:       { type: 'integer', notNull: true, references: 'ordini',               onDelete: 'RESTRICT' },
        cliente_id:      { type: 'integer', notNull: true, references: 'clienti',              onDelete: 'RESTRICT' },
        destinazione_id: { type: 'integer', notNull: true, references: 'destinazioni_clienti', onDelete: 'RESTRICT' },
        corriere_id:     { type: 'integer', references: 'dipendenti', onDelete: 'SET NULL' },
        stato:           { type: 'shipping_state', notNull: true, default: pgm.func("'IN_PREPARAZIONE'") },
        tracking_number: 'text',
        created_at:      { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:      { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('spedizioni', 'set_updated_at', TRIGGER);

    pgm.createIndex('spedizioni', 'ordine_id',       { name: 'spedizioni_ordine_id_index' });
    pgm.createIndex('spedizioni', 'cliente_id',      { name: 'spedizioni_cliente_id_index' });
    pgm.createIndex('spedizioni', 'destinazione_id', { name: 'spedizioni_destinazione_id_index' });
    pgm.createIndex('spedizioni', 'corriere_id',     { name: 'spedizioni_corriere_id_index' });
    pgm.createIndex('spedizioni', 'stato',           { name: 'spedizioni_stato_index' });

    pgm.createTable('ddt', {
        id:             'id',
        spedizione_id:  { type: 'integer', notNull: true, references: 'spedizioni', onDelete: 'CASCADE' },
        numero_ddt:     { type: 'text', notNull: true },
        data_ddt:       { type: 'date', notNull: true, default: pgm.func('CURRENT_DATE') },
        trasportatore:  'text',
        note:           'text',
        created_at:     { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:     { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.addConstraint('ddt', 'unique_spedizione_ddt', { unique: ['spedizione_id'] });
    pgm.createTrigger('ddt', 'set_updated_at', TRIGGER);

    pgm.createIndex('ddt', 'numero_ddt',   { name: 'ddt_numero_ddt_index' });
    pgm.createIndex('ddt', 'spedizione_id',{ name: 'ddt_spedizione_id_index' });
};

exports.down = (pgm) => {
    pgm.dropTable('ddt');
    pgm.dropTable('spedizioni');
    pgm.dropSequence('seq_ddt_numero_progressivo');
    pgm.dropTable('corrieri');
};