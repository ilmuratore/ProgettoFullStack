const TRIGGER = { when: 'BEFORE', operation: 'UPDATE', level: 'ROW', function: 'fn_set_updated_at' };

exports.up = (pgm) => {

    pgm.createTable('ruoli', {
        id:          'id',
        nome:        { type: 'text', notNull: true, unique: true },
        descrizione: 'text',
        created_at:  { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:  { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('ruoli', 'set_updated_at', TRIGGER);

    pgm.createTable('permessi', {
        id:          'id',
        codice:      { type: 'text', notNull: true, unique: true },
        descrizione: 'text',
        created_at:  { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:  { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('permessi', 'set_updated_at', TRIGGER);

    pgm.createTable('ruoli_permessi', {
        ruolo_id:    { type: 'integer', notNull: true, references: 'ruoli',    onDelete: 'CASCADE' },
        permesso_id: { type: 'integer', notNull: true, references: 'permessi', onDelete: 'CASCADE' },
        created_at:  { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:  { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.addConstraint('ruoli_permessi', 'ruoli_permessi_pkey', 'PRIMARY KEY (ruolo_id, permesso_id)');
    pgm.createTrigger('ruoli_permessi', 'set_updated_at', TRIGGER);

    pgm.createTable('utenti', {
        id:            'id',
        nome:          { type: 'text', notNull: true },
        cognome:       { type: 'text', notNull: true },
        email:         { type: 'text', notNull: true, unique: true },
        password_hash: { type: 'text', notNull: true },
        ruolo_id:      { type: 'integer', notNull: true, references: 'ruoli', onDelete: 'NO ACTION' },
        attivo:        { type: 'boolean', notNull: true, default: true },
        created_at:    { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:    { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('utenti', 'set_updated_at', TRIGGER);

    pgm.createTable('dipendenti', {
        id:              'id',
        nome:            { type: 'text', notNull: true },
        cognome:         { type: 'text', notNull: true },
        codice_fiscale:  { type: 'text', notNull: true, unique: true },
        ruolo_operativo: 'text',
        data_assunzione: 'date',
        utente_id:       { type: 'integer', references: 'utenti', onDelete: 'NO ACTION' },
        created_at:      { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:      { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('dipendenti', 'set_updated_at', TRIGGER);

    pgm.createTable('notifiche', {
        id:               'id',
        utente_id:        { type: 'integer', notNull: true, references: 'utenti', onDelete: 'NO ACTION' },
        tipo:             { type: 'notification_type', notNull: true },
        messaggio:        { type: 'text', notNull: true },
        letto:            { type: 'boolean', notNull: true, default: false },
        riferimento_tipo: 'text',
        riferimento_id:   'integer',
        created_at:       { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:       { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('notifiche', 'set_updated_at', TRIGGER);

    pgm.createIndex('notifiche', ['utente_id', 'letto'],  { name: 'idx_notifiche_utente_letto' });
    pgm.createIndex('notifiche', 'created_at',            { name: 'idx_notifiche_created_at' });
};

exports.down = (pgm) => {
    pgm.dropTable('notifiche');
    pgm.dropTable('dipendenti');
    pgm.dropTable('utenti');
    pgm.dropTable('ruoli_permessi');
    pgm.dropTable('permessi');
    pgm.dropTable('ruoli');
};