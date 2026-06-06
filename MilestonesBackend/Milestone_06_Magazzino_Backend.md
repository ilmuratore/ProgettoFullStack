# Milestone 06 — Gestione Magazzino: Magazzini & Ubicazioni (Backend)
## LogiChain ERP V2 | Checklist Sviluppo

---

## Contesto

Questa milestone implementa il backend del modulo **M06 — Gestione Magazzino**.
La struttura è a **2 livelli**: Magazzini → Ubicazioni.
Nessuna modifica allo schema DB — tabelle esistenti in V1.3.

**Prerequisiti:** M01–M05 completate e merged su develop.
**Stack:** Node.js + Express + PostgreSQL
**Pattern:** Routes → Middleware → Controllers → Services → Queries

**Regole chiave del modulo:**

| Regola | Dettaglio |
|--------|-----------|
| Nessun DELETE | Solo toggle `attivo` via PATCH dedicato — né hard delete né soft delete |
| Codice composto ubicazione | Calcolato nel service, **non stored** in DB |
| Formato codice composto | `{magazzino_id}-{corsia:02d}-{scaffale:02d}` (es. `1-03-05`) |
| Vincolo unicità ubicazione | `UNIQUE(magazzino_id, corsia, scaffale)` — già in DB |
| Contatore giacenze | Incluso in GET albero via LEFT JOIN su `giacenze` |

---

## Permessi coinvolti (definiti in M01)

| Permesso | Operazione |
|----------|------------|
| `magazzino:read` | GET lista, GET dettaglio, GET ubicazioni |
| `magazzino:write` | POST, PATCH dati, PATCH toggle |

> Nessun `magazzino:delete` — coerente con il design toggle-only.

**Chi può fare cosa:**

| Ruolo | Read | Write |
|-------|------|-------|
| Admin | ✅ | ✅ |
| Responsabile Magazzino | ✅ | ✅ |
| Responsabile Acquisti | ❌ | ❌ |
| Operatore | ❌ | ❌ |
| Corriere | ❌ | ❌ |

---

## Campi tabelle

### Tabella `magazzini`

| Campo | Tipo | Note |
|-------|------|------|
| `id` | INTEGER PK | — |
| `codice` | TEXT UNIQUE | Identificatore breve (es. "MAG-A") — non modificabile dopo creazione |
| `nome` | TEXT | Nome descrittivo |
| `indirizzo` | TEXT | Indirizzo fisico |
| `attivo` | BOOLEAN | Toggle attivazione — default true |
| `created_at` | TIMESTAMPTZ | — |
| `updated_at` | TIMESTAMPTZ | Trigger fn_set_updated_at |

### Tabella `ubicazioni`

| Campo | Tipo | Note |
|-------|------|------|
| `id` | INTEGER PK | — |
| `magazzino_id` | INTEGER FK → magazzini | NOT NULL |
| `corsia` | INT | Numero corsia — parte del codice composto |
| `scaffale` | INT | Numero scaffale — parte del codice composto |
| `attivo` | BOOLEAN | Toggle per manutenzione/quarantena |
| `temperatura_controllata` | BOOLEAN | Flag cella frigorifera |
| UNIQUE | (magazzino_id, corsia, scaffale) | Nessun duplicato per slot |

> Il campo `codice_composto` **non esiste in DB** — viene calcolato nel service
> ad ogni risposta con la formula: `${magazzino_id}-${corsia:02d}-${scaffale:02d}`

---

## Struttura file da creare

```
backend/
└── src/
    ├── queries/
    │   ├── magazziniQueries.js          ← NUOVO
    │   └── ubicazioniQueries.js         ← NUOVO
    ├── services/
    │   ├── magazziniService.js          ← NUOVO
    │   └── ubicazioniService.js         ← NUOVO
    ├── controllers/
    │   ├── magazziniController.js       ← NUOVO
    │   └── ubicazioniController.js      ← NUOVO
    └── routes/
        ├── magazziniRoutes.js           ← NUOVO
        └── ubicazioniRoutes.js          ← NUOVO
```

> Nessun file di migration — nessuna modifica allo schema DB.
> Nessun seed aggiuntivo — permessi già in M01.

