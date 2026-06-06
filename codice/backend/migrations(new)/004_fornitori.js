const TRIGGER = { when: 'BEFORE', operation: 'UPDATE', level: 'ROW', function: 'fn_set_updated_at' };

exports.up = (pgm) => {

    pgm.createTable('fornitori', {
        id:                    'id',
        ragione_sociale:       { type: 'text', notNull: true },
        piva:                  { type: 'text', unique: true },
        indirizzo:             'text',
        email:                 'text',
        telefono:              'text',
        lead_time_giorni:      'integer',
        source:                { type: 'text', notNull: true, default: pgm.func("'manual'") },
        sito_web:              'text',
        descrizione_aziendale: 'text',
        attivo:                { type: 'boolean', notNull: true, default: true },
        created_at:            { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:            { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.addConstraint('fornitori', 'chk_fornitori_source',
        "CHECK (source IN ('manual', 'ecosystem'))");
    pgm.createTrigger('fornitori', 'set_updated_at', TRIGGER);

    pgm.createIndex('fornitori', 'attivo',          { name: 'idx_fornitori_attivo' });
    pgm.createIndex('fornitori', 'ragione_sociale',  { name: 'idx_fornitori_ragione_sociale' });
    pgm.createIndex('fornitori', 'source',           { name: 'idx_fornitori_source' });

    pgm.createTable('contatti_fornitori', {
        id:           'id',
        fornitore_id: { type: 'integer', notNull: true, references: 'fornitori', onDelete: 'CASCADE' },
        nome:         'text',
        ruolo:        'text',
        email:        'text',
        telefono:     'text',
        created_at:   { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:   { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('contatti_fornitori', 'set_updated_at', TRIGGER);
    pgm.createIndex('contatti_fornitori', 'fornitore_id', { name: 'idx_contatti_fornitori_fornitore_id' });
};

exports.down = (pgm) => {
    pgm.dropTable('contatti_fornitori');
    pgm.dropTable('fornitori');
};