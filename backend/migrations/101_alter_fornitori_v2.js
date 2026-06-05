// V2 — M03: Anagrafiche "I nostri Fornitori"
// Introduce la distinzione source=manual/ecosystem.
// Aggiunti: source (default 'manual'), sito_web, descrizione_aziendale.

exports.up = (pgm) => {
    pgm.addColumns('fornitori', {
        source: { type: 'text', notNull: true, default: "'manual'" },
        sito_web: { type: 'text' },
        descrizione_aziendale: { type: 'text' }
    });
    pgm.addConstraint('fornitori', 'chk_fornitori_source', "CHECK (source IN ('manual', 'ecosystem'))");
    pgm.createIndex('fornitori', 'source', { name: 'idx_fornitori_source' });
};

exports.down = (pgm) => {
    pgm.dropIndex('fornitori', 'source', { name: 'idx_fornitori_source' });
    pgm.dropConstraint('fornitori', 'chk_fornitori_source');
    pgm.dropColumns('fornitori', ['source', 'sito_web', 'descrizione_aziendale']);
};
