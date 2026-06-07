const TRIGGER = { when: 'BEFORE', operation: 'UPDATE', level: 'ROW', function: 'fn_set_updated_at' };

exports.up = (pgm) => {

    pgm.createTable('magazzini', {
        id:         'id',
        codice:     { type: 'text', notNull: true, unique: true },
        nome:       { type: 'text', notNull: true },
        indirizzo:  'text',
        cap:        'text',
        citta:      'text',
        provincia:  'text',
        paese:      'text',
        attivo:     { type: 'boolean', notNull: true, default: true },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('magazzini', 'set_updated_at', TRIGGER);
    pgm.createIndex('magazzini', 'attivo',  { name: 'magazzini_attivo_index' });
    pgm.createIndex('magazzini', 'codice',  { name: 'magazzini_codice_index' });

    pgm.createTable('ubicazioni', {
        id:                      'id',
        magazzino_id:            { type: 'integer', notNull: true, references: 'magazzini', onDelete: 'CASCADE' },
        codice:                  { type: 'text', notNull: true },
        corsia:                  { type: 'integer', notNull: true },
        scaffale:                { type: 'integer', notNull: true },
        attivo:                  { type: 'boolean', notNull: true, default: true },
        temperatura_controllata: { type: 'boolean', notNull: true, default: false },
        created_at:              { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:              { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.addConstraint('ubicazioni', 'unique_magazzino_corsia_scaffale',
        { unique: ['magazzino_id', 'corsia', 'scaffale'] });
    pgm.createTrigger('ubicazioni', 'set_updated_at', TRIGGER);

    pgm.createIndex('ubicazioni', 'magazzino_id',             { name: 'ubicazioni_magazzino_id_index' });
    pgm.createIndex('ubicazioni', ['magazzino_id', 'codice'], { name: 'ubicazioni_magazzino_id_codice_index' });
    pgm.createIndex('ubicazioni', 'codice',                   { name: 'ubicazioni_codice_index' });
};

exports.down = (pgm) => {
    pgm.dropTable('ubicazioni');
    pgm.dropTable('magazzini');
};