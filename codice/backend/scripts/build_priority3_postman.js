const fs = require('fs');
const path = require('path');

const outDir = path.resolve(process.cwd(), 'postman');
fs.mkdirSync(outDir, { recursive: true });

const headerJson = [{ key: 'Content-Type', value: 'application/json' }];
const authHeader = (tokenVar = 'token_admin') => [
    { key: 'Content-Type', value: 'application/json' },
    { key: 'Authorization', value: `Bearer {{${tokenVar}}}` }
];

const rawBody = (value) => ({
    mode: 'raw',
    raw: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
    options: { raw: { language: 'json' } }
});

const url = (raw) => raw.startsWith('http') ? raw : `{{base_url}}${raw}`;
const script = (lines) => ({ listen: 'test', script: { type: 'text/javascript', exec: Array.isArray(lines) ? lines : String(lines).split('\n') } });
const prereq = (lines) => ({ listen: 'prerequest', script: { type: 'text/javascript', exec: Array.isArray(lines) ? lines : String(lines).split('\n') } });
const statusTest = (code) => [`pm.test('HTTP ${code}', () => pm.response.to.have.status(${code}));`];
const save = (varName, expr) => [`const json = pm.response.json();`, `pm.collectionVariables.set('${varName}', ${expr});`];

const item = ({ name, method = 'GET', path, token = 'token_admin', body, tests = [], pre = [], headers }) => {
    const req = {
        method,
        header: headers || (token ? authHeader(token) : headerJson),
        url: { raw: url(path), host: [url(path)] }
    };
    if (body !== undefined) req.body = rawBody(body);
    const events = [];
    if (pre.length) events.push(prereq(pre));
    if (tests.length) events.push(script(tests));
    return { name, request: req, event: events };
};

const loginItem = (name, emailVar, passVar, tokenVar) => item({
    name,
    method: 'POST',
    path: '/api/v1/auth/login',
    token: null,
    body: { email: `{{${emailVar}}}`, password: `{{${passVar}}}` },
    tests: [
        ...statusTest(200),
        ...save(tokenVar, 'json.data.token'),
        `pm.test('token presente', () => pm.expect(pm.collectionVariables.get('${tokenVar}')).to.be.ok);`
    ]
});

const variables = [
    ['base_url', 'http://localhost:3000'],
    ['admin_email', 'admin@logichain.it'],
    ['admin_password', 'Admin123!'],
    ['test_password', 'Test123!'],
    ['operatore_email', 'operatore@test.local'],
    ['token_admin', ''],
    ['token_operatore', ''],
    ['suffix', ''],
    ['utente_id', ''], ['dipendente_id', ''], ['ruolo_operatore_id', ''],
    ['prodotto_id', ''], ['prodotto_acquisto_id', ''], ['fornitore_id', ''],
    ['magazzino_id', ''], ['ubicazione_id', ''], ['ubicazione_2_id', ''],
    ['movimento_id', ''], ['ordine_acquisto_id', ''], ['ricezione_id', ''],
    ['cliente_id', ''], ['destinazione_id', ''], ['ordine_vendita_id', ''], ['riga_ordine_id', ''],
    ['spedizione_id', ''], ['richiesta_acquisto_id', '']
].map(([key, value]) => ({ key, value, type: 'string' }));

