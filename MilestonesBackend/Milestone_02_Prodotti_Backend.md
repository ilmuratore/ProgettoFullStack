# Milestone 02 — Anagrafiche: I nostri Prodotti (Backend)

## LogiChain ERP V2 | Checklist Sviluppo

---

## Contesto

Questa milestone implementa il backend del modulo **M02 — I nostri Prodotti**, che in V2 assume il ruolo di **Listino Prezzi Aziendale**. Rispetto alla V1, la sezione è rinominata e semplificata: espone solo nome, SKU, prezzo e data aggiornamento prezzo.

**Prerequisiti:** M01 completata e merged su develop.
**Stack:** Node.js + Express + PostgreSQL
**Pattern:** Routes → Middleware → Controllers → Services → Models

**Permessi coinvolti (definiti in M01):**

| Permesso          | Operazione                |
| ----------------- | ------------------------- |
| `prodotti:read`   | GET lista, GET dettaglio  |
| `prodotti:write`  | POST crea, PATCH modifica |
| `prodotti:delete` | DELETE soft delete        |

**Chi può fare cosa:**

| Ruolo                  | Read | Write | Delete |
| ---------------------- | ---- | ----- | ------ |
| Admin                  | ✅   | ✅    | ✅     |
| Responsabile Acquisti  | ✅   | ❌    | ❌     |
| Responsabile Magazzino | ✅   | ❌    | ❌     |
| Operatore              | ✅   | ❌    | ❌     |
| Corriere               | ❌   | ❌    | ❌     |

---

## Struttura file da creare

```
backend/
├── migrations/
│   └── [timestamp]_add_prezzo_prodotti.js     ← NUOVO: migration DB
├── src/
│   ├── models/
│   │   └── prodottiModel.js                 ← NUOVO: SQL puro
│   ├── services/
│   │   └── prodottiService.js                 ← NUOVO: business logic
│   ├── controllers/
│   │   └── prodottiController.js              ← NUOVO: handler HTTP
│   └── routes/
│       └── prodottiRoutes.js                  ← NUOVO: path + middleware
```

---

## STEP 1 — Migration: nuovi campi su tabella `prodotti`

La migration aggiunge i due nuovi campi richiesti dalla FA V2 e il trigger dedicato
per l'aggiornamento automatico di `data_agg_prezzo`.

> ⚠️ I file migration di node-pg-migrate **non si modificano mai dopo il merge**.
> Creare un file nuovo con timestamp corrente. Seguire la naming convention del progetto.

### Campi da aggiungere

```sql
-- Aggiunge prezzo al listino aziendale
ALTER TABLE prodotti
  ADD COLUMN prezzo NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Aggiunge timestamp aggiornamento prezzo
ALTER TABLE prodotti
  ADD COLUMN data_agg_prezzo TIMESTAMPTZ DEFAULT NOW();
```

### Trigger `data_agg_prezzo`

Il trigger aggiorna `data_agg_prezzo` **solo quando il valore di `prezzo` cambia**,
non ad ogni UPDATE generico (comportamento diverso da `fn_set_updated_at`).

```sql
CREATE OR REPLACE FUNCTION fn_set_data_agg_prezzo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.prezzo IS DISTINCT FROM OLD.prezzo THEN
    NEW.data_agg_prezzo = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_data_agg_prezzo
BEFORE UPDATE ON prodotti
FOR EACH ROW
EXECUTE FUNCTION fn_set_data_agg_prezzo();
```

> **`IS DISTINCT FROM`** gestisce correttamente anche i confronti con NULL,
> a differenza del semplice `!=`.

### Checklist migration

- [ ] File migration creato con timestamp corretto secondo convenzione progetto
- [ ] `up`: aggiunge `prezzo`, `data_agg_prezzo`, funzione trigger, trigger
- [ ] `down`: rimuove trigger, funzione, colonne (rollback pulito)
- [ ] Migration eseguita senza errori: `npm run migrate up`
- [ ] Verificare in psql che i campi esistano su `prodotti` e il trigger sia attivo:
  ```sql
  \d prodotti
  SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'prodotti';
  ```

---

