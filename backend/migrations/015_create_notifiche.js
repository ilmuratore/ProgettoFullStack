exports.up = (pgm) => {
    pgm.createTable('notifiche', {
        id: 'id',
        utente_id: {
            type: 'integer',
            notNull: true,
            references: 'utenti',
            onDelete: 'NO ACTION'
        },
        tipo: { type: 'notification_type', notNull: true },
        messaggio: { type: 'text', notNull: true },
        letto: { type: 'boolean', notNull: true, default: false },
        riferimento_tipo: 'text',
        riferimento_id: 'integer',
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('notifiche', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_updated_at'
    });

};

exports.down = (pgm) => {
    pgm.dropTable('notifiche');
};
