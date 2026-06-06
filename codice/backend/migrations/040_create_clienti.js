exports.up = (pgm) => {
    pgm.createTable("clienti", {
        id: "id",
        ragione_sociale: { type: "text", notNull: true },
        piva_cf: { type: "text", unique: true },
        email: "text",
        telefono: "text",
        attivo: { type: "boolean", notNull: true, default: true },
        created_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") },
        updated_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") }
    });

    pgm.createTrigger("clienti", "set_updated_at", {
        when: "BEFORE",
        operation: "UPDATE",
        function: "fn_set_updated_at"
    });
};

exports.down = (pgm) => {
    pgm.dropTable("clienti");
};
