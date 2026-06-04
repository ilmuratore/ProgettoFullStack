exports.up = (pgm) => {
    pgm.createTable("ubicazioni", {
        id: "id",
        magazzino_id: {
            type: "integer",
            notNull: true,
            references: "magazzini",
            onDelete: "CASCADE"
        },
        codice: { type: "text", notNull: true },
        corsia: "text",
        scaffale: "text",
        livello: "text",
        descrizione: "text",
        created_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") },
        updated_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") }
    });

    // Trigger updated_at
    pgm.createTrigger("ubicazioni", "set_updated_at", {
        when: "BEFORE",
        operation: "UPDATE",
        function: "fn_set_updated_at"
    });

    // Vincolo: codice univoco per magazzino
    pgm.addConstraint("ubicazioni", "unique_magazzino_codice", {
        unique: ["magazzino_id", "codice"]
    });
};

exports.down = (pgm) => {
    pgm.dropTable("ubicazioni");
};
