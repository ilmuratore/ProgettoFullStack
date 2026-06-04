exports.up = (pgm) => {
    pgm.sql(`
        CREATE TABLE permessi (
            id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            codice TEXT NOT NULL UNIQUE,
            descrizione TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
    `);
};

exports.down = (pgm) => {
    pgm.sql(`
        DROP TABLE IF EXISTS permessi;
    `);
};
