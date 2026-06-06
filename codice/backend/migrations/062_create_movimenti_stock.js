exports.up = (pgm) => {
    pgm.createTable("movimenti_stock", {
        id: "id",

        prodotto_id: {
            type: "integer",
            notNull: true,
            references: "prodotti",
            onDelete: "RESTRICT"
        },

        ubicazione_id: {
            type: "integer",
            notNull: true,
            references: "ubicazioni",
            onDelete: "RESTRICT"
        },

        quantita: { type: "integer", notNull: true },

        tipo: {
            type: "movimento_tipo",
            notNull: true
        },

        riferimento: "text",   // es: numero PO, numero SO, numero DDT
        note: "text",

        created_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") },
        updated_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") }
    });

    // Trigger updated_at
    pgm.createTrigger("movimenti_stock", "set_updated_at", {
        when: "BEFORE",
        operation: "UPDATE",
        function: "fn_set_updated_at"
    });

    // Append-only: impedisce UPDATE e DELETE
    pgm.addConstraint("movimenti_stock", "movimenti_stock_no_update", {
        check: "TRUE" // placeholder per compatibilità
    });

    pgm.sql(`
    CREATE OR REPLACE RULE movimenti_stock_no_update_rule AS
    ON UPDATE TO movimenti_stock DO INSTEAD NOTHING;
  `);

    pgm.sql(`
    CREATE OR REPLACE RULE movimenti_stock_no_delete_rule AS
    ON DELETE TO movimenti_stock DO INSTEAD NOTHING;
  `);
};

exports.down = (pgm) => {
    pgm.sql(`DROP RULE IF EXISTS movimenti_stock_no_update_rule ON movimenti_stock;`);
    pgm.sql(`DROP RULE IF EXISTS movimenti_stock_no_delete_rule ON movimenti_stock;`);
    pgm.dropTable("movimenti_stock");
};
