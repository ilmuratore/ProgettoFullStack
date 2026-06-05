BEGIN;

INSERT INTO ruoli (id, nome, descrizione)
VALUES
    (1, 'Admin', 'Accesso completo al sistema'),
    (2, 'Responsabile Acquisti', 'Gestione acquisti, fornitori e richieste acquisto'),
    (3, 'Responsabile Magazzino', 'Gestione magazzino, giacenze, ordini e spedizioni'),
    (4, 'Operatore', 'Operativita su ordini, giacenze, spedizioni e richieste'),
    (5, 'Corriere', 'Gestione operativa delle spedizioni')
ON CONFLICT DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('ruoli', 'id'),
    COALESCE((SELECT MAX(id) FROM ruoli), 1),
    true
);

INSERT INTO permessi (codice, descrizione)
VALUES
    ('utenti:read', 'Visualizza utenti'),
    ('utenti:write', 'Crea/modifica utenti'),
    ('utenti:delete', 'Elimina utenti'),
    ('prodotti:read', 'Visualizza prodotti'),
    ('prodotti:write', 'Crea/modifica prodotti'),
    ('prodotti:delete', 'Elimina prodotti'),
    ('fornitori:read', 'Visualizza fornitori'),
    ('fornitori:write', 'Crea/modifica fornitori'),
    ('fornitori:delete', 'Elimina fornitori'),
    ('clienti:read', 'Visualizza clienti'),
    ('clienti:write', 'Crea/modifica clienti'),
    ('clienti:delete', 'Elimina clienti'),
    ('magazzino:read', 'Visualizza magazzino'),
    ('magazzino:write', 'Gestisce ubicazioni'),
    ('giacenze:read', 'Visualizza giacenze'),
    ('giacenze:write', 'Modifica giacenze'),
    ('ordini:read', 'Visualizza ordini'),
    ('ordini:write', 'Crea/modifica ordini e gestisce stato picking'),
    ('ordini:approve', 'Approva ordini commerciali'),
    ('acquisti:read', 'Visualizza acquisti'),
    ('acquisti:write', 'Crea/modifica acquisti'),
    ('acquisti:approve', 'Approva acquisti'),
    ('spedizioni:read', 'Visualizza spedizioni'),
    ('spedizioni:write', 'Gestisce spedizioni'),
    ('notifiche:read', 'Visualizza notifiche'),
    ('dashboard:read', 'Visualizza dashboard'),
    ('ecosystem:read', 'Ricerca nell''ecosistema globale'),
    ('ecosystem:write', 'Interagisce con ecosistema (chat fornitore, aggiunta fornitore da ecosistema)'),
    ('richieste:read', 'Visualizza richieste acquisto'),
    ('richieste:write', 'Crea e invia richieste acquisto')
ON CONFLICT DO NOTHING;

WITH ruolo_permesso_map (ruolo_nome, permesso_codice) AS (
    VALUES
        ('Admin', 'utenti:read'),
        ('Admin', 'utenti:write'),
        ('Admin', 'utenti:delete'),
        ('Admin', 'prodotti:read'),
        ('Admin', 'prodotti:write'),
        ('Admin', 'prodotti:delete'),
        ('Admin', 'fornitori:read'),
        ('Admin', 'fornitori:write'),
        ('Admin', 'fornitori:delete'),
        ('Admin', 'clienti:read'),
        ('Admin', 'clienti:write'),
        ('Admin', 'clienti:delete'),
        ('Admin', 'magazzino:read'),
        ('Admin', 'magazzino:write'),
        ('Admin', 'giacenze:read'),
        ('Admin', 'giacenze:write'),
        ('Admin', 'ordini:read'),
        ('Admin', 'ordini:write'),
        ('Admin', 'ordini:approve'),
        ('Admin', 'acquisti:read'),
        ('Admin', 'acquisti:write'),
        ('Admin', 'acquisti:approve'),
        ('Admin', 'spedizioni:read'),
        ('Admin', 'spedizioni:write'),
        ('Admin', 'notifiche:read'),
        ('Admin', 'dashboard:read'),
        ('Admin', 'ecosystem:read'),
        ('Admin', 'ecosystem:write'),
        ('Admin', 'richieste:read'),
        ('Admin', 'richieste:write'),
        ('Responsabile Acquisti', 'acquisti:read'),
        ('Responsabile Acquisti', 'acquisti:write'),
        ('Responsabile Acquisti', 'acquisti:approve'),
        ('Responsabile Acquisti', 'fornitori:read'),
        ('Responsabile Acquisti', 'fornitori:write'),
        ('Responsabile Acquisti', 'fornitori:delete'),
        ('Responsabile Acquisti', 'prodotti:read'),
        ('Responsabile Acquisti', 'ordini:read'),
        ('Responsabile Acquisti', 'richieste:read'),
        ('Responsabile Acquisti', 'richieste:write'),
        ('Responsabile Acquisti', 'ecosystem:read'),
        ('Responsabile Acquisti', 'ecosystem:write'),
        ('Responsabile Acquisti', 'notifiche:read'),
        ('Responsabile Acquisti', 'dashboard:read'),
        ('Responsabile Magazzino', 'magazzino:read'),
        ('Responsabile Magazzino', 'magazzino:write'),
        ('Responsabile Magazzino', 'giacenze:read'),
        ('Responsabile Magazzino', 'giacenze:write'),
        ('Responsabile Magazzino', 'prodotti:read'),
        ('Responsabile Magazzino', 'spedizioni:read'),
        ('Responsabile Magazzino', 'spedizioni:write'),
        ('Responsabile Magazzino', 'ordini:read'),
        ('Responsabile Magazzino', 'ordini:write'),
        ('Responsabile Magazzino', 'notifiche:read'),
        ('Responsabile Magazzino', 'dashboard:read'),
        ('Operatore', 'ordini:read'),
        ('Operatore', 'ordini:write'),
        ('Operatore', 'giacenze:read'),
        ('Operatore', 'prodotti:read'),
        ('Operatore', 'spedizioni:read'),
        ('Operatore', 'richieste:write'),
        ('Operatore', 'ecosystem:read'),
        ('Operatore', 'notifiche:read'),
        ('Corriere', 'spedizioni:read'),
        ('Corriere', 'spedizioni:write'),
        ('Corriere', 'notifiche:read')
)
INSERT INTO ruoli_permessi (ruolo_id, permesso_id)
SELECT r.id, p.id
FROM ruolo_permesso_map rpm
JOIN ruoli r ON r.nome = rpm.ruolo_nome
JOIN permessi p ON p.codice = rpm.permesso_codice
ON CONFLICT (ruolo_id, permesso_id) DO NOTHING;

COMMIT;