const e2e = {
    info: {
        name: 'LogiChain V2 — Priority 3 E2E Smoke Tests',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        description: 'Collection end-to-end per certificare migration, seed, RBAC, acquisti/ricezioni, vendita/picking, spedizione/DDT, richieste acquisto e PDF.'
    },
    variable: variables,
    item: [
        {
            name: '00 - Bootstrap & Auth',
            item: [
                item({
                    name: '00.01 Set suffix runtime',
                    path: '/',
                    token: null,
                    pre: [`pm.collectionVariables.set('suffix', Date.now().toString());`],
                    tests: [...statusTest(200)]
                }),
                loginItem('00.02 Login Admin', 'admin_email', 'admin_password', 'token_admin'),
                loginItem('00.03 Login Operatore', 'operatore_email', 'test_password', 'token_operatore'),
            ]
        },
        {
            name: '01 - M01 Admin Utenti & RBAC',
            item: [
                item({ name: '01.01 GET utenti admin 200', path: '/api/v1/utenti', tests: [...statusTest(200)] }),
                item({ name: '01.02 GET utenti operatore 403', path: '/api/v1/utenti', token: 'token_operatore', tests: [...statusTest(403)] }),
                item({
                    name: '01.03 GET ruoli e salva Operatore', path: '/api/v1/utenti/ruoli', tests: [
                        ...statusTest(200),
                        `const json = pm.response.json();`,
                        `const ruolo = json.data.find(r => r.nome === 'Operatore');`,
                        `pm.expect(ruolo, 'ruolo Operatore').to.be.ok;`,
                        `pm.collectionVariables.set('ruolo_operatore_id', ruolo.id);`
                    ]
                }),
                item({
                    name: '01.04 Crea dipendente per associazione account', method: 'POST', path: '/api/v1/dipendenti',
                    body: {
                        nome: 'Mario', cognome: 'Postman', codice_fiscale: 'PM{{$timestamp}}', ruolo_operativo: 'Operatore', data_assunzione: '2026-01-01'
                    },
                    tests: [...statusTest(201), ...save('dipendente_id', 'json.data.id')]
                }),
                item({
                    name: '01.05 Register utente test', method: 'POST', path: '/api/v1/auth/register',
                    body: { nome: 'Utente', cognome: 'Postman', email: 'utente.{{suffix}}@test.local', password: 'Temp123!', ruolo_id: '{{ruolo_operatore_id}}' },
                    tests: [...statusTest(201), ...save('utente_id', 'json.data.id')]
                }),
                item({
                    name: '01.06 Associa dipendente ad account', method: 'PATCH', path: '/api/v1/utenti/{{utente_id}}',
                    body: { dipendente_id: '{{dipendente_id}}', attivo: true },
                    tests: [...statusTest(200)]
                }),
                item({
                    name: '01.07 Reset password account', method: 'PATCH', path: '/api/v1/utenti/{{utente_id}}/password',
                    body: { password_nuova: 'NewPass123!' }, tests: [...statusTest(204)]
                }),
            ]
        },
        {
            name: '02 - M02 SKU soft delete',
            item: [
                item({
                    name: '02.01 Crea prodotto SKU unico', method: 'POST', path: '/api/v1/prodotti',
                    body: { nome: 'Prodotto SKU {{suffix}}', sku: 'SKU-PM-{{suffix}}', prezzo: 10, unita_misura: 'pz', scorta_minima: 1 },
                    tests: [...statusTest(201), ...save('prodotto_id', 'json.data.id')]
                }),
                item({ name: '02.02 Soft delete prodotto', method: 'DELETE', path: '/api/v1/prodotti/{{prodotto_id}}', tests: [...statusTest(204)] }),
                item({
                    name: '02.03 SKU duplicato resta bloccato', method: 'POST', path: '/api/v1/prodotti',
                    body: { nome: 'Duplicato', sku: 'SKU-PM-{{suffix}}', prezzo: 10 }, tests: [...statusTest(409)]
                }),
            ]
        },
        {
            name: '03 - M06/M07 Magazzino e movimenti',
            item: [
                item({
                    name: '03.01 Crea prodotto stock', method: 'POST', path: '/api/v1/prodotti',
                    body: { nome: 'Prodotto stock {{suffix}}', sku: 'SKU-STOCK-{{suffix}}', prezzo: 10, unita_misura: 'pz', scorta_minima: 2 },
                    tests: [...statusTest(201), ...save('prodotto_id', 'json.data.id')]
                }),
                item({
                    name: '03.02 Crea magazzino', method: 'POST', path: '/api/v1/magazzini',
                    body: { codice: 'MAG-PM-{{suffix}}', nome: 'Magazzino Postman', indirizzo: 'Via Test 1', cap: '70100', citta: 'Bari', provincia: 'BA', paese: 'Italia' },
                    tests: [...statusTest(201), ...save('magazzino_id', 'json.data.id')]
                }),
                item({ name: '03.03 Crea ubicazione A', method: 'POST', path: '/api/v1/magazzini/{{magazzino_id}}/ubicazioni', body: { corsia: 1, scaffale: 1 }, tests: [...statusTest(201), ...save('ubicazione_id', 'json.data.id')] }),
                item({ name: '03.04 Crea ubicazione B', method: 'POST', path: '/api/v1/magazzini/{{magazzino_id}}/ubicazioni', body: { corsia: 1, scaffale: 2 }, tests: [...statusTest(201), ...save('ubicazione_2_id', 'json.data.id')] }),
                item({
                    name: '03.05 Rettifica positiva stock', method: 'POST', path: '/api/v1/movimenti-stock',
                    body: { prodotto_id: '{{prodotto_id}}', ubicazione_id: '{{ubicazione_id}}', quantita: 10, movimento_tipo: 'RETTIFICA_POSITIVA', riferimento: 'postman:{{suffix}}', note: 'Carico test Postman' },
                    tests: [...statusTest(201), ...save('movimento_id', 'json.data.id')]
                }),
                item({
                    name: '03.06 Spostamento stock dual record', method: 'POST', path: '/api/v1/movimenti-stock',
                    body: { prodotto_id: '{{prodotto_id}}', ubicazione_da_id: '{{ubicazione_id}}', ubicazione_a_id: '{{ubicazione_2_id}}', quantita: 4, movimento_tipo: 'SPOSTAMENTO', riferimento: 'postman-spostamento:{{suffix}}', note: 'Spostamento Postman' },
                    tests: [...statusTest(201), `const json = pm.response.json(); pm.expect(json.data.scarico).to.be.ok; pm.expect(json.data.carico).to.be.ok;`]
                }),
                item({ name: '03.07 PDF movimento', path: '/api/v1/movimenti-stock/{{movimento_id}}/pdf', tests: [...statusTest(200), `pm.test('PDF', () => pm.expect(pm.response.headers.get('Content-Type')).to.include('application/pdf'));`] }),
            ]
        },
        {
            name: '04 - M08 Acquisto e ricezione',
            item: [
                item({ name: '04.01 Crea fornitore', method: 'POST', path: '/api/v1/fornitori', body: { ragione_sociale: 'Fornitore PO {{suffix}}', piva: 'PIVA-PO-{{suffix}}', email: 'po.{{suffix}}@test.local' }, tests: [...statusTest(201), ...save('fornitore_id', 'json.data.id')] }),
                item({ name: '04.02 Crea prodotto acquisto', method: 'POST', path: '/api/v1/prodotti', body: { nome: 'Prodotto PO {{suffix}}', sku: 'SKU-PO-{{suffix}}', prezzo: 8, unita_misura: 'pz' }, tests: [...statusTest(201), ...save('prodotto_acquisto_id', 'json.data.id')] }),
                item({ name: '04.03 Crea ordine acquisto', method: 'POST', path: '/api/v1/ordini-acquisto', body: { fornitore_id: '{{fornitore_id}}', data_prevista: '2099-12-31', note: 'PO Postman', righe: [{ prodotto_id: '{{prodotto_acquisto_id}}', quantita_ordinata: 5, prezzo_unitario: 8 }] }, tests: [...statusTest(201), ...save('ordine_acquisto_id', 'json.data.id')] }),
                item({ name: '04.04 Stato INVIATO', method: 'PATCH', path: '/api/v1/ordini-acquisto/{{ordine_acquisto_id}}/stato', body: { stato: 'INVIATO' }, tests: [...statusTest(200)] }),
                item({ name: '04.05 Stato CONFERMATO', method: 'PATCH', path: '/api/v1/ordini-acquisto/{{ordine_acquisto_id}}/stato', body: { stato: 'CONFERMATO' }, tests: [...statusTest(200)] }),
                item({ name: '04.06 Ricezione e carico giacenza', method: 'POST', path: '/api/v1/ordini-acquisto/ricezioni', body: { ordine_acquisto_id: '{{ordine_acquisto_id}}', data_ricezione: '2099-12-31', note: 'Ricezione Postman', righe: [{ prodotto_id: '{{prodotto_acquisto_id}}', quantita_ricevuta: 5, ubicazione_id: '{{ubicazione_id}}' }] }, tests: [...statusTest(201), ...save('ricezione_id', 'json.data.id')] }),
                item({ name: '04.07 PDF ordine acquisto', path: '/api/v1/ordini-acquisto/{{ordine_acquisto_id}}/pdf', tests: [...statusTest(200)] }),
                item({ name: '04.08 PDF ricezione', path: '/api/v1/ricezioni/{{ricezione_id}}/pdf', tests: [...statusTest(200)] }),
            ]
        },
        {
            name: '05 - M09/M10 Vendita, picking, spedizione, DDT',
            item: [
                item({ name: '05.01 Crea cliente', method: 'POST', path: '/api/v1/clienti', body: { ragione_sociale: 'Cliente {{suffix}}', piva_cf: 'CF-{{suffix}}', email: 'cliente.{{suffix}}@test.local' }, tests: [...statusTest(201), ...save('cliente_id', 'json.data.id')] }),
                item({ name: '05.02 Crea destinazione', method: 'POST', path: '/api/v1/clienti/{{cliente_id}}/destinazioni', body: { etichetta: 'Sede', indirizzo: 'Via Test 1', cap: '70100', citta: 'Bari', provincia: 'BA', paese: 'Italia', predefinita: true }, tests: [...statusTest(201), ...save('destinazione_id', 'json.data.id')] }),
                item({ name: '05.03 Crea ordine vendita', method: 'POST', path: '/api/v1/ordini', body: { cliente_id: '{{cliente_id}}', destinazione_id: '{{destinazione_id}}', data_consegna_richiesta: '2099-12-31', righe: [{ prodotto_id: '{{prodotto_acquisto_id}}', quantita: 2 }] }, tests: [...statusTest(201), ...save('ordine_vendita_id', 'json.data.ordine.id')] }),
                item({ name: '05.04 Spedizione prima del picking deve fallire', method: 'POST', path: '/api/v1/spedizioni', body: { ordine_id: '{{ordine_vendita_id}}', cliente_id: '{{cliente_id}}', destinazione_id: '{{destinazione_id}}' }, tests: [...statusTest(409)] }),
                item({ name: '05.05 Conferma ordine vendita', method: 'PATCH', path: '/api/v1/ordini/{{ordine_vendita_id}}/stato', body: { stato: 'CONFERMATO' }, tests: [...statusTest(200)] }),
                item({ name: '05.06 Avvia picking con Operatore', method: 'PATCH', path: '/api/v1/ordini/{{ordine_vendita_id}}/picking', token: 'token_operatore', body: { stato_picking: 'IN_PICKING' }, tests: [...statusTest(200)] }),
                item({ name: '05.07 Leggi riga ordine', path: '/api/v1/ordini/{{ordine_vendita_id}}', tests: [...statusTest(200), `const json = pm.response.json(); pm.collectionVariables.set('riga_ordine_id', json.data.righe[0].id);`] }),
                item({ name: '05.08 Completa picking con scarico', method: 'PATCH', path: '/api/v1/ordini/{{ordine_vendita_id}}/picking', token: 'token_operatore', body: { stato_picking: 'PICKING_COMPLETATO', prelievi: [{ riga_id: '{{riga_ordine_id}}', ubicazioni: [{ ubicazione_id: '{{ubicazione_id}}', quantita: 2 }] }] }, tests: [...statusTest(200)] }),
                item({ name: '05.09 PDF ordine vendita', path: '/api/v1/ordini/{{ordine_vendita_id}}/pdf', tests: [...statusTest(200)] }),
                item({ name: '05.10 Crea spedizione', method: 'POST', path: '/api/v1/spedizioni', body: { ordine_id: '{{ordine_vendita_id}}', cliente_id: '{{cliente_id}}', destinazione_id: '{{destinazione_id}}', tracking_number: 'TRK-{{suffix}}' }, tests: [...statusTest(201), ...save('spedizione_id', 'json.data.id')] }),
                item({ name: '05.11 Stato spedita', method: 'PATCH', path: '/api/v1/spedizioni/{{spedizione_id}}/stato', body: { stato: 'SPEDITA' }, tests: [...statusTest(200)] }),
                item({ name: '05.12 Crea DDT', method: 'POST', path: '/api/v1/spedizioni/{{spedizione_id}}/ddt', body: { numero_ddt: 'DDT-{{suffix}}', data_ddt: '2099-12-31', trasportatore: 'Corriere Test', note: 'DDT Postman' }, tests: [...statusTest(201)] }),
                item({ name: '05.13 PDF DDT', path: '/api/v1/spedizioni/{{spedizione_id}}/ddt/pdf', tests: [...statusTest(200)] }),
                item({ name: '05.14 Doppia spedizione bloccata', method: 'POST', path: '/api/v1/spedizioni', body: { ordine_id: '{{ordine_vendita_id}}', cliente_id: '{{cliente_id}}', destinazione_id: '{{destinazione_id}}' }, tests: [...statusTest(409)] }),
            ]
        },
        {
            name: '06 - M16 Richieste acquisto & M11 notifiche',
            item: [
                item({ name: '06.01 Crea richiesta acquisto con righe', method: 'POST', path: '/api/v1/richieste-acquisto', body: { fornitore_id: '{{fornitore_id}}', note: 'Richiesta Postman', righe: [{ prodotto_id: '{{prodotto_acquisto_id}}', quantita_richiesta: 3 }] }, tests: [...statusTest(201), ...save('richiesta_acquisto_id', 'json.data.id')] }),
                item({ name: '06.02 Stato INVIATA', method: 'PATCH', path: '/api/v1/richieste-acquisto/{{richiesta_acquisto_id}}/stato', body: { stato: 'INVIATA' }, tests: [...statusTest(200)] }),
                item({ name: '06.03 Stato IN_VALUTAZIONE', method: 'PATCH', path: '/api/v1/richieste-acquisto/{{richiesta_acquisto_id}}/stato', body: { stato: 'IN_VALUTAZIONE' }, tests: [...statusTest(200)] }),
                item({ name: '06.04 Stato ACCETTATA genera notifica', method: 'PATCH', path: '/api/v1/richieste-acquisto/{{richiesta_acquisto_id}}/stato', body: { stato: 'ACCETTATA' }, tests: [...statusTest(200)] }),
                item({ name: '06.05 Transizione finale non valida', method: 'PATCH', path: '/api/v1/richieste-acquisto/{{richiesta_acquisto_id}}/stato', body: { stato: 'RIFIUTATA' }, tests: [...statusTest(409)] }),
                item({ name: '06.06 Lista notifiche contiene richiesta accettata', path: '/api/v1/notifiche', tests: [...statusTest(200), `const json = pm.response.json(); pm.test('notifica richiesta accettata', () => pm.expect(json.data.some(n => n.tipo === 'RICHIESTA_ACCETTATA' && String(n.riferimento_id) === String(pm.collectionVariables.get('richiesta_acquisto_id')))).to.eql(true));`] }),
            ]
        }
    ]
};

