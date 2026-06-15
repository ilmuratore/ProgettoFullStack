exports.up = (pgm) => {
    pgm.addConstraint('ddt', 'unique_ddt_numero_ddt', {
        unique: ['numero_ddt']
    });
};

exports.down = (pgm) => {
    pgm.dropConstraint('ddt', 'unique_ddt_numero_ddt');
};