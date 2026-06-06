exports.up = (pgm) => {

    pgm.sql(`ALTER TABLE fornitori ALTER COLUMN source SET DEFAULT 'manual'`);
    pgm.sql(`ALTER TABLE clienti   ALTER COLUMN source SET DEFAULT 'manual'`);
    pgm.sql(`UPDATE fornitori SET source = 'manual' WHERE source = '''manual'''`);
    pgm.sql(`UPDATE clienti   SET source = 'manual' WHERE source = '''manual'''`);
}

exports.down = (_pgm) => {

};