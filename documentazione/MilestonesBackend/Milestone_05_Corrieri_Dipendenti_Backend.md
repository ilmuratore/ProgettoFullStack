# Milestone 05 — Anagrafiche: Corrieri & Dipendenti (Backend)
## LogiChain ERP V2 | Checklist Sviluppo

---

## Contesto

Questa milestone implementa il backend del modulo **M05 — Corrieri & Dipendenti**.
Si tratta di due registri operativi indipendenti, invariati rispetto alla V1.
**Nessuna modifica allo schema DB** — entrambe le tabelle esistono già nel DB V1.3
con la struttura corretta.

**Prerequisiti:** M01, M02, M03, M04 completate e merged su develop.
**Stack:** Node.js + Express + PostgreSQL
**Pattern:** Routes → Middleware → Controllers → Services → Queries

**Differenze comportamentali tra i due registri:**

| | Corrieri | Dipendenti |
|-|----------|------------|
| Campo `attivo` | ❌ Assente | ✅ Presente |
| DELETE | Hard delete con check FK | Soft delete (`attivo = false`) |
| GET lista | Tutti i record | Solo `attivo = true` |
| Riferimenti esterni | FK in `spedizioni` | Nessuna FK critica |

**Permessi:** Non presenti in M01 — aggiunti in questa milestone via seed esteso.

---

## Permessi da aggiungere (STEP 1)

I seguenti 6 permessi non erano nel seed originale di M01 e vanno aggiunti in questa milestone.
Il totale permessi passa da **30 a 36**.

| Codice | Descrizione |
|--------|-------------|
| `corrieri:read` | Visualizza corrieri |
| `corrieri:write` | Crea/modifica corrieri |
| `corrieri:delete` | Elimina corrieri |
| `dipendenti:read` | Visualizza dipendenti |
| `dipendenti:write` | Crea/modifica dipendenti |
| `dipendenti:delete` | Elimina dipendenti |

**Assegnazione ruoli:**

| Ruolo | corrieri:* | dipendenti:* |
|-------|-----------|--------------|
| Admin | ✅ tutti | ✅ tutti |
| Responsabile Acquisti | ❌ | ❌ |
| Responsabile Magazzino | ❌ | ❌ |
| Operatore | ❌ | ❌ |
| Corriere | ❌ | ❌ |

---

## Campi tabelle

### Tabella `corrieri`

| Campo | Tipo | Note |
|-------|------|------|
| `id` | INTEGER PK | — |
| `nome` | TEXT | — |
| `cognome` | TEXT | — |
| `email` | TEXT | — |
| `telefono` | TEXT | — |

> Nessun campo `attivo` — DELETE è hard delete con controllo FK.

### Tabella `dipendenti`

| Campo | Tipo | Note |
|-------|------|------|
| `id` | INTEGER PK | — |
| `nome` | TEXT | — |
| `cognome` | TEXT | — |
| `email` | TEXT | — |
| `telefono` | TEXT | — |
| `ruolo` | TEXT | Mansione operativa (es. "Magazziniere") — non è il ruolo RBAC di sistema |
| `attivo` | BOOLEAN | Soft delete |

---

## Struttura file da creare

```
backend/
├── seeds/
│   └── seed_m05_permessi.js                    ← NUOVO: 6 permessi + assegnazione Admin
├── src/
│   ├── queries/
│   │   ├── corrieriQueries.js                  ← NUOVO
│   │   └── dipendentiQueries.js                ← NUOVO
│   ├── services/
│   │   ├── corrieriService.js                  ← NUOVO
│   │   └── dipendentiService.js                ← NUOVO
│   ├── controllers/
│   │   ├── corrieriController.js               ← NUOVO
│   │   └── dipendentiController.js             ← NUOVO
│   └── routes/
│       ├── corrieriRoutes.js                   ← NUOVO
│       └── dipendentiRoutes.js                 ← NUOVO
```