const env = {
    id: 'logichain-priority3-local-env',
    name: 'LogiChain Local Priority 3',
    values: [
        { key: 'base_url', value: 'http://localhost:3000', enabled: true },
        { key: 'admin_email', value: 'admin@logichain.it', enabled: true },
        { key: 'admin_password', value: 'Admin123!', enabled: true },
        { key: 'test_password', value: 'Test123!', enabled: true },
        { key: 'operatore_email', value: 'operatore@test.local', enabled: true },
    ],
    _postman_variable_scope: 'environment',
    _postman_exported_using: 'LogiChain Priority 3 generator'
};

fs.writeFileSync(path.join(outDir, 'LogiChain_M00_Priority3_E2E_Smoke.postman_collection.json'), JSON.stringify(e2e, null, 2));
fs.writeFileSync(path.join(outDir, 'LogiChain_ENV_Local_Priority3.postman_environment.json'), JSON.stringify(env, null, 2));

const adminUtenti = {
    info: {
        name: 'LogiChain V2 — M01 Admin Gestione Utenti',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        description: 'Estensione M01 per GET /utenti, gestione ruoli, reset password, associazione dipendente-account.'
    },
    variable: variables,
    item: e2e.item[0].item.concat(e2e.item[1].item)
};
fs.writeFileSync(path.join(outDir, 'LogiChain_M01_Admin_Gestione_Utenti.postman_collection.json'), JSON.stringify(adminUtenti, null, 2));

