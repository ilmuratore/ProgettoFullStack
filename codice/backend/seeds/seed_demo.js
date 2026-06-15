const readline = require('readline');
const bcrypt = require('bcryptjs');

const DEFAULT_PASSWORD = process.env.DEMO_PASSWORD || 'Demo123!';

const selezionaAmbiente = async () => {
    const argTarget = (process.argv[2] || '').toLowerCase();
    const envTarget = (process.env.SEED_TARGET || '').toLowerCase();
    let target = argTarget || envTarget;

    if (!target) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const ask = (q) => new Promise((res) => rl.question(q, res));
        console.log('Seleziona database:');
        console.log('  1) test       (.env.test  -> DB_NAME deve contenere "test")');
        console.log('  2) produzione (.env)');
        const scelta = (await ask('Scelta [1/2]: ')).trim();
        rl.close();
        target = scelta === '2' ? 'prod' : 'test';
    }

    if (['1', 'test'].includes(target)) {
        process.env.NODE_ENV = 'test';
    } else if (['2', 'prod', 'production', 'produzione'].includes(target)) {
        process.env.NODE_ENV = 'production';
    } else {
        throw new Error(`Target non valido: ${target} (usa test|prod)`);
    }

    return process.env.NODE_ENV === 'test' ? 'test' : 'produzione';
};

const utentiPerRuolo = [
    { ruolo_id: 1,  nome: 'Alice',   cognome: 'Admin',     email: 'admin.demo@logichain.it' },
    { ruolo_id: 2,  nome: 'Dario',   cognome: 'Dev',       email: 'dev.demo@logichain.it' },
    { ruolo_id: 3,  nome: 'Sara',    cognome: 'Supporto',  email: 'supporto.demo@logichain.it' },
    { ruolo_id: 4,  nome: 'Roberto', cognome: 'Azienda',   email: 'azienda.demo@logichain.it' },
    { ruolo_id: 5,  nome: 'Elena',   cognome: 'HR',        email: 'hr.demo@logichain.it' },
    { ruolo_id: 6,  nome: 'Marco',   cognome: 'Vendite',   email: 'vendite.demo@logichain.it' },
    { ruolo_id: 7,  nome: 'Giulia',  cognome: 'Acquisti',  email: 'acquisti.demo@logichain.it' },
    { ruolo_id: 8,  nome: 'Paolo',   cognome: 'Magazzino', email: 'magazzino.demo@logichain.it' },
    { ruolo_id: 9,  nome: 'Luca',    cognome: 'Operatore', email: 'operatore.demo@logichain.it' },
    { ruolo_id: 10, nome: 'Franco',  cognome: 'Corriere',  email: 'corriere.demo@logichain.it' },
];

const categorie = [
    { nome: 'Elettronica' },
    { nome: 'Componenti' },
    { nome: 'Imballaggio' },
    { nome: 'Utensili' },
];

const prodotti = [
    { sku: 'SKU-EL-001', nome: 'Router WiFi 6',          categoria: 'Elettronica', um: 'pz', peso: 0.45, scorta: 10, prezzo: 79.90 },
    { sku: 'SKU-EL-002', nome: 'Switch 8 porte',         categoria: 'Elettronica', um: 'pz', peso: 0.80, scorta: 5,  prezzo: 49.00 },
    { sku: 'SKU-CO-001', nome: 'Cavo HDMI 2m',           categoria: 'Componenti',  um: 'pz', peso: 0.15, scorta: 50, prezzo: 7.50 },
    { sku: 'SKU-CO-002', nome: 'Alimentatore 12V 5A',    categoria: 'Componenti',  um: 'pz', peso: 0.30, scorta: 20, prezzo: 14.90 },
    { sku: 'SKU-IM-001', nome: 'Scatola cartone M',      categoria: 'Imballaggio', um: 'pz', peso: 0.10, scorta: 100,prezzo: 0.80 },
    { sku: 'SKU-IM-002', nome: 'Pluriball 50m',          categoria: 'Imballaggio', um: 'rt', peso: 1.20, scorta: 15, prezzo: 9.90 },
    { sku: 'SKU-UT-001', nome: 'Cacciavite a stella',    categoria: 'Utensili',    um: 'pz', peso: 0.12, scorta: 30, prezzo: 4.50 },
    { sku: 'SKU-UT-002', nome: 'Set chiavi a brugola',   categoria: 'Utensili',    um: 'set',peso: 0.40, scorta: 12, prezzo: 11.00 },
];

