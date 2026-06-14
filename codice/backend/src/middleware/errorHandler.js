const errorMessages = {
    VALIDATION_ERROR: 'Dati richiesta non validi',
    AUTH_REQUIRED: 'Autenticazione richiesta',
    CREDENZIALI_NON_VALIDE: 'Credenziali non valide',
    UTENTE_DISABILITATO: 'Utente disabilitato',
    PASSWORD_NON_VALIDA: 'La password attuale non è corretta',
    ACCESS_DENIED: 'Accesso negato',
    EMAIL_GIA_ESISTENTE: 'Email già esistente',
    RUOLO_NON_VALIDO: 'Ruolo non valido',
    UTENTE_NON_TROVATO: 'Utente non trovato',
    RESOURCE_NOT_FOUND: 'Risorsa non trovata',
    STATE_TRANSITION_INVALID: 'Transizione di stato non consentita',
    INVALID_STATE: 'Operazione non consentita nello stato corrente',
    INVALID_TRANSITION: 'Transizione di stato non consentita',
    DUPLICATE_ENTRY: 'Record già esistente (valore duplicato)',
    INSUFFICIENT_STOCK: 'Giacenza insufficiente per completare il movimento',
    ENDPOINT_DEPRECATED: 'Endpoint deprecato',
    CORRIERE_CON_SPEDIZIONI: 'Impossibile eliminare: il corriere ha spedizioni associate',
    CATEGORIA_CON_PRODOTTI: 'Impossibile eliminare: la categoria ha prodotti associati',
    CATEGORIA_CON_SOTTOCATEGORIE: 'Impossibile eliminare: la categoria ha sottocategorie',
    RATE_LIMIT: 'Troppe richieste',
    EMAIL_CONFIG_MISSING: 'Configurazione email incompleta',
    EMAIL_SEND_FAILED: 'Invio email non riuscito',
    INTERNAL_SERVER_ERROR: 'Errore interno del server',
    LIMIT_FILE_SIZE: 'VALIDATION_ERROR'
};

const errorStatusCodes = {
    VALIDATION_ERROR: 400,
    AUTH_REQUIRED: 401,
    CREDENZIALI_NON_VALIDE: 401,
    UTENTE_DISABILITATO: 401,
    PASSWORD_NON_VALIDA: 401,
    ACCESS_DENIED: 403,
    UTENTE_NON_TROVATO: 404,
    RESOURCE_NOT_FOUND: 404,
    STATE_TRANSITION_INVALID: 409,
    INVALID_STATE: 409,
    INVALID_TRANSITION: 409,
    EMAIL_GIA_ESISTENTE: 409,
    DUPLICATE_ENTRY: 409,
    CORRIERE_CON_SPEDIZIONI: 409,
    CATEGORIA_CON_PRODOTTI: 409,
    CATEGORIA_CON_SOTTOCATEGORIE: 409,
    ENDPOINT_DEPRECATED: 410,
    RUOLO_NON_VALIDO: 422,
    INSUFFICIENT_STOCK: 422,
    RATE_LIMIT: 429,
    EMAIL_CONFIG_MISSING: 500,
    EMAIL_SEND_FAILED: 502,
    INTERNAL_SERVER_ERROR: 500
};

const PG_SQLSTATE = {
    '23505': 'DUPLICATE_ENTRY'
};

const errorHandler = (err, _req, res, _next) => {
    let code = PG_SQLSTATE[err.code] || err.code;

    if (!code || !errorStatusCodes[code]) {
        code = 'INTERNAL_SERVER_ERROR';
    }

    const statusCode = err.status || errorStatusCodes[code] || 500;
    const message = err.message || errorMessages[code] || errorMessages.INTERNAL_SERVER_ERROR;

    if (process.env.NODE_ENV !== 'production') {
        console.error(`[${new Date().toISOString()}] ${statusCode} - ${code}: ${message}`);
        if (statusCode === 500 && err.stack) console.error(err.stack);
    }

    const payload = { status: 'error', code, message };

    if (code === 'VALIDATION_ERROR' && err.details) {
        payload.details = err.details;
    }

    return res.status(statusCode).json(payload);
};

module.exports = { errorHandler };
