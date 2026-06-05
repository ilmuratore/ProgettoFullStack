# Milestone 03 — Anagrafiche: I nostri Fornitori (Backend)
## LogiChain ERP V2 | Checklist Sviluppo

---

## Contesto

Questa milestone implementa il backend del modulo **M03 — I nostri Fornitori**.
In V2 la sezione introduce la distinzione tra fornitori creati manualmente (`source='manual'`)
e fornitori aggiunti dall'ecosistema (`source='ecosystem'`), con logica di visibilità azioni condizionale.

**Prerequisiti:** M01 e M02 completate e merged su develop.
**Stack:** Node.js + Express + PostgreSQL
**Pattern:** Routes → Middleware → Controllers → Services → Queries

**Regola critica (FA Appendix D7):**
> Il controllo `source` è una protezione **backend**, non solo UX.
> Se `source = 'ecosystem'`, il service restituisce `403 ACCESS_DENIED` **prima** di eseguire
> qualsiasi query SQL di UPDATE. Nascondere il pulsante Modifica nel frontend è solo cosmesi.

---

## Permessi coinvolti (definiti in M01)

| Permesso | Operazione |
|----------|------------|
| `fornitori:read` | GET lista, GET dettaglio |
| `fornitori:write` | POST crea, PATCH modifica |
| `fornitori:delete` | DELETE soft delete |

**Chi può fare cosa:**

| Ruolo | Read | Write | Delete |
|-------|------|-------|--------|
| Admin | ✅ | ✅ | ✅ |
| Responsabile Acquisti | ✅ | ✅ | ✅ |
| Responsabile Magazzino | ❌ | ❌ | ❌ |
| Operatore | ❌ | ❌ | ❌ |
| Corriere | ❌ | ❌ | ❌ |

---

## Campi tabella `fornitori`

| Campo | Stato | Tipo | Note |
|-------|-------|------|------|
| `id` | V1.3 | INTEGER PK | — |
| `ragione_sociale` | V1.3 | TEXT | — |
| `piva` | V1.3 | TEXT | — |
| `indirizzo` | V1.3 | TEXT | — |
| `email` | V1.3 | TEXT | — |
| `telefono` | V1.3 | TEXT | — |
| `attivo` | V1.3 | BOOLEAN | Soft delete — esiste già |
| `created_at` | V1.3 | TIMESTAMPTZ | — |
| `updated_at` | V1.3 | TIMESTAMPTZ | Trigger fn_set_updated_at già presente |
| `source` | **NUOVO V2** | TEXT NOT NULL DEFAULT 'manual' | 'manual' o 'ecosystem' |
| `sito_web` | **NUOVO V2** | TEXT | URL sito web — nullable |
| `descrizione_aziendale` | **NUOVO V2** | TEXT | Testo esteso — nullable |

---

## Struttura file da creare

```
backend/
├── migrations/
│   └── [timestamp]_add_source_fornitori.js     ← NUOVO: migration DB
├── src/
│   ├── queries/
│   │   └── fornitoriQueries.js                 ← NUOVO: SQL puro
│   ├── services/
│   │   └── fornitoriService.js                 ← NUOVO: business logic
│   ├── controllers/
│   │   └── fornitoriController.js              ← NUOVO: handler HTTP
│   └── routes/
│       └── fornitoriRoutes.js                  ← NUOVO: path + middleware
```

---

## STEP 1 — Migration: nuovi campi su tabella `fornitori`

> ⚠️ I file migration di node-pg-migrate **non si modificano mai dopo il merge**.
> Creare un file nuovo con timestamp corrente. Seguire la naming convention del progetto.

### Campi da aggiungere

```sql
-- Distinzione origine fornitore: creato manualmente o da ecosistema
ALTER TABLE fornitori
  ADD COLUMN source TEXT NOT NULL DEFAULT 'manual';

-- Vincolo: solo valori ammessi
ALTER TABLE fornitori
  ADD CONSTRAINT chk_fornitori_source CHECK (source IN ('manual', 'ecosystem'));

-- URL sito web aziendale (nullable)
ALTER TABLE fornitori
  ADD COLUMN sito_web TEXT;

-- Descrizione estesa per scheda ecosistema (nullable)
ALTER TABLE fornitori
  ADD COLUMN descrizione_aziendale TEXT;
```

