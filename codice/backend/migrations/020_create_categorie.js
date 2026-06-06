exports.up = (pgm) => {
    // -------------------------
    // TABELLA CATEGORIE
    // -------------------------
    pgm.createTable('categorie', {
        id: 'id',
        nome: { type: 'text', notNull: true, unique: true },
        categoria_padre_id: {
            type: 'integer',
            references: 'categorie',
            onDelete: 'NO ACTION'
        },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    // Trigger updated_at
    pgm.createTrigger('categorie', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        function: 'fn_set_updated_at'
    });


};

exports.down = (pgm) => {
    pgm.dropTable('categorie');
};
