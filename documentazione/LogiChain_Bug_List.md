# LogiChain ERP — Bug List
**Data**: 11 Giugno 2026 | **Fonte**: Code review codebase + AF V6

---

## BACKEND — Priorità Alta

### BUG-BE-01 · `ordiniModel.create` — `importo_totale` silenziosamente perso
**File**: `src/models/ordiniModel.js` → `create()`
**Problema**: la funzione accetta solo `{ cliente_id, destinazione_id, data_consegna_richiesta, utente_id }` — il campo `importo_totale` NON è nell'INSERT. Il service lo calcola correttamente e lo passa, ma il model lo ignora. La colonna `importo_totale` in DB rimane `NULL` su ogni ordine creato.
**Fix**: aggiungere `importo_totale` nei parametri e nell'INSERT.

---

### BUG-BE-02 · `ordiniService.create` — `prezzo_unitario` non preso dal listino
**File**: `src/services/ordiniService.js` → `create()`
**Problema**: l'AF specifica *"Prezzo preso dal listino prodotto al momento della creazione"*. Il service usa `r.prezzo_unitario` passato dal body. Se il client non lo invia (o invia 0), viene salvato `NULL`/`0` su `righe_ordine.prezzo_unitario` e `importo_totale` risulta errato. Il `validateRighe` inline nella route non richiede `prezzo_unitario`.
**Fix**: nel loop righe, fare `prodottiModel.findById(r.prodotto_id)` e usare `prodotto.prezzo` come `prezzo_unitario` — il body client non deve poterlo sovrascrivere.

---

### BUG-BE-03 · `validateRighe` middleware — formato errore non conforme
**File**: `src/middleware/validateRighe.js`
**Problema**: restituisce `{ status: 'error', error: '...' }` invece del formato standard `{ status: 'error', code: 'VALIDATION_ERROR', message: '...', details: [] }`. Il frontend si aspetta `body.code` e `body.message` nell'interceptor di `client.ts`. Questo rompe la gestione errori sul frontend per ricezioni.
**Fix**: allineare al formato `errorHandler` standard. (Nota: il `validateRighe` inline in `ordiniRoutes.js` usa già il formato corretto — il problema è solo nel file `middleware/validateRighe.js` usato dalle ricezioni).

---

### BUG-BE-04 · `errorHandler` — messaggio specifico dal service viene sovrascritto
**File**: `src/middleware/errorHandler.js`
**Problema**: il handler usa `errorMessages[code]` (messaggi generici hardcoded) e ignora `err.message`. Quando il service lancia `INSUFFICIENT_STOCK` con il messaggio *"Disponibilita insufficiente per il prodotto X: richiesti 10, disponibili 3"*, al client arriva solo *"Giacenza insufficiente per completare il movimento"*. Stessa perdita per `STATE_TRANSITION_INVALID` e `RESOURCE_NOT_FOUND` con messaggi contestuali.
**Fix**: nel payload finale usare `err.message` (se presente) invece di `errorMessages[code]`, oppure aggiungere `message: err.message || errorMessages[code]`.

---

### BUG-BE-05 · `ordiniAcquistoController.getAll` — double-wrap condizionale
**File**: `src/controllers/ordiniAcquistoController.js` → `getAll`
**Problema**: `res.json({ status: 'success', data: result.rows || result })`. Il service `getAll` chiama `findAllFiltered` che è `async` e restituisce `result.rows` direttamente (array). Quindi `result.rows` è `undefined`, e si entra nel branch `|| result` che è già l'array — funziona per caso. Se `findAllFiltered` venisse modificato per restituire il raw pg result, il branch `result.rows` prenderebbe il sopravvento restituendo array corretto ma fragile. Uniformare al pattern degli altri controller.
**Fix**: il service deve restituire l'array direttamente. Il controller fa `data: result` senza `.rows`.

---

### BUG-BE-06 · `validate` middleware — body vuoto restituisce 200
**File**: `src/middleware/validate.js`
**Problema**: noto dall'M02, documentato come deferred. `PATCH /prodotti/:id` con body `{}` restituisce `200` invece di `400`. Il middleware itera sui campi del blueprint ma se nessuno è `required`, tutti i campi con value `undefined` vengono saltati silenziosamente e si arriva a `next()`. Stesso comportamento su tutti i PATCH del sistema.
**Fix**: aggiungere check all'inizio — se tutti i campi del blueprint sono opzionali E il body è completamente vuoto (`Object.keys(req.body).length === 0`), restituire `400 VALIDATION_ERROR` con messaggio "Nessun campo da aggiornare".

---