## STEP 2 — Model `prodottiModel.js`

Questo file contiene **solo SQL parametrizzato**. Zero business logic.
Importa il pool da `src/config/db.js`.

### `findAll()`

```js
// Ritorna tutti i prodotti attivi ordinati per nome
// Campi esposti: solo quelli del Listino Prezzi Aziendale (FA M02)
SELECT id, nome, sku, prezzo, data_agg_prezzo
FROM prodotti
WHERE attivo = true
ORDER BY nome ASC
```

### `findById(id)`

```js
SELECT id, nome, sku, prezzo, data_agg_prezzo
FROM prodotti
WHERE id = $1 AND attivo = true
```

### `findBySku(sku)`

```js
-- Usata dal service per verifica unicità SKU (esclude eventualmente l'id corrente in PATCH)
SELECT id FROM prodotti WHERE sku = $1 AND attivo = true
```

### `findBySkuExcludingId(sku, id)`

```js
-- Usata in PATCH per verificare che lo SKU non sia già usato da un altro prodotto
SELECT id FROM prodotti WHERE sku = $1 AND id != $2 AND attivo = true
```

### `create(nome, sku, prezzo)`

```js
INSERT INTO prodotti (nome, sku, prezzo)
VALUES ($1, $2, $3)
RETURNING id, nome, sku, prezzo, data_agg_prezzo
```

### `update(id, fields)`

```js
-- Costruire dinamicamente solo i campi presenti nel body
-- Esempio con tutti i campi:
UPDATE prodotti
SET nome = $1, sku = $2, prezzo = $3
WHERE id = $4 AND attivo = true
RETURNING id, nome, sku, prezzo, data_agg_prezzo
```

> La query UPDATE deve essere costruita dinamicamente nel service in base
> ai campi effettivamente presenti nel body (PATCH parziale).
> Il trigger `trg_data_agg_prezzo` aggiornerà `data_agg_prezzo` automaticamente
> se `prezzo` è tra i campi modificati.

### `softDelete(id)`

```js
UPDATE prodotti SET attivo = false WHERE id = $1 AND attivo = true
RETURNING id
```

### Checklist queries

- [ ] `findAll()` — ritorna solo `attivo = true`, campi corretti
- [ ] `findById(id)` — ritorna solo `attivo = true`
- [ ] `findBySku(sku)` — usata per controllo unicità in POST
- [ ] `findBySkuExcludingId(sku, id)` — usata per controllo unicità in PATCH
- [ ] `create()` — RETURNING campi completi
- [ ] `update()` — costruzione dinamica campi, RETURNING campi completi
- [ ] `softDelete()` — imposta `attivo = false`, non DELETE fisica
- [ ] Nessuna business logic in questo file — solo SQL e parametri

---

## STEP 3 — Service `prodottiService.js`

Il service contiene tutta la **business logic**: validazioni semantiche, controlli unicità,
gestione errori di dominio. Non fa mai SQL diretto — usa sempre le queries.

### `getAll()`

- [ ] Chiama `prodottiModel.findAll()`
- [ ] Ritorna array prodotti (può essere vuoto `[]`)

### `getById(id)`

- [ ] Chiama `prodottiModel.findById(id)`
- [ ] Se non trovato (null) → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Ritorna il prodotto

### `create({ nome, sku, prezzo })`

- [ ] Verifica che SKU non esista già: chiama `findBySku(sku)`
- [ ] Se SKU già presente → lancia errore `DUPLICATE_ENTRY`
- [ ] Chiama `prodottiModel.create(nome, sku, prezzo)`
- [ ] Ritorna il prodotto creato

### `update(id, { nome, sku, prezzo })`

