# Milestone 01 — Auth & RBAC Backend
## LogiChain ERP V2 | Checklist Sviluppo — Versione Corretta

---

## Contesto

Questa milestone implementa il sistema di autenticazione e controllo accessi di LogiChain.
Al termine, ogni rotta del backend sarà protetta da JWT e da un sistema di permessi granulari per ruolo.

**Stack:** Node.js + Express + PostgreSQL + bcryptjs + JWT
**Pattern:** Routes → Middleware → Controllers → Services/Queries

> ⚠️ Usare sempre il pacchetto **`bcryptjs`** (puro JavaScript, zero dipendenze native).
> Non usare `bcrypt` — richiede build tools nativi e non è lo stack definito in FA.

---

## Struttura file da creare

```
backend/src/
├── middleware/
│   ├── auth.js              # verifica JWT
│   ├── rbac.js              # verifica permesso granulare
│   └── validate.js          # validazione body richieste
├── controllers/
│   └── authController.js
├── services/
│   └── authService.js
├── routes/
│   └── authRoutes.js
└── seeds/
    └── seed_ruoli_permessi.js
```

---

## STEP 1 — Middleware `auth.js`

- [ ] Legge il token dall'header `Authorization: Bearer <token>`
- [ ] Se mancante → risponde `401 AUTH_REQUIRED`
- [ ] Verifica il token con `jwt.verify(token, process.env.JWT_SECRET)`
- [ ] Se non valido o scaduto → risponde `401 AUTH_REQUIRED`
- [ ] Se valido → attacca il payload decodificato a `req.user` e chiama `next()`
- [ ] `req.user` contiene esattamente: `{ id, email, ruolo_id, ruolo }`

> **Payload JWT — struttura obbligatoria:**
> ```json
> { "id": 1, "email": "utente@logichain.it", "ruolo_id": 2, "ruolo": "Responsabile Acquisti" }
> ```
> Tutti i middleware RBAC leggono `req.user` da questo payload.
> La scadenza del token si legge da variabile d'ambiente: `process.env.JWT_EXPIRES_IN`.

---

## STEP 2 — Middleware `rbac.js`

- [ ] Esporta una funzione `requirePermesso(codice)` che ritorna un middleware
- [ ] Il middleware legge `req.user.id`
- [ ] Fa una query su `ruoli_permessi JOIN permessi` per verificare che l'utente abbia il permesso richiesto
- [ ] Se non ha il permesso → risponde `403 ACCESS_DENIED`
- [ ] Se ha il permesso → chiama `next()`
- [ ] Esempio di utilizzo nella route: `requirePermesso('ordini:approve')`

---

## STEP 3 — Middleware `validate.js`

- [ ] Esporta una funzione `validate(blueprint)` che ritorna un middleware
- [ ] `blueprint` è un oggetto che descrive i campi richiesti e le loro regole
- [ ] Se la validazione fallisce → risponde `400 VALIDATION_ERROR` con array errori per campo
- [ ] Esempio blueprint:

```js
{
  email:    { required: true, type: 'string' },
  password: { required: true, minLength: 6 }
}
```

---

## STEP 4 — Seed `seed_ruoli_permessi.js`

Il seed inserisce nel DB i 5 ruoli, tutti i permessi granulari e le associazioni ruolo→permesso.
Va eseguito **una volta sola** dopo le migration. È idempotente.

### 5 Ruoli

| id | nome |
|----|------|
| 1 | Admin |
| 2 | Responsabile Acquisti |
| 3 | Responsabile Magazzino |
| 4 | Operatore |
| 5 | Corriere |

### Permessi granulari — 30 totali

