exports.up = (pgm) => {
    pgm.createTable('ruoli', {
        id: 'id',
        nome: { type: 'text', notNull: true, unique: true },
        descrizione: 'text',
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('ruoli', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('ruoli');
};