> `sito_web` e `descrizione_aziendale` sono nullable: un fornitore manual
> può essere creato senza di essi.

### Checklist migration

- [ ] File migration creato con timestamp corretto secondo convenzione progetto
- [ ] `up`: aggiunge `source` con DEFAULT e CHECK, `sito_web`, `descrizione_aziendale`
- [ ] `down`: rimuove constraint CHECK, poi i tre campi (ordine inverso)
- [ ] Migration eseguita senza errori: `npm run migrate up`
- [ ] Verificare in psql:
  ```sql
  \d fornitori
  -- Deve mostrare i 3 nuovi campi e il constraint chk_fornitori_source
  ```
- [ ] Verificare che i fornitori esistenti abbiano `source = 'manual'` (DEFAULT applicato)

---

## STEP 2 — Queries `fornitoriQueries.js`

Questo file contiene **solo SQL parametrizzato**. Zero business logic.
Importa il pool da `src/config/db.js`.

### `findAll()`

```sql
-- Lista fornitori attivi con tutti i campi necessari al frontend
-- source è incluso: il frontend lo usa per mostrare/nascondere il pulsante Modifica
SELECT id, ragione_sociale, piva, indirizzo, email, telefono,
       sito_web, descrizione_aziendale, source
FROM fornitori
WHERE attivo = true
ORDER BY ragione_sociale ASC
```

### `findById(id)`

```sql
SELECT id, ragione_sociale, piva, indirizzo, email, telefono,
       sito_web, descrizione_aziendale, source
FROM fornitori
WHERE id = $1 AND attivo = true
```

### `create(data)`

```sql
-- source viene passato dal service sempre come 'manual'
-- NON accettare source dal body utente
INSERT INTO fornitori (ragione_sociale, piva, indirizzo, email, telefono,
                       sito_web, descrizione_aziendale, source)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING id, ragione_sociale, piva, indirizzo, email, telefono,
          sito_web, descrizione_aziendale, source
```

### `update(id, fields)`

```sql
-- Costruire dinamicamente solo i campi presenti nel body
-- Esempio con tutti i campi modificabili:
UPDATE fornitori
SET ragione_sociale = $1, piva = $2, indirizzo = $3,
    email = $4, telefono = $5, sito_web = $6, descrizione_aziendale = $7
WHERE id = $8 AND attivo = true
RETURNING id, ragione_sociale, piva, indirizzo, email, telefono,
          sito_web, descrizione_aziendale, source
```

> La query UPDATE viene costruita dinamicamente nel service.
> Il campo `source` non è mai incluso nei campi aggiornabili.

### `softDelete(id)`

```sql
UPDATE fornitori SET attivo = false WHERE id = $1 AND attivo = true
RETURNING id
```

### Checklist queries

- [ ] `findAll()` — ritorna solo `attivo = true`, include `source`
- [ ] `findById(id)` — ritorna solo `attivo = true`
- [ ] `create()` — `source` passato dal service, mai dal body
- [ ] `update()` — costruzione dinamica campi, `source` mai aggiornabile
- [ ] `softDelete()` — imposta `attivo = false`, non DELETE fisica
- [ ] Nessuna business logic in questo file

---

## STEP 3 — Service `fornitoriService.js`

Il service contiene tutta la **business logic**, inclusa la protezione sul campo `source`.

### `getAll()`

- [ ] Chiama `fornitoriQueries.findAll()`
- [ ] Ritorna array fornitori (può essere vuoto `[]`)

### `getById(id)`

- [ ] Chiama `fornitoriQueries.findById(id)`
- [ ] Se non trovato (null) → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Ritorna il fornitore

### `create({ ragione_sociale, piva, indirizzo, email, telefono, sito_web, descrizione_aziendale })`

- [ ] **Forza `source = 'manual'`** — non accettare source dal body, mai
- [ ] Chiama `fornitoriQueries.create({ ...dati, source: 'manual' })`
- [ ] Ritorna il fornitore creato

### `update(id, { ragione_sociale, piva, indirizzo, email, telefono, sito_web, descrizione_aziendale })`

