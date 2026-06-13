exports.up = (pgm) => {
    pgm.sql(`
        ALTER TABLE spedizioni
            DROP CONSTRAINT spedizioni_corriere_id_fkey,
            ADD CONSTRAINT spedizioni_corriere_id_fkey
                FOREIGN KEY (corriere_id)
                REFERENCES corrieri(id)
                ON DELETE SET NULL
    `);
};

exports.down = (pgm) => {
    pgm.sql(`
        ALTER TABLE spedizioni
            DROP CONSTRAINT spedizioni_corriere_id_fkey,
            ADD CONSTRAINT spedizioni_corriere_id_fkey
                FOREIGN KEY (corriere_id)
                REFERENCES dipendenti(id)
                ON DELETE SET NULL
    `);
};