exports.up = (pgm) => {
    pgm.sql(`
        CREATE TABLE ruoli_permessi (
            ruolo_id INTEGER NOT NULL,
            permesso_id INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

            CONSTRAINT pk_ruoli_permessi
                PRIMARY KEY (ruolo_id, permesso_id),
            CONSTRAINT fk_ruoli_permessi_ruolo
                FOREIGN KEY (ruolo_id) REFERENCES ruoli(id)
                ON DELETE CASCADE ON UPDATE NO ACTION,
            CONSTRAINT fk_ruoli_permessi_permesso
                FOREIGN KEY (permesso_id) REFERENCES permessi(id)
                ON DELETE CASCADE ON UPDATE NO ACTION
        );
    `);
};

exports.down = (pgm) => {
    pgm.sql(`
        DROP TABLE IF EXISTS ruoli_permessi;
    `);
};
