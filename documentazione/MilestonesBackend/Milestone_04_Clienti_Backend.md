# Milestone 04 — Anagrafiche: I nostri Clienti (Backend)
## LogiChain ERP V2 | Checklist Sviluppo

---

## Contesto

Questa milestone implementa il backend del modulo **M04 — I nostri Clienti**.
In V2 la sezione introduce la distinzione tra clienti creati manualmente (`source='manual'`)
e clienti provenienti dall'ecosistema (`source='ecosystem'`), con la stessa logica di
protezione già implementata in M03 per i fornitori.

**Prerequisiti:** M01, M02, M03 completate e merged su develop.
**Stack:** Node.js + Express + PostgreSQL
**Pattern:** Routes → Middleware → Controllers → Services → Queries

**Differenze chiave rispetto a M03:**
- Un solo nuovo campo DB (`source`) — nessun `sito_web` o `descrizione_aziendale`
- Solo **Admin** ha permessi su `clienti` — Responsabile Acquisti escluso
- Il soft delete preserva **obbligatoriamente** tutto lo storico transazionale (ordini, spedizioni, DDT)
- `GET /clienti/:id` restituisce solo dati base — storico operazioni implementato in milestone successive

**Regola critica (FA Appendix D9):**
> Il soft delete (`attivo = false`) rimuove il cliente dalla lista operativa
> ma tutti i riferimenti in ordini, spedizioni e DDT rimangono **intatti**.
> Non eseguire mai una DELETE fisica sulla tabella clienti.

---

## Permessi coinvolti (definiti in M01)

| Permesso | Operazione |
|----------|------------|
| `clienti:read` | GET lista, GET dettaglio |
| `clienti:write` | POST crea, PATCH modifica |
| `clienti:delete` | DELETE soft delete |

**Chi può fare cosa:**

| Ruolo | Read | Write | Delete |
|-------|------|-------|--------|
| Admin | ✅ | ✅ | ✅ |
| Responsabile Acquisti | ❌ | ❌ | ❌ |
| Responsabile Magazzino | ❌ | ❌ | ❌ |
| Operatore | ❌ | ❌ | ❌ |
| Corriere | ❌ | ❌ | ❌ |

> ⚠️ **Nota per M09 (Sales Orders):** Quando verrà implementato M09, l'Operatore
> dovrà selezionare un cliente per creare un ordine. Valutare in quella milestone
> se aggiungere `clienti:read` all'Operatore per gli endpoint di lookup.

---

## Campi tabella `clienti`

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

---

## Struttura file da creare

```
backend/
├── migrations/
│   └── [timestamp]_add_source_clienti.js      ← NUOVO: migration DB
├── src/
│   ├── queries/
│   │   └── clientiQueries.js                  ← NUOVO: SQL puro
│   ├── services/
│   │   └── clientiService.js                  ← NUOVO: business logic
│   ├── controllers/
│   │   └── clientiController.js               ← NUOVO: handler HTTP
│   └── routes/
│       └── clientiRoutes.js                   ← NUOVO: path + middleware
```

---

## STEP 1 — Migration: nuovo campo su tabella `clienti`

> ⚠️ I file migration di node-pg-migrate **non si modificano mai dopo il merge**.
> Creare un file nuovo con timestamp corrente. Seguire la naming convention del progetto.

### Campo da aggiungere

```sql
-- Distinzione origine cliente: creato manualmente o da ecosistema
ALTER TABLE clienti
  ADD COLUMN source TEXT NOT NULL DEFAULT 'manual';

-- Vincolo: solo valori ammessi
ALTER TABLE clienti
  ADD CONSTRAINT chk_clienti_source CHECK (source IN ('manual', 'ecosystem'));
```

> A differenza di M03 (fornitori), **non ci sono altri nuovi campi**.
> Solo `source` viene aggiunto alla tabella clienti in V2.

### Checklist migration

- [ ] File migration creato con timestamp corretto secondo convenzione progetto
- [ ] `up`: aggiunge `source` con DEFAULT `'manual'` e constraint CHECK
- [ ] `down`: rimuove constraint `chk_clienti_source`, poi il campo `source`
- [ ] Migration eseguita senza errori: `npm run migrate up`
- [ ] Verificare in psql:
  ```sql
  \d clienti
  -- Deve mostrare il campo source e il constraint chk_clienti_source
  ```
