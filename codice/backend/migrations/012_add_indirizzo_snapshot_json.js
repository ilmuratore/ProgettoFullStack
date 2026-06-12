exports.up = (pgm) => {
    // ORDINI
    pgm.addColumn('ordini', {
        indirizzo_snapshot: {
            type: 'text',
            notNull: false,
            comment: 'Snapshot JSON dell\'indirizzo al momento della creazione ordine'
        }
    });

    // SPEDIZIONI
    pgm.addColumn('spedizioni', {
        indirizzo_snapshot: {
            type: 'text',
            notNull: false,
            comment: 'Snapshot JSON dell\'indirizzo al momento della creazione spedizione'
        }
    });
};

exports.down = (pgm) => {
    pgm.dropColumn('ordini', 'indirizzo_snapshot');
    pgm.dropColumn('spedizioni', 'indirizzo_snapshot');
};