> Nessun file di migration — zero modifiche allo schema DB.

---

## STEP 1 — Seed `seed_m05_permessi.js`

Questo seed aggiunge i 6 nuovi permessi alla tabella `permessi` e li assegna all'Admin.
Va eseguito **una volta sola** dopo il deploy. È idempotente.

- [ ] Inserisce i 6 nuovi permessi (se non esistono già):
  ```js
  // INSERT INTO permessi (codice, descrizione) VALUES (...) ON CONFLICT DO NOTHING
  'corrieri:read'    → 'Visualizza corrieri'
  'corrieri:write'   → 'Crea/modifica corrieri'
  'corrieri:delete'  → 'Elimina corrieri'
  'dipendenti:read'  → 'Visualizza dipendenti'
  'dipendenti:write' → 'Crea/modifica dipendenti'
  'dipendenti:delete'→ 'Elimina dipendenti'
  ```

- [ ] Assegna tutti e 6 i permessi al ruolo Admin (`ruolo_id = 1`):
  ```js
  // INSERT INTO ruoli_permessi (ruolo_id, permesso_id)
  // ON CONFLICT DO NOTHING
  ```

- [ ] Il seed è completamente **idempotente** — rieseguibile senza effetti collaterali
- [ ] Aggiungere il comando nel `package.json`:
  ```json
  "seed:m05": "node seeds/seed_m05_permessi.js"
  ```
- [ ] Eseguire: `npm run seed:m05`
- [ ] Verificare in psql:
  ```sql
  SELECT codice FROM permessi WHERE codice LIKE 'corrieri%' OR codice LIKE 'dipendenti%';
  -- Atteso: 6 righe
  SELECT COUNT(*) FROM ruoli_permessi rp
  JOIN permessi p ON rp.permesso_id = p.id
  WHERE rp.ruolo_id = 1 AND p.codice LIKE ANY(ARRAY['corrieri:%','dipendenti:%']);
  -- Atteso: 6
  ```

---

## CORRIERI

---

## STEP 2 — Queries `corrieriQueries.js`

Questo file contiene **solo SQL parametrizzato**. Zero business logic.

### `findAll()`

```sql
-- Nessun filtro attivo — la tabella corrieri non ha il campo attivo
SELECT id, nome, cognome, email, telefono
FROM corrieri
ORDER BY cognome ASC, nome ASC
```

### `findById(id)`

```sql
SELECT id, nome, cognome, email, telefono
FROM corrieri
WHERE id = $1
```

### `hasSpedizioni(id)`

```sql
-- Controlla se il corriere ha spedizioni associate (FK check pre-delete)
SELECT COUNT(*) AS totale
FROM spedizioni
WHERE corriere_id = $1
```

### `create(data)`

```sql
INSERT INTO corrieri (nome, cognome, email, telefono)
VALUES ($1, $2, $3, $4)
RETURNING id, nome, cognome, email, telefono
```

### `update(id, fields)`

```sql
-- Costruire dinamicamente solo i campi presenti nel body
UPDATE corrieri
SET nome = $1, cognome = $2, email = $3, telefono = $4
WHERE id = $1
RETURNING id, nome, cognome, email, telefono
```

### `hardDelete(id)`

```sql
-- DELETE fisica — eseguire SOLO dopo aver verificato hasSpedizioni = 0
DELETE FROM corrieri WHERE id = $1
RETURNING id
```

### Checklist queries corrieri

- [ ] `findAll()` — nessun filtro `attivo` (campo non esiste)
- [ ] `findById(id)` — ritorna null se non trovato
- [ ] `hasSpedizioni(id)` — usata dal service prima di ogni DELETE
- [ ] `create()` — RETURNING tutti i campi
- [ ] `update()` — costruzione dinamica, RETURNING tutti i campi
- [ ] `hardDelete()` — DELETE fisica — mai chiamata senza check FK
- [ ] Nessuna business logic in questo file

