exports.up = (pgm) => {
    // CLIENTI
    pgm.createIndex("clienti", "ragione_sociale");
    pgm.createIndex("clienti", "piva_cf");

    // DESTINAZIONI CLIENTI
    pgm.createIndex("destinazioni_clienti", "cliente_id");
    pgm.createIndex("destinazioni_clienti", ["cliente_id", "predefinita"]);
};

exports.down = (pgm) => {
    pgm.dropIndex("clienti", "ragione_sociale");
    pgm.dropIndex("clienti", "piva_cf");

    pgm.dropIndex("destinazioni_clienti", "cliente_id");
    pgm.dropIndex("destinazioni_clienti", ["cliente_id", "predefinita"]);
};
