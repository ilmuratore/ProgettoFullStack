exports.up = (pgm) => {
    pgm.createTable("spedizioni", {
        id: "id",

        ordine_id: {
            type: "integer",
            notNull: true,
            references: "ordini",
            onDelete: "RESTRICT"
        },

        cliente_id: {
            type: "integer",
            notNull: true,
            references: "clienti",
            onDelete: "RESTRICT"
        },

        destinazione_id: {
            type: "integer",
            notNull: true,
            references: "destinazioni_clienti",
            onDelete: "RESTRICT"
        },

        corriere_id: {
            type: "integer",
            references: "dipendenti",
            onDelete: "SET NULL"
        },

        stato: {
            type: "shipping_state",
            notNull: true,
            default: "IN_PREPARAZIONE"
        },

        tracking_number: "text",

        created_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") },
        updated_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") }
    });

    pgm.createTrigger("spedizioni", "set_updated_at", {
        when: "BEFORE",
        operation: "UPDATE",
        function: "fn_set_updated_at"
    });
};

exports.down = (pgm) => {
    pgm.dropTable("spedizioni");
};