- [ ] Verifica che il fornitore esista: chiama `findById(id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] **Controlla `source`**: se `fornitore.source === 'ecosystem'` → lancia errore `ACCESS_DENIED`

  > Questo controllo avviene **nel service**, prima di qualsiasi UPDATE.
  > È la protezione reale — il frontend nasconde solo il pulsante.

- [ ] Costruisce l'oggetto fields con solo i campi presenti nel body (PATCH parziale)
- [ ] Se `fields` è vuoto → lancia errore `VALIDATION_ERROR`
- [ ] Il campo `source` è escluso da `fields` anche se presente nel body
- [ ] Chiama `fornitoriQueries.update(id, fields)`
- [ ] Ritorna il fornitore aggiornato

### `delete(id)`

- [ ] Verifica che il fornitore esista: chiama `findById(id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] **Nessun controllo su `source`** — il delete è sempre consentito per qualsiasi source
- [ ] Chiama `fornitoriQueries.softDelete(id)`

  > FA: "Elimina rimuove dalla lista 'I nostri Fornitori' ma NON dall'ecosistema globale."
  > Il soft delete (`attivo = false`) rimuove il fornitore da M03.
  > I moduli ecosistema (M14) useranno logica propria indipendente dal campo `attivo`.

- [ ] Non ritorna dati (risposta 204)

### Checklist service

- [ ] `create` forza sempre `source = 'manual'`
- [ ] `update` controlla `source` prima di qualsiasi modifica — `ACCESS_DENIED` se ecosystem
- [ ] `update` gestisce PATCH parziale (solo campi presenti nel body)
- [ ] `update` mai modifica il campo `source`
- [ ] `delete` non controlla `source` — soft delete consentito per entrambi
- [ ] Nessun SQL diretto nel service

---

## STEP 4 — Controller `fornitoriController.js`

### `getAll(req, res)`

- [ ] Chiama `fornitoriService.getAll()`
- [ ] Risponde `200` con `{ status: 'success', data: fornitori }`

### `getById(req, res)`

- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `fornitoriService.getById(id)`
- [ ] Risponde `200` con `{ status: 'success', data: fornitore }`

### `create(req, res)`

- [ ] Estrae campi da `req.body`
- [ ] Chiama `fornitoriService.create(body)`
- [ ] Risponde `201` con `{ status: 'success', data: fornitore }`

### `update(req, res)`

- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Estrae campi da `req.body`
- [ ] Chiama `fornitoriService.update(id, body)`
- [ ] Risponde `200` con `{ status: 'success', data: fornitore }`

### `delete(req, res)`

- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `fornitoriService.delete(id)`
- [ ] Risponde `204` senza body

### Checklist controller

- [ ] Nessuna business logic nel controller
- [ ] Tutti gli errori del service mappati alla risposta HTTP corretta
- [ ] DELETE risponde `204 No Content`
- [ ] `id` sempre convertito a intero

---

## STEP 5 — Routes `fornitoriRoutes.js`

### Endpoint esposti

| Metodo | Path | Middleware | Controller |
|--------|------|-----------|------------|
| `GET` | `/api/v1/fornitori` | `auth`, `requirePermesso('fornitori:read')` | `fornitoriController.getAll` |
| `POST` | `/api/v1/fornitori` | `auth`, `requirePermesso('fornitori:write')`, `validate(createBlueprint)` | `fornitoriController.create` |
| `GET` | `/api/v1/fornitori/:id` | `auth`, `requirePermesso('fornitori:read')` | `fornitoriController.getById` |
| `PATCH` | `/api/v1/fornitori/:id` | `auth`, `requirePermesso('fornitori:write')`, `validate(updateBlueprint)` | `fornitoriController.update` |
| `DELETE` | `/api/v1/fornitori/:id` | `auth`, `requirePermesso('fornitori:delete')` | `fornitoriController.delete` |

### Blueprint validazione

```js
// createBlueprint — ragione_sociale e piva obbligatori, resto opzionale
{
  ragione_sociale:      { required: true,  type: 'string' },
  piva:                 { required: true,  type: 'string' },
  indirizzo:            { required: false, type: 'string' },
  email:                { required: false, type: 'string' },
  telefono:             { required: false, type: 'string' },
  sito_web:             { required: false, type: 'string' },
  descrizione_aziendale:{ required: false, type: 'string' }
}

// updateBlueprint — tutti opzionali (PATCH parziale)
// Almeno un campo deve essere presente — controllo nel service
{
  ragione_sociale:      { required: false, type: 'string' },
  piva:                 { required: false, type: 'string' },
  indirizzo:            { required: false, type: 'string' },
  email:                { required: false, type: 'string' },
  telefono:             { required: false, type: 'string' },
  sito_web:             { required: false, type: 'string' },
  descrizione_aziendale:{ required: false, type: 'string' }
}
```

