exports.up = (pgm) => {
    pgm.createTable("ddt", {
        id: "id",

        spedizione_id: {
            type: "integer",
            notNull: true,
            references: "spedizioni",
            onDelete: "CASCADE"
        },

        numero_ddt: { type: "text", notNull: true },
        data_ddt: { type: "date", notNull: true, default: pgm.func("CURRENT_DATE") },

        trasportatore: "text",
        note: "text",

        created_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") },
        updated_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") }
    });

    pgm.createTrigger("ddt", "set_updated_at", {
        when: "BEFORE",
        operation: "UPDATE",
        function: "fn_set_updated_at"
    });

    // Un DDT per spedizione
    pgm.addConstraint("ddt", "unique_spedizione_ddt", {
        unique: ["spedizione_id"]
    });
};

exports.down = (pgm) => {
    pgm.dropTable("ddt");
};
