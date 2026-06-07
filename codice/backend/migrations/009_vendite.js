const TRIGGER = { when: 'BEFORE', operation: 'UPDATE', level: 'ROW', function: 'fn_set_updated_at' };

exports.up = (pgm) => {

    pgm.createTable('ordini', {
        id:                     'id',
        cliente_id:             { type: 'integer', notNull: true, references: 'clienti',              onDelete: 'NO ACTION' },
        destinazione_id:        { type: 'integer', notNull: true, references: 'destinazioni_clienti', onDelete: 'NO ACTION' },
        stato:                  { type: 'sales_order_state',         notNull: true, default: pgm.func("'BOZZA'") },
        stato_picking:          { type: 'sales_order_picking_state', notNull: true, default: pgm.func("'NON_AVVIATO'") },
        data_ordine:            { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        data_consegna_richiesta:'date',
        importo_totale:         'numeric',
        utente_id:              { type: 'integer', references: 'utenti', onDelete: 'NO ACTION' },
        created_at:             { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:             { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('ordini', 'set_updated_at', TRIGGER);

    pgm.createIndex('ordini', 'stato',          { name: 'idx_ordini_stato' });
    pgm.createIndex('ordini', 'stato_picking',  { name: 'idx_ordini_stato_picking' });
    pgm.createIndex('ordini', 'cliente_id',     { name: 'idx_ordini_cliente' });
    pgm.sql("CREATE INDEX idx_ordini_data_ordine ON ordini USING btree (data_ordine DESC)");

    pgm.createTable('righe_ordine', {
        id:              'id',
        ordine_id:       { type: 'integer', notNull: true, references: 'ordini',   onDelete: 'CASCADE' },
        prodotto_id:     { type: 'integer', notNull: true, references: 'prodotti', onDelete: 'NO ACTION' },
        quantita:        { type: 'integer', notNull: true },
        prezzo_unitario: 'numeric',
        created_at:      { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:      { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('righe_ordine', 'set_updated_at', TRIGGER);
};

exports.down = (pgm) => {
    pgm.dropTable('righe_ordine');
    pgm.dropTable('ordini');
};