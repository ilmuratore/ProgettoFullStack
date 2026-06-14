exports.up = (pgm) => {
    pgm.sql(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT ordine_id
                FROM spedizioni
                GROUP BY ordine_id
                HAVING COUNT(*) > 1
            ) THEN
                RAISE EXCEPTION 'Impossibile aggiungere unique_spedizioni_ordine_id: esistono spedizioni duplicate per lo stesso ordine';
            END IF;
        END $$;
    `);

    pgm.addConstraint('spedizioni', 'unique_spedizioni_ordine_id', {
        unique: ['ordine_id']
    });
};

exports.down = (pgm) => {
    pgm.dropConstraint('spedizioni', 'unique_spedizioni_ordine_id');
};
