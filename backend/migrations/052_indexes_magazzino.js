exports.up = (pgm) => {
    // MAGAZZINI
    pgm.createIndex("magazzini", "codice");
    pgm.createIndex("magazzini", "attivo");

    // UBICAZIONI
    pgm.createIndex("ubicazioni", "magazzino_id");
    pgm.createIndex("ubicazioni", "codice");
    pgm.createIndex("ubicazioni", ["magazzino_id", "codice"]);
};

exports.down = (pgm) => {
    pgm.dropIndex("magazzini", "codice");
    pgm.dropIndex("magazzini", "attivo");

    pgm.dropIndex("ubicazioni", "magazzino_id");
    pgm.dropIndex("ubicazioni", "codice");
    pgm.dropIndex("ubicazioni", ["magazzino_id", "codice"]);
};
