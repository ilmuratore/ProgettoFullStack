exports.up = (pgm) => {

    pgm.createTable('righe_po', {
        id: 'id',
        ordine_acquisto_id: {
            type: 'integer',
            notNull: true,
            references: 'ordini_acquisto',
            onDelete: 'CASCADE'
        },
        prodotto_id: {
            type: 'integer',
            notNull: true,
            references: 'prodotti',
            onDelete: 'NO ACTION'
        },
        quantita_ordinata: { type: 'integer', notNull: true },
        quantita_ricevuta: { type: 'integer', notNull: true, default: 0 },
        prezzo_unitario: 'numeric',
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('righe_po', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('righe_po');
};
