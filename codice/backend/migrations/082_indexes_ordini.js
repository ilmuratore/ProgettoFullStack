exports.up = (pgm) => {
    pgm.createIndex('ordini', 'stato', {
        name: 'idx_ordini_stato'
    });

    pgm.createIndex('ordini', 'stato_picking', {
        name: 'idx_ordini_stato_picking'
    });

    pgm.createIndex('ordini', 'cliente_id', {
        name: 'idx_ordini_cliente'
    });

    pgm.createIndex('ordini', [{ name: 'data_ordine', sort: 'DESC' }], {
        name: 'idx_ordini_data_ordine'
    });
};

exports.down = (pgm) => {
    pgm.dropIndex('ordini', [{ name: 'data_ordine', sort: 'DESC' }], {
        name: 'idx_ordini_data_ordine'
    });

    pgm.dropIndex('ordini', 'cliente_id', {
        name: 'idx_ordini_cliente'
    });

    pgm.dropIndex('ordini', 'stato_picking', {
        name: 'idx_ordini_stato_picking'
    });

    pgm.dropIndex('ordini', 'stato', {
        name: 'idx_ordini_stato'
    });
};
