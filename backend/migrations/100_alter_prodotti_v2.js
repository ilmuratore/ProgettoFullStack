// V2 — M02: Anagrafiche "I nostri Prodotti"
// La tabella prodotti diventa Listino Prezzi Aziendale.
// Aggiunti: prezzo (obbligatorio, > 0) e data_agg_prezzo (aggiornato ad ogni modifica prezzo).

exports.up = (pgm) => {
    pgm.addColumns('prodotti', {
        prezzo: { type: 'numeric(12,2)', notNull: true, default: 0 },
        data_agg_prezzo: { type: 'timestamptz', default: pgm.func('NOW()') }
    });
    pgm.createIndex('prodotti', 'prezzo', { name: 'idx_prodotti_prezzo' });
};

exports.down = (pgm) => {
    pgm.dropIndex('prodotti', 'prezzo', { name: 'idx_prodotti_prezzo' });
    pgm.dropColumns('prodotti', ['prezzo', 'data_agg_prezzo']);
};
