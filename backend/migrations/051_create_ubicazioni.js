exports.up = (pgm) => {
    pgm.createTable("ubicazioni", {
        id: "id",
        magazzino_id: { type: "integer", notNull: true, references: "magazzini", onDelete: "CASCADE" },
        codice: { type: "text", notNull: true },
        corsia: { type: "integer", notNull: true },
        scaffale: { type: "integer", notNull: true },
        attivo: { type: "boolean", notNull: true, default: true },
        temperatura_controllata: { type: "boolean", notNull: true, default: false },
        created_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") },
        updated_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") }
    });

    pgm.createTrigger("ubicazioni", "set_updated_at", {
        when: "BEFORE", operation: "UPDATE", function: "fn_set_updated_at"
    });

    pgm.addConstraint("ubicazioni", "unique_magazzino_corsia_scaffale", {
        unique: ["magazzino_id", "corsia", "scaffale"]
    });
};

exports.down = (pgm) => {
    pgm.dropTable("ubicazioni");
};