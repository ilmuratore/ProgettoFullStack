exports.up = (pgm) => {
    pgm.createIndex('notifiche', ['utente_id', 'letto'], {
        name: 'idx_notifiche_utente_letto'
    });

    pgm.createIndex('notifiche', [{ name: 'created_at', sort: 'DESC' }], {
        name: 'idx_notifiche_created_at'
    });
};

exports.down = (pgm) => {
    pgm.dropIndex('notifiche', [{ name: 'created_at', sort: 'DESC' }], {
        name: 'idx_notifiche_created_at'
    });

    pgm.dropIndex('notifiche', ['utente_id', 'letto'], {
        name: 'idx_notifiche_utente_letto'
    });
};
