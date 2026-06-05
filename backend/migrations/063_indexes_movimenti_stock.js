exports.up = (pgm) => {
    pgm.createIndex("movimenti_stock", "prodotto_id");
    pgm.createIndex("movimenti_stock", "ubicazione_id");
    pgm.createIndex("movimenti_stock", "created_at");
    pgm.createIndex("movimenti_stock", ["prodotto_id", "created_at"]);
};

exports.down = (pgm) => {
    pgm.dropIndex("movimenti_stock", "prodotto_id");
    pgm.dropIndex("movimenti_stock", "ubicazione_id");
    pgm.dropIndex("movimenti_stock", "created_at");
    pgm.dropIndex("movimenti_stock", ["prodotto_id", "created_at"]);
};
