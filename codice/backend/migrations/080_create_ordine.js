exports.up = (pgm) => {

    pgm.createTable('ordini', {
        id: 'id',
        cliente_id: {
            type: 'integer',
            notNull: true,
            references: 'clienti',
            onDelete: 'NO ACTION'
        },
        destinazione_id: {
            type: 'integer',
            notNull: true,
            references: 'destinazioni_clienti',
            onDelete: 'NO ACTION'
        },
        stato: { type: 'sales_order_state', notNull: true, default: 'BOZZA' },
        stato_picking: { type: 'sales_order_picking_state', notNull: true, default: 'NON_AVVIATO' },
        data_ordine: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        data_consegna_richiesta: 'date',
        importo_totale: 'numeric',
        utente_id: {
            type: 'integer',
            references: 'utenti',
            onDelete: 'NO ACTION'
        },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('ordini', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('ordini');
};