- [ ] Verifica che il prodotto esista: chiama `findById(id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Se `sku` è presente nel body → verifica che non sia già usato da un altro prodotto:
      chiama `findBySkuExcludingId(sku, id)`
- [ ] Se SKU già usato da altro prodotto → lancia errore `DUPLICATE_ENTRY`
- [ ] Costruisce l'oggetto fields con solo i campi presenti nel body (PATCH parziale)
- [ ] Se `fields` è vuoto (body senza campi validi) → lancia errore `VALIDATION_ERROR`
- [ ] Chiama `prodottiModel.update(id, fields)`
- [ ] Ritorna il prodotto aggiornato

### `delete(id)`

- [ ] Verifica che il prodotto esista: chiama `findById(id)`
- [ ] Se non trovato → lancia errore `RESOURCE_NOT_FOUND`
- [ ] Chiama `prodottiModel.softDelete(id)`
- [ ] Non ritorna dati (risposta 204)

### Checklist service

- [ ] `getAll` ritorna `[]` se non ci sono prodotti (non è un errore)
- [ ] `getById` lancia `RESOURCE_NOT_FOUND` per id inesistente o `attivo = false`
- [ ] `create` controlla unicità SKU prima dell'INSERT
- [ ] `update` controlla unicità SKU escludendo il prodotto stesso
- [ ] `update` gestisce PATCH parziale (solo i campi presenti nel body)
- [ ] `delete` è soft (imposta `attivo = false`)
- [ ] Nessun SQL diretto nel service

---

## STEP 4 — Controller `prodottiController.js`

Il controller **non contiene logica**: estrae parametri da `req`, chiama il service,
costruisce la risposta. Gestisce la mappatura errori service → HTTP response.

### `getAll(req, res)`

- [ ] Chiama `prodottiService.getAll()`
- [ ] Risponde `200` con `{ status: 'success', data: prodotti }`

### `getById(req, res)`

- [ ] Estrae `id` da `req.params.id`
- [ ] Chiama `prodottiService.getById(id)`
- [ ] Risponde `200` con `{ status: 'success', data: prodotto }`

### `create(req, res)`

- [ ] Estrae `{ nome, sku, prezzo }` da `req.body`
- [ ] Chiama `prodottiService.create({ nome, sku, prezzo })`
- [ ] Risponde `201` con `{ status: 'success', data: prodotto }`

### `update(req, res)`

- [ ] Estrae `id` da `req.params.id`
- [ ] Estrae `{ nome, sku, prezzo }` da `req.body` (solo campi presenti)
- [ ] Chiama `prodottiService.update(id, body)`
- [ ] Risponde `200` con `{ status: 'success', data: prodotto }`

### `delete(req, res)`

- [ ] Estrae `id` da `req.params.id`
- [ ] Chiama `prodottiService.delete(id)`
- [ ] Risponde `204` senza body

### Checklist controller

- [ ] Nessuna business logic nel controller
- [ ] Tutti gli errori del service vengono catturati e mappati alla risposta HTTP corretta
- [ ] DELETE risponde `204 No Content` (nessun body)
- [ ] I parametri `id` vengono convertiti a intero prima di passarli al service

---

## STEP 5 — Routes `prodottiRoutes.js`

### Endpoint esposti

| Metodo   | Path                   | Middleware                                                               | Controller                   |
| -------- | ---------------------- | ------------------------------------------------------------------------ | ---------------------------- |
| `GET`    | `/api/v1/prodotti`     | `auth`, `requirePermesso('prodotti:read')`                               | `prodottiController.getAll`  |
| `POST`   | `/api/v1/prodotti`     | `auth`, `requirePermesso('prodotti:write')`, `validate(createBlueprint)` | `prodottiController.create`  |
| `GET`    | `/api/v1/prodotti/:id` | `auth`, `requirePermesso('prodotti:read')`                               | `prodottiController.getById` |
| `PATCH`  | `/api/v1/prodotti/:id` | `auth`, `requirePermesso('prodotti:write')`, `validate(updateBlueprint)` | `prodottiController.update`  |
| `DELETE` | `/api/v1/prodotti/:id` | `auth`, `requirePermesso('prodotti:delete')`                             | `prodottiController.delete`  |

### Blueprint validazione

```js
// createBlueprint — tutti i campi obbligatori
{
  nome:   { required: true,  type: 'string' },
  sku:    { required: true,  type: 'string' },
  prezzo: { required: true,  type: 'number', min: 0.01 }
}

