exports.up = (pgm) => {

    pgm.createTable('righe_ordine', {
        id: 'id',
        ordine_id: {
            type: 'integer',
            notNull: true,
            references: 'ordini',
            onDelete: 'CASCADE'
        },
        prodotto_id: {
            type: 'integer',
            notNull: true,
            references: 'prodotti',
            onDelete: 'NO ACTION'
        },
        quantita: { type: 'integer', notNull: true },
        prezzo_unitario: 'numeric',
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('righe_ordine', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('righe_ordine');
};
