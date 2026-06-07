const TRIGGER = { when: 'BEFORE', operation: 'UPDATE', level: 'ROW', function: 'fn_set_updated_at' };

exports.up = (pgm) => {

    pgm.createTable('ordini_acquisto', {
        id:             'id',
        fornitore_id:   { type: 'integer', notNull: true, references: 'fornitori', onDelete: 'NO ACTION' },
        stato:          { type: 'purchase_order_state', notNull: true, default: pgm.func("'BOZZA'") },
        data_prevista:  'date',
        importo_totale: 'numeric',
        note:           'text',
        utente_id:      { type: 'integer', references: 'utenti', onDelete: 'NO ACTION' },
        created_at:     { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:     { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('ordini_acquisto', 'set_updated_at', TRIGGER);
    pgm.createIndex('ordini_acquisto', 'stato',        { name: 'idx_ordini_acquisto_stato' });
    pgm.createIndex('ordini_acquisto', 'fornitore_id', { name: 'idx_ordini_acquisto_forn' });

    pgm.createTable('righe_po', {
        id:                  'id',
        ordine_acquisto_id:  { type: 'integer', notNull: true, references: 'ordini_acquisto', onDelete: 'CASCADE' },
        prodotto_id:         { type: 'integer', notNull: true, references: 'prodotti', onDelete: 'NO ACTION' },
        quantita_ordinata:   { type: 'integer', notNull: true },
        quantita_ricevuta:   { type: 'integer', notNull: true, default: 0 },
        prezzo_unitario:     'numeric',
        created_at:          { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:          { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('righe_po', 'set_updated_at', TRIGGER);

    pgm.createTable('ricezioni', {
        id:                  'id',
        ordine_acquisto_id:  { type: 'integer', notNull: true, references: 'ordini_acquisto', onDelete: 'NO ACTION' },
        data_ricezione:      { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        note:                'text',
        utente_id:           { type: 'integer', references: 'utenti', onDelete: 'NO ACTION' },
        created_at:          { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:          { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('ricezioni', 'set_updated_at', TRIGGER);
    pgm.createIndex('ricezioni', 'ordine_acquisto_id', { name: 'idx_ricezioni_po' });

    pgm.createTable('righe_ricezione', {
        id:                'id',
        ricezione_id:      { type: 'integer', notNull: true, references: 'ricezioni',  onDelete: 'CASCADE' },
        prodotto_id:       { type: 'integer', notNull: true, references: 'prodotti',   onDelete: 'NO ACTION' },
        quantita_ricevuta: { type: 'integer', notNull: true },
        ubicazione_id:     { type: 'integer', notNull: true, references: 'ubicazioni', onDelete: 'NO ACTION' },
        created_at:        { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:        { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('righe_ricezione', 'set_updated_at', TRIGGER);
};

exports.down = (pgm) => {
    pgm.dropTable('righe_ricezione');
    pgm.dropTable('ricezioni');
    pgm.dropTable('righe_po');
    pgm.dropTable('ordini_acquisto');
};