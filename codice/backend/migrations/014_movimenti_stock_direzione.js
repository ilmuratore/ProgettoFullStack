exports.up = (pgm) => {
    pgm.addColumn('movimenti_stock', {
        direzione: { type: 'char(3)', notNull: false }
    });

    pgm.addConstraint(
        'movimenti_stock',
        'chk_movimenti_stock_direzione',
        "CHECK (direzione IS NULL OR direzione IN ('IN', 'OUT'))"
    );
};

exports.down = (pgm) => {
    pgm.dropConstraint('movimenti_stock', 'chk_movimenti_stock_direzione');
    pgm.dropColumn('movimenti_stock', 'direzione');
};
