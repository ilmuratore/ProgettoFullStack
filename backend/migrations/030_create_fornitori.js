exports.up = (pgm) => {
    pgm.createTable('fornitori', {
        id: 'id',
        ragione_sociale: { type: 'text', notNull: true },
        piva: { type: 'text', unique: true },
        indirizzo: 'text',
        email: 'text',
        telefono: 'text',
        lead_time_giorni: 'integer',
        attivo: { type: 'boolean', notNull: true, default: true },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('fornitori', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('fornitori');
};
