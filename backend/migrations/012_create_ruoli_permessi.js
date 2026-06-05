exports.up = (pgm) => {
    pgm.createTable('ruoli_permessi', {
        ruolo_id: {
            type: 'integer',
            notNull: true,
            primaryKey: true,
            references: 'ruoli',
            onDelete: 'CASCADE'
        },
        permesso_id: {
            type: 'integer',
            notNull: true,
            primaryKey: true,
            references: 'permessi',
            onDelete: 'CASCADE'
        },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('ruoli_permessi', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('ruoli_permessi');
};
