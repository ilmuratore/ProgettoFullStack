exports.up = (pgm) => {
    pgm.createIndex('richieste_acquisto', 'fornitore_id', { name: 'idx_richieste_fornitore_id' });
    pgm.createIndex('richieste_acquisto', 'stato',        { name: 'idx_richieste_stato' });
    pgm.createIndex('richieste_acquisto', 'utente_id',    { name: 'idx_richieste_utente_id' });
    pgm.createIndex('richieste_acquisto', ['utente_id', { name: 'data_richiesta', sort: 'DESC' }], { name: 'idx_richieste_utente_data' });
    pgm.createIndex('righe_richiesta', 'richiesta_id', { name: 'idx_righe_richiesta_id' });
    pgm.createIndex('righe_richiesta', 'prodotto_id',  { name: 'idx_righe_prodotto_id' });
};

exports.down = (pgm) => {
    pgm.dropIndex('righe_richiesta',    'prodotto_id',  { name: 'idx_righe_prodotto_id' });
    pgm.dropIndex('righe_richiesta',    'richiesta_id', { name: 'idx_righe_richiesta_id' });
    pgm.dropIndex('richieste_acquisto', ['utente_id', { name: 'data_richiesta', sort: 'DESC' }], { name: 'idx_richieste_utente_data' });
    pgm.dropIndex('richieste_acquisto', 'utente_id',    { name: 'idx_richieste_utente_id' });
    pgm.dropIndex('richieste_acquisto', 'stato',        { name: 'idx_richieste_stato' });
    pgm.dropIndex('richieste_acquisto', 'fornitore_id', { name: 'idx_richieste_fornitore_id' });
};