---

## STEP 3 — Service `corrieriService.js`

### `getAll()`

- [ ] Chiama `corrieriQueries.findAll()`
- [ ] Ritorna array corrieri (può essere vuoto `[]`)

### `getById(id)`

- [ ] Chiama `corrieriQueries.findById(id)`
- [ ] Se non trovato (null) → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Ritorna il corriere

### `create({ nome, cognome, email, telefono })`

- [ ] Chiama `corrieriQueries.create(dati)`
- [ ] Ritorna il corriere creato

### `update(id, { nome, cognome, email, telefono })`

- [ ] Verifica che il corriere esista: chiama `findById(id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Costruisce l'oggetto `fields` con solo i campi presenti nel body (PATCH parziale)
- [ ] Se `fields` è vuoto → lancia errore `VALIDATION_ERROR`
- [ ] Chiama `corrieriQueries.update(id, fields)`
- [ ] Ritorna il corriere aggiornato

### `delete(id)`

- [ ] Verifica che il corriere esista: chiama `findById(id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] **Controlla FK**: chiama `hasSpedizioni(id)`
- [ ] Se `totale > 0` → lancia errore `CORRIERE_CON_SPEDIZIONI`

  > Non è possibile eliminare un corriere che ha spedizioni associate.
  > Le spedizioni mantengono l'integrità storica. Risposta: `409 CONFLICT`.

- [ ] Se `totale = 0` → chiama `corrieriQueries.hardDelete(id)`
- [ ] Non ritorna dati (risposta 204)

### Checklist service corrieri

- [ ] `getById` lancia `RESOURCE_NOT_FOUND` per id inesistente
- [ ] `update` gestisce PATCH parziale
- [ ] `delete` controlla FK spedizioni prima del DELETE fisico
- [ ] `delete` ritorna `409` se il corriere ha spedizioni associate
- [ ] Nessun SQL diretto nel service

---

## STEP 4 — Controller `corrieriController.js`

### `getAll(req, res)`
- [ ] Chiama `corrieriService.getAll()`
- [ ] Risponde `200` con `{ status: 'success', data: corrieri }`

### `getById(req, res)`
- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `corrieriService.getById(id)`
- [ ] Risponde `200` con `{ status: 'success', data: corriere }`

### `create(req, res)`
- [ ] Chiama `corrieriService.create(req.body)`
- [ ] Risponde `201` con `{ status: 'success', data: corriere }`

### `update(req, res)`
- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `corrieriService.update(id, req.body)`
- [ ] Risponde `200` con `{ status: 'success', data: corriere }`

### `delete(req, res)`
- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `corrieriService.delete(id)`
- [ ] Risponde `204` senza body

### Checklist controller corrieri
- [ ] Nessuna business logic nel controller
- [ ] Errori del service mappati alla risposta HTTP corretta
- [ ] DELETE risponde `204 No Content`
- [ ] `id` sempre convertito a intero

---

## STEP 5 — Routes `corrieriRoutes.js`

### Endpoint esposti

| Metodo | Path | Middleware | Controller |
|--------|------|-----------|------------|
| `GET` | `/api/v1/corrieri` | `auth`, `requirePermesso('corrieri:read')` | `corrieriController.getAll` |
| `POST` | `/api/v1/corrieri` | `auth`, `requirePermesso('corrieri:write')`, `validate(createBlueprint)` | `corrieriController.create` |
| `GET` | `/api/v1/corrieri/:id` | `auth`, `requirePermesso('corrieri:read')` | `corrieriController.getById` |
| `PATCH` | `/api/v1/corrieri/:id` | `auth`, `requirePermesso('corrieri:write')`, `validate(updateBlueprint)` | `corrieriController.update` |
| `DELETE` | `/api/v1/corrieri/:id` | `auth`, `requirePermesso('corrieri:delete')` | `corrieriController.delete` |