> Il campo `source` non è mai incluso nei blueprint — non è accettato dal body utente.

- [ ] Aggiungere in `server.js`:

```js
app.use('/api/v1/fornitori', require('./src/routes/fornitoriRoutes'));
```

### Checklist routes

- [ ] Ordine middleware corretto: `auth` → `requirePermesso` → `validate` → controller
- [ ] `validate` applicato solo a POST e PATCH
- [ ] `source` assente da entrambi i blueprint
- [ ] Rotta registrata in `server.js`

---

## STEP 6 — Formato risposte e codici errore M03

### Formato standard

```json
{ "status": "success", "data": { } }
{ "status": "error", "code": "CODICE_ERRORE", "message": "Descrizione leggibile" }
```

### Esempio risposta GET lista

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "ragione_sociale": "Acme Srl",
      "piva": "12345678901",
      "indirizzo": "Via Roma 1, Milano",
      "email": "info@acme.it",
      "telefono": "0212345678",
      "sito_web": "https://acme.it",
      "descrizione_aziendale": null,
      "source": "manual"
    }
  ]
}
```

### Tabella codici errore M03

| HTTP | Codice | Quando |
|------|--------|--------|
| `400` | `VALIDATION_ERROR` | Blueprint fallisce o body PATCH senza campi validi |
| `401` | `AUTH_REQUIRED` | Token mancante o non valido |
| `403` | `ACCESS_DENIED` | Ruolo senza permesso — oppure PATCH su fornitore `source='ecosystem'` |
| `404` | `RESOURCE_NOT_FOUND` | Fornitore non trovato o `attivo = false` |

> ⚠️ Il `403 ACCESS_DENIED` su PATCH ecosystem ha la **stessa struttura** del 403 da RBAC.
> Il `message` può essere più specifico (es. "Fornitore ecosistema non modificabile")
> ma il codice HTTP e il campo `code` sono identici.

---

## STEP 7 — Test Postman

Aggiungere folder **Fornitori** alla collection LogiChain V2.

> **Setup prerequisito per i test ecosystem:**
> Inserire direttamente in DB (via seed o psql) un fornitore con `source = 'ecosystem'`:
> ```sql
> INSERT INTO fornitori (ragione_sociale, piva, email, source)
> VALUES ('Ecosistema Srl', '99999999999', 'eco@test.it', 'ecosystem');
> ```
> Salvare il suo `id` come `{{fornitore_eco_id}}`.

> **Variabili d'ambiente necessarie:**
> - `{{token_admin}}` — Admin
> - `{{token_resp_acquisti}}` — Responsabile Acquisti
> - `{{token_no_access}}` — Operatore (nessun permesso fornitori)

### Folder: Fornitori

- [ ] **GET `/api/v1/fornitori`** — lista fornitori
  - Header: `{{token_admin}}`
  - Atteso: `200`, array con campo `source` visibile per ogni fornitore

- [ ] **POST `/api/v1/fornitori`** — crea fornitore valido
  - Body: `{ "ragione_sociale": "Acme Srl", "piva": "12345678901", "email": "info@acme.it" }`
  - Atteso: `201`, fornitore con `source: "manual"` nella risposta
  - Salvare `{{fornitore_id}}` dalla risposta

- [ ] **POST `/api/v1/fornitori`** — `source` nel body ignorato
  - Body: `{ "ragione_sociale": "Test", "piva": "11111111111", "source": "ecosystem" }`
  - Atteso: `201`, risposta ha `source: "manual"` — il source dal body è ignorato

- [ ] **POST `/api/v1/fornitori`** — campo obbligatorio mancante
  - Body: `{ "ragione_sociale": "Solo nome" }` (senza piva)
  - Atteso: `400 VALIDATION_ERROR`

- [ ] **GET `/api/v1/fornitori/:id`** — dettaglio fornitore manual
  - Usa `{{fornitore_id}}`
  - Atteso: `200`, tutti i campi incluso `source: "manual"`

- [ ] **GET `/api/v1/fornitori/:id`** — id inesistente
  - Atteso: `404 RESOURCE_NOT_FOUND`

- [ ] **PATCH `/api/v1/fornitori/:id`** — modifica fornitore manual
  - Body: `{ "telefono": "0298765432", "sito_web": "https://acme.it" }`
  - Atteso: `200`, campi aggiornati

- [ ] **PATCH `/api/v1/fornitori/:id`** — tentativo su fornitore ecosystem
  - Usa `{{fornitore_eco_id}}`
  - Body: `{ "ragione_sociale": "Modifica" }`
  - Atteso: `403 ACCESS_DENIED`

- [ ] **PATCH `/api/v1/fornitori/:id`** — `source` nel body ignorato
  - Body: `{ "ragione_sociale": "Nuovo nome", "source": "ecosystem" }`
  - Atteso: `200`, `source` nella risposta è ancora `"manual"` — non modificato

- [ ] **PATCH `/api/v1/fornitori/:id`** — body vuoto
  - Body: `{}`
  - Atteso: `400 VALIDATION_ERROR`

- [ ] **DELETE `/api/v1/fornitori/:id`** — soft delete fornitore manual
  - Usa `{{fornitore_id}}`
  - Atteso: `204 No Content`

- [ ] **DELETE `/api/v1/fornitori/:id`** — soft delete fornitore ecosystem consentito
  - Usa `{{fornitore_eco_id}}`
  - Atteso: `204 No Content` (FA: elimina sempre disponibile)

- [ ] **GET `/api/v1/fornitori/:id`** — dopo delete → non trovato
  - Atteso: `404 RESOURCE_NOT_FOUND`

- [ ] **GET `/api/v1/fornitori`** — fornitore eliminato non compare in lista
  - Atteso: `200`, i due fornitori eliminati non sono nell'array

- [ ] **GET `/api/v1/fornitori`** — senza token
  - Atteso: `401 AUTH_REQUIRED`

- [ ] **POST `/api/v1/fornitori`** — con token Operatore
  - Atteso: `403 ACCESS_DENIED`

- [ ] **PATCH `/api/v1/fornitori/:id`** — con token Responsabile Magazzino
  - Atteso: `403 ACCESS_DENIED`

- [ ] **DELETE `/api/v1/fornitori/:id`** — con token Operatore
  - Atteso: `403 ACCESS_DENIED`

---

## Definition of Done

La M03 è completata quando:

- [ ] Migration eseguita senza errori — campi `source`, `sito_web`, `descrizione_aziendale` presenti su `fornitori`
- [ ] Constraint `chk_fornitori_source` attivo — solo `'manual'` e `'ecosystem'` accettati
- [ ] Fornitori esistenti hanno `source = 'manual'` dopo la migration
- [ ] `GET /fornitori` ritorna solo `attivo = true` con campo `source`
- [ ] `POST /fornitori` crea sempre con `source = 'manual'` — anche se il body include `source`
- [ ] `PATCH /fornitori/:id` su fornitore `source='ecosystem'` risponde `403 ACCESS_DENIED`
- [ ] `PATCH /fornitori/:id` non modifica mai il campo `source`
- [ ] `DELETE /fornitori/:id` funziona per **entrambi** i source — soft delete in entrambi i casi
- [ ] Fornitore con `attivo = false` risponde `404` su GET e non compare in lista
- [ ] Tutti i 18 test Postman passano con status atteso
- [ ] Nessun `console.log` di debug nel codice
- [ ] Codice committato su branch `feature/m03-fornitori` e PR aperta su `develop`

---

## Note per l'AI / sviluppatore

Fornire sempre come contesto:

- `logichain_schema_v2.sql` — schema completo del DB
- `src/config/db.js` — pool PostgreSQL
- `src/middleware/auth.js`, `rbac.js`, `validate.js` — da M01
- La struttura delle risposte API (STEP 6)

**Dipendenze tra milestone:**
- M14 (Scheda Fornitore Ecosistema) utilizzerà la stessa tabella `fornitori`
  ma con endpoint separati sotto `/api/v1/ecosystem/` — logica indipendente da `attivo`.
- M16 (Richieste Acquisto) usa `fornitori.id` come FK in `richieste_acquisto`.
- I campi `sito_web` e `descrizione_aziendale` aggiunti in questa milestone
  vengono visualizzati nella scheda M14.

---

*Giugno 2025 — LogiChain ERP V2.0 — CONFIDENZIALE*
*Milestone M03 — Backend Fornitori — I nostri Fornitori*
