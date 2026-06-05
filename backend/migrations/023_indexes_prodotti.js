exports.up = (pgm) => {
    pgm.createIndex("prodotti", "sku");
    pgm.createIndex("prodotti", "nome");
    pgm.createIndex("prodotti", "categoria_id");
};

exports.down = (pgm) => {
    pgm.dropIndex("prodotti", "sku");
    pgm.dropIndex("prodotti", "nome");
    pgm.dropIndex("prodotti", "categoria_id");
};