### Blueprint validazione corrieri

```js
// createBlueprint — nome e cognome obbligatori
{
  nome:     { required: true,  type: 'string' },
  cognome:  { required: true,  type: 'string' },
  email:    { required: false, type: 'string' },
  telefono: { required: false, type: 'string' }
}

// updateBlueprint — tutti opzionali (PATCH parziale)
{
  nome:     { required: false, type: 'string' },
  cognome:  { required: false, type: 'string' },
  email:    { required: false, type: 'string' },
  telefono: { required: false, type: 'string' }
}
```

- [ ] Aggiungere in `server.js`:
  ```js
  app.use('/api/v1/corrieri', require('./src/routes/corrieriRoutes'));
  ```

---

## DIPENDENTI

---

## STEP 6 — Queries `dipendentiQueries.js`

### `findAll()`

```sql
-- Solo dipendenti attivi
SELECT id, nome, cognome, email, telefono, ruolo
FROM dipendenti
WHERE attivo = true
ORDER BY cognome ASC, nome ASC
```

### `findById(id)`

```sql
SELECT id, nome, cognome, email, telefono, ruolo
FROM dipendenti
WHERE id = $1 AND attivo = true
```

### `create(data)`

```sql
INSERT INTO dipendenti (nome, cognome, email, telefono, ruolo)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, nome, cognome, email, telefono, ruolo
```

### `update(id, fields)`

```sql
-- Costruire dinamicamente solo i campi presenti nel body
UPDATE dipendenti
SET nome = $1, cognome = $2, email = $3, telefono = $4, ruolo = $5
WHERE id = $6 AND attivo = true
RETURNING id, nome, cognome, email, telefono, ruolo
```

### `softDelete(id)`

```sql
UPDATE dipendenti SET attivo = false WHERE id = $1 AND attivo = true
RETURNING id
```

### Checklist queries dipendenti

- [ ] `findAll()` — solo `attivo = true`
- [ ] `findById(id)` — solo `attivo = true`
- [ ] `create()` — RETURNING tutti i campi
- [ ] `update()` — costruzione dinamica, RETURNING tutti i campi
- [ ] `softDelete()` — solo `attivo = false`, nessuna DELETE fisica
- [ ] Nessuna business logic in questo file

---

## STEP 7 — Service `dipendentiService.js`

### `getAll()`
- [ ] Chiama `dipendentiQueries.findAll()`
- [ ] Ritorna array dipendenti (può essere vuoto `[]`)

### `getById(id)`
- [ ] Chiama `dipendentiQueries.findById(id)`
- [ ] Se non trovato (null) → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Ritorna il dipendente

### `create({ nome, cognome, email, telefono, ruolo })`
- [ ] Chiama `dipendentiQueries.create(dati)`
- [ ] Ritorna il dipendente creato

