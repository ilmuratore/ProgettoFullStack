exports.up = (pgm) => {
    pgm.createTable('dipendenti', {
        id: 'id',
        nome: { type: 'text', notNull: true },
        cognome: { type: 'text', notNull: true },
        codice_fiscale: { type: 'text', notNull: true, unique: true },
        ruolo_operativo: 'text',
        data_assunzione: 'date',
        utente_id: {
            type: 'integer',
            references: 'utenti',
            onDelete: 'NO ACTION'
        },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('dipendenti', 'set_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_updated_at'
    });
};

exports.down = (pgm) => {
    pgm.dropTable('dipendenti');
};
