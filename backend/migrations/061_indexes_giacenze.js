exports.up = (pgm) => {
    pgm.createIndex("giacenze", "prodotto_id");
    pgm.createIndex("giacenze", "ubicazione_id");
    pgm.createIndex("giacenze", ["prodotto_id", "ubicazione_id"]);
};

exports.down = (pgm) => {
    pgm.dropIndex("giacenze", "prodotto_id");
    pgm.dropIndex("giacenze", "ubicazione_id");
    pgm.dropIndex("giacenze", ["prodotto_id", "ubicazione_id"]);
};
