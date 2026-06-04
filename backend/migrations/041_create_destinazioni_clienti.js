exports.up = (pgm) => {
    pgm.createTable("destinazioni_clienti", {
        id: "id",
        cliente_id: {
            type: "integer",
            notNull: true,
            references: "clienti",
            onDelete: "CASCADE"
        },
        etichetta: "text",
        indirizzo: "text",
        cap: "text",
        citta: "text",
        provincia: "text",
        paese: "text",
        predefinita: { type: "boolean", notNull: true, default: false },
        created_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") },
        updated_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") }
    });

    pgm.createTrigger("destinazioni_clienti", "set_updated_at", {
        when: "BEFORE",
        operation: "UPDATE",
        function: "fn_set_updated_at"
    });
};

exports.down = (pgm) => {
    pgm.dropTable("destinazioni_clienti");
};
