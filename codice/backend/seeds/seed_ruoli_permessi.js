require('dotenv').config();

const pool = require('../src/config/db');

const ruoli = [
    { id:  1, nome: 'Admin',            descrizione: 'Accesso completo al sistema' },
    { id:  2, nome: 'Dev',              descrizione: 'Accesso tecnico completo per sviluppo e manutenzione' },
    { id:  3, nome: 'Supporto',         descrizione: 'Accesso in sola lettura per assistenza clienti' },
    { id:  4, nome: 'Resp. Azienda',    descrizione: 'Responsabile aziendale con visibilità trasversale' },
    { id:  5, nome: 'Resp. HR',         descrizione: 'Gestione risorse umane e dipendenti' },
    { id:  6, nome: 'Resp. Vendite',    descrizione: 'Gestione ordini in uscita, clienti e giacenze commerciali' },
    { id:  7, nome: 'Resp. Acquisti',   descrizione: 'Gestione acquisti, fornitori e approvvigionamenti' },
    { id:  8, nome: 'Resp. Magazzino',  descrizione: 'Gestione magazzino, giacenze, spedizioni e corrieri' },
    { id:  9, nome: 'Operatore',        descrizione: 'Operatività su ordini, giacenze e spedizioni' },
    { id: 10, nome: 'Corriere',         descrizione: 'Visualizzazione e aggiornamento spedizioni assegnate' },
];

const permessi = [
    { codice: 'utenti:read',        descrizione: 'Visualizza utenti' },
    { codice: 'utenti:write',       descrizione: 'Crea/modifica utenti' },
    { codice: 'utenti:delete',      descrizione: 'Elimina utenti' },
    { codice: 'prodotti:read',      descrizione: 'Visualizza prodotti' },
    { codice: 'prodotti:write',     descrizione: 'Crea/modifica prodotti' },
    { codice: 'prodotti:delete',    descrizione: 'Elimina prodotti' },
    { codice: 'fornitori:read',     descrizione: 'Visualizza fornitori' },
    { codice: 'fornitori:write',    descrizione: 'Crea/modifica fornitori' },
    { codice: 'fornitori:delete',   descrizione: 'Elimina fornitori' },
    { codice: 'clienti:read',       descrizione: 'Visualizza clienti' },
    { codice: 'clienti:write',      descrizione: 'Crea/modifica clienti' },
    { codice: 'clienti:delete',     descrizione: 'Elimina clienti' },
    { codice: 'magazzino:read',     descrizione: 'Visualizza magazzino e corrieri' },
    { codice: 'magazzino:write',    descrizione: 'Gestisce ubicazioni e corrieri' },
    { codice: 'giacenze:read',      descrizione: 'Visualizza giacenze e movimenti stock' },
    { codice: 'giacenze:write',     descrizione: 'Modifica giacenze e registra movimenti' },
    { codice: 'ordini:read',        descrizione: 'Visualizza ordini in uscita' },
    { codice: 'ordini:write',       descrizione: 'Crea/modifica ordini e gestisce picking' },
    { codice: 'ordini:approve',     descrizione: 'Approva ordini commerciali' },
    { codice: 'acquisti:read',      descrizione: 'Visualizza ordini di acquisto' },
    { codice: 'acquisti:write',     descrizione: 'Crea/modifica ordini di acquisto' },
    { codice: 'acquisti:approve',   descrizione: 'Approva ordini di acquisto' },
    { codice: 'spedizioni:read',    descrizione: 'Visualizza spedizioni e DDT' },
    { codice: 'spedizioni:write',   descrizione: 'Gestisce spedizioni e DDT' },
    { codice: 'notifiche:read',     descrizione: 'Visualizza notifiche' },
    { codice: 'dashboard:read',     descrizione: 'Visualizza dashboard e KPI' },
    { codice: 'ecosystem:read',     descrizione: "Ricerca nell'ecosistema globale" },
    { codice: 'dipendenti:read',    descrizione: 'Visualizza dipendenti' },
    { codice: 'dipendenti:write',   descrizione: 'Crea/modifica dipendenti' },
    { codice: 'dipendenti:delete',  descrizione: 'Elimina dipendenti' },
];

const ALL = permessi.map((p) => p.codice);

