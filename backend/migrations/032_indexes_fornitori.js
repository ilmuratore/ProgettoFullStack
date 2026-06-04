exports.up = (pgm) => {
    pgm.createIndex('fornitori', 'attivo', {
        name: 'idx_fornitori_attivo'
    });

    pgm.createIndex('fornitori', 'ragione_sociale', {
        name: 'idx_fornitori_ragione_sociale'
    });

    pgm.createIndex('contatti_fornitori', 'fornitore_id', {
        name: 'idx_contatti_fornitori_fornitore_id'
    });
};

exports.down = (pgm) => {
    pgm.dropIndex('contatti_fornitori', 'fornitore_id', {
        name: 'idx_contatti_fornitori_fornitore_id'
    });

    pgm.dropIndex('fornitori', 'ragione_sociale', {
        name: 'idx_fornitori_ragione_sociale'
    });

    pgm.dropIndex('fornitori', 'attivo', {
        name: 'idx_fornitori_attivo'
    });
};
