// V2 — M11: Notifiche & Alert Operativi (Esteso)
// Aggiunge 3 nuovi valori all'enum notification_type per l'ecosistema B2B.
//
// NOTA: PostgreSQL non supporta la rimozione di valori enum esistenti.
// Il down di questa migrazione è intenzionalmente no-op.
// Per rollback completo: ricreazione manuale del tipo (richiede DROP CASCADE).

exports.up = (pgm) => {
    pgm.sql(`ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'RICHIESTA_ACCETTATA'`);
    pgm.sql(`ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'RICHIESTA_RIFIUTATA'`);
    pgm.sql(`ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'MESSAGGIO_FORNITORE'`);
};

exports.down = (_pgm) => {
    // enum values non rimovibili in PostgreSQL
};