---

## STEP 1 — Helper: `buildCodiceComposto()`

Funzione utility da definire nel service (o in un file helper condiviso).
Usata ovunque si costruisce una ubicazione nella risposta.

```js
function buildCodiceComposto(magazzino_id, corsia, scaffale) {
  return `${magazzino_id}-${String(corsia).padStart(2, '0')}-${String(scaffale).padStart(2, '0')}`;
}

// Esempi:
// buildCodiceComposto(1, 3, 5)  → '1-03-05'
// buildCodiceComposto(2, 12, 1) → '2-12-01'
```

- [ ] Funzione implementata e usata in **ogni** risposta che include ubicazioni
- [ ] Mai salvata in DB — solo nella costruzione della risposta JSON

---

## MAGAZZINI

---

## STEP 2 — Queries `magazziniQueries.js`

### `findAll()`

```sql
-- Tutti i magazzini inclusi i disattivi (management view — serve il toggle)
SELECT id, codice, nome, indirizzo, attivo
FROM magazzini
ORDER BY codice ASC
```

### `findById(id)` — solo dati base magazzino

```sql
SELECT id, codice, nome, indirizzo, attivo
FROM magazzini
WHERE id = $1
```

### `findUbicazioniByMagazzino(magazzino_id)` — ubicazioni con giacenze

```sql
-- Usata per la vista ad albero — include contatore giacenze per ubicazione
SELECT u.id, u.magazzino_id, u.corsia, u.scaffale,
       u.attivo, u.temperatura_controllata,
       COALESCE(SUM(g.quantita), 0) AS totale_giacenza
FROM ubicazioni u
LEFT JOIN giacenze g ON g.ubicazione_id = u.id
WHERE u.magazzino_id = $1
GROUP BY u.id
ORDER BY u.corsia ASC, u.scaffale ASC
```

### `findByCodice(codice)`

```sql
-- Controllo unicità prima di INSERT
SELECT id FROM magazzini WHERE codice = $1
```

### `create(codice, nome, indirizzo)`

```sql
INSERT INTO magazzini (codice, nome, indirizzo)
VALUES ($1, $2, $3)
RETURNING id, codice, nome, indirizzo, attivo
```

### `update(id, fields)`

```sql
-- Costruire dinamicamente: solo nome e/o indirizzo
-- codice non è mai aggiornabile
UPDATE magazzini
SET nome = $1, indirizzo = $2
WHERE id = $3
RETURNING id, codice, nome, indirizzo, attivo
```

### `toggleAttivo(id)`

```sql
UPDATE magazzini
SET attivo = NOT attivo
WHERE id = $1
RETURNING id, codice, nome, indirizzo, attivo
```

### Checklist queries magazzini

- [ ] `findAll()` — nessun filtro su `attivo` (mostra tutti)
- [ ] `findUbicazioniByMagazzino()` — LEFT JOIN giacenze, GROUP BY ubicazione
- [ ] `findByCodice()` — per check unicità pre-insert
- [ ] `create()` — RETURNING completo
- [ ] `update()` — costruzione dinamica, `codice` mai aggiornabile
- [ ] `toggleAttivo()` — `NOT attivo` in SQL, RETURNING stato aggiornato
- [ ] Nessuna business logic in questo file

---

## STEP 3 — Service `magazziniService.js`

### `getAll()`

- [ ] Chiama `magazziniQueries.findAll()`
- [ ] Ritorna array magazzini (può essere `[]`)

### `getById(id)`

