exports.up = (pgm) => {
    pgm.createTable("magazzini", {
        id: "id",
        codice: { type: "text", notNull: true, unique: true },
        nome: { type: "text", notNull: true },
        indirizzo: "text",
        cap: "text",
        citta: "text",
        provincia: "text",
        paese: "text",
        attivo: { type: "boolean", notNull: true, default: true },
        created_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") },
        updated_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") }
    });

    pgm.createTrigger("magazzini", "set_updated_at", {
        when: "BEFORE",
        operation: "UPDATE",
        function: "fn_set_updated_at"
    });
};

exports.down = (pgm) => {
    pgm.dropTable("magazzini");
};
