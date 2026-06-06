exports.up = (pgm) => {
    pgm.createTable('utenti', {
        id: 'id',
        nome: { type: 'text', notNull: true },
        cognome: { type: 'text', notNull: true },
        email: { type: 'text', notNull: true, unique: true },
        password_hash: { type: 'text', notNull: true },
        ruolo_id: {
            type: 'integer',
            notNull: true,
            references: 'ruoli',
            onDelete: 'NO ACTION'
        },
        attivo: { type: 'boolean', notNull: true, default: true },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('utenti', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('utenti');
};
