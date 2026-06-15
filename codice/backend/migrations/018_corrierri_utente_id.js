exports.up = (pgm) => {
    pgm.addColumn('corrieri', {
        utente_id: {
            type: 'integer',
            references: 'utenti',
            onDelete: 'SET NULL'
        }
    });

    pgm.sql(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_corrieri_utente_id
        ON corrieri (utente_id)
        WHERE utente_id IS NOT NULL
    `);

    pgm.createIndex('corrieri', 'utente_id', {
        name: 'idx_corrieri_utente_id'
    });
};

exports.down = (pgm) => {
    pgm.dropIndex('corrieri', 'utente_id', {
        name: 'idx_corrieri_utente_id',
        ifExists: true
    });

    pgm.sql('DROP INDEX IF EXISTS unique_corrieri_utente_id');

    pgm.dropColumn('corrieri', 'utente_id');
};