// updateBlueprint — tutti i campi opzionali (PATCH parziale)
// Almeno un campo deve essere presente — controllo nel service
{
  nome:   { required: false, type: 'string' },
  sku:    { required: false, type: 'string' },
  prezzo: { required: false, type: 'number', min: 0.01 }
}
```

> `prezzo` deve essere `> 0` (min: 0.01). Un prezzo di 0 non è valido per un listino.

- [ ] Aggiungere in `server.js`:

```js
app.use("/api/v1/prodotti", require("./src/routes/prodottiRoutes"));
```

### Checklist routes

- [ ] Ordine middleware corretto: `auth` → `requirePermesso` → `validate` → controller
- [ ] `validate` applicato solo a POST e PATCH (non a GET e DELETE)
- [ ] Rotta registrata in `server.js`

---

## STEP 6 — Formato risposte e codici errore M02

### Formato standard (invariato da M01)

```json
{ "status": "success", "data": { } }
{ "status": "error", "code": "CODICE_ERRORE", "message": "Descrizione leggibile" }
```

### Esempi risposta GET lista

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nome": "Vite M6x20",
      "sku": "VIT-M6-020",
      "prezzo": "1.25",
      "data_agg_prezzo": "2025-06-01T10:30:00.000Z"
    }
  ]
}
```

### Tabella codici errore M02

| HTTP  | Codice               | Quando                                                              |
| ----- | -------------------- | ------------------------------------------------------------------- |
| `400` | `VALIDATION_ERROR`   | Body non supera blueprint (campo mancante, tipo errato, prezzo ≤ 0) |
| `401` | `AUTH_REQUIRED`      | Token mancante o non valido                                         |
| `403` | `ACCESS_DENIED`      | Ruolo senza il permesso richiesto                                   |
| `404` | `RESOURCE_NOT_FOUND` | Prodotto non trovato o `attivo = false`                             |
| `409` | `DUPLICATE_ENTRY`    | SKU già presente su altro prodotto attivo                           |

---

## STEP 7 — Test Postman

Aggiungere folder **Prodotti** alla collection LogiChain V2.

> Preparare variabili d'ambiente:
>
> - `{{token_admin}}` — token Admin (tutti i permessi)
> - `{{token_read_only}}` — token Operatore (solo `prodotti:read`)
> - `{{token_no_access}}` — token Corriere (nessun permesso prodotti)

### Folder: Prodotti

- [ ] **GET `/api/v1/prodotti`** — lista prodotti
  - Header: `{{token_admin}}`
  - Atteso: `200`, array (anche vuoto `[]`)

- [ ] **POST `/api/v1/prodotti`** — crea prodotto valido
  - Body: `{ "nome": "Vite M6x20", "sku": "VIT-M6-020", "prezzo": 1.25 }`
  - Atteso: `201`, prodotto con `id`, `data_agg_prezzo`
  - Salvare `{{prodotto_id}}` dalla risposta

- [ ] **POST `/api/v1/prodotti`** — SKU duplicato
  - Body: stesso SKU del test precedente
  - Atteso: `409 DUPLICATE_ENTRY`

- [ ] **POST `/api/v1/prodotti`** — prezzo = 0
  - Body: `{ "nome": "Test", "sku": "TEST-001", "prezzo": 0 }`
  - Atteso: `400 VALIDATION_ERROR`

- [ ] **POST `/api/v1/prodotti`** — prezzo negativo
  - Body: `{ "nome": "Test", "sku": "TEST-002", "prezzo": -5 }`
  - Atteso: `400 VALIDATION_ERROR`

- [ ] **POST `/api/v1/prodotti`** — campo obbligatorio mancante
  - Body: `{ "nome": "Test" }` (senza sku e prezzo)
  - Atteso: `400 VALIDATION_ERROR` con `details` per ogni campo mancante

- [ ] **GET `/api/v1/prodotti/:id`** — dettaglio prodotto esistente
  - Atteso: `200`, prodotto con tutti i campi

- [ ] **GET `/api/v1/prodotti/:id`** — id inesistente
  - Atteso: `404 RESOURCE_NOT_FOUND`

- [ ] **PATCH `/api/v1/prodotti/:id`** — modifica solo prezzo
  - Body: `{ "prezzo": 2.50 }`
  - Atteso: `200`, `data_agg_prezzo` aggiornata rispetto al valore precedente

