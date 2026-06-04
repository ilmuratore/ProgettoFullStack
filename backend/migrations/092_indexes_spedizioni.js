exports.up = (pgm) => {
    // SPEDIZIONI
    pgm.createIndex("spedizioni", "ordine_id");
    pgm.createIndex("spedizioni", "cliente_id");
    pgm.createIndex("spedizioni", "destinazione_id");
    pgm.createIndex("spedizioni", "corriere_id");
    pgm.createIndex("spedizioni", "stato");

    // DDT
    pgm.createIndex("ddt", "spedizione_id");
    pgm.createIndex("ddt", "numero_ddt");
};

exports.down = (pgm) => {
    pgm.dropIndex("spedizioni", "ordine_id");
    pgm.dropIndex("spedizioni", "cliente_id");
    pgm.dropIndex("spedizioni", "destinazione_id");
    pgm.dropIndex("spedizioni", "corriere_id");
    pgm.dropIndex("spedizioni", "stato");

    pgm.dropIndex("ddt", "spedizione_id");
    pgm.dropIndex("ddt", "numero_ddt");
};
