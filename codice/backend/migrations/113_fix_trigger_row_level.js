// Fix: set_updated_at trigger era FOR EACH STATEMENT su 9 tabelle operative.
// fn_set_updated_at() accede a NEW.updated_at — richiede FOR EACH ROW.
// Con STATEMENT il campo NEW è NULL e updated_at non veniva mai aggiornato.
//
// Tabelle fixate: categorie, clienti, ddt, destinazioni_clienti,
//                 giacenze, magazzini, prodotti, spedizioni, ubicazioni
//
// movimenti_stock esclusa: le RULES no_update/no_delete rendono qualsiasi
// UPDATE un no-op a livello DB, quindi il trigger è irrilevante.
//
// prodotti ha anche trg_data_agg_prezzo (FOR EACH ROW corretto) — invariato.

const TABLES = [
    'categorie',
    'clienti',
    'ddt',
    'destinazioni_clienti',
    'giacenze',
    'magazzini',
    'prodotti',
    'spedizioni',
    'ubicazioni'
];

exports.up = (pgm) => {
    for (const table of TABLES) {
        // Elimina il trigger STATEMENT errato
        pgm.dropTrigger(table, 'set_updated_at', { ifExists: true });

        // Ricrea correttamente come FOR EACH ROW
        pgm.createTrigger(table, 'set_updated_at', {
            when:      'BEFORE',
            operation: 'UPDATE',
            level:     'ROW',
            function:  'fn_set_updated_at'
        });
    }
};

exports.down = (pgm) => {
    // Ripristina STATEMENT (stato originale errato — non consigliato)
    for (const table of TABLES) {
        pgm.dropTrigger(table, 'set_updated_at', { ifExists: true });
        pgm.createTrigger(table, 'set_updated_at', {
            when:      'BEFORE',
            operation: 'UPDATE',
            function:  'fn_set_updated_at'
            // omettendo level → default STATEMENT (comportamento originale)
        });
    }
};
