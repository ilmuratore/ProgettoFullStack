exports.up = (pgm) => {
    pgm.sql(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_dipendenti_utente_id
        ON dipendenti (utente_id)
        WHERE utente_id IS NOT NULL
    `);
};

exports.down = (pgm) => {
    pgm.sql('DROP INDEX IF EXISTS unique_dipendenti_utente_id');
};
