exports.up = (pgm) => {

    pgm.createTable('ordini_acquisto', {
        id: 'id',
        fornitore_id: {
            type: 'integer',
            notNull: true,
            references: 'fornitori',
            onDelete: 'NO ACTION'
        },
        stato: { type: 'purchase_order_state', notNull: true, default: 'BOZZA' },
        data_prevista: 'date',
        importo_totale: 'numeric',
        note: 'text',
        utente_id: {
            type: 'integer',
            references: 'utenti',
            onDelete: 'NO ACTION'
        },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('ordini_acquisto', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('ordini_acquisto');
};