- [ ] **PATCH `/api/v1/prodotti/:id`** — modifica solo nome (prezzo invariato)
  - Body: `{ "nome": "Vite M6x20 ZINC" }`
  - Atteso: `200`, `data_agg_prezzo` **invariata** (trigger non scatta)

- [ ] **PATCH `/api/v1/prodotti/:id`** — SKU già usato da altro prodotto
  - Creare un secondo prodotto, poi tentare PATCH del primo con SKU del secondo
  - Atteso: `409 DUPLICATE_ENTRY`

- [ ] **DELETE `/api/v1/prodotti/:id`** — soft delete
  - Atteso: `204 No Content`

- [ ] **GET `/api/v1/prodotti/:id`** — prodotto appena eliminato
  - Atteso: `404 RESOURCE_NOT_FOUND` (non compare più)

- [ ] **GET `/api/v1/prodotti`** — prodotto eliminato non compare in lista
  - Atteso: `200`, il prodotto eliminato non è nell'array

- [ ] **GET `/api/v1/prodotti`** — senza token
  - Atteso: `401 AUTH_REQUIRED`

- [ ] **POST `/api/v1/prodotti`** — con token Operatore (`prodotti:read` only)
  - Atteso: `403 ACCESS_DENIED`

- [ ] **DELETE `/api/v1/prodotti/:id`** — con token Operatore
  - Atteso: `403 ACCESS_DENIED`

- [ ] **GET `/api/v1/prodotti`** — con token Corriere (nessun permesso prodotti)
  - Atteso: `403 ACCESS_DENIED`

---

## Definition of Done

La M02 è completata quando:

- [ ] Migration eseguita senza errori — campi `prezzo` e `data_agg_prezzo` presenti su `prodotti`
- [ ] Trigger `trg_data_agg_prezzo` attivo e verificato: aggiorna `data_agg_prezzo` solo se `prezzo` cambia
- [ ] `GET /prodotti` ritorna solo prodotti con `attivo = true`
- [ ] `GET /prodotti` con token Corriere risponde `403 ACCESS_DENIED`
- [ ] `POST /prodotti` crea prodotto e risponde `201`
- [ ] `POST /prodotti` con SKU duplicato risponde `409 DUPLICATE_ENTRY`
- [ ] `POST /prodotti` con `prezzo ≤ 0` risponde `400 VALIDATION_ERROR`
- [ ] `PATCH /prodotti/:id` aggiorna solo i campi inviati (PATCH parziale)
- [ ] `PATCH /prodotti/:id` con modifica `prezzo` → `data_agg_prezzo` aggiornata
- [ ] `PATCH /prodotti/:id` senza modifica `prezzo` → `data_agg_prezzo` invariata
- [ ] `DELETE /prodotti/:id` imposta `attivo = false` — nessuna DELETE fisica
- [ ] Prodotto con `attivo = false` risponde `404` su GET dettaglio e non compare in GET lista
- [ ] Tutti i 18 test Postman passano con status atteso
- [ ] Nessun `console.log` di debug nel codice
- [ ] Codice committato su branch `feature/m02-prodotti` e PR aperta su `develop`

---

## Note per l'AI / sviluppatore

Fornire sempre come contesto:

- `logichain_schema_v2.sql` — schema completo del DB
- `src/config/db.js` — pool PostgreSQL
- `src/middleware/auth.js`, `rbac.js`, `validate.js` — da M01
- La struttura delle risposte API (STEP 6)

Il campo `attivo` esiste già su `prodotti` dal DB V1.3.
I nuovi campi `prezzo` e `data_agg_prezzo` vengono aggiunti dalla migration di questa milestone.
Il trigger `fn_set_updated_at` già presente su `prodotti` continuerà ad aggiornare `updated_at`
ad ogni UPDATE — il nuovo trigger `trg_data_agg_prezzo` si aggiunge senza conflitti.

---

_Giugno 2025 — LogiChain ERP V2.0 — CONFIDENZIALE_
_Milestone M02 — Backend Prodotti — Listino Prezzi Aziendale_
