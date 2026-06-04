exports.up = (pgm) => {
    pgm.sql(`
        CREATE TABLE utenti (
            id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            nome TEXT NOT NULL,
            cognome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            ruolo_id INTEGER NOT NULL,
            attivo BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

            CONSTRAINT fk_utenti_ruolo
                FOREIGN KEY (ruolo_id) REFERENCES ruoli(id)
                ON DELETE NO ACTION ON UPDATE NO ACTION
        );
    `);
};

exports.down = (pgm) => {
    pgm.sql(`
        DROP TABLE IF EXISTS utenti;
    `);
};
