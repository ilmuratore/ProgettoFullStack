exports.up = (pgm) => {

    pgm.createTable('ricezioni', {
        id: 'id',
        ordine_acquisto_id: {
            type: 'integer',
            notNull: true,
            references: 'ordini_acquisto',
            onDelete: 'NO ACTION'
        },
        data_ricezione: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        note: 'text',
        utente_id: {
            type: 'integer',
            references: 'utenti',
            onDelete: 'NO ACTION'
        },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('ricezioni', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('ricezioni');
};
