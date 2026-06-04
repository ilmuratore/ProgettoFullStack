exports.up = (pgm) => {
    pgm.createIndex('ordini_acquisto', 'stato', {
        name: 'idx_ordini_acquisto_stato'
    });

    pgm.createIndex('ordini_acquisto', 'fornitore_id', {
        name: 'idx_ordini_acquisto_forn'
    });

    pgm.createIndex('ricezioni', 'ordine_acquisto_id', {
        name: 'idx_ricezioni_po'
    });
};

exports.down = (pgm) => {
    pgm.dropIndex('ricezioni', 'ordine_acquisto_id', {
        name: 'idx_ricezioni_po'
    });

    pgm.dropIndex('ordini_acquisto', 'fornitore_id', {
        name: 'idx_ordini_acquisto_forn'
    });

    pgm.dropIndex('ordini_acquisto', 'stato', {
        name: 'idx_ordini_acquisto_stato'
    });
};
