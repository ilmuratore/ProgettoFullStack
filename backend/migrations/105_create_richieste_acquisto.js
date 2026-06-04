exports.up = (pgm) => {
    pgm.createTable('richieste_acquisto', {
        id: 'id',
        fornitore_id: { type: 'integer', notNull: true, references: 'fornitori', onDelete: 'NO ACTION' },
        stato: { type: 'richiesta_acquisto_state', notNull: true, default: 'BOZZA' },
        data_richiesta: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        note: { type: 'text' },
        utente_id: { type: 'integer', references: 'utenti', onDelete: 'NO ACTION' },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('richieste_acquisto', 'set_updated_at', {
        when: 'BEFORE', operation: 'UPDATE', level: 'ROW', function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('richieste_acquisto');
};