- [ ] Verificare che i clienti esistenti abbiano `source = 'manual'` (DEFAULT applicato)

---

## STEP 2 — Queries `clientiQueries.js`

Questo file contiene **solo SQL parametrizzato**. Zero business logic.
Importa il pool da `src/config/db.js`.

### `findAll()`

```sql
-- Lista clienti attivi con tutti i campi
-- source incluso: il frontend lo usa per mostrare/nascondere il pulsante Modifica
SELECT id, ragione_sociale, piva, indirizzo, email, telefono, source
FROM clienti
WHERE attivo = true
ORDER BY ragione_sociale ASC
```

### `findById(id)`

```sql
SELECT id, ragione_sociale, piva, indirizzo, email, telefono, source
FROM clienti
WHERE id = $1 AND attivo = true
```

### `create(data)`

```sql
-- source viene passato dal service sempre come 'manual'
-- NON accettare source dal body utente
INSERT INTO clienti (ragione_sociale, piva, indirizzo, email, telefono, source)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, ragione_sociale, piva, indirizzo, email, telefono, source
```

### `update(id, fields)`

```sql
-- Costruire dinamicamente solo i campi presenti nel body
-- Esempio con tutti i campi modificabili:
UPDATE clienti
SET ragione_sociale = $1, piva = $2, indirizzo = $3,
    email = $4, telefono = $5
WHERE id = $6 AND attivo = true
RETURNING id, ragione_sociale, piva, indirizzo, email, telefono, source
```

> La query UPDATE viene costruita dinamicamente nel service.
> Il campo `source` non è mai incluso nei campi aggiornabili.

### `softDelete(id)`

```sql
-- Soft delete: imposta attivo = false
-- Tutti i riferimenti in ordini, spedizioni, DDT rimangono intatti per FK
UPDATE clienti SET attivo = false WHERE id = $1 AND attivo = true
RETURNING id
```

### Checklist queries

- [ ] `findAll()` — solo `attivo = true`, include `source`
- [ ] `findById(id)` — solo `attivo = true`
- [ ] `create()` — `source` passato dal service, mai dal body
- [ ] `update()` — costruzione dinamica, `source` mai aggiornabile
- [ ] `softDelete()` — solo `attivo = false`, nessuna DELETE fisica mai
- [ ] Nessuna business logic in questo file

---

## STEP 3 — Service `clientiService.js`

Il service contiene tutta la **business logic**, inclusa la protezione sul campo `source`.

### `getAll()`

- [ ] Chiama `clientiQueries.findAll()`
- [ ] Ritorna array clienti (può essere vuoto `[]`)

### `getById(id)`

- [ ] Chiama `clientiQueries.findById(id)`
- [ ] Se non trovato (null) → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Ritorna il cliente

### `create({ ragione_sociale, piva, indirizzo, email, telefono })`

- [ ] **Forza `source = 'manual'`** — non accettare source dal body, mai
- [ ] Chiama `clientiQueries.create({ ...dati, source: 'manual' })`
- [ ] Ritorna il cliente creato

### `update(id, { ragione_sociale, piva, indirizzo, email, telefono })`

- [ ] Verifica che il cliente esista: chiama `findById(id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] **Controlla `source`**: se `cliente.source === 'ecosystem'` → lancia errore `ACCESS_DENIED`

  > Stesso pattern di M03. Il controllo avviene **nel service**, prima di qualsiasi UPDATE.
  > È la protezione reale — il frontend nasconde solo il pulsante.

- [ ] Costruisce l'oggetto `fields` con solo i campi presenti nel body (PATCH parziale)
- [ ] Se `fields` è vuoto → lancia errore `VALIDATION_ERROR`
- [ ] Il campo `source` è escluso da `fields` anche se presente nel body
- [ ] Chiama `clientiQueries.update(id, fields)`
- [ ] Ritorna il cliente aggiornato

### `delete(id)`

- [ ] Verifica che il cliente esista: chiama `findById(id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] **Nessun controllo su `source`** — il delete è sempre consentito per qualsiasi source
- [ ] Chiama `clientiQueries.softDelete(id)`

  > FA Appendix D9: il soft delete non rompe nessuna FK — ordini, spedizioni e DDT
  > del cliente restano intatti. Il cliente sparisce dalla lista operativa,
  > ma lo storico transazionale è preservato per integrità dati.