### `update(id, { nome, cognome, email, telefono, ruolo })`
- [ ] Verifica che il dipendente esista: chiama `findById(id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Costruisce `fields` con solo i campi presenti nel body (PATCH parziale)
- [ ] Se `fields` è vuoto → lancia errore `VALIDATION_ERROR`
- [ ] Chiama `dipendentiQueries.update(id, fields)`
- [ ] Ritorna il dipendente aggiornato

### `delete(id)`
- [ ] Verifica che il dipendente esista: chiama `findById(id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Chiama `dipendentiQueries.softDelete(id)`
- [ ] Non ritorna dati (risposta 204)

### Checklist service dipendenti
- [ ] `getById` lancia `RESOURCE_NOT_FOUND` per id inesistente o `attivo = false`
- [ ] `update` gestisce PATCH parziale
- [ ] `delete` è soft — nessuna DELETE fisica
- [ ] Nessun SQL diretto nel service

---

## STEP 8 — Controller `dipendentiController.js`

### `getAll(req, res)`
- [ ] Chiama `dipendentiService.getAll()`
- [ ] Risponde `200` con `{ status: 'success', data: dipendenti }`

### `getById(req, res)`
- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `dipendentiService.getById(id)`
- [ ] Risponde `200` con `{ status: 'success', data: dipendente }`

### `create(req, res)`
- [ ] Chiama `dipendentiService.create(req.body)`
- [ ] Risponde `201` con `{ status: 'success', data: dipendente }`

### `update(req, res)`
- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `dipendentiService.update(id, req.body)`
- [ ] Risponde `200` con `{ status: 'success', data: dipendente }`

### `delete(req, res)`
- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `dipendentiService.delete(id)`
- [ ] Risponde `204` senza body

### Checklist controller dipendenti
- [ ] Nessuna business logic nel controller
- [ ] Errori del service mappati alla risposta HTTP corretta
- [ ] DELETE risponde `204 No Content`
- [ ] `id` sempre convertito a intero

---

## STEP 9 — Routes `dipendentiRoutes.js`

### Endpoint esposti

| Metodo | Path | Middleware | Controller |
|--------|------|-----------|------------|
| `GET` | `/api/v1/dipendenti` | `auth`, `requirePermesso('dipendenti:read')` | `dipendentiController.getAll` |
| `POST` | `/api/v1/dipendenti` | `auth`, `requirePermesso('dipendenti:write')`, `validate(createBlueprint)` | `dipendentiController.create` |
| `GET` | `/api/v1/dipendenti/:id` | `auth`, `requirePermesso('dipendenti:read')` | `dipendentiController.getById` |
| `PATCH` | `/api/v1/dipendenti/:id` | `auth`, `requirePermesso('dipendenti:write')`, `validate(updateBlueprint)` | `dipendentiController.update` |
| `DELETE` | `/api/v1/dipendenti/:id` | `auth`, `requirePermesso('dipendenti:delete')` | `dipendentiController.delete` |

### Blueprint validazione dipendenti

```js
// createBlueprint — nome e cognome obbligatori
{
  nome:     { required: true,  type: 'string' },
  cognome:  { required: true,  type: 'string' },
  email:    { required: false, type: 'string' },
  telefono: { required: false, type: 'string' },
  ruolo:    { required: false, type: 'string' }
}

// updateBlueprint — tutti opzionali (PATCH parziale)
{
  nome:     { required: false, type: 'string' },
  cognome:  { required: false, type: 'string' },
  email:    { required: false, type: 'string' },
  telefono: { required: false, type: 'string' },
  ruolo:    { required: false, type: 'string' }
}
```

- [ ] Aggiungere in `server.js`:
  ```js
  app.use('/api/v1/dipendenti', require('./src/routes/dipendentiRoutes'));
  ```

---

## STEP 10 — Formato risposte e codici errore M05

### Formato standard

```json
{ "status": "success", "data": { } }
{ "status": "error", "code": "CODICE_ERRORE", "message": "Descrizione leggibile" }
```

### Tabella codici errore M05

| HTTP | Codice | Modulo | Quando |
|------|--------|--------|--------|
| `400` | `VALIDATION_ERROR` | entrambi | Blueprint fallisce o body PATCH senza campi validi |
| `401` | `AUTH_REQUIRED` | entrambi | Token mancante o non valido |
| `403` | `ACCESS_DENIED` | entrambi | Ruolo senza il permesso richiesto |
| `404` | `RESOURCE_NOT_FOUND` | entrambi | Record non trovato (o `attivo=false` per dipendenti) |
| `409` | `CORRIERE_CON_SPEDIZIONI` | corrieri | DELETE su corriere con spedizioni associate |

---

## STEP 11 — Test Postman

Aggiungere folder **Corrieri** e folder **Dipendenti** alla collection LogiChain V2.

> **Variabili d'ambiente necessarie:**
> - `{{token_admin}}` — unico ruolo con accesso
> - `{{token_no_access}}` — Responsabile Acquisti (nessun permesso su corrieri/dipendenti)

### Folder: Corrieri — 16 test

- [ ] **GET `/api/v1/corrieri`** — lista
  - Atteso: `200`, array corrieri

- [ ] **POST `/api/v1/corrieri`** — crea corriere valido
  - Body: `{ "nome": "Marco", "cognome": "Bianchi", "telefono": "3331234567" }`
  - Atteso: `201`
  - Salvare `{{corriere_id}}`

- [ ] **POST `/api/v1/corrieri`** — campo obbligatorio mancante
  - Body: `{ "nome": "Marco" }` (senza cognome)
  - Atteso: `400 VALIDATION_ERROR`

- [ ] **GET `/api/v1/corrieri/:id`** — dettaglio
  - Atteso: `200`, tutti i campi

- [ ] **GET `/api/v1/corrieri/:id`** — id inesistente
  - Atteso: `404 RESOURCE_NOT_FOUND`

- [ ] **PATCH `/api/v1/corrieri/:id`** — modifica parziale
  - Body: `{ "email": "marco.bianchi@corriere.it" }`
  - Atteso: `200`, campo aggiornato

- [ ] **PATCH `/api/v1/corrieri/:id`** — body vuoto
  - Body: `{}`
  - Atteso: `400 VALIDATION_ERROR`

- [ ] **DELETE `/api/v1/corrieri/:id`** — corriere senza spedizioni
  - Usa `{{corriere_id}}` (appena creato, senza spedizioni)
  - Atteso: `204 No Content`

- [ ] **DELETE `/api/v1/corrieri/:id`** — corriere con spedizioni associate
  - Setup: inserire in psql un corriere e una spedizione che lo referenzia
  - Atteso: `409 CORRIERE_CON_SPEDIZIONI`

- [ ] **GET `/api/v1/corrieri/:id`** — dopo DELETE → non trovato
  - Atteso: `404 RESOURCE_NOT_FOUND`

- [ ] **GET `/api/v1/corrieri`** — corriere eliminato non compare
  - Atteso: `200`, corriere assente dalla lista

- [ ] **GET `/api/v1/corrieri`** — senza token
  - Atteso: `401 AUTH_REQUIRED`

- [ ] **POST `/api/v1/corrieri`** — con token Resp. Acquisti
  - Atteso: `403 ACCESS_DENIED`

- [ ] **PATCH `/api/v1/corrieri/:id`** — con token Resp. Magazzino
  - Atteso: `403 ACCESS_DENIED`

- [ ] **DELETE `/api/v1/corrieri/:id`** — con token Operatore
  - Atteso: `403 ACCESS_DENIED`

- [ ] **Verifica permessi seed** — token Admin ha corrieri:read/write/delete
  - Chiamare GET, POST, DELETE con `{{token_admin}}` — tutto deve funzionare

### Folder: Dipendenti — 15 test

- [ ] **GET `/api/v1/dipendenti`** — lista
  - Atteso: `200`, solo dipendenti `attivo = true`

- [ ] **POST `/api/v1/dipendenti`** — crea dipendente valido
  - Body: `{ "nome": "Luca", "cognome": "Verdi", "ruolo": "Magazziniere" }`
  - Atteso: `201`
  - Salvare `{{dipendente_id}}`

- [ ] **POST `/api/v1/dipendenti`** — campo obbligatorio mancante
  - Body: `{ "nome": "Luca" }` (senza cognome)
  - Atteso: `400 VALIDATION_ERROR`

- [ ] **GET `/api/v1/dipendenti/:id`** — dettaglio
  - Atteso: `200`, tutti i campi incluso `ruolo`

- [ ] **GET `/api/v1/dipendenti/:id`** — id inesistente
  - Atteso: `404 RESOURCE_NOT_FOUND`

- [ ] **PATCH `/api/v1/dipendenti/:id`** — modifica ruolo
  - Body: `{ "ruolo": "Responsabile Logistica" }`
  - Atteso: `200`, campo aggiornato

- [ ] **PATCH `/api/v1/dipendenti/:id`** — body vuoto
  - Body: `{}`
  - Atteso: `400 VALIDATION_ERROR`

- [ ] **DELETE `/api/v1/dipendenti/:id`** — soft delete
  - Usa `{{dipendente_id}}`
  - Atteso: `204 No Content`

- [ ] **GET `/api/v1/dipendenti/:id`** — dopo soft delete
  - Atteso: `404 RESOURCE_NOT_FOUND`

- [ ] **GET `/api/v1/dipendenti`** — dipendente eliminato non compare
  - Atteso: `200`, dipendente assente dalla lista

- [ ] **Verifica psql** — dipendente esiste ancora con `attivo = false`
  ```sql
  SELECT id, nome, attivo FROM dipendenti WHERE id = <dipendente_id>;
  -- Atteso: record presente con attivo = false
  ```

- [ ] **GET `/api/v1/dipendenti`** — senza token
  - Atteso: `401 AUTH_REQUIRED`

- [ ] **POST `/api/v1/dipendenti`** — con token Resp. Acquisti
  - Atteso: `403 ACCESS_DENIED`

- [ ] **PATCH `/api/v1/dipendenti/:id`** — con token Resp. Magazzino
  - Atteso: `403 ACCESS_DENIED`

- [ ] **DELETE `/api/v1/dipendenti/:id`** — con token Operatore
  - Atteso: `403 ACCESS_DENIED`

---

## Definition of Done

La M05 è completata quando:

- [ ] `npm run seed:m05` eseguito senza errori — 6 nuovi permessi in DB assegnati ad Admin
- [ ] Totale permessi in DB: **36** (30 da M01 + 6 da M05)
- [ ] **Corrieri:**
  - [ ] `GET /corrieri` ritorna tutti i corrieri (nessun filtro `attivo`)
  - [ ] `POST /corrieri` crea corriere e risponde `201`
  - [ ] `DELETE /corrieri/:id` con spedizioni associate risponde `409 CORRIERE_CON_SPEDIZIONI`
  - [ ] `DELETE /corrieri/:id` senza spedizioni esegue hard delete e risponde `204`
  - [ ] Tutti i 16 test Postman corrieri passano
- [ ] **Dipendenti:**
  - [ ] `GET /dipendenti` ritorna solo `attivo = true`
  - [ ] `POST /dipendenti` crea dipendente e risponde `201`
  - [ ] `DELETE /dipendenti/:id` imposta `attivo = false` — nessuna DELETE fisica
  - [ ] Tutti i 15 test Postman dipendenti passano
- [ ] Nessun `console.log` di debug nel codice
- [ ] Codice committato su branch `feature/m05-corrieri-dipendenti` e PR aperta su `develop`

---

## Note per l'AI / sviluppatore

Fornire sempre come contesto:

- `logichain_schema_v2.sql` — schema completo del DB
- `src/config/db.js` — pool PostgreSQL
- `src/middleware/auth.js`, `rbac.js`, `validate.js` — da M01
- La struttura delle risposte API (STEP 10)

**Dipendenze tra milestone:**
- M10 (Spedizioni & DDT): usa `corrieri.id` come FK — il check FK in delete di M05
  si basa sulla tabella `spedizioni` che verrà completata in M10.
  Se M10 non è ancora implementata, il check restituisce sempre `totale = 0`
  (nessuna spedizione in DB) — comportamento corretto per l'ambiente di sviluppo.
- Il campo `ruolo` in `dipendenti` è una stringa libera (mansione operativa),
  completamente separato dalla tabella `ruoli` del sistema RBAC.

---

*Giugno 2025 — LogiChain ERP V2.0 — CONFIDENZIALE*
*Milestone M05 — Backend Corrieri & Dipendenti*
