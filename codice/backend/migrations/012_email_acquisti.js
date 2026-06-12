const TRIGGER = { when: 'BEFORE', operation: 'UPDATE', level: 'ROW', function: 'fn_set_updated_at' };

exports.up = (pgm) => {
    pgm.createTable('azienda_settings', {
        id:              'id',
        ragione_sociale: { type: 'varchar(180)', notNull: true },
        piva:            { type: 'varchar(32)' },
        codice_fiscale:  { type: 'varchar(32)' },
        indirizzo:       { type: 'varchar(255)' },
        citta:           { type: 'varchar(120)' },
        provincia:       { type: 'varchar(10)' },
        cap:             { type: 'varchar(10)' },
        nazione:         { type: 'varchar(80)', notNull: true, default: 'Italia' },
        email:           { type: 'varchar(180)' },
        pec:             { type: 'varchar(180)' },
        telefono:        { type: 'varchar(50)' },
        sito_web:        { type: 'varchar(180)' },
        iban:            { type: 'varchar(64)' },
        sdi:             { type: 'varchar(16)' },
        logo_url:        { type: 'text' },
        attivo:          { type: 'boolean', notNull: true, default: true },
        created_at:      { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:      { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('azienda_settings', 'set_updated_at', TRIGGER);

    pgm.sql(`
        INSERT INTO azienda_settings
            (id, ragione_sociale, email, nazione, attivo)
        VALUES
            (1, 'LogiChain ERP', 'no-reply@logichain.it', 'Italia', true)
        ON CONFLICT (id) DO NOTHING
    `);

    pgm.createTable('ordini_acquisto_email_log', {
        id:                           'id',
        ordine_acquisto_id:           { type: 'integer', notNull: true, references: 'ordini_acquisto', onDelete: 'CASCADE' },
        utente_id:                    { type: 'integer', references: 'utenti', onDelete: 'SET NULL' },
        destinatario:                 { type: 'text', notNull: true },
        cc:                           { type: 'text' },
        bcc:                          { type: 'text' },
        subject:                      { type: 'text', notNull: true },
        body:                         { type: 'text' },
        stato:                        { type: 'varchar(20)', notNull: true },
        provider_message_id:          { type: 'text' },
        errore:                       { type: 'text' },
        allegato_ordine_filename:     { type: 'varchar(255)' },
        allegato_contabile_filename:  { type: 'varchar(255)' },
        allegato_contabile_mime:      { type: 'varchar(120)' },
        allegato_contabile_size:      { type: 'integer' },
        sent_at:                      { type: 'timestamptz' },
        created_at:                   { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
        updated_at:                   { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createTrigger('ordini_acquisto_email_log', 'set_updated_at', TRIGGER);
    pgm.createIndex('ordini_acquisto_email_log', 'ordine_acquisto_id', { name: 'idx_po_email_log_ordine' });
    pgm.createIndex('ordini_acquisto_email_log', 'stato', { name: 'idx_po_email_log_stato' });

    pgm.addConstraint(
        'ordini_acquisto_email_log',
        'chk_po_email_log_stato',
        "CHECK (stato IN ('INVIATA', 'FALLITA'))"
    );
};

exports.down = (pgm) => {
    pgm.dropTable('ordini_acquisto_email_log');
    pgm.dropTable('azienda_settings');
};