- [ ] Non ritorna dati (risposta 204)

### Checklist service

- [ ] `create` forza sempre `source = 'manual'`
- [ ] `update` controlla `source` prima di qualsiasi modifica — `ACCESS_DENIED` se ecosystem
- [ ] `update` gestisce PATCH parziale (solo campi presenti nel body)
- [ ] `update` mai modifica il campo `source`
- [ ] `delete` non controlla `source` — soft delete consentito per entrambi
- [ ] Nessun SQL diretto nel service

---

## STEP 4 — Controller `clientiController.js`

### `getAll(req, res)`

- [ ] Chiama `clientiService.getAll()`
- [ ] Risponde `200` con `{ status: 'success', data: clienti }`

### `getById(req, res)`

- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `clientiService.getById(id)`
- [ ] Risponde `200` con `{ status: 'success', data: cliente }`

### `create(req, res)`

- [ ] Estrae campi da `req.body`
- [ ] Chiama `clientiService.create(body)`
- [ ] Risponde `201` con `{ status: 'success', data: cliente }`

### `update(req, res)`

- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Estrae campi da `req.body`
- [ ] Chiama `clientiService.update(id, body)`
- [ ] Risponde `200` con `{ status: 'success', data: cliente }`

### `delete(req, res)`

- [ ] Estrae `id` da `req.params.id` — converte a intero
- [ ] Chiama `clientiService.delete(id)`
- [ ] Risponde `204` senza body

### Checklist controller

- [ ] Nessuna business logic nel controller
- [ ] Tutti gli errori del service mappati alla risposta HTTP corretta
- [ ] DELETE risponde `204 No Content`
- [ ] `id` sempre convertito a intero

---

## STEP 5 — Routes `clientiRoutes.js`

### Endpoint esposti

| Metodo | Path | Middleware | Controller |
|--------|------|-----------|------------|
| `GET` | `/api/v1/clienti` | `auth`, `requirePermesso('clienti:read')` | `clientiController.getAll` |
| `POST` | `/api/v1/clienti` | `auth`, `requirePermesso('clienti:write')`, `validate(createBlueprint)` | `clientiController.create` |
| `GET` | `/api/v1/clienti/:id` | `auth`, `requirePermesso('clienti:read')` | `clientiController.getById` |
| `PATCH` | `/api/v1/clienti/:id` | `auth`, `requirePermesso('clienti:write')`, `validate(updateBlueprint)` | `clientiController.update` |
| `DELETE` | `/api/v1/clienti/:id` | `auth`, `requirePermesso('clienti:delete')` | `clientiController.delete` |

### Blueprint validazione

```js
// createBlueprint — ragione_sociale e piva obbligatori, resto opzionale
{
  ragione_sociale: { required: true,  type: 'string' },
  piva:            { required: true,  type: 'string' },
  indirizzo:       { required: false, type: 'string' },
  email:           { required: false, type: 'string' },
  telefono:        { required: false, type: 'string' }
}

// updateBlueprint — tutti opzionali (PATCH parziale)
// Almeno un campo deve essere presente — controllo nel service
{
  ragione_sociale: { required: false, type: 'string' },
  piva:            { required: false, type: 'string' },
  indirizzo:       { required: false, type: 'string' },
  email:           { required: false, type: 'string' },
  telefono:        { required: false, type: 'string' }
}
```

> Il campo `source` non è mai incluso nei blueprint.
> Non accettato dal body in nessuna operazione.

- [ ] Aggiungere in `server.js`:

```js
app.use('/api/v1/clienti', require('./src/routes/clientiRoutes'));
```

### Checklist routes

- [ ] Ordine middleware corretto: `auth` → `requirePermesso` → `validate` → controller
- [ ] `validate` applicato solo a POST e PATCH
- [ ] `source` assente da entrambi i blueprint
- [ ] Rotta registrata in `server.js`

