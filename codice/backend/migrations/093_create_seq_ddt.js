exports.up = (pgm) => {
    pgm.sql(`CREATE SEQUENCE seq_ddt_numero_progressivo START 1`);
};

exports.down = (pgm) => {
    pgm.sql(`DROP SEQUENCE IF EXISTS seq_ddt_numero_progressivo`);
};