### BUG-BE-07 · `ordiniModel.findAll` / `findByStato` — manca JOIN con destinazione
**File**: `src/models/ordiniModel.js` → `findAll()`, `findByStato()`, `findByClienteId()`
**Problema**: le query restituiscono `ordini.*` + solo `cliente` (ragione_sociale). Manca il JOIN con `destinazioni_clienti` per ottenere `destinazione` (etichetta). Il frontend dovrà fare una seconda chiamata per ogni ordine per mostrare la destinazione nella tabella.
**Fix**: aggiungere `LEFT JOIN destinazioni_clienti ON ordini.destinazione_id = destinazioni_clienti.id` e `destinazioni_clienti.etichetta AS destinazione` nel SELECT.

---

### BUG-BE-08 · `ricezioniRoutes` — endpoint deprecati restituiscono formato errore non standard
**File**: `src/routes/ricezioniRoutes.js`
**Problema**: i due endpoint deprecati (`GET /:id/righe` e `POST /:id/righe`) restituiscono `{ status: 'error', error: '...' }` invece del formato `{ status: 'error', code: '...', message: '...' }`. L'interceptor `client.ts` legge `body.message` — questi endpoint restituirebbero `undefined` come messaggio di errore al frontend.
**Fix**: usare `code: 'ENDPOINT_DEPRECATED'` e `message: '...'` nel formato standard, oppure passare per `next(err)`.

---

### BUG-BE-09 · `ordiniService.create` — `importo_totale` calcolato con `prezzo_unitario` da body (potenzialmente 0)
**Correlato a BUG-BE-02.** Anche se si fixa BE-02 leggendo dal listino, il calcolo dell'`importo_totale` alla riga 114 usa ancora `r.prezzo_unitario` dal body. Deve essere ricalcolato dopo aver recuperato i prezzi dal listino.

---

## BACKEND — Priorità Media

### BUG-BE-10 · `utentiRoutes` — scope limitato non documentato nell'OpenAPI
**File**: `src/routes/utentiRoutes.js`
**Problema**: la route è montata ma contiene solo `PATCH /:id/password`. L'OpenAPI in `/rbac` segna `utenti:read` e `utenti:delete` come "non montate" ma `server.js` monta la route. Chiunque tenti `GET /api/v1/utenti` ottiene `404 RESOURCE_NOT_FOUND` dall'Express catch-all invece di un 404 esplicito "endpoint non implementato". Non è un crash, ma è fuorviante durante i test Postman.

---

### BUG-BE-11 · `ordiniAcquistoService.canTransitionStato` — `CONFERMATO` non può andare a `IN_RICEZIONE` via PATCH
**File**: `src/services/ordiniAcquistoService.js`
**Problema**: `canTransitionStato('CONFERMATO', 'IN_RICEZIONE')` restituisce `false`. Questo è intenzionale — `IN_RICEZIONE` viene impostato solo internamente da `createRicezione`, non tramite `PATCH /stato`. Tuttavia non è documentato nel codice né nell'OpenAPI, e può confondere chi testa manualmente. Non è un bug funzionale ma va documentato.

---

## FRONTEND — Priorità Alta

### BUG-FE-01 · `ricezioniApi.ts` — `addRiga` chiama endpoint deprecato (410 GONE)
**File**: `src/api/ricezioniApi.ts`
**Problema**: `addRiga(id, body)` → `POST /ricezioni/:id/righe` → backend risponde `410 Gone`. Se qualsiasi componente chiama questo metodo, riceve un errore 410 con corpo non standard (BUG-BE-08). Attualmente `GoodsReceiptsTimeline` importa `ricezioniApi` ma usa solo `list()` — quindi non crasha, ma il metodo è una trappola.
**Fix**: rimuovere `addRiga` da `ricezioniApi.ts`. Per creare ricezioni complete usare `acquistiApi.createRicezione()`.

---

### BUG-FE-02 · `NewSalesOrderModal` — il bottone "Conferma Ordine" non chiama nessuna API
**File**: `src/modules/vendite/components/NewSalesOrderModal.tsx`
**Problema**: `onClick={() => setConfirmed(true)}` — nessuna POST a `/api/v1/ordini`. L'utente vede la conferma UI ma nessun ordine viene creato nel DB. Il prodotti nel modal sono hardcoded in un array locale di 6 items mock — non provengono da `prodottiApi`.
**Fix**: sostituire con `ordiniApi.create()` + fetch prodotti reali.

---

### BUG-FE-03 · `SalesOrdersTable` — dati completamente hardcoded
**File**: `src/modules/vendite/components/SalesOrdersTable.tsx`
**Problema**: array `orders[]` con 10 ordini fake statici. Nessuna API call. Nessun `useEffect`.

---

### BUG-FE-04 · `ShipmentsTable` — dati completamente hardcoded
**File**: `src/modules/logistica/components/ShipmentsTable.tsx`
**Problema**: array `shipments[]` con 8 spedizioni fake. Nessun endpoint `/spedizioni` montato sul backend (BUG separato di M10 non implementato).

