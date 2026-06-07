const TRIGGER = { when: 'BEFORE', operation: 'UPDATE', level: 'ROW', function: 'fn_set_updated_at' };

exports.up = (pgm) => {

    pgm.createTable('richieste_acquisto', {
        id:             'id',
        fornitore_id:   { type: 'integer', notNull: true, references: 'fornitori', onDelete: 'NO ACTION' },
        stato:          { type: 'richiesta_acquisto_state', notNull: true, default: pgm.func("'BOZZA'") },
        data_richiesta: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        note:           'text',
        utente_id:      { type: 'integer', references: 'utenti', onDelete: 'NO ACTION' },
        created_at:     { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:     { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('richieste_acquisto', 'set_updated_at', TRIGGER);

    pgm.createIndex('richieste_acquisto', 'fornitore_id',
        { name: 'idx_richieste_fornitore_id' });
    pgm.createIndex('richieste_acquisto', 'stato',
        { name: 'idx_richieste_stato' });
    pgm.createIndex('richieste_acquisto', 'utente_id',
        { name: 'idx_richieste_utente_id' });
    pgm.sql("CREATE INDEX idx_richieste_utente_data ON richieste_acquisto USING btree (utente_id, data_richiesta DESC)");

    pgm.createTable('righe_richiesta', {
        id:                  'id',
        richiesta_id:        { type: 'integer', notNull: true, references: 'richieste_acquisto', onDelete: 'CASCADE' },
        prodotto_id:         { type: 'integer', notNull: true, references: 'prodotti', onDelete: 'NO ACTION' },
        quantita_richiesta:  { type: 'integer', notNull: true },
        created_at:          { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.addConstraint('righe_richiesta', 'chk_righe_richiesta_quantita',
        'CHECK (quantita_richiesta > 0)');

    pgm.createIndex('righe_richiesta', 'richiesta_id', { name: 'idx_righe_richiesta_id' });
    pgm.createIndex('righe_richiesta', 'prodotto_id',  { name: 'idx_righe_prodotto_id' });
};

exports.down = (pgm) => {
    pgm.dropTable('righe_richiesta');
    pgm.dropTable('richieste_acquisto');
};