| codice | descrizione |
|--------|-------------|
| `utenti:read` | Visualizza utenti |
| `utenti:write` | Crea/modifica utenti |
| `utenti:delete` | Elimina utenti |
| `prodotti:read` | Visualizza prodotti |
| `prodotti:write` | Crea/modifica prodotti |
| `prodotti:delete` | Elimina prodotti |
| `fornitori:read` | Visualizza fornitori |
| `fornitori:write` | Crea/modifica fornitori |
| `fornitori:delete` | Elimina fornitori |
| `clienti:read` | Visualizza clienti |
| `clienti:write` | Crea/modifica clienti |
| `clienti:delete` | Elimina clienti |
| `magazzino:read` | Visualizza magazzino |
| `magazzino:write` | Gestisce ubicazioni |
| `giacenze:read` | Visualizza giacenze |
| `giacenze:write` | Modifica giacenze |
| `ordini:read` | Visualizza ordini |
| `ordini:write` | Crea/modifica ordini e gestisce stato picking |
| `ordini:approve` | Approva ordini commerciali |
| `acquisti:read` | Visualizza acquisti |
| `acquisti:write` | Crea/modifica acquisti |
| `acquisti:approve` | Approva acquisti |
| `spedizioni:read` | Visualizza spedizioni |
| `spedizioni:write` | Gestisce spedizioni |
| `notifiche:read` | Visualizza notifiche |
| `dashboard:read` | Visualizza dashboard |
| `ecosystem:read` | Ricerca nell'ecosistema globale |
| `ecosystem:write` | Interagisce con ecosistema (chat fornitore, aggiunta fornitore da ecosistema) |
| `richieste:read` | Visualizza richieste acquisto |
| `richieste:write` | Crea e invia richieste acquisto |

### Matrice Ruoli → Permessi

| Ruolo | Permessi assegnati |
|-------|--------------------|
| **Admin** | Tutti i 30 permessi |
| **Responsabile Acquisti** | `acquisti:read`, `acquisti:write`, `acquisti:approve`, `fornitori:read`, `fornitori:write`, `fornitori:delete`, `prodotti:read`, `ordini:read`, `richieste:read`, `richieste:write`, `ecosystem:read`, `ecosystem:write`, `notifiche:read`, `dashboard:read` |
| **Responsabile Magazzino** | `magazzino:read`, `magazzino:write`, `giacenze:read`, `giacenze:write`, `prodotti:read`, `spedizioni:read`, `spedizioni:write`, `ordini:read`, `ordini:write`, `notifiche:read`, `dashboard:read` |
| **Operatore** | `ordini:read`, `ordini:write`, `giacenze:read`, `prodotti:read`, `spedizioni:read`, `richieste:write`, `ecosystem:read`, `notifiche:read` |
| **Corriere** | `spedizioni:read`, `spedizioni:write`, `notifiche:read` |

> **Nota `ordini:write` per Responsabile Magazzino:**
> Necessario per eseguire la transizione `PICKING_COMPLETATO` su `sales_order_picking_state` (M09).
> Questa transizione scatena lo scarico giacenze — è un'operazione logistica, non commerciale.

> **Nota `ecosystem:write` vs `richieste:write`:**
> Sono due permessi distinti con scope diversi.
> `ecosystem:write` → chat con fornitore (M14), aggiunta fornitore a "I nostri Fornitori" (M03).
> `richieste:write` → crea e invia richiesta acquisto su M16 (`POST /api/v1/richieste-acquisto`, `PATCH .../stato`).

### Regole seed

- [ ] Inserisce i 5 ruoli se non esistono: `INSERT ... ON CONFLICT DO NOTHING`
- [ ] Inserisce i 30 permessi se non esistono: `INSERT ... ON CONFLICT DO NOTHING`
- [ ] Associa i permessi ai ruoli secondo la matrice sopra: `INSERT ... ON CONFLICT DO NOTHING`
- [ ] Il seed è completamente **idempotente** — rieseguibile senza effetti collaterali
- [ ] Aggiunge il comando nel `package.json`:

```json
"seed": "node seeds/seed_ruoli_permessi.js"
```

---

## STEP 5 — Service `authService.js`

### `login(email, password)`

- [ ] Cerca utente per email con `utentiModel.findByEmail(email)`
- [ ] Se non trovato → lancia errore `CREDENZIALI_NON_VALIDE`
- [ ] Se `attivo = false` → lancia errore `UTENTE_DISABILITATO`
- [ ] Confronta password con `bcryptjs.compare(password, utente.password_hash)`
- [ ] Se non corrisponde → lancia errore `CREDENZIALI_NON_VALIDE`