---

## STEP 6 — Formato risposte e codici errore M04

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
      "ragione_sociale": "Beta Spa",
      "piva": "98765432101",
      "indirizzo": "Via Verdi 5, Roma",
      "email": "info@beta.it",
      "telefono": "0698765432",
      "source": "manual"
    }
  ]
}
```

### Tabella codici errore M04

| HTTP | Codice | Quando |
|------|--------|--------|
| `400` | `VALIDATION_ERROR` | Blueprint fallisce o body PATCH senza campi validi |
| `401` | `AUTH_REQUIRED` | Token mancante o non valido |
| `403` | `ACCESS_DENIED` | Ruolo senza permesso — oppure PATCH su cliente `source='ecosystem'` |
| `404` | `RESOURCE_NOT_FOUND` | Cliente non trovato o `attivo = false` |

> Il `403 ACCESS_DENIED` su PATCH ecosystem usa la stessa struttura del 403 RBAC.
> Il `message` può essere più specifico (es. "Cliente ecosistema non modificabile").

---

## STEP 7 — Test Postman

Aggiungere folder **Clienti** alla collection LogiChain V2.

> **Setup prerequisito per i test ecosystem:**
> Inserire direttamente in DB (via seed o psql) un cliente con `source = 'ecosystem'`:
> ```sql
> INSERT INTO clienti (ragione_sociale, piva, email, source)
> VALUES ('Ecosistema Client Srl', '88888888888', 'eco@client.it', 'ecosystem');
> ```
> Salvare il suo `id` come `{{cliente_eco_id}}`.

> **Variabili d'ambiente necessarie:**
> - `{{token_admin}}` — unico ruolo con accesso a clienti
> - `{{token_no_access}}` — Responsabile Acquisti (nessun permesso clienti)
> - `{{token_operatore}}` — Operatore (nessun permesso clienti)

### Folder: Clienti

- [ ] **GET `/api/v1/clienti`** — lista clienti
  - Header: `{{token_admin}}`
  - Atteso: `200`, array con campo `source` per ogni cliente

- [ ] **POST `/api/v1/clienti`** — crea cliente valido
  - Body: `{ "ragione_sociale": "Beta Spa", "piva": "98765432101", "email": "info@beta.it" }`
  - Atteso: `201`, cliente con `source: "manual"` nella risposta
  - Salvare `{{cliente_id}}` dalla risposta

- [ ] **POST `/api/v1/clienti`** — `source` nel body ignorato
  - Body: `{ "ragione_sociale": "Gamma Srl", "piva": "11122233344", "source": "ecosystem" }`
  - Atteso: `201`, risposta ha `source: "manual"` — il source dal body è ignorato

- [ ] **POST `/api/v1/clienti`** — campo obbligatorio mancante
  - Body: `{ "ragione_sociale": "Solo nome" }` (senza piva)
  - Atteso: `400 VALIDATION_ERROR`

- [ ] **GET `/api/v1/clienti/:id`** — dettaglio cliente manual
  - Usa `{{cliente_id}}`
  - Atteso: `200`, tutti i campi incluso `source: "manual"`

- [ ] **GET `/api/v1/clienti/:id`** — id inesistente
  - Atteso: `404 RESOURCE_NOT_FOUND`

- [ ] **PATCH `/api/v1/clienti/:id`** — modifica cliente manual
  - Body: `{ "telefono": "0612345678", "indirizzo": "Via Nuova 10, Roma" }`
  - Atteso: `200`, campi aggiornati — `source` invariato

- [ ] **PATCH `/api/v1/clienti/:id`** — tentativo su cliente ecosystem
  - Usa `{{cliente_eco_id}}`
  - Body: `{ "ragione_sociale": "Modifica" }`
  - Atteso: `403 ACCESS_DENIED`

- [ ] **PATCH `/api/v1/clienti/:id`** — `source` nel body ignorato
  - Body: `{ "ragione_sociale": "Nuovo nome", "source": "ecosystem" }`
  - Atteso: `200`, `source` nella risposta è ancora `"manual"` — non modificato

- [ ] **PATCH `/api/v1/clienti/:id`** — body vuoto
  - Body: `{}`
  - Atteso: `400 VALIDATION_ERROR`

- [ ] **DELETE `/api/v1/clienti/:id`** — soft delete cliente manual
  - Usa `{{cliente_id}}`
  - Atteso: `204 No Content`

- [ ] **DELETE `/api/v1/clienti/:id`** — soft delete cliente ecosystem consentito
  - Usa `{{cliente_eco_id}}`
  - Atteso: `204 No Content` (FA: elimina sempre disponibile)

- [ ] **GET `/api/v1/clienti/:id`** — dopo delete → non trovato
  - Atteso: `404 RESOURCE_NOT_FOUND`

- [ ] **GET `/api/v1/clienti`** — clienti eliminati non compaiono in lista
  - Atteso: `200`, i clienti eliminati non sono nell'array

- [ ] **GET `/api/v1/clienti`** — senza token
  - Atteso: `401 AUTH_REQUIRED`

- [ ] **POST `/api/v1/clienti`** — con token Responsabile Acquisti
  - Atteso: `403 ACCESS_DENIED`

- [ ] **PATCH `/api/v1/clienti/:id`** — con token Responsabile Magazzino
  - Atteso: `403 ACCESS_DENIED`

- [ ] **DELETE `/api/v1/clienti/:id`** — con token Operatore
  - Atteso: `403 ACCESS_DENIED`

### Verifica integrità storico (DB — non Postman)

Dopo il soft delete, verificare via psql che lo storico transazionale sia intatto:

```sql
-- Verificare che il cliente abbia attivo = false ma esista ancora
SELECT id, ragione_sociale, attivo FROM clienti WHERE id = <cliente_id>;
-- Atteso: record presente con attivo = false

