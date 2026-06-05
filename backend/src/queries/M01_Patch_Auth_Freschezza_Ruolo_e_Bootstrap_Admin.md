# M01 — Patch Auth: freschezza ruolo + bootstrap Admin
## LogiChain ERP V2 | Handoff sviluppo — post review M01

---

## Cosa risolve questa patch

Due problemi emersi in review della M01:

1. **Ruolo "stale" nel token + utente disabilitato a sessione aperta.**
   `auth.js` faceva solo `jwt.verify`. Conseguenze: (a) se cambia il ruolo di un utente, il vecchio `ruolo_id` resta nel token fino a scadenza; (b) se disabiliti un utente (`attivo=false`), la sua sessione **continua a funzionare** fino a scadenza token. La patch rilegge l'utente dal DB ad ogni richiesta autenticata: ruolo sempre fresco e utente disabilitato bloccato subito. **Zero modifiche allo schema.**

2. **`/register` pubblico con auto-assegnazione ruolo.**
   Chiunque poteva registrarsi come Admin. La patch protegge `/register` con il permesso `utenti:write` (che per matrice ha **solo** l'Admin) e introduce un runner `seed_admin.js` che crea il primo Admin dai secret `.env`, risolvendo il problema di bootstrap.

> **Nota:** NON introduciamo `token_version` in tabella. Quello serve alla *revoca esplicita* (logout-da-tutti-i-dispositivi, kill sessione al cambio password) ed è rimandato alla V3 con i refresh token. Per la freschezza del ruolo e il blocco del disabilitato basta la rilettura DB.

---

## Riepilogo modifiche

| File | Tipo | Scopo |
|------|------|-------|
| `backend/src/middleware/auth.js` | **SOSTITUIRE** | Rilettura utente dal DB: ruolo fresco + blocco utente disabilitato |
| `backend/seeds/seed_admin.js` | **NUOVO** | Runner idempotente che crea l'Admin iniziale dai secret `.env` |
| `backend/src/routes/authRoutes.js` | **MODIFICARE** (2 righe) | Proteggere `/register` con `auth + requirePermesso('utenti:write')` |
| `backend/.env` e `.env.example` | **MODIFICARE** | Aggiungere variabili `ADMIN_*` |
| `backend/package.json` | **MODIFICARE** (1 riga) | Aggiungere script `seed_admin` |

---

## ⚠️ Ordine di esecuzione (IMPORTANTE — c'è un bootstrap)

Proteggere `/register` crea un problema dell'uovo e della gallina: per registrare un utente serve un Admin autenticato, ma all'inizio l'Admin non esiste. Per questo l'Admin va creato **via seed**, non via API. Sequenza corretta su un DB pulito:

```bash
npm run migrate              # 1. crea le tabelle
npm run seed_ruoli_permessi  # 2. popola ruoli (incl. Admin id=1) e permessi
npm run seed_admin           # 3. crea l'Admin iniziale dai secret .env
```

Da qui in poi: login come Admin → si usa il token per chiamare `POST /api/v1/auth/register` e creare tutti gli altri utenti (Admin compresi, passando `ruolo_id: 1`).

---

## File 1 — `backend/src/middleware/auth.js` (SOSTITUIRE l'intero file)

```js
const jwt = require('jsonwebtoken');
const utentiModel = require('../models/utentiModel');

module.exports = async (req, res, next) => {
    const header = req.headers['authorization'];

    // Nessun header → 401
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            code: 'AUTH_REQUIRED',
            message: 'Token mancante o non valido'
        });
    }

    const token = header.split(' ')[1];

    // 1) Verifica firma/scadenza del token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({
            status: 'error',
            code: 'AUTH_REQUIRED',
            message: 'Token non valido o scaduto'
        });
    }

    // 2) Rilettura utente dal DB: ruolo sempre fresco + check stato attuale
    try {
        const result = await utentiModel.findById(decoded.id);
        const utente = result.rows[0];

        // L'utente non esiste più (eliminato dopo l'emissione del token)
        if (!utente) {
            return res.status(401).json({
                status: 'error',
                code: 'AUTH_REQUIRED',
                message: 'Utente non più valido'
            });
        }

        // Disabilitato dopo l'emissione del token → sessione non più valida
        if (!utente.attivo) {
            return res.status(401).json({
                status: 'error',
                code: 'UTENTE_DISABILITATO',
                message: 'Utente disabilitato'
            });
        }

        // req.user con stato AGGIORNATO dal DB (ruolo_id fresco anche se cambiato dopo il login)
        req.user = {
            id: utente.id,
            email: utente.email,
            ruolo_id: utente.ruolo_id,
            ruolo: utente.ruolo
        };

        return next();

    } catch (err) {
        // Errore DB reale → 500, non mascherarlo da 401
        return res.status(500).json({
            status: 'error',
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Errore interno'
        });
    }
};
```

**Cosa cambia rispetto a prima:**
- Il middleware diventa `async`.
- `req.user` non viene più costruito dal payload del token, ma dalla riga letta dal DB → il `ruolo_id` usato dall'RBAC è sempre quello attuale.
- Un utente disabilitato a sessione aperta riceve `401 UTENTE_DISABILITATO` (stesso codice del login, contratto coerente).
- Un errore del DB ritorna `500`, non viene confuso con un `401`.

**Trade-off (atteso e accettato in review):** aggiunge una lookup per PK ad ogni richiesta autenticata. È trascurabile e, sulle rotte protette da permesso, il DB veniva già colpito per l'RBAC. `utentiModel.findById` è già implementato e ritorna `attivo`, `ruolo_id` e `ruolo` (JOIN su `ruoli`), quindi non serve modificarlo.

---

## File 2 — `backend/seeds/seed_admin.js` (NUOVO)

```js
require('dotenv').config();

const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

const ADMIN_RUOLO_ID = 1; // 'Admin' — vedi seed_ruoli_permessi.js

const seedAdmin = async () => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const nome = process.env.ADMIN_NOME || 'Admin';
    const cognome = process.env.ADMIN_COGNOME || 'LogiChain';

    if (!email || !password) {
        console.error('❌ ADMIN_EMAIL e ADMIN_PASSWORD devono essere definiti nel .env');
        process.exitCode = 1;
        return;
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Il ruolo Admin deve già esistere (eseguire prima: npm run seed_ruoli_permessi)
        const ruolo = await client.query(
            'SELECT id FROM ruoli WHERE id = $1',
            [ADMIN_RUOLO_ID]
        );
        if (ruolo.rowCount === 0) {
            throw new Error(
                'Ruolo Admin (id=1) non trovato — esegui prima: npm run seed_ruoli_permessi'
            );
        }

        const password_hash = await bcrypt.hash(password, 12);

        const result = await client.query(
            `INSERT INTO utenti (nome, cognome, email, password_hash, ruolo_id, attivo)
             VALUES ($1, $2, $3, $4, $5, true)
             ON CONFLICT (email) DO NOTHING
             RETURNING id, email`,
            [nome, cognome, email, password_hash, ADMIN_RUOLO_ID]
        );

        await client.query('COMMIT');

        if (result.rowCount > 0) {
            console.log(`✅ Admin creato: ${result.rows[0].email} (id=${result.rows[0].id})`);
        } else {
            console.log(`ℹ️  Admin già presente (${email}) — nessuna azione`);
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Errore durante il seed admin:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
};

if (require.main === module) {
    seedAdmin();
}

module.exports = { seedAdmin };
```

**Caratteristiche:**
- **Idempotente:** `ON CONFLICT (email) DO NOTHING` (la colonna `email` è già `unique` in migration 013). Rieseguibile senza effetti collaterali.
- **Hash a 12 round con `bcryptjs`** — identico al register, stesso stack.
- **Verifica la precondizione:** se il ruolo Admin non c'è, fallisce con messaggio chiaro invece di inserire dati incoerenti.
- **Transazionale** e con lo stesso stile di `seed_ruoli_permessi.js`.
- La password vive **solo nel `.env` di deploy** (fuori dal repo). Consigliato forzare il cambio al primo login lato app.

---

## File 3 — `backend/src/routes/authRoutes.js` (MODIFICARE)

In testa al file, aggiungere l'import di `requirePermesso`:

```js
const { requirePermesso } = require('../middleware/rbac');
```

> Nota: `rbac.js` esporta `{ requirePermesso }` come oggetto, quindi l'import **va destrutturato**. `auth` invece è export di default e resta `const auth = require('../middleware/auth');`.

Poi modificare **solo** la riga del register, da:

```js
router.post('/register', validate(registerBlueprint), authController.register);
```

a:

```js
router.post('/register', auth, requirePermesso('utenti:write'), validate(registerBlueprint), authController.register);
```

**Ordine dei middleware (obbligatorio):** `auth` per primo (popola `req.user`) → `requirePermesso` (legge `req.user.ruolo_id`) → `validate` (controlla il body) → controller. Login e `/me` restano invariati.

---

## File 4 — `.env` e `.env.example`

Aggiungere in `backend/.env` (valori reali, NON committare questo file):

```
ADMIN_EMAIL=admin@logichain.it
ADMIN_PASSWORD=CambiaMiSubito_2025!
ADMIN_NOME=Admin
ADMIN_COGNOME=LogiChain
```

E in `backend/.env.example` (placeholder, questo SÌ nel repo):

```
ADMIN_EMAIL=admin@logichain.it
ADMIN_PASSWORD=
ADMIN_NOME=Admin
ADMIN_COGNOME=LogiChain
```

---

## File 5 — `backend/package.json` (aggiungere 1 script)

Nella sezione `"scripts"`:

```json
"seed_admin": "node seeds/seed_admin.js"
```

---

## Impatto sui test Postman (da aggiornare in M02)

La protezione di `/register` **cambia i test esistenti**: le request `POST /register` senza token che oggi si aspettano `201` d'ora in poi ritornano `401 AUTH_REQUIRED`. Quando si riprende la collection in M02:

- Il flusso register va eseguito **con il token Admin** (login Admin → salva `{{token}}` → register con header `Authorization: Bearer {{token}}`).
- Aggiungere un caso: register **senza token** → atteso `401 AUTH_REQUIRED`.
- Aggiungere un caso: register con token di un ruolo **senza** `utenti:write` (es. Operatore) → atteso `403 ACCESS_DENIED`. Questo copre anche il test RBAC 403 che era rimasto senza endpoint da chiamare in M01.

---

## Definition of Done di questa patch

- [ ] `auth.js` sostituito; una richiesta con token di un utente nel frattempo disabilitato risponde `401 UTENTE_DISABILITATO`.
- [ ] Cambiando il `ruolo_id` di un utente a DB, la richiesta successiva usa il **nuovo** ruolo senza dover rifare login.
- [ ] `npm run seed_admin` crea l'Admin; rieseguito, stampa "già presente" e non duplica.
- [ ] `seed_admin` senza ruoli a DB fallisce con messaggio che invita a lanciare `seed_ruoli_permessi`.
- [ ] `POST /api/v1/auth/register` senza token → `401`; con token non-Admin → `403`; con token Admin → `201`.
- [ ] `ADMIN_PASSWORD` non presente in `.env.example` e `.env` non committato.
- [ ] Commit su `feature/m01-auth` (o branch dedicato) e PR su `develop`.

---

*Giugno 2025 — LogiChain ERP V2.0 — CONFIDENZIALE*
*Patch post-review M01 — freschezza ruolo via rilettura DB + bootstrap Admin*
