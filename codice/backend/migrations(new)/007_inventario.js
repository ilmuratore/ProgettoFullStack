const TRIGGER = { when: 'BEFORE', operation: 'UPDATE', level: 'ROW', function: 'fn_set_updated_at' };

exports.up = (pgm) => {

    pgm.createTable('giacenze', {
        id:           'id',
        prodotto_id:  { type: 'integer', notNull: true, references: 'prodotti',   onDelete: 'RESTRICT' },
        ubicazione_id:{ type: 'integer', notNull: true, references: 'ubicazioni', onDelete: 'RESTRICT' },
        quantita:     { type: 'integer', notNull: true, default: 0 },
        created_at:   { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:   { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.addConstraint('giacenze', 'chk_giacenze_quantita', 'CHECK (quantita >= 0)');
    pgm.addConstraint('giacenze', 'unique_prodotto_ubicazione',
        { unique: ['prodotto_id', 'ubicazione_id'] });
    pgm.createTrigger('giacenze', 'set_updated_at', TRIGGER);

    pgm.createIndex('giacenze', 'prodotto_id',                    { name: 'giacenze_prodotto_id_index' });
    pgm.createIndex('giacenze', 'ubicazione_id',                  { name: 'giacenze_ubicazione_id_index' });
    pgm.createIndex('giacenze', ['prodotto_id', 'ubicazione_id'], { name: 'giacenze_prodotto_id_ubicazione_id_index' });


    pgm.createTable('movimenti_stock', {
        id:            'id',
        prodotto_id:   { type: 'integer', notNull: true, references: 'prodotti',   onDelete: 'RESTRICT' },
        ubicazione_id: { type: 'integer', notNull: true, references: 'ubicazioni', onDelete: 'RESTRICT' },
        quantita:      { type: 'integer', notNull: true },
        tipo:          { type: 'movimento_tipo', notNull: true },
        riferimento:   'text',
        note:          'text',   
        created_at:    { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:    { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.createTrigger('movimenti_stock', 'set_updated_at', TRIGGER);

    pgm.sql(`
        CREATE RULE movimenti_stock_no_update_rule AS
            ON UPDATE TO movimenti_stock DO INSTEAD NOTHING
    `);
    pgm.sql(`
        CREATE RULE movimenti_stock_no_delete_rule AS
            ON DELETE TO movimenti_stock DO INSTEAD NOTHING
    `);

    pgm.createIndex('movimenti_stock', 'prodotto_id',                    { name: 'movimenti_stock_prodotto_id_index' });
    pgm.createIndex('movimenti_stock', 'ubicazione_id',                  { name: 'movimenti_stock_ubicazione_id_index' });
    pgm.createIndex('movimenti_stock', 'created_at',                     { name: 'movimenti_stock_created_at_index' });
    pgm.createIndex('movimenti_stock', ['prodotto_id', 'created_at'],    { name: 'movimenti_stock_prodotto_id_created_at_index' });
};

exports.down = (pgm) => {
    pgm.sql('DROP RULE IF EXISTS movimenti_stock_no_delete_rule ON movimenti_stock');
    pgm.sql('DROP RULE IF EXISTS movimenti_stock_no_update_rule ON movimenti_stock');
    pgm.dropTable('movimenti_stock');
    pgm.dropTable('giacenze');
};