require('dotenv').config();

const pool = require('../src/config/db');

const ruoli = [
    { id: 1, nome: 'Admin', descrizione: 'Accesso completo al sistema' },
    { id: 2, nome: 'Responsabile Acquisti', descrizione: 'Gestione acquisti, fornitori e richieste acquisto' },
    { id: 3, nome: 'Responsabile Magazzino', descrizione: 'Gestione magazzino, giacenze, ordini e spedizioni' },
    { id: 4, nome: 'Operatore', descrizione: 'Operativita su ordini, giacenze, spedizioni e richieste' },
    { id: 5, nome: 'Corriere', descrizione: 'Gestione operativa delle spedizioni' }
];

const permessi = [
    { codice: 'utenti:read', descrizione: 'Visualizza utenti' },
    { codice: 'utenti:write', descrizione: 'Crea/modifica utenti' },
    { codice: 'utenti:delete', descrizione: 'Elimina utenti' },
    { codice: 'prodotti:read', descrizione: 'Visualizza prodotti' },
    { codice: 'prodotti:write', descrizione: 'Crea/modifica prodotti' },
    { codice: 'prodotti:delete', descrizione: 'Elimina prodotti' },
    { codice: 'fornitori:read', descrizione: 'Visualizza fornitori' },
    { codice: 'fornitori:write', descrizione: 'Crea/modifica fornitori' },
    { codice: 'fornitori:delete', descrizione: 'Elimina fornitori' },
    { codice: 'clienti:read', descrizione: 'Visualizza clienti' },
    { codice: 'clienti:write', descrizione: 'Crea/modifica clienti' },
    { codice: 'clienti:delete', descrizione: 'Elimina clienti' },
    { codice: 'magazzino:read', descrizione: 'Visualizza magazzino' },
    { codice: 'magazzino:write', descrizione: 'Gestisce ubicazioni' },
    { codice: 'giacenze:read', descrizione: 'Visualizza giacenze' },
    { codice: 'giacenze:write', descrizione: 'Modifica giacenze' },
    { codice: 'ordini:read', descrizione: 'Visualizza ordini' },
    { codice: 'ordini:write', descrizione: 'Crea/modifica ordini e gestisce stato picking' },
    { codice: 'ordini:approve', descrizione: 'Approva ordini commerciali' },
    { codice: 'acquisti:read', descrizione: 'Visualizza acquisti' },
    { codice: 'acquisti:write', descrizione: 'Crea/modifica acquisti' },
    { codice: 'acquisti:approve', descrizione: 'Approva acquisti' },
    { codice: 'spedizioni:read', descrizione: 'Visualizza spedizioni' },
    { codice: 'spedizioni:write', descrizione: 'Gestisce spedizioni' },
    { codice: 'notifiche:read', descrizione: 'Visualizza notifiche' },
    { codice: 'dashboard:read', descrizione: 'Visualizza dashboard' },
    { codice: 'ecosystem:read', descrizione: "Ricerca nell'ecosistema globale" },
    { codice: 'ecosystem:write', descrizione: "Interagisce con ecosistema (chat fornitore, aggiunta fornitore da ecosistema)" },
    { codice: 'richieste:read', descrizione: 'Visualizza richieste acquisto' },
    { codice: 'richieste:write', descrizione: 'Crea e invia richieste acquisto' }
];

const permessiPerRuolo = {
    Admin: permessi.map((permesso) => permesso.codice),
    'Responsabile Acquisti': [
        'acquisti:read',
        'acquisti:write',
        'acquisti:approve',
        'fornitori:read',
        'fornitori:write',
        'fornitori:delete',
        'prodotti:read',
        'ordini:read',
        'richieste:read',
        'richieste:write',
        'ecosystem:read',
        'ecosystem:write',
        'notifiche:read',
        'dashboard:read'
    ],
    'Responsabile Magazzino': [
        'magazzino:read',
        'magazzino:write',
        'giacenze:read',
        'giacenze:write',
        'prodotti:read',
        'spedizioni:read',
        'spedizioni:write',
        'ordini:read',
        'ordini:write',
        'notifiche:read',
        'dashboard:read'
    ],
    Operatore: [
        'ordini:read',
        'ordini:write',
        'giacenze:read',
        'prodotti:read',
        'spedizioni:read',
        'richieste:write',
        'ecosystem:read',
        'notifiche:read'
    ],
    Corriere: [
        'spedizioni:read',
        'spedizioni:write',
        'notifiche:read'
    ]
};


const seedRuoli = async (client) => {
    for (const ruolo of ruoli) {
        await client.query(
            `INSERT INTO ruoli (id, nome, descrizione)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [ruolo.id, ruolo.nome, ruolo.descrizione]
        );
    }

    await client.query(
        `SELECT setval(
            pg_get_serial_sequence('ruoli', 'id'),
            COALESCE((SELECT MAX(id) FROM ruoli), 1),
            true
        )`
    );
};

const seedPermessi = async (client) => {
    for (const permesso of permessi) {
        await client.query(
            `INSERT INTO permessi (codice, descrizione)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [permesso.codice, permesso.descrizione]
        );
    }
};

const loadRuoliByNome = async (client) => {
    const result = await client.query('SELECT id, nome FROM ruoli');
    return Object.fromEntries(result.rows.map((ruolo) => [ruolo.nome, ruolo.id]));
};

const loadPermessiByCodice = async (client) => {
    const result = await client.query('SELECT id, codice FROM permessi');
    return Object.fromEntries(result.rows.map((permesso) => [permesso.codice, permesso.id]));
};

const ensureSeedReferencesExist = (ruoliByNome, permessiByCodice) => {
    for (const ruolo of ruoli) {
        if (!ruoliByNome[ruolo.nome]) {
            throw new Error(`Ruolo mancante dopo seed: ${ruolo.nome}`);
        }
    }

    for (const permesso of permessi) {
        if (!permessiByCodice[permesso.codice]) {
            throw new Error(`Permesso mancante dopo seed: ${permesso.codice}`);
        }
    }
};

const seedRuoliPermessi = async (client, ruoliByNome, permessiByCodice) => {
    for (const [nomeRuolo, codiciPermessi] of Object.entries(permessiPerRuolo)) {
        const ruoloId = ruoliByNome[nomeRuolo];

        for (const codicePermesso of codiciPermessi) {
            const permessoId = permessiByCodice[codicePermesso];

            await client.query(
                `INSERT INTO ruoli_permessi (ruolo_id, permesso_id)
                 VALUES ($1, $2)
                 ON CONFLICT (ruolo_id, permesso_id) DO NOTHING`,
                [ruoloId, permessoId]
            );
        }
    }
};

const seed = async () => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await seedRuoli(client);
        await seedPermessi(client);

        const ruoliByNome = await loadRuoliByNome(client);
        const permessiByCodice = await loadPermessiByCodice(client);

        ensureSeedReferencesExist(ruoliByNome, permessiByCodice);
        await seedRuoliPermessi(client, ruoliByNome, permessiByCodice);

        await client.query('COMMIT');
        console.log('Seed ruoli e permessi completato con successo');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Errore durante il seed ruoli/permessi:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
};


if (require.main === module) {
    seed();
}

module.exports = {
    seed
};
