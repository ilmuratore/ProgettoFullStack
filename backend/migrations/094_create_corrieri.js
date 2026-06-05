exports.up = (pgm) => {
    pgm.createTable('corrieri', {
        id: 'id',
        codice: { type: 'text', notNull: true, unique: true },
        nome: { type: 'text', notNull: true },
        telefono: { type: 'text' },
        email: { type: 'text' },
        attivo: { type: 'boolean', notNull: true, default: true },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('corrieri', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('corrieri');
};