- [ ] Chiama `magazziniQueries.findById(id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Chiama `magazziniQueries.findUbicazioniByMagazzino(id)`
- [ ] Per ogni ubicazione aggiunge `codice_composto` via `buildCodiceComposto()`
- [ ] Ritorna oggetto: `{ ...magazzino, ubicazioni: [...] }`

### `create({ codice, nome, indirizzo })`

- [ ] Verifica unicità codice: chiama `findByCodice(codice)`
- [ ] Se già esistente → lancia errore `DUPLICATE_ENTRY`
- [ ] Chiama `magazziniQueries.create(codice, nome, indirizzo)`
- [ ] Ritorna il magazzino creato

### `update(id, { nome, indirizzo })`

- [ ] Verifica che il magazzino esista: chiama `findById(id)` (solo dati base)
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Costruisce `fields` con solo i campi presenti nel body
- [ ] `codice` è **sempre escluso** da `fields` anche se presente nel body
- [ ] Se `fields` è vuoto → lancia errore `VALIDATION_ERROR`
- [ ] Chiama `magazziniQueries.update(id, fields)`
- [ ] Ritorna il magazzino aggiornato

### `toggleAttivo(id)`

- [ ] Verifica che il magazzino esista: chiama `findById(id)` (solo dati base)
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Chiama `magazziniQueries.toggleAttivo(id)`
- [ ] Ritorna il magazzino con `attivo` aggiornato

### Checklist service magazzini

- [ ] `getById` include ubicazioni con `codice_composto` calcolato
- [ ] `create` controlla unicità codice prima dell'INSERT
- [ ] `update` mai modifica `codice`
- [ ] `toggleAttivo` usa `NOT attivo` — non accetta un valore booleano dal body
- [ ] Nessun SQL diretto nel service

---

## STEP 4 — Controller `magazziniController.js`

### `getAll(req, res)`
- [ ] Chiama `magazziniService.getAll()`
- [ ] Risponde `200` con `{ status: 'success', data: magazzini }`

### `getById(req, res)`
- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `magazziniService.getById(id)`
- [ ] Risponde `200` con `{ status: 'success', data: magazzino }` (include ubicazioni)

### `create(req, res)`
- [ ] Chiama `magazziniService.create(req.body)`
- [ ] Risponde `201` con `{ status: 'success', data: magazzino }`

### `update(req, res)`
- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `magazziniService.update(id, req.body)`
- [ ] Risponde `200` con `{ status: 'success', data: magazzino }`

### `toggleAttivo(req, res)`
- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `magazziniService.toggleAttivo(id)`
- [ ] Risponde `200` con `{ status: 'success', data: magazzino }` (include `attivo` aggiornato)

### Checklist controller magazzini
- [ ] Nessuna business logic
- [ ] Tutti gli errori mappati alla risposta HTTP corretta
- [ ] `id` sempre convertito a intero

---

## STEP 5 — Routes `magazziniRoutes.js`

### Endpoint esposti

| Metodo | Path | Middleware | Controller |
|--------|------|-----------|------------|
| `GET` | `/api/v1/magazzini` | `auth`, `requirePermesso('magazzino:read')` | `magazziniController.getAll` |
| `POST` | `/api/v1/magazzini` | `auth`, `requirePermesso('magazzino:write')`, `validate(createBlueprint)` | `magazziniController.create` |
| `GET` | `/api/v1/magazzini/:id` | `auth`, `requirePermesso('magazzino:read')` | `magazziniController.getById` |
| `PATCH` | `/api/v1/magazzini/:id` | `auth`, `requirePermesso('magazzino:write')`, `validate(updateBlueprint)` | `magazziniController.update` |
| `PATCH` | `/api/v1/magazzini/:id/toggle` | `auth`, `requirePermesso('magazzino:write')` | `magazziniController.toggleAttivo` |

### Blueprint validazione magazzini

```js
// createBlueprint — codice e nome obbligatori
{
  codice:    { required: true,  type: 'string' },
  nome:      { required: true,  type: 'string' },
  indirizzo: { required: false, type: 'string' }
}

