exports.up = (pgm) => {
    pgm.sql(`
        CREATE TYPE notification_type AS ENUM (
            'SOTTO_SCORTA',
            'PO_IN_RITARDO',
            'RICEZIONE_PARZIALE',
            'CAMBIO_STATO_SPEDIZIONE',
            'ALTRO'
        );

        CREATE TABLE notifiche (
            id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            utente_id INTEGER NOT NULL,
            tipo notification_type NOT NULL,
            messaggio TEXT NOT NULL,
            letto BOOLEAN NOT NULL DEFAULT FALSE,
            riferimento_tipo TEXT,
            riferimento_id INTEGER,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

            CONSTRAINT fk_notifiche_utente
                FOREIGN KEY (utente_id) REFERENCES utenti(id)
                ON DELETE NO ACTION ON UPDATE NO ACTION
        );

        CREATE INDEX idx_notifiche_utente_letto ON notifiche (utente_id, letto);
        CREATE INDEX idx_notifiche_created_at ON notifiche (created_at DESC);
    `);
};

exports.down = (pgm) => {
    pgm.sql(`
        DROP INDEX IF EXISTS idx_notifiche_created_at;
        DROP INDEX IF EXISTS idx_notifiche_utente_letto;

        DROP TABLE IF EXISTS notifiche;
        DROP TYPE IF EXISTS notification_type;
    `);
};
