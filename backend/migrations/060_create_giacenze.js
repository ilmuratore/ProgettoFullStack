exports.up = (pgm) => {
    pgm.createTable("giacenze", {
        id: "id",
        prodotto_id: { type: "integer", notNull: true, references: "prodotti", onDelete: "RESTRICT" },
        ubicazione_id: { type: "integer", notNull: true, references: "ubicazioni", onDelete: "RESTRICT" },
        quantita: { type: "integer", notNull: true, default: 0 },
        created_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") },
        updated_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") }
    });

    pgm.createTrigger("giacenze", "set_updated_at", {
        when: "BEFORE", operation: "UPDATE", function: "fn_set_updated_at"
    });

    pgm.addConstraint("giacenze", "unique_prodotto_ubicazione", { unique: ["prodotto_id", "ubicazione_id"] });
    pgm.addConstraint("giacenze", "chk_giacenze_quantita", "CHECK (quantita >= 0)");
};

exports.down = (pgm) => {
    pgm.dropTable("giacenze");
};