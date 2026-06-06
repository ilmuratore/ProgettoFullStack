exports.up = (pgm) => {
    pgm.createTable('contatti_fornitori', {
        id: 'id',
        fornitore_id: {
            type: 'integer',
            notNull: true,
            references: 'fornitori',
            onDelete: 'CASCADE'
        },
        nome: 'text',
        ruolo: 'text',
        email: 'text',
        telefono: 'text',
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('contatti_fornitori', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('contatti_fornitori');
};