---

### BUG-FE-05 · `DashboardPage` — notifiche mock statiche
**File**: `src/pages/DashboardPage.tsx`
**Problema**: `notificheIniziali` array hardcoded con commento `// Mock — rimangono statici fino a M11`. Nessuna chiamata a `/api/v1/notifiche`. Il badge nell'header non riflette dati reali.

---

### BUG-FE-06 · `PAGINE_PER_RUOLO` — ruolo 5 (Resp. HR) mancante
**File**: `src/store/authStore.ts`
**Problema**: la mappa `PAGINE_PER_RUOLO` ha chiavi `1,2,3,4,6,7,8,9,10` — manca la chiave `5`. Un utente con `ruolo_id: 5` ottiene `undefined` → fallback a `['dashboard']` soltanto, perdendo l'accesso ad `anagrafiche` (che il ruolo dovrebbe avere per gestire dipendenti).
**Verifica in authStore**: `5: ['dashboard', 'anagrafiche']` esiste nella mappa permessi ma non in `PAGINE_PER_RUOLO`.
**Fix**: aggiungere `5: ['dashboard', 'anagrafiche']` in `PAGINE_PER_RUOLO`.

---

### BUG-FE-07 · `acquistiApi.createRicezione` — tipizzazione risposta `unknown`
**File**: `src/api/acquistiApi.ts`
**Problema**: `createRicezione` restituisce `Promise<unknown>`. Il `NewGoodsReceiptModal` non può usare il risultato (es. mostrare l'ID ricezione creata o fare refresh). Va tipizzato con `RicezioneRow` o il tipo corretto.

---

## FRONTEND — Priorità Media

### BUG-FE-08 · `SalesOrderDrawer` — nessun fetch dati reali
**File**: `src/modules/vendite/components/SalesOrderDrawer.tsx`
**Problema**: il drawer si apre ma non carica dati dall'API. Mostra presumibilmente dati statici o vuoti.

---

### BUG-FE-09 · `LogisticsPage` — nessun `useEffect`, nessuna API call
**File**: `src/modules/logistica/LogisticsPage.tsx`
**Problema**: non fa nessuna chiamata API. Dipende da `ShipmentsTable` che ha dati mock (BUG-FE-04).

---

### BUG-FE-10 · `NewSalesOrderModal` — prodotti da lista hardcoded, non da `prodottiApi`
**File**: `src/modules/vendite/components/NewSalesOrderModal.tsx` righe 16–22
**Problema**: 6 prodotti mock con disponibilità inventata. Anche dopo il fix di BUG-FE-02, se non si sostituisce questa lista l'utente vede prodotti che non esistono nel DB.
**Fix**: `useEffect` → `prodottiApi.list()` + `ordiniApi.getDisponibilita()` per la disponibilità reale.

---

## Riepilogo per priorità

| # | Dove | Impatto | Fix stimato |
|---|------|---------|-------------|
| BE-01 | `ordiniModel.create` | `importo_totale` sempre NULL in DB | 5 min |
| BE-02 | `ordiniService.create` | prezzo_unitario da body, non da listino | 15 min |
| BE-03 | `validateRighe.js` | formato errore non standard | 5 min |
| BE-04 | `errorHandler.js` | messaggi contestuali persi | 5 min |
| BE-05 | `ordiniAcquistoController.getAll` | fragile, funziona per caso | 5 min |
| BE-06 | `validate.js` | PATCH body vuoto → 200 | 10 min |
| BE-07 | `ordiniModel.findAll` | manca destinazione nel response | 10 min |
| BE-08 | `ricezioniRoutes` deprecati | formato errore non standard | 5 min |
| BE-09 | `ordiniService.create` importo | correlato a BE-02 | incluso in BE-02 |
| FE-01 | `ricezioniApi.addRiga` | chiama 410 GONE | 2 min |
| FE-02 | `NewSalesOrderModal` | conferma non crea niente | 1h |
| FE-03 | `SalesOrdersTable` | dati falsi | 30 min |
| FE-04 | `ShipmentsTable` | dati falsi (dipende da M10 BE) | 30 min |
| FE-05 | `DashboardPage` notifiche | dati falsi (dipende da M11 BE) | 20 min |
| FE-06 | `authStore` ruolo 5 | Resp. HR vede solo dashboard | 1 min |
| FE-07 | `acquistiApi.createRicezione` | risposta non tipizzata | 5 min |
| FE-08 | `SalesOrderDrawer` | nessun fetch | 30 min |
| FE-09 | `LogisticsPage` | nessun fetch | incluso in FE-04 |
| FE-10 | `NewSalesOrderModal` prodotti | prodotti falsi | 20 min |