exports.up = (pgm) => {
    pgm.sql(`
        CREATE TABLE dipendenti (
            id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            nome TEXT NOT NULL,
            cognome TEXT NOT NULL,
            codice_fiscale TEXT NOT NULL UNIQUE,
            ruolo_operativo TEXT,
            data_assunzione DATE,
            utente_id INTEGER,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

            CONSTRAINT fk_dipendenti_utente
                FOREIGN KEY (utente_id) REFERENCES utenti(id)
                ON DELETE NO ACTION ON UPDATE NO ACTION
        );
    `);
};

exports.down = (pgm) => {
    pgm.sql(`
        DROP TABLE IF EXISTS dipendenti;
    `);
};