const permessiPerRuolo = {
    'Admin': ALL,

    'Dev': ALL,

    'Supporto': [
        'utenti:read',
        'prodotti:read',
        'fornitori:read',
        'clienti:read',
        'magazzino:read',
        'giacenze:read',
        'ordini:read',
        'acquisti:read',
        'spedizioni:read',
        'notifiche:read',
        'dashboard:read',
        'ecosystem:read',
    ],

    'Resp. Azienda': [
        'utenti:read',
        'prodotti:read',    'prodotti:write',   'prodotti:delete',
        'fornitori:read',   'fornitori:write',  'fornitori:delete',
        'clienti:read',     'clienti:write',    'clienti:delete',
        'magazzino:read',   'magazzino:write',
        'giacenze:read',    'giacenze:write',
        'ordini:read',      'ordini:write',     'ordini:approve',
        'acquisti:read',    'acquisti:write',   'acquisti:approve',
        'spedizioni:read',  'spedizioni:write',
        'notifiche:read',
        'dashboard:read',
        'ecosystem:read',
        'dipendenti:read',  'dipendenti:write', 'dipendenti:delete',
    ],

    'Resp. HR': [
        'utenti:read',
        'notifiche:read',
        'dashboard:read',
        'dipendenti:read',  'dipendenti:write', 'dipendenti:delete',
    ],

    'Resp. Vendite': [
        'prodotti:read',
        'clienti:read',     'clienti:write',    'clienti:delete',
        'magazzino:read',
        'giacenze:read',    'giacenze:write',
        'ordini:read',      'ordini:write',     'ordini:approve',
        'notifiche:read',
        'dashboard:read',
    ],

    'Resp. Acquisti': [
        'prodotti:read',    'prodotti:write',
        'fornitori:read',   'fornitori:write',
        'clienti:read',     'clienti:write',
        'magazzino:read',
        'giacenze:read',
        'acquisti:read',    'acquisti:write',   'acquisti:approve',
        'notifiche:read',
        'dashboard:read',
        'ecosystem:read',
    ],

    'Resp. Magazzino': [
        'prodotti:read',    'prodotti:write',
        'fornitori:read',
        'clienti:read',
        'magazzino:read',   'magazzino:write',
        'giacenze:read',    'giacenze:write',
        'ordini:read',                          'ordini:approve',
        'acquisti:read',                        'acquisti:approve',
        'spedizioni:read',  'spedizioni:write',
        'notifiche:read',
        'dashboard:read',
    ],

    'Operatore': [
        'prodotti:read',
        'fornitori:read',
        'clienti:read',
        'magazzino:read',
        'giacenze:read',    'giacenze:write',
        'ordini:read',
        'spedizioni:read',
        'notifiche:read',
        'dashboard:read',
    ],

    'Corriere': [
        'spedizioni:read',
        'notifiche:read',
        'dashboard:read',
    ],
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
    return Object.fromEntries(result.rows.map((r) => [r.nome, r.id]));
};

const loadPermessiByCodice = async (client) => {
    const result = await client.query('SELECT id, codice FROM permessi');
    return Object.fromEntries(result.rows.map((p) => [p.codice, p.id]));
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

        const ruoliByNome      = await loadRuoliByNome(client);
        const permessiByCodice = await loadPermessiByCodice(client);

        ensureSeedReferencesExist(ruoliByNome, permessiByCodice);
        await seedRuoliPermessi(client, ruoliByNome, permessiByCodice);

        await client.query('COMMIT');

        console.log('✅ seed_ruoli_permessi completato:');
        console.log(`   Ruoli: ${ruoli.length}`);
        console.log(`   Permessi: ${permessi.length}`);

        const check = await client.query(
            `SELECT r.nome, COUNT(rp.permesso_id) AS n_permessi
             FROM ruoli r
             LEFT JOIN ruoli_permessi rp ON rp.ruolo_id = r.id
             GROUP BY r.id, r.nome
             ORDER BY r.id`
        );
        console.log('\n   Permessi assegnati per ruolo:');
        for (const row of check.rows) {
            console.log(`   ${row.nome.padEnd(20)} ${row.n_permessi}`);
        }

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Errore seed_ruoli_permessi:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
};

if (require.main === module) {
    seed();
}

module.exports = { seed };