// updateBlueprint — tutti opzionali, codice mai accettato
{
  nome:      { required: false, type: 'string' },
  indirizzo: { required: false, type: 'string' }
}
```

> `/toggle` non ha body — nessun `validate` applicato.

- [ ] Aggiungere in `server.js`:
  ```js
  app.use('/api/v1/magazzini', require('./src/routes/magazziniRoutes'));
  ```

---

## UBICAZIONI

---

## STEP 6 — Queries `ubicazioniQueries.js`

### `findById(id)`

```sql
SELECT id, magazzino_id, corsia, scaffale, attivo, temperatura_controllata
FROM ubicazioni
WHERE id = $1
```

### `findByMagazzinoIdCorsiaScaffale(magazzino_id, corsia, scaffale)`

```sql
-- Controllo unicità pre-insert
SELECT id FROM ubicazioni
WHERE magazzino_id = $1 AND corsia = $2 AND scaffale = $3
```

### `create(magazzino_id, corsia, scaffale, temperatura_controllata)`

```sql
INSERT INTO ubicazioni (magazzino_id, corsia, scaffale, temperatura_controllata)
VALUES ($1, $2, $3, $4)
RETURNING id, magazzino_id, corsia, scaffale, attivo, temperatura_controllata
```

### `updateTemperatura(id, temperatura_controllata)`

```sql
UPDATE ubicazioni
SET temperatura_controllata = $1
WHERE id = $2
RETURNING id, magazzino_id, corsia, scaffale, attivo, temperatura_controllata
```

### `toggleAttivo(id)`

```sql
UPDATE ubicazioni
SET attivo = NOT attivo
WHERE id = $1
RETURNING id, magazzino_id, corsia, scaffale, attivo, temperatura_controllata
```

### Checklist queries ubicazioni

- [ ] `findById()` — ritorna null se non trovato
- [ ] `findByMagazzinoIdCorsiaScaffale()` — per check unicità pre-insert
- [ ] `create()` — RETURNING completo (senza codice_composto — calcolato nel service)
- [ ] `updateTemperatura()` — solo `temperatura_controllata`
- [ ] `toggleAttivo()` — `NOT attivo`, RETURNING stato aggiornato
- [ ] Nessuna business logic in questo file

---

## STEP 7 — Service `ubicazioniService.js`

### Helper interno

```js
// Aggiunge codice_composto a un oggetto ubicazione
function withCodice(ubicazione) {
  return {
    ...ubicazione,
    codice_composto: buildCodiceComposto(
      ubicazione.magazzino_id,
      ubicazione.corsia,
      ubicazione.scaffale
    )
  };
}
```

### `getById(id)`

- [ ] Chiama `ubicazioniQueries.findById(id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Aggiunge `codice_composto` via `withCodice()`
- [ ] Ritorna ubicazione con `codice_composto`

### `create(magazzino_id, { corsia, scaffale, temperatura_controllata })`

- [ ] Verifica che il magazzino esista: chiama `magazziniQueries.findById(magazzino_id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND` (magazzino non esistente)
- [ ] Verifica unicità slot: chiama `findByMagazzinoIdCorsiaScaffale(magazzino_id, corsia, scaffale)`
- [ ] Se già esistente → lancia errore `DUPLICATE_ENTRY`
- [ ] Chiama `ubicazioniQueries.create(magazzino_id, corsia, scaffale, temperatura_controllata ?? false)`
- [ ] Aggiunge `codice_composto` via `withCodice()`
- [ ] Ritorna ubicazione creata con `codice_composto`

### `updateTemperatura(id, temperatura_controllata)`

- [ ] Verifica che l'ubicazione esista: chiama `findById(id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Chiama `ubicazioniQueries.updateTemperatura(id, temperatura_controllata)`
- [ ] Aggiunge `codice_composto` via `withCodice()`
- [ ] Ritorna ubicazione aggiornata con `codice_composto`

### `toggleAttivo(id)`

- [ ] Verifica che l'ubicazione esista: chiama `findById(id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Chiama `ubicazioniQueries.toggleAttivo(id)`
- [ ] Aggiunge `codice_composto` via `withCodice()`
- [ ] Ritorna ubicazione con `attivo` aggiornato e `codice_composto`

### Checklist service ubicazioni

- [ ] `create` verifica esistenza magazzino prima dell'insert
- [ ] `create` verifica unicità (magazzino_id, corsia, scaffale) prima dell'insert
- [ ] `temperatura_controllata` default `false` se non passata nel body
- [ ] `codice_composto` aggiunto a ogni risposta
- [ ] `toggleAttivo` usa `NOT attivo` — non accetta booleano dal body
- [ ] Nessun SQL diretto nel service

---

## STEP 8 — Controller `ubicazioniController.js`

### `getById(req, res)`
- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `ubicazioniService.getById(id)`
- [ ] Risponde `200` con `{ status: 'success', data: ubicazione }`

### `create(req, res)`
- [ ] Estrae `magazzino_id` da `req.params.magId` — converte a intero
- [ ] Chiama `ubicazioniService.create(magazzino_id, req.body)`
- [ ] Risponde `201` con `{ status: 'success', data: ubicazione }`

### `updateTemperatura(req, res)`
- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `ubicazioniService.updateTemperatura(id, req.body.temperatura_controllata)`
- [ ] Risponde `200` con `{ status: 'success', data: ubicazione }`

### `toggleAttivo(req, res)`
- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `ubicazioniService.toggleAttivo(id)`
- [ ] Risponde `200` con `{ status: 'success', data: ubicazione }`

### Checklist controller ubicazioni
- [ ] `magazzino_id` da `req.params.magId` convertito a intero
- [ ] `id` da `req.params.id` convertito a intero
- [ ] Nessuna business logic nel controller

---

## STEP 9 — Routes

### `magazziniRoutes.js` — ubicazioni nested

```js
// Rotta ubicazioni nested sotto magazzini (POST crea ubicazione)
router.post(
  '/:magId/ubicazioni',
  auth,
  requirePermesso('magazzino:write'),
  validate(ubicazioneCreateBlueprint),
  ubicazioniController.create
);
```

### `ubicazioniRoutes.js` — rotte dirette per operazioni su singola ubicazione

| Metodo | Path | Middleware | Controller |
|--------|------|-----------|------------|
| `GET` | `/api/v1/ubicazioni/:id` | `auth`, `requirePermesso('magazzino:read')` | `ubicazioniController.getById` |
| `PATCH` | `/api/v1/ubicazioni/:id` | `auth`, `requirePermesso('magazzino:write')`, `validate(updateBlueprint)` | `ubicazioniController.updateTemperatura` |
| `PATCH` | `/api/v1/ubicazioni/:id/toggle` | `auth`, `requirePermesso('magazzino:write')` | `ubicazioniController.toggleAttivo` |

### Blueprint validazione ubicazioni

```js
// ubicazioneCreateBlueprint — corsia e scaffale obbligatori, interi > 0
{
  corsia:                 { required: true,  type: 'number', integer: true, min: 1 },
  scaffale:               { required: true,  type: 'number', integer: true, min: 1 },
  temperatura_controllata:{ required: false, type: 'boolean' }
}

// ubicazioneUpdateBlueprint — solo temperatura_controllata
{
  temperatura_controllata: { required: true, type: 'boolean' }
}
```

- [ ] Aggiungere in `server.js`:
  ```js
  app.use('/api/v1/magazzini',  require('./src/routes/magazziniRoutes'));
  app.use('/api/v1/ubicazioni', require('./src/routes/ubicazioniRoutes'));
  ```

> La rotta `POST /api/v1/magazzini/:magId/ubicazioni` è registrata in `magazziniRoutes.js`
> e gestita da `ubicazioniController.create`. Le altre rotte ubicazioni sono in `ubicazioniRoutes.js`.

---

## STEP 10 — Formato risposte e codici errore M06

### Esempio risposta GET /magazzini/:id (vista albero)

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "codice": "MAG-A",
    "nome": "Magazzino principale",
    "indirizzo": "Via Industriale 1, Milano",
    "attivo": true,
    "ubicazioni": [
      {
        "id": 1,
        "magazzino_id": 1,
        "corsia": 1,
        "scaffale": 1,
        "codice_composto": "1-01-01",
        "attivo": true,
        "temperatura_controllata": false,
        "totale_giacenza": 150
      },
      {
        "id": 2,
        "magazzino_id": 1,
        "corsia": 1,
        "scaffale": 2,
        "codice_composto": "1-01-02",
        "attivo": false,
        "temperatura_controllata": true,
        "totale_giacenza": 0
      }
    ]
  }
}
```

### Tabella codici errore M06

| HTTP | Codice | Quando |
|------|--------|--------|
| `400` | `VALIDATION_ERROR` | Blueprint fallisce — campo mancante, tipo errato, corsia/scaffale < 1, body PATCH vuoto |
| `401` | `AUTH_REQUIRED` | Token mancante o non valido |
| `403` | `ACCESS_DENIED` | Ruolo senza il permesso richiesto |
| `404` | `RESOURCE_NOT_FOUND` | Magazzino o ubicazione non trovata |
| `409` | `DUPLICATE_ENTRY` | Codice magazzino già esistente — oppure (magazzino_id, corsia, scaffale) già usato |

---

## STEP 11 — Test Postman

Aggiungere folder **Magazzino** alla collection LogiChain V2.

> **Variabili d'ambiente necessarie:**
> - `{{token_admin}}` — accesso completo
> - `{{token_resp_magazzino}}` — Responsabile Magazzino
> - `{{token_no_access}}` — Operatore (nessun permesso magazzino)

### Folder: Magazzini — 13 test

- [ ] **GET `/api/v1/magazzini`** — lista tutti (inclusi disattivi)
  - Atteso: `200`, array (con campo `attivo` per ognuno)

- [ ] **POST `/api/v1/magazzini`** — crea magazzino valido
  - Body: `{ "codice": "MAG-TEST", "nome": "Magazzino Test", "indirizzo": "Via Test 1" }`
  - Atteso: `201`
  - Salvare `{{magazzino_id}}`

- [ ] **POST `/api/v1/magazzini`** — codice duplicato
  - Body: stesso codice "MAG-TEST"
  - Atteso: `409 DUPLICATE_ENTRY`

- [ ] **POST `/api/v1/magazzini`** — campo obbligatorio mancante
  - Body: `{ "codice": "MAG-X" }` (senza nome)
  - Atteso: `400 VALIDATION_ERROR`

- [ ] **GET `/api/v1/magazzini/:id`** — dettaglio con albero ubicazioni vuoto
  - Usa `{{magazzino_id}}`
  - Atteso: `200`, `ubicazioni: []`

- [ ] **GET `/api/v1/magazzini/:id`** — id inesistente
  - Atteso: `404 RESOURCE_NOT_FOUND`

- [ ] **PATCH `/api/v1/magazzini/:id`** — modifica nome e indirizzo
  - Body: `{ "nome": "Magazzino Aggiornato" }`
  - Atteso: `200`, nome aggiornato — `codice` invariato

- [ ] **PATCH `/api/v1/magazzini/:id`** — codice nel body ignorato
  - Body: `{ "codice": "HACKEDCODICE", "nome": "Test" }`
  - Atteso: `200`, `codice` nella risposta è ancora "MAG-TEST" — non modificato

- [ ] **PATCH `/api/v1/magazzini/:id`** — body vuoto
  - Body: `{}`
  - Atteso: `400 VALIDATION_ERROR`

- [ ] **PATCH `/api/v1/magazzini/:id/toggle`** — disattiva magazzino
  - Atteso: `200`, `attivo: false`

- [ ] **PATCH `/api/v1/magazzini/:id/toggle`** — riattiva magazzino
  - Atteso: `200`, `attivo: true`

- [ ] **GET `/api/v1/magazzini`** — senza token
  - Atteso: `401 AUTH_REQUIRED`

- [ ] **POST `/api/v1/magazzini`** — con token Operatore
  - Atteso: `403 ACCESS_DENIED`

### Folder: Ubicazioni — 12 test

- [ ] **POST `/api/v1/magazzini/:magId/ubicazioni`** — crea ubicazione valida
  - Usa `{{magazzino_id}}`
  - Body: `{ "corsia": 3, "scaffale": 5, "temperatura_controllata": false }`
  - Atteso: `201`, risposta include `"codice_composto": "{{magazzino_id}}-03-05"`
  - Salvare `{{ubicazione_id}}`

- [ ] **POST `/api/v1/magazzini/:magId/ubicazioni`** — slot duplicato
  - Body: stesso `{ "corsia": 3, "scaffale": 5 }`
  - Atteso: `409 DUPLICATE_ENTRY`

- [ ] **POST `/api/v1/magazzini/:magId/ubicazioni`** — magazzino inesistente
  - Usa `magId = 99999`
  - Atteso: `404 RESOURCE_NOT_FOUND`

- [ ] **POST `/api/v1/magazzini/:magId/ubicazioni`** — campo mancante
  - Body: `{ "corsia": 1 }` (senza scaffale)
  - Atteso: `400 VALIDATION_ERROR`

- [ ] **GET `/api/v1/ubicazioni/:id`** — dettaglio con codice_composto
  - Usa `{{ubicazione_id}}`
  - Atteso: `200`, campo `codice_composto` presente e formattato correttamente

- [ ] **GET `/api/v1/ubicazioni/:id`** — id inesistente
  - Atteso: `404 RESOURCE_NOT_FOUND`

- [ ] **GET `/api/v1/magazzini/:id`** — albero con ubicazione e totale_giacenza
  - Usa `{{magazzino_id}}`
  - Atteso: `200`, `ubicazioni` ha 1 elemento con `codice_composto` e `totale_giacenza: 0`

- [ ] **PATCH `/api/v1/ubicazioni/:id`** — modifica temperatura_controllata
  - Body: `{ "temperatura_controllata": true }`
  - Atteso: `200`, campo aggiornato — `codice_composto` presente nella risposta

- [ ] **PATCH `/api/v1/ubicazioni/:id/toggle`** — disattiva ubicazione
  - Atteso: `200`, `attivo: false`

- [ ] **PATCH `/api/v1/ubicazioni/:id/toggle`** — riattiva ubicazione
  - Atteso: `200`, `attivo: true`

- [ ] **GET `/api/v1/ubicazioni/:id`** — senza token
  - Atteso: `401 AUTH_REQUIRED`

- [ ] **POST `/api/v1/magazzini/:magId/ubicazioni`** — con token Resp. Acquisti
  - Atteso: `403 ACCESS_DENIED`

---

## Definition of Done

La M06 è completata quando:

- [ ] `GET /magazzini` ritorna tutti i magazzini inclusi i disattivi
- [ ] `POST /magazzini` con codice duplicato risponde `409 DUPLICATE_ENTRY`
- [ ] `PATCH /magazzini/:id` non modifica mai il campo `codice`
- [ ] `PATCH /magazzini/:id/toggle` inverte `attivo` — senza body
- [ ] `POST /magazzini/:magId/ubicazioni` con slot duplicato risponde `409 DUPLICATE_ENTRY`
- [ ] `POST /magazzini/:magId/ubicazioni` con magazzino inesistente risponde `404`
- [ ] Ogni risposta contenente ubicazioni include `codice_composto` calcolato correttamente
- [ ] `codice_composto` usa padding a 2 cifre: corsia=3 → `03`, scaffale=5 → `05`
- [ ] `GET /magazzini/:id` include `totale_giacenza` per ogni ubicazione (0 se nessuna giacenza)
- [ ] `PATCH /ubicazioni/:id/toggle` inverte `attivo` — senza body
- [ ] Tutti i 13 test Postman magazzini passano
- [ ] Tutti i 12 test Postman ubicazioni passano
- [ ] Nessun `console.log` di debug nel codice
- [ ] Codice committato su branch `feature/m06-magazzino` e PR aperta su `develop`

---

## Note per l'AI / sviluppatore

Fornire sempre come contesto:

- `logichain_schema_v2.sql` — schema completo del DB
- `src/config/db.js` — pool PostgreSQL
- `src/middleware/auth.js`, `rbac.js`, `validate.js` — da M01
- La struttura delle risposte API (STEP 10)

**Dipendenze tra milestone:**
- M07 (Giacenze): la tabella `giacenze` referenzia `ubicazioni.id`. Il LEFT JOIN in
  `findUbicazioniByMagazzino()` funziona già — restituisce `totale_giacenza = 0`
  finché M07 non inserisce dati reali.
- M09/M10: i picking e le spedizioni operano su ubicazioni esistenti — la struttura
  definita in M06 è la baseline per tutti i moduli logistici successivi.
- Il toggle `attivo` su ubicazioni sostituisce il concetto di "quarantena" o
  "manutenzione" — ubicazioni disattive non devono essere selezionabili nei
  movimenti stock (vincolo da implementare in M07).

---

*Giugno 2025 — LogiChain ERP V2.0 — CONFIDENZIALE*
*Milestone M06 — Backend Gestione Magazzino*
