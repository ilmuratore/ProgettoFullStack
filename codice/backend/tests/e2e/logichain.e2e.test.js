const request = require('supertest');
const app = require('../../server');
const pool = require('../../src/config/db');

const api = request(app);
const suffix = Date.now();

const state = {
    tokens: {},
    ids: {},
};

const credentials = {
    admin: { email: process.env.ADMIN_EMAIL || 'admin@logichain.it', password: process.env.ADMIN_PASSWORD || 'Admin123!' },
    operatore: { email: 'operatore@test.local', password: 'Test123!' },
    supporto: { email: 'supporto@test.local', password: 'Test123!' },
    acquisti: { email: 'resp.acquisti@test.local', password: 'Test123!' },
    vendite: { email: 'resp.vendite@test.local', password: 'Test123!' },
    magazzino: { email: 'resp.magazzino@test.local', password: 'Test123!' },
};

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

const login = async ({ email, password }) => {
    const res = await api
        .post('/api/v1/auth/login')
        .send({ email, password })
        .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.data.token).toEqual(expect.any(String));
    return res.body.data.token;
};

const expectPdf = (res) => {
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(Number(res.headers['content-length'] || 0)).toBeGreaterThan(100);
};

const createProdotto = async (token, overrides = {}) => {
    const payload = {
        nome: `Prodotto E2E ${suffix}`,
        sku: `E2E-SKU-${suffix}-${Math.floor(Math.random() * 100000)}`,
        descrizione: 'Prodotto creato dai test e2e',
        prezzo: 12.5,
        unita_misura: 'pz',
        peso_kg: 1,
        scorta_minima: 1,
        ...overrides,
    };

    const res = await api
        .post('/api/v1/prodotti')
        .set(bearer(token))
        .send(payload)
        .expect(201);

    expect(res.body.status).toBe('success');
    return res.body.data;
};

const createFornitore = async (token, overrides = {}) => {
    const payload = {
        ragione_sociale: `Fornitore E2E ${suffix}`,
        piva: `PIVA-E2E-${suffix}-${Math.floor(Math.random() * 100000)}`,
        email: `fornitore.${suffix}@test.local`,
        telefono: '0800000000',
        ...overrides,
    };

    const res = await api
        .post('/api/v1/fornitori')
        .set(bearer(token))
        .send(payload)
        .expect(201);

    expect(res.body.status).toBe('success');
    return res.body.data;
};

const createClienteConDestinazione = async (token) => {
    const clienteRes = await api
        .post('/api/v1/clienti')
        .set(bearer(token))
        .send({
            ragione_sociale: `Cliente E2E ${suffix}`,
            piva_cf: `CF-E2E-${suffix}`,
            email: `cliente.${suffix}@test.local`,
            telefono: '0800000001',
        })
        .expect(201);

    const cliente = clienteRes.body.data;

    const destRes = await api
        .post(`/api/v1/clienti/${cliente.id}/destinazioni`)
        .set(bearer(token))
        .send({
            etichetta: 'Sede principale',
            indirizzo: 'Via Test 1',
            cap: '70100',
            citta: 'Bari',
            provincia: 'BA',
            paese: 'Italia',
            predefinita: true,
        })
        .expect(201);

    return { cliente, destinazione: destRes.body.data };
};

const createMagazzinoConUbicazioni = async (token) => {
    const magRes = await api
        .post('/api/v1/magazzini')
        .set(bearer(token))
        .send({
            codice: `MAG-E2E-${suffix}-${Math.floor(Math.random() * 100000)}`,
            nome: `Magazzino E2E ${suffix}`,
            indirizzo: 'Via Magazzino 1',
            cap: '70100',
            citta: 'Bari',
            provincia: 'BA',
            paese: 'Italia',
        })
        .expect(201);

    const magazzino = magRes.body.data;

    const ubicazione1Res = await api
        .post(`/api/v1/magazzini/${magazzino.id}/ubicazioni`)
        .set(bearer(token))
        .send({ corsia: 1, scaffale: 1, temperatura_controllata: false })
        .expect(201);

    const ubicazione2Res = await api
        .post(`/api/v1/magazzini/${magazzino.id}/ubicazioni`)
        .set(bearer(token))
        .send({ corsia: 1, scaffale: 2, temperatura_controllata: false })
        .expect(201);

    return {
        magazzino,
        ubicazione1: ubicazione1Res.body.data,
        ubicazione2: ubicazione2Res.body.data,
    };
};