> ⚠️ Non distinguere in risposta tra "utente non trovato" e "password errata" — entrambi restituiscono
> `CREDENZIALI_NON_VALIDE`. Prevenzione enumeration attack.

- [ ] Genera JWT con payload `{ id, email, ruolo_id, ruolo }` e scadenza da `process.env.JWT_EXPIRES_IN`
- [ ] Ritorna `{ token, utente: { id, nome, cognome, email, ruolo } }`
- [ ] La risposta **non include mai** `password_hash`

### `register(dati)`

- [ ] Verifica che l'email non esista già → errore `EMAIL_GIA_ESISTENTE`
- [ ] Verifica che `ruolo_id` esista nella tabella `ruoli` → errore `RUOLO_NON_VALIDO`
- [ ] Hash della password con `bcryptjs.hash(password, 12)`
- [ ] Crea utente con `utentiModel.create()`
- [ ] Ritorna l'utente creato **senza** `password_hash`

### `getMe(utente_id)`

- [ ] Cerca utente per id con `utentiModel.findById(id)`
- [ ] Ritorna `{ id, nome, cognome, email, ruolo }`

---

## STEP 6 — Controller `authController.js`

### `login(req, res)`

- [ ] Chiama `authService.login(email, password)`
- [ ] Risponde `200` con `{ status: 'success', data: { token, utente } }`
- [ ] Gestisce errori del service → risposta appropriata (vedi tabella errori STEP 8)

### `register(req, res)`

- [ ] Chiama `authService.register(req.body)`
- [ ] Risponde `201` con `{ status: 'success', data: utente }`

### `getMe(req, res)`

- [ ] Chiama `authService.getMe(req.user.id)`
- [ ] Risponde `200` con `{ status: 'success', data: utente }`

---

## STEP 7 — Routes `authRoutes.js`

### Endpoint esposti

| Metodo | Path | Middleware | Controller |
|--------|------|-----------|------------|
| `POST` | `/api/v1/auth/login` | `validate(loginBlueprint)` | `authController.login` |
| `POST` | `/api/v1/auth/register` | `validate(registerBlueprint)` | `authController.register` |
| `GET` | `/api/v1/auth/me` | `auth` | `authController.getMe` |

### Blueprint validazione

```js
// loginBlueprint
{
  email:    { required: true, type: 'string' },
  password: { required: true, type: 'string', minLength: 6 }
}

// registerBlueprint
{
  nome:     { required: true, type: 'string' },
  cognome:  { required: true, type: 'string' },
  email:    { required: true, type: 'string' },
  password: { required: true, type: 'string', minLength: 6 },
  ruolo_id: { required: true, type: 'number' }
}
```

- [ ] Decommentare in `server.js`:

```js
app.use('/api/v1/auth', require('./src/routes/authRoutes'));
```

---

## STEP 8 — Formato risposte (rispettare sempre)

**Successo:**
```json
{
  "status": "success",
  "data": { }
}
```

**Errore:**
```json
{
  "status": "error",
  "code": "CODICE_ERRORE",
  "message": "Descrizione leggibile"
}
```

### Tabella codici errore M01

| HTTP | Codice | Quando |
|------|--------|--------|
| `400` | `VALIDATION_ERROR` | Body non supera il blueprint — include array `details` con errori per campo |
| `401` | `AUTH_REQUIRED` | Token mancante, non valido o scaduto |
| `401` | `CREDENZIALI_NON_VALIDE` | Email non trovata o password errata |
| `401` | `UTENTE_DISABILITATO` | Utente con `attivo = false` tenta il login |
| `403` | `ACCESS_DENIED` | Utente autenticato ma senza il permesso richiesto |
| `409` | `EMAIL_GIA_ESISTENTE` | Tentativo di register con email già in uso |
| `422` | `RUOLO_NON_VALIDO` | `ruolo_id` non corrisponde a nessun ruolo in DB |

