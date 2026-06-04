exports.up = (pgm) => {

    pgm.createTable('righe_ricezione', {
        id: 'id',
        ricezione_id: {
            type: 'integer',
            notNull: true,
            references: 'ricezioni',
            onDelete: 'CASCADE'
        },
        prodotto_id: {
            type: 'integer',
            notNull: true,
            references: 'prodotti',
            onDelete: 'NO ACTION'
        },
        quantita_ricevuta: { type: 'integer', notNull: true },
        ubicazione_id: {
            type: 'integer',
            notNull: true,
            references: 'ubicazioni',
            onDelete: 'NO ACTION'
        },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });


    pgm.createTrigger('righe_ricezione', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('righe_ricezione');
};
