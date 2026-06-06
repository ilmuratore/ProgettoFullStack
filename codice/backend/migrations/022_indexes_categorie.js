exports.up = (pgm) => {
    pgm.createIndex("categorie", "nome");
    pgm.createIndex("categorie", "categoria_padre_id");
};

exports.down = (pgm) => {
    pgm.dropIndex("categorie", "nome");
    pgm.dropIndex("categorie", "categoria_padre_id");
};