---

## STEP 9 — Test Postman

Creare una collection **LogiChain V2** con le seguenti request:

### Folder: Auth

- [ ] **POST `/api/v1/auth/register`**
  - Body: `{ "nome": "Mario", "cognome": "Rossi", "email": "admin@logichain.it", "password": "password123", "ruolo_id": 1 }`
  - Atteso: `201` con utente creato (senza `password_hash`)

- [ ] **POST `/api/v1/auth/login`**
  - Body: `{ "email": "admin@logichain.it", "password": "password123" }`
  - Atteso: `200` con token JWT
  - Salvare il token in variabile d'ambiente `{{token}}`

- [ ] **GET `/api/v1/auth/me`**
  - Header: `Authorization: Bearer {{token}}`
  - Atteso: `200` con dati utente

- [ ] **POST `/api/v1/auth/login` — credenziali errate**
  - Body: `{ "email": "admin@logichain.it", "password": "sbagliata" }`
  - Atteso: `401 CREDENZIALI_NON_VALIDE`

- [ ] **GET `/api/v1/auth/me` — senza token**
  - Atteso: `401 AUTH_REQUIRED`

- [ ] **GET `/api/v1/auth/me` — token falso**
  - Header: `Authorization: Bearer tokenfalso`
  - Atteso: `401 AUTH_REQUIRED`

- [ ] **POST `/api/v1/auth/register` — email duplicata**
  - Body: stesso body del primo register
  - Atteso: `409 EMAIL_GIA_ESISTENTE`

- [ ] **POST `/api/v1/auth/register` — ruolo non valido**
  - Body: `{ ..., "ruolo_id": 999 }`
  - Atteso: `422 RUOLO_NON_VALIDO`

- [ ] **Test permesso RBAC — rotta protetta senza permesso**
  - Login con Corriere (ruolo_id: 5)
  - Chiamare una rotta protetta da `requirePermesso('acquisti:approve')`
  - Atteso: `403 ACCESS_DENIED`

---

## Definition of Done

La M01 è completata quando:

- [ ] `npm run seed` gira senza errori e popola ruoli + permessi (30 permessi, 5 ruoli, matrice completa)
- [ ] `POST /auth/login` ritorna un JWT valido con payload `{ id, email, ruolo_id, ruolo }`
- [ ] `POST /auth/register` crea un utente con password hashata con `bcryptjs` a 12 rounds
- [ ] `GET /auth/me` ritorna il profilo con il token corretto
- [ ] Tutte le rotte senza token rispondono `401 AUTH_REQUIRED`
- [ ] Una rotta protetta con `requirePermesso` risponde `403 ACCESS_DENIED` se il ruolo non ha il permesso
- [ ] Login con utente `attivo = false` risponde `401 UTENTE_DISABILITATO`
- [ ] Register con email duplicata risponde `409 EMAIL_GIA_ESISTENTE`
- [ ] Nessuna risposta include mai `password_hash`
- [ ] Tutti i test Postman (9 casi) passano con status atteso
- [ ] Nessun `console.log` di debug lasciato nel codice
- [ ] Codice committato su branch `feature/m01-auth` e PR aperta su `develop`

---

## Note per l'AI / sviluppatore

Se usi questa checklist per generare codice, fornisci sempre come contesto:

- Il file `logichain_schema_v2.sql` (schema completo del DB)
- Il file `src/models/utentiModel.js` (già implementato)
- Il file `src/config/db.js` (pool PostgreSQL)
- La struttura delle risposte API (STEP 8)

Il pattern da seguire è: **Routes → Middleware → Controllers → Services → Models**.
I models fanno solo SQL, i services fanno la business logic, i controllers gestiscono req/res.

**Pacchetti da installare:**
```bash
npm install bcryptjs jsonwebtoken
```

---

*Giugno 2025 — LogiChain ERP V2.0 — CONFIDENZIALE*
*Versione milestone corretta post-analisi FA V2 — sostituisce la versione precedente*
