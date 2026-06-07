const TRIGGER = { when: 'BEFORE', operation: 'UPDATE', level: 'ROW', function: 'fn_set_updated_at' };

exports.up = (pgm) => {

    pgm.createTable('clienti', {
        id:              'id',
        ragione_sociale: { type: 'text', notNull: true },
        piva_cf:         { type: 'text', unique: true },  
        email:           'text',
        telefono:        'text',
        source:          { type: 'text', notNull: true, default: pgm.func("'manual'") },
        attivo:          { type: 'boolean', notNull: true, default: true },
        created_at:      { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:      { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.addConstraint('clienti', 'chk_clienti_source',
        "CHECK (source IN ('manual', 'ecosystem'))");
    pgm.createTrigger('clienti', 'set_updated_at', TRIGGER);

    pgm.createIndex('clienti', 'piva_cf',          { name: 'clienti_piva_cf_index' });
    pgm.createIndex('clienti', 'ragione_sociale',   { name: 'clienti_ragione_sociale_index' });
    pgm.createIndex('clienti', 'source',            { name: 'idx_clienti_source' });

    pgm.createTable('destinazioni_clienti', {
        id:          'id',
        cliente_id:  { type: 'integer', notNull: true, references: 'clienti', onDelete: 'CASCADE' },
        etichetta:   'text',
        indirizzo:   'text',
        cap:         'text',
        citta:       'text',
        provincia:   'text',
        paese:       'text',
        predefinita: { type: 'boolean', notNull: true, default: false },
        created_at:  { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:  { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('destinazioni_clienti', 'set_updated_at', TRIGGER);

    pgm.createIndex('destinazioni_clienti', 'cliente_id',
        { name: 'destinazioni_clienti_cliente_id_index' });
    pgm.createIndex('destinazioni_clienti', ['cliente_id', 'predefinita'],
        { name: 'destinazioni_clienti_cliente_id_predefinita_index' });
};

exports.down = (pgm) => {
    pgm.dropTable('destinazioni_clienti');
    pgm.dropTable('clienti');
};