const magazzini = [
    { codice: 'MAG-NORD', nome: 'Magazzino Nord',  citta: 'Milano',  provincia: 'MI', cap: '20100', paese: 'IT' },
    { codice: 'MAG-SUD',  nome: 'Magazzino Sud',   citta: 'Napoli',  provincia: 'NA', cap: '80100', paese: 'IT' },
];

const fornitori = [
    { ragione_sociale: 'TechSupply S.r.l.',  piva: '11111111111', email: 'ordini@techsupply.it', telefono: '021111111', lead_time: 5, indirizzo: 'Via Roma 1, Milano' },
    { ragione_sociale: 'Componenti Italia',  piva: '22222222222', email: 'info@compita.it',      telefono: '022222222', lead_time: 7, indirizzo: 'Via Po 10, Torino' },
    { ragione_sociale: 'Imballaggi Veloci',  piva: '33333333333', email: 'vendite@imbveloci.it', telefono: '023333333', lead_time: 3, indirizzo: 'Via Mare 5, Napoli' },
];

const clienti = [
    { ragione_sociale: 'Negozio Bianchi',   piva_cf: '44444444444', email: 'bianchi@negozio.it', telefono: '024444444' },
    { ragione_sociale: 'Distribuzione Rossi', piva_cf: '55555555555', email: 'rossi@distr.it',    telefono: '025555555' },
    { ragione_sociale: 'Ferramenta Verdi',  piva_cf: '66666666666', email: 'verdi@ferramenta.it',telefono: '026666666' },
];

const corrieri = [
    { codice: 'COR-BRT', nome: 'BRT Corriere',   telefono: '800111222', email: 'tracking@brt.it' },
    { codice: 'COR-GLS', nome: 'GLS Express',    telefono: '800333444', email: 'info@gls.it' },
];

const seedUtenti = async (client) => {
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
    for (const u of utentiPerRuolo) {
        await client.query(
            `INSERT INTO utenti (nome, cognome, email, password_hash, ruolo_id, attivo)
             VALUES ($1,$2,$3,$4,$5,true)
             ON CONFLICT (email) DO NOTHING`,
            [u.nome, u.cognome, u.email, hash, u.ruolo_id]
        );
    }
};

const seedCategorie = async (client) => {
    const map = {};
    for (const c of categorie) {
        const r = await client.query(
            `INSERT INTO categorie (nome) VALUES ($1)
             ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
             RETURNING id`,
            [c.nome]
        );
        map[c.nome] = r.rows[0].id;
    }
    return map;
};

const seedProdotti = async (client, catMap) => {
    const map = {};
    for (const p of prodotti) {
        const r = await client.query(
            `INSERT INTO prodotti (sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, attivo)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)
             ON CONFLICT (sku) DO UPDATE SET nome = EXCLUDED.nome
             RETURNING id`,
            [p.sku, p.nome, `${p.nome} - prodotto demo`, catMap[p.categoria], p.um, p.peso, p.scorta, p.prezzo]
        );
        map[p.sku] = r.rows[0].id;
    }
    return map;
};

const seedMagazzini = async (client) => {
    const map = {};
    for (const m of magazzini) {
        const r = await client.query(
            `INSERT INTO magazzini (codice, nome, citta, provincia, cap, paese, attivo)
             VALUES ($1,$2,$3,$4,$5,$6,true)
             ON CONFLICT (codice) DO UPDATE SET nome = EXCLUDED.nome
             RETURNING id`,
            [m.codice, m.nome, m.citta, m.provincia, m.cap, m.paese]
        );
        map[m.codice] = r.rows[0].id;
    }
    return map;
};

const seedUbicazioni = async (client, magMap) => {
    const lista = [];
    for (const codice of Object.keys(magMap)) {
        const magId = magMap[codice];
        for (let corsia = 1; corsia <= 2; corsia++) {
            for (let scaffale = 1; scaffale <= 3; scaffale++) {
                const codiceUb = `${codice}-C${corsia}-S${scaffale}`;
                const r = await client.query(
                    `INSERT INTO ubicazioni (magazzino_id, codice, corsia, scaffale, attivo)
                     VALUES ($1,$2,$3,$4,true)
                     ON CONFLICT (magazzino_id, corsia, scaffale) DO UPDATE SET codice = EXCLUDED.codice
                     RETURNING id`,
                    [magId, codiceUb, corsia, scaffale]
                );
                lista.push(r.rows[0].id);
            }
        }
    }
    return lista;
};

