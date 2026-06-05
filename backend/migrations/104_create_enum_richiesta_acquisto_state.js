// V2 — M16: Richieste di Acquisto Ecosistema
// Nuovo enum per la state machine delle richieste d'acquisto.
// Ciclo: BOZZA → INVIATA → IN_VALUTAZIONE → ACCETTATA | RIFIUTATA

exports.up = (pgm) => {
    pgm.createType('richiesta_acquisto_state', [
        'BOZZA', 'INVIATA', 'IN_VALUTAZIONE', 'ACCETTATA', 'RIFIUTATA'
    ]);
};

exports.down = (pgm) => {
    pgm.dropType('richiesta_acquisto_state');
};