describe('LogiChain backend E2E priority 3', () => {
    afterAll(async () => {
        await pool.end();
    });

    test('smoke: root e login admin/test users funzionano', async () => {
        const root = await api.get('/').expect(200);
        expect(root.body.status).toBe('success');

        state.tokens.admin = await login(credentials.admin);
        state.tokens.operatore = await login(credentials.operatore);
        state.tokens.supporto = await login(credentials.supporto);
        state.tokens.acquisti = await login(credentials.acquisti);
        state.tokens.vendite = await login(credentials.vendite);
        state.tokens.magazzino = await login(credentials.magazzino);
    });

    test('M01: admin gestisce utenti, ruoli, reset password e RBAC blocca operatore', async () => {
        const adminToken = state.tokens.admin;
        const operatoreToken = state.tokens.operatore;

        const utentiRes = await api
            .get('/api/v1/utenti')
            .set(bearer(adminToken))
            .expect(200);
        expect(Array.isArray(utentiRes.body.data)).toBe(true);
        expect(utentiRes.body.data.some((u) => u.email === credentials.admin.email)).toBe(true);

        await api
            .get('/api/v1/utenti')
            .set(bearer(operatoreToken))
            .expect(403);

        const ruoliRes = await api
            .get('/api/v1/utenti/ruoli')
            .set(bearer(adminToken))
            .expect(200);
        const ruoloOperatore = ruoliRes.body.data.find((r) => r.nome === 'Operatore');
        expect(ruoloOperatore).toBeTruthy();

        const dipendenteRes = await api
            .post('/api/v1/dipendenti')
            .set(bearer(adminToken))
            .send({
                nome: 'Mario',
                cognome: 'UtenteTest',
                codice_fiscale: `CFUTENTE${suffix}`.slice(0, 16),
                ruolo_operativo: 'Operatore test',
                data_assunzione: '2026-01-01',
            })
            .expect(201);

        const newEmail = `utente.priority3.${suffix}@test.local`;
        const registerRes = await api
            .post('/api/v1/auth/register')
            .set(bearer(adminToken))
            .send({
                nome: 'Utente',
                cognome: 'Priority3',
                email: newEmail,
                password: 'Temp123!',
                ruolo_id: ruoloOperatore.id,
            })
            .expect(201);

        const userId = registerRes.body.data.id;
        state.ids.testUser = userId;

        const updateRes = await api
            .patch(`/api/v1/utenti/${userId}`)
            .set(bearer(adminToken))
            .send({ dipendente_id: dipendenteRes.body.data.id, attivo: true })
            .expect(200);
        expect(updateRes.body.data.dipendente.id).toBe(dipendenteRes.body.data.id);

        await api
            .patch(`/api/v1/utenti/${userId}/password`)
            .set(bearer(adminToken))
            .send({ password_nuova: 'NewPass123!' })
            .expect(204);

        const token = await login({ email: newEmail, password: 'NewPass123!' });
        expect(token).toEqual(expect.any(String));
    });

    test('M02: SKU resta univoco anche se il prodotto e disattivato', async () => {
        const adminToken = state.tokens.admin;
        const sku = `SKU-UNIQUE-${suffix}`;
        const prodotto = await createProdotto(adminToken, { sku, nome: `SKU unico ${suffix}` });

        await api
            .delete(`/api/v1/prodotti/${prodotto.id}`)
            .set(bearer(adminToken))
            .expect(204);

        const duplicateRes = await api
            .post('/api/v1/prodotti')
            .set(bearer(adminToken))
            .send({ nome: 'Duplicato', sku, prezzo: 10 })
            .expect(409);

        expect(duplicateRes.body.code).toBe('DUPLICATE_ENTRY');
    });

    test('M06/M07: magazzino, ubicazioni, giacenze, spostamento e PDF movimento', async () => {
        const adminToken = state.tokens.admin;
        const prodotto = await createProdotto(adminToken, { scorta_minima: 2 });
        const { ubicazione1, ubicazione2 } = await createMagazzinoConUbicazioni(adminToken);

        const caricoRes = await api
            .post('/api/v1/movimenti-stock')
            .set(bearer(adminToken))
            .send({
                prodotto_id: prodotto.id,
                ubicazione_id: ubicazione1.id,
                quantita: 10,
                movimento_tipo: 'RETTIFICA_POSITIVA',
                riferimento: `test:${suffix}`,
                note: 'Carico tecnico test e2e',
            })
            .expect(201);

        state.ids.prodotto = prodotto.id;
        state.ids.ubicazione1 = ubicazione1.id;
        state.ids.ubicazione2 = ubicazione2.id;
        state.ids.movimento = caricoRes.body.data.id;

        const giacenzeRes = await api
            .get(`/api/v1/giacenze/${prodotto.id}`)
            .set(bearer(adminToken))
            .expect(200);
        expect(giacenzeRes.body.data.reduce((sum, g) => sum + Number(g.quantita), 0)).toBe(10);

        const spostamentoRes = await api
            .post('/api/v1/movimenti-stock')
            .set(bearer(adminToken))
            .send({
                prodotto_id: prodotto.id,
                ubicazione_da_id: ubicazione1.id,
                ubicazione_a_id: ubicazione2.id,
                quantita: 4,
                movimento_tipo: 'SPOSTAMENTO',
                riferimento: `test-spostamento:${suffix}`,
                note: 'Spostamento test e2e',
            })
            .expect(201);
        expect(spostamentoRes.body.data.scarico).toBeTruthy();
        expect(spostamentoRes.body.data.carico).toBeTruthy();

        const pdfRes = await api
            .get(`/api/v1/movimenti-stock/${state.ids.movimento}/pdf`)
            .set(bearer(adminToken));
        expectPdf(pdfRes);
    });

    test('M08: acquisto, conferma, ricezione e PDF ordine/ricezione', async () => {
        const adminToken = state.tokens.admin;
        const prodotto = await createProdotto(adminToken, { sku: `SKU-PO-${suffix}`, nome: `Prodotto PO ${suffix}` });
        const fornitore = await createFornitore(adminToken, { piva: `PIVA-PO-${suffix}` });
        const { ubicazione1 } = await createMagazzinoConUbicazioni(adminToken);

        const poRes = await api
            .post('/api/v1/ordini-acquisto')
            .set(bearer(adminToken))
            .send({
                fornitore_id: fornitore.id,
                data_prevista: '2099-12-31',
                note: 'PO test e2e',
                righe: [{ prodotto_id: prodotto.id, quantita_ordinata: 5, prezzo_unitario: 8 }],
            })
            .expect(201);

        const poId = poRes.body.data.id;
        state.ids.po = poId;

        await api.patch(`/api/v1/ordini-acquisto/${poId}/stato`).set(bearer(adminToken)).send({ stato: 'INVIATO' }).expect(200);
        await api.patch(`/api/v1/ordini-acquisto/${poId}/stato`).set(bearer(adminToken)).send({ stato: 'CONFERMATO' }).expect(200);

        const ricezioneRes = await api
            .post('/api/v1/ordini-acquisto/ricezioni')
            .set(bearer(adminToken))
            .send({
                ordine_acquisto_id: poId,
                data_ricezione: '2099-12-31',
                note: 'Ricezione test e2e',
                righe: [{ prodotto_id: prodotto.id, quantita_ricevuta: 5, ubicazione_id: ubicazione1.id }],
            })
            .expect(201);

        state.ids.ricezione = ricezioneRes.body.data.id;
        state.ids.prodottoAcquisto = prodotto.id;
        state.ids.ubicazioneAcquisto = ubicazione1.id;

        const pdfPoRes = await api.get(`/api/v1/ordini-acquisto/${poId}/pdf`).set(bearer(adminToken));
        expectPdf(pdfPoRes);

        const pdfRicezioneRes = await api.get(`/api/v1/ricezioni/${state.ids.ricezione}/pdf`).set(bearer(adminToken));
        expectPdf(pdfRicezioneRes);
    });

    test('M09/M10: vendita, disponibilita, picking operativo, spedizione, DDT e PDF', async () => {
        const adminToken = state.tokens.admin;
        const prodotto = state.ids.prodottoAcquisto;
        const ubicazione = state.ids.ubicazioneAcquisto;
        const { cliente, destinazione } = await createClienteConDestinazione(adminToken);

        const ordineRes = await api
            .post('/api/v1/ordini')
            .set(bearer(adminToken))
            .send({
                cliente_id: cliente.id,
                destinazione_id: destinazione.id,
                data_consegna_richiesta: '2099-12-31',
                righe: [{ prodotto_id: prodotto, quantita: 2 }],
            })
            .expect(201);

        const ordineId = ordineRes.body.data.ordine.id;
        state.ids.ordineVendita = ordineId;

        await api
            .post('/api/v1/spedizioni')
            .set(bearer(adminToken))
            .send({ ordine_id: ordineId, cliente_id: cliente.id, destinazione_id: destinazione.id })
            .expect(409);

        await api.patch(`/api/v1/ordini/${ordineId}/stato`).set(bearer(adminToken)).send({ stato: 'CONFERMATO' }).expect(200);
        await api.patch(`/api/v1/ordini/${ordineId}/picking`).set(bearer(state.tokens.operatore)).send({ stato_picking: 'IN_PICKING' }).expect(200);

        const dettaglioRes = await api.get(`/api/v1/ordini/${ordineId}`).set(bearer(adminToken)).expect(200);
        const riga = dettaglioRes.body.data.righe[0];

        await api
            .patch(`/api/v1/ordini/${ordineId}/picking`)
            .set(bearer(state.tokens.operatore))
            .send({
                stato_picking: 'PICKING_COMPLETATO',
                prelievi: [{
                    riga_id: riga.id,
                    ubicazioni: [{ ubicazione_id: ubicazione, quantita: Number(riga.quantita) }],
                }],
            })
            .expect(200);

        const pdfOrdineRes = await api.get(`/api/v1/ordini/${ordineId}/pdf`).set(bearer(adminToken));
        expectPdf(pdfOrdineRes);

        const spedizioneRes = await api
            .post('/api/v1/spedizioni')
            .set(bearer(adminToken))
            .send({
                ordine_id: ordineId,
                cliente_id: cliente.id,
                destinazione_id: destinazione.id,
                tracking_number: `TRK-${suffix}`,
            })
            .expect(201);

        const spedizione = spedizioneRes.body.data;
        state.ids.spedizione = spedizione.id;

        await api.patch(`/api/v1/spedizioni/${spedizione.id}/stato`).set(bearer(adminToken)).send({ stato: 'SPEDITA' }).expect(200);

        await api
            .post(`/api/v1/spedizioni/${spedizione.id}/ddt`)
            .set(bearer(adminToken))
            .send({
                numero_ddt: `DDT-${suffix}`,
                data_ddt: '2099-12-31',
                trasportatore: 'Corriere test',
                note: 'DDT e2e',
            })
            .expect(201);

        const pdfDdtRes = await api.get(`/api/v1/spedizioni/${spedizione.id}/ddt/pdf`).set(bearer(adminToken));
        expectPdf(pdfDdtRes);

        await api
            .post('/api/v1/spedizioni')
            .set(bearer(adminToken))
            .send({ ordine_id: ordineId, cliente_id: cliente.id, destinazione_id: destinazione.id })
            .expect(409);
    });

    test('M11/M16: richiesta acquisto, state machine e notifica esito', async () => {
        const adminToken = state.tokens.admin;
        const prodotto = await createProdotto(adminToken, { sku: `SKU-RICH-${suffix}`, nome: `Prodotto Richiesta ${suffix}` });
        const fornitore = await createFornitore(adminToken, { piva: `PIVA-RICH-${suffix}` });

        const richiestaRes = await api
            .post('/api/v1/richieste-acquisto')
            .set(bearer(adminToken))
            .send({
                fornitore_id: fornitore.id,
                note: 'Richiesta e2e',
                righe: [{ prodotto_id: prodotto.id, quantita_richiesta: 3 }],
            })
            .expect(201);

        const richiestaId = richiestaRes.body.data.id;
        await api.patch(`/api/v1/richieste-acquisto/${richiestaId}/stato`).set(bearer(adminToken)).send({ stato: 'INVIATA' }).expect(200);
        await api.patch(`/api/v1/richieste-acquisto/${richiestaId}/stato`).set(bearer(adminToken)).send({ stato: 'IN_VALUTAZIONE' }).expect(200);
        await api.patch(`/api/v1/richieste-acquisto/${richiestaId}/stato`).set(bearer(adminToken)).send({ stato: 'ACCETTATA' }).expect(200);

        const invalidTransition = await api
            .patch(`/api/v1/richieste-acquisto/${richiestaId}/stato`)
            .set(bearer(adminToken))
            .send({ stato: 'RIFIUTATA' })
            .expect(409);
        expect(invalidTransition.body.code).toBe('INVALID_TRANSITION');

        const notificheRes = await api.get('/api/v1/notifiche').set(bearer(adminToken)).expect(200);
        expect(notificheRes.body.data.some((n) => n.tipo === 'RICHIESTA_ACCETTATA' && Number(n.riferimento_id) === Number(richiestaId))).toBe(true);
    });
});