-- Verificare che gli eventuali ordini collegati esistano ancora
SELECT id, cliente_id FROM sales_orders WHERE cliente_id = <cliente_id>;
-- Atteso: ordini presenti (FK non rotta)
```

---

## Definition of Done

La M04 è completata quando:

- [ ] Migration eseguita senza errori — campo `source` e constraint `chk_clienti_source` presenti su `clienti`
- [ ] Clienti esistenti hanno `source = 'manual'` dopo la migration
- [ ] `GET /clienti` ritorna solo `attivo = true` con campo `source`
- [ ] `POST /clienti` crea sempre con `source = 'manual'` — anche se il body include `source`
- [ ] `PATCH /clienti/:id` su cliente `source='ecosystem'` risponde `403 ACCESS_DENIED`
- [ ] `PATCH /clienti/:id` non modifica mai il campo `source`
- [ ] `DELETE /clienti/:id` funziona per **entrambi** i source — soft delete in entrambi i casi
- [ ] Cliente con `attivo = false` risponde `404` su GET e non compare in lista
- [ ] Verifica psql: dopo soft delete il record esiste ancora con `attivo = false`
- [ ] Tutti i 18 test Postman passano con status atteso
- [ ] Nessun `console.log` di debug nel codice
- [ ] Codice committato su branch `feature/m04-clienti` e PR aperta su `develop`

---

## Note per l'AI / sviluppatore

Fornire sempre come contesto:

- `logichain_schema_v2.sql` — schema completo del DB
- `src/config/db.js` — pool PostgreSQL
- `src/middleware/auth.js`, `rbac.js`, `validate.js` — da M01
- La struttura delle risposte API (STEP 6)

**Dipendenze tra milestone:**
- M09 (Sales Orders): quando implementato, verificare se l'Operatore necessita di
  `clienti:read` per selezionare clienti nella creazione ordini. Se sì, aggiornare
  il seed permessi con una migration su `ruoli_permessi`.
- M04 implementa solo dati base. Lo storico operazioni completo (ordini, spedizioni,
  fatturato, ultimo acquisto) sarà aggiunto all'endpoint `GET /clienti/:id` in una
  milestone dedicata, dopo che M08 e M09 saranno disponibili.

---

*Giugno 2025 — LogiChain ERP V2.0 — CONFIDENZIALE*
*Milestone M04 — Backend Clienti — I nostri Clienti*