const m10 = {
    info: { name: 'LogiChain V2 — M10 Spedizioni & DDT', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
    variable: variables,
    item: [e2e.item[0], e2e.item[5]]
};
fs.writeFileSync(path.join(outDir, 'LogiChain_M10_Spedizioni_DDT.postman_collection.json'), JSON.stringify(m10, null, 2));

const m16 = {
    info: { name: 'LogiChain V2 — M16 Richieste Acquisto', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
    variable: variables,
    item: [e2e.item[0], e2e.item[3], e2e.item[6]]
};
fs.writeFileSync(path.join(outDir, 'LogiChain_M16_Richieste_Acquisto.postman_collection.json'), JSON.stringify(m16, null, 2));

fs.writeFileSync(path.join(outDir, 'README_POSTMAN_PRIORITY3.md'), `# LogiChain Priority 3 - Postman\n\n## Uso consigliato\n\n1. Importa \`LogiChain_ENV_Local_Priority3.postman_environment.json\`.\n2. Avvia il backend su \`http://localhost:3000\`.\n3. Esegui prima i test automatici Jest per creare/reset DB e seed utenti test.\n4. In Postman esegui \`LogiChain_M00_Priority3_E2E_Smoke.postman_collection.json\` con Runner.\n\nUtenti test seedati da Jest/script:\n\n- admin@logichain.it / Admin123!\n- operatore@test.local / Test123!\n- supporto@test.local / Test123!\n- resp.acquisti@test.local / Test123!\n- resp.vendite@test.local / Test123!\n- resp.magazzino@test.local / Test123!\n\nLe collection M01, M10 e M16 sono estratti focalizzati del flusso Priority 3.\n`);

console.log(`✅ Postman Priority 3 generato in ${outDir}`);
