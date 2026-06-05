exports.up = (pgm) => {


    // 2) Funzione trigger
    pgm.createFunction(
        'fn_set_data_agg_prezzo',
        [],
        {
            returns: 'trigger',
            language: 'plpgsql',
        },
        `
        BEGIN
            IF NEW.prezzo IS DISTINCT FROM OLD.prezzo THEN
                NEW.data_agg_prezzo = NOW();
            END IF;
            RETURN NEW;
        END;
        `
    );

    // 3) Trigger
    pgm.createTrigger('prodotti', 'trg_data_agg_prezzo', {
        when: 'BEFORE',
        operation: 'UPDATE',
        level: 'ROW',
        function: 'fn_set_data_agg_prezzo'
    });
};

exports.down = (pgm) => {
    pgm.dropTrigger('prodotti', 'trg_data_agg_prezzo');
    pgm.dropFunction('fn_set_data_agg_prezzo');

};
