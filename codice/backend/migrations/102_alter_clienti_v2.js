exports.up = (pgm) => {
    pgm.addColumns('clienti', {
        source: { type: 'text', notNull: true, default: pgm.func("'manual'") }
    });
    pgm.addConstraint('clienti', 'chk_clienti_source', "CHECK (source IN ('manual', 'ecosystem'))");
    pgm.createIndex('clienti', 'source', { name: 'idx_clienti_source' });
};
 
exports.down = (pgm) => {
    pgm.dropIndex('clienti', 'source', { name: 'idx_clienti_source' });
    pgm.dropConstraint('clienti', 'chk_clienti_source');
    pgm.dropColumns('clienti', ['source']);
};
 