const seedGiacenzeEMovimenti = async (client, prodMap, ubicazioni) => {
    const skus = Object.keys(prodMap);
    let i = 0;
    for (const sku of skus) {
        const prodId = prodMap[sku];
        const ubId = ubicazioni[i % ubicazioni.length];
        const qty = 50 + (i * 10);
        i++;

        await client.query(
            `INSERT INTO giacenze (prodotto_id, ubicazione_id, quantita)
             VALUES ($1,$2,$3)
             ON CONFLICT (prodotto_id, ubicazione_id) DO UPDATE SET quantita = EXCLUDED.quantita`,
            [prodId, ubId, qty]
        );

        const giaPresente = await client.query(
            `SELECT 1 FROM movimenti_stock
             WHERE prodotto_id = $1 AND ubicazione_id = $2 AND riferimento = $3 LIMIT 1`,
            [prodId, ubId, 'SEED-DEMO']
        );
        if (giaPresente.rowCount === 0) {
            await client.query(
                `INSERT INTO movimenti_stock (prodotto_id, ubicazione_id, quantita, tipo, riferimento, note)
                 VALUES ($1,$2,$3,'CARICO_ACQUISTO','SEED-DEMO','Carico iniziale demo')`,
                [prodId, ubId, qty]
            );
        }
    }
};

const seedFornitori = async (client) => {
    for (const f of fornitori) {
        await client.query(
            `INSERT INTO fornitori (ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni, source, attivo)
             VALUES ($1,$2,$3,$4,$5,$6,'manual',true)
             ON CONFLICT (piva) DO NOTHING`,
            [f.ragione_sociale, f.piva, f.indirizzo, f.email, f.telefono, f.lead_time]
        );
    }
};

const seedClienti = async (client) => {
    for (const c of clienti) {
        const r = await client.query(
            `INSERT INTO clienti (ragione_sociale, piva_cf, email, telefono, source, attivo)
             VALUES ($1,$2,$3,$4,'manual',true)
             ON CONFLICT (piva_cf) DO NOTHING
             RETURNING id`,
            [c.ragione_sociale, c.piva_cf, c.email, c.telefono]
        );
        if (r.rowCount > 0) {
            await client.query(
                `INSERT INTO destinazioni_clienti (cliente_id, etichetta, indirizzo, cap, citta, provincia, paese, predefinita)
                 VALUES ($1,'Sede principale','Via Cliente 1','20100','Milano','MI','IT',true)`,
                [r.rows[0].id]
            );
        }
    }
};

const seedCorrieri = async (client) => {
    for (const c of corrieri) {
        await client.query(
            `INSERT INTO corrieri (codice, nome, telefono, email, attivo)
             VALUES ($1,$2,$3,$4,true)
             ON CONFLICT (codice) DO NOTHING`,
            [c.codice, c.nome, c.telefono, c.email]
        );
    }
};

const run = async () => {
    const ambiente = await selezionaAmbiente();

    const pool = require('../src/config/db');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const ruoli = await client.query('SELECT COUNT(*) AS n FROM ruoli');
        if (Number(ruoli.rows[0].n) === 0) {
            throw new Error('Ruoli assenti - esegui prima: npm run seed_ruoli_permessi');
        }

        await seedUtenti(client);
        const catMap = await seedCategorie(client);
        const prodMap = await seedProdotti(client, catMap);
        const magMap = await seedMagazzini(client);
        const ubicazioni = await seedUbicazioni(client, magMap);
        await seedGiacenzeEMovimenti(client, prodMap, ubicazioni);
        await seedFornitori(client);
        await seedClienti(client);
        await seedCorrieri(client);

        await client.query('COMMIT');

        console.log(`\n✅ seed_demo completato su DB: ${process.env.DB_NAME} (${ambiente})`);
        console.log(`   Utenti (1/ruolo): ${utentiPerRuolo.length}  | password: ${DEFAULT_PASSWORD}`);
        console.log(`   Categorie: ${categorie.length} | Prodotti: ${prodotti.length}`);
        console.log(`   Magazzini: ${magazzini.length} | Ubicazioni: ${ubicazioni.length}`);
        console.log(`   Fornitori: ${fornitori.length} | Clienti: ${clienti.length} | Corrieri: ${corrieri.length}`);
        console.log('\n   Credenziali utenti:');
        for (const u of utentiPerRuolo) {
            console.log(`   ruolo ${String(u.ruolo_id).padStart(2)}  ${u.email}`);
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Errore seed_demo:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
};

if (require.main === module) {
    run();
}

module.exports = { run };
