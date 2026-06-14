const request = require('supertest');
const app = require('../../server');
const pool = require('../../src/config/db');

const api = request(app);
const suffix = Date.now();

const state = { tokens: {}, ids: {} };

const credentials = {
    admin: { email: process.env.ADMIN_EMAIL || 'admin@logichain.it', password: process.env.ADMIN_PASSWORD || 'Admin123!' },
    operatore: { email: 'operatore@test.local', password: 'Test123!' },
    acquisti: { email: 'resp.acquisti@test.local', password: 'Test123!' },
};

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

const login = async ({ email, password }) => {
    const res = await api.post('/api/v1/auth/login').send({ email, password }).expect(200);
    return res.body.data.token;
};

describe('LogiChain backend E2E priority 4 (anagrafiche, ecosystem, settings)', () => {
    afterAll(async () => {
        await pool.end();
    });

    test('setup: login admin/operatore/acquisti', async () => {
        state.tokens.admin = await login(credentials.admin);
        state.tokens.operatore = await login(credentials.operatore);
        state.tokens.acquisti = await login(credentials.acquisti);
    });

    test('M03: source forzato a manual, ecosystem non modificabile', async () => {
        const adminToken = state.tokens.admin;

        const res = await api
            .post('/api/v1/fornitori')
            .set(bearer(adminToken))
            .send({
                ragione_sociale: `Fornitore Source ${suffix}`,
                piva: `PIVA-SRC-${suffix}`,
                email: `src.${suffix}@test.local`,
                source: 'ecosystem',
            })
            .expect(201);

        expect(res.body.data.source).toBe('manual');
        state.ids.fornitore = res.body.data.id;

        const updateRes = await api
            .patch(`/api/v1/fornitori/${res.body.data.id}`)
            .set(bearer(adminToken))
            .send({ source: 'ecosystem', ragione_sociale: 'Tentativo modifica source' })
            .expect(200);
        expect(updateRes.body.data.source).toBe('manual');
    });

    test('M03: DELETE fornitore e soft delete (attivo=false)', async () => {
        const adminToken = state.tokens.admin;

        const createRes = await api
            .post('/api/v1/fornitori')
            .set(bearer(adminToken))
            .send({ ragione_sociale: `Fornitore Soft ${suffix}`, piva: `PIVA-SOFT-${suffix}` })
            .expect(201);

        await api.delete(`/api/v1/fornitori/${createRes.body.data.id}`).set(bearer(adminToken)).expect(204);

        const dettaglio = await api
            .get(`/api/v1/fornitori/${createRes.body.data.id}`)
            .set(bearer(adminToken))
            .expect(200);
        expect(dettaglio.body.data.attivo).toBe(false);
    });

    test('M04: cliente con storico e soft delete sempre consentito', async () => {
        const adminToken = state.tokens.admin;

        const clienteRes = await api
            .post('/api/v1/clienti')
            .set(bearer(adminToken))
            .send({
                ragione_sociale: `Cliente Storico ${suffix}`,
                piva_cf: `CF-STO-${suffix}`,
                email: `cli.sto.${suffix}@test.local`,
            })
            .expect(201);

        const clienteId = clienteRes.body.data.id;

        await api.delete(`/api/v1/clienti/${clienteId}`).set(bearer(adminToken)).expect(204);

        const dettaglio = await api.get(`/api/v1/clienti/${clienteId}`).set(bearer(adminToken)).expect(200);
        expect(dettaglio.body.data.attivo).toBe(false);
    });

    test('M05: corriere soft delete, dipendente hard delete', async () => {
        const adminToken = state.tokens.admin;

        const corriereRes = await api
            .post('/api/v1/corrieri')
            .set(bearer(adminToken))
            .send({ codice: `COR-${suffix}`, nome: 'Corriere E2E', telefono: '0800000002', email: `cor.${suffix}@test.local` })
            .expect(201);
        const corriereId = corriereRes.body.data.id;

        await api.delete(`/api/v1/corrieri/${corriereId}`).set(bearer(adminToken)).expect(204);
        const corriereDett = await api.get(`/api/v1/corrieri/${corriereId}`).set(bearer(adminToken)).expect(200);
        expect(corriereDett.body.data.attivo).toBe(false);

        const dipRes = await api
            .post('/api/v1/dipendenti')
            .set(bearer(adminToken))
            .send({
                nome: 'Hard',
                cognome: 'Delete',
                codice_fiscale: `CFHARD${suffix}`.slice(0, 16),
                ruolo_operativo: 'Magazziniere',
                data_assunzione: '2026-01-01',
            })
            .expect(201);
        const dipId = dipRes.body.data.id;

        await api.delete(`/api/v1/dipendenti/${dipId}`).set(bearer(adminToken)).expect(204);
        await api.get(`/api/v1/dipendenti/${dipId}`).set(bearer(adminToken)).expect(404);
    });

    test('M07: RETTIFICA senza note e bloccata, stock insufficiente e bloccato', async () => {
        const adminToken = state.tokens.admin;

        const prodottoRes = await api
            .post('/api/v1/prodotti')
            .set(bearer(adminToken))
            .send({ nome: `Prodotto Rettifica ${suffix}`, sku: `SKU-RET-${suffix}`, prezzo: 5 })
            .expect(201);

        const magRes = await api
            .post('/api/v1/magazzini')
            .set(bearer(adminToken))
            .send({ codice: `MAG-RET-${suffix}`, nome: 'Mag Rettifica', citta: 'Bari', provincia: 'BA' })
            .expect(201);

        const ubiRes = await api
            .post(`/api/v1/magazzini/${magRes.body.data.id}/ubicazioni`)
            .set(bearer(adminToken))
            .send({ corsia: 1, scaffale: 1 })
            .expect(201);

        const noteMancanti = await api
            .post('/api/v1/movimenti-stock')
            .set(bearer(adminToken))
            .send({
                prodotto_id: prodottoRes.body.data.id,
                ubicazione_id: ubiRes.body.data.id,
                quantita: 5,
                movimento_tipo: 'RETTIFICA_POSITIVA',
            })
            .expect(400);
        expect(noteMancanti.body.code).toBe('VALIDATION_ERROR');

        const scaricoEccessivo = await api
            .post('/api/v1/movimenti-stock')
            .set(bearer(adminToken))
            .send({
                prodotto_id: prodottoRes.body.data.id,
                ubicazione_id: ubiRes.body.data.id,
                quantita: 999,
                movimento_tipo: 'RETTIFICA_NEGATIVA',
                note: 'Tentativo scarico eccessivo',
            })
            .expect(422);
        expect(scaricoEccessivo.body.code).toBe('INSUFFICIENT_STOCK');
    });

    test('M13: ecosystem search e schede protette da permesso', async () => {
        const adminToken = state.tokens.admin;

        const shortQuery = await api
            .get('/api/v1/ecosystem/search?q=a')
            .set(bearer(adminToken))
            .expect(400);
        expect(shortQuery.body.code).toBe('VALIDATION_ERROR');

        const searchRes = await api
            .get(`/api/v1/ecosystem/search?q=${encodeURIComponent('Fornitore')}`)
            .set(bearer(adminToken))
            .expect(200);
        expect(searchRes.body.status).toBe('success');

        await api.get('/api/v1/ecosystem/search?q=test').set(bearer(state.tokens.operatore)).expect(403);
    });

    test('Azienda Settings: GET e PATCH intestazione documenti', async () => {
        const adminToken = state.tokens.admin;

        const getRes = await api.get('/api/v1/azienda-settings').set(bearer(adminToken)).expect(200);
        expect(getRes.body.data).toHaveProperty('ragione_sociale');

        const nuovaRagione = `LogiChain Test ${suffix}`;
        const patchRes = await api
            .patch('/api/v1/azienda-settings')
            .set(bearer(adminToken))
            .send({ ragione_sociale: nuovaRagione, citta: 'Milano', provincia: 'MI' })
            .expect(200);
        expect(patchRes.body.data.ragione_sociale).toBe(nuovaRagione);
        expect(patchRes.body.data.citta).toBe('Milano');

        await api
            .patch('/api/v1/azienda-settings')
            .set(bearer(state.tokens.operatore))
            .send({ ragione_sociale: 'Non autorizzato' })
            .expect(403);

        const empty = await api
            .patch('/api/v1/azienda-settings')
            .set(bearer(adminToken))
            .send({ ragione_sociale: '   ' })
            .expect(400);
        expect(empty.body.code).toBe('VALIDATION_ERROR');
    });
});
