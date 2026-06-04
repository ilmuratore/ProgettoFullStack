exports.up = (pgm) => {
    pgm.createFunction(
        "fn_set_updated_at",
        [],
        {
            returns: "trigger",
            language: "plpgsql",
        },
        `
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        `
    );
};

exports.down = (pgm) => {
    pgm.dropFunction("fn_set_updated_at", []);
};
