exports.up = (pgm) => {
    pgm.createTable('righe_richiesta', {
        id: 'id',
        richiesta_id: { type: 'integer', notNull: true, references: 'richieste_acquisto', onDelete: 'CASCADE' },
        prodotto_id: { type: 'integer', notNull: true, references: 'prodotti', onDelete: 'NO ACTION' },
        quantita_richiesta: { type: 'integer', notNull: true },
        created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });

    pgm.addConstraint('righe_richiesta', 'chk_righe_richiesta_quantita', 'CHECK (quantita_richiesta > 0)');
};

exports.down = (pgm) => {
    pgm.dropTable('righe_richiesta');
};