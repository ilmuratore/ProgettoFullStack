// V2 — M04: Anagrafiche "I nostri Clienti"
// Introduce la distinzione source=manual/ecosystem.
// L'azione Modifica è disponibile solo per source=manual.
// Elimina → soft delete (attivo=false), storico transazionale preservato.

exports.up = (pgm) => {
    pgm.addColumns('clienti', {
        source: { type: 'text', notNull: true, default: "'manual'" }
    });
    pgm.addConstraint('clienti', 'chk_clienti_source', "CHECK (source IN ('manual', 'ecosystem'))");
    pgm.createIndex('clienti', 'source', { name: 'idx_clienti_source' });
};

exports.down = (pgm) => {
    pgm.dropIndex('clienti', 'source', { name: 'idx_clienti_source' });
    pgm.dropConstraint('clienti', 'chk_clienti_source');
    pgm.dropColumns('clienti', ['source']);
};
