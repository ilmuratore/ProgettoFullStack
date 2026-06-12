# LogiChain ERP — Sprint 3 Giorni: Piano Checkpoint
**Data**: 11 Giugno 2026 | **Riferimento AF**: V6.0 | **Tech Lead**: Simone Iengo

---

## Stato di partenza verificato (da code review 11/06)

| Modulo | Backend | Frontend |
|--------|---------|----------|
| M01–M07 | ✅ Completo + testato Postman | ✅ Integrato |
| M08 Acquisti/Ricezioni | ✅ Montato in server.js | ✅ Integrato (`acquistiApi`, `ricezioniApi`) |
| M09 Vendite | ✅ Montato in server.js | ❌ Mock hardcoded — nessun `ordiniApi.ts` |
| M10 Spedizioni/DDT | 🟡 model presenti — routes/controller mancanti, non montato | ❌ Mock hardcoded |
| M11 Notifiche | 🟡 `notificheModel.js` presente — routes/controller mancanti, non montato | ❌ `notificheIniziali` mock statici |
| Export Excel | ❌ | ❌ |
| Import CSV/Excel | ❌ | ❌ |

**Problemi critici rilevati:**
- `NewSalesOrderModal`: il click "Conferma Ordine" fa solo `setConfirmed(true)` — zero POST a `/api/v1/ordini`
- `SalesOrdersTable`: array `orders[]` hardcoded, nessun `useEffect`/API call
- `ShipmentsTable`: array `shipments[]` hardcoded
- `DashboardPage`: commento esplicito `// Mock — rimangono statici fino a M11`

---

## GIORNO 1 — M09 Frontend Integration + M11 Backend

### Blocco 1A — `ordiniApi.ts` (nuovo file frontend)
**AF ref**: AF V6 §M09 · OpenAPI `/ordini`

- [ ] Creare `frontend/src/api/ordiniApi.ts`
- [ ] `list(filters?)` → `GET /ordini` — filtri: `stato`, `cliente_id`, `stato_picking`
- [ ] `getById(id)` → `GET /ordini/:id`
- [ ] `create(body)` → `POST /ordini` — body: `{ cliente_id, destinazione_id, data_consegna_richiesta?, righe: [{prodotto_id, quantita}] }`
- [ ] `updateStato(id, stato)` → `PATCH /ordini/:id/stato` — permesso `ordini:approve`
- [ ] `updatePicking(id, body)` → `PATCH /ordini/:id/picking` — body con `prelievi` per `PICKING_COMPLETATO`
- [ ] `getDisponibilita(prodotto_id)` → `GET /ordini/disponibilita/:prodotto_id`
- [ ] Aggiungere tipi TypeScript in `frontend/src/types/` (OrdineVendita, RigaOrdine, StatoOrdineVendita, StatoPicking)

**Verifica**: `tsc --noEmit` senza errori su file nuovo

---

### Blocco 1B — `SalesOrdersTable` reale
**AF ref**: AF V6 §M09 — lista ordini, stati BOZZA/CONFERMATO/SPEDITO/ANNULLATO

- [ ] Sostituire array `orders[]` hardcoded con `useEffect` + `ordiniApi.list()`
- [ ] Stato loading + skeleton o spinner
- [ ] Gestione errore con `toast.error`
- [ ] Filtri `stato` e `stato_picking` collegati ai select esistenti nella UI
- [ ] Campo `search` filtro lato frontend su `cliente` / `id`
- [ ] `onOrderClick` passa `id: number` (intero, non stringa) — allineare con `SalesPage`

**Verifica**: tabella mostra dati reali dal DB, filtri funzionanti

---

### Blocco 1C — `NewSalesOrderModal` — POST reale
**AF ref**: AF V6 §M09 — creazione ordine con righe; `prezzo_unitario` preso da listino al momento creazione

- [ ] Step 5 "Conferma Ordine": sostituire `setConfirmed(true)` con chiamata `ordiniApi.create()`
- [ ] Body costruito da: `selectedCliente.id`, `selectedDest.id`, `orderLines[]` → `righe[]`
- [ ] Stato `loading` sul bottone durante POST
- [ ] In caso di successo: `toast.success`, chiudi modale, trigger reload tabella (`reloadKey`)
- [ ] In caso di errore `422 INSUFFICIENT_STOCK`: toast specifico "Stock insufficiente"
- [ ] In caso di errore `409`: toast "Conflitto dati"

**Verifica**: creazione ordine da UI → record visibile in tabella → verificabile in DB

---

### Blocco 1D — `SalesOrderDrawer` — GET reale
**AF ref**: AF V6 §M09 — dettaglio ordine con righe e stato picking

- [ ] `useEffect` on `orderId` prop → `ordiniApi.getById(id)`
- [ ] Mostrare righe ordine (sku, prodotto, quantita, prezzo_unitario)
- [ ] Mostrare stato ordine + stato picking con badge coerenti con quelli della tabella
- [ ] Bottone cambio stato (BOZZA→CONFERMATO) per ruoli con `ordini:approve` — `ordiniApi.updateStato()`
- [ ] Loading skeleton mentre fetch

**Verifica**: click riga tabella → drawer apre con dati reali

---

### Blocco 1E — M11 Backend: Controller + Routes
**AF ref**: AF V6 §M11 — notifiche per utente, mark as read, count non lette

- [ ] Creare `backend/src/controllers/notificheController.js`
  - `getAll` — `GET /notifiche` → `findByUtenteId(req.utente.id)` — permesso `notifiche:read`
  - `getNonLette` — `GET /notifiche/non-lette` → `findNonLette(req.utente.id)`
  - `countNonLette` — `GET /notifiche/count` → `countNonLette(req.utente.id)` — risposta `{ count: N }`
  - `getById` — `GET /notifiche/:id` — verifica ownership `utente_id === req.utente.id`
  - `markAsRead` — `PATCH /notifiche/:id/letta` → `markAsRead(id)`
  - `markAllAsRead` — `PATCH /notifiche/letta-tutto` → `markAllAsRead(req.utente.id)`
- [ ] Creare `backend/src/routes/notificheRoutes.js` con middleware `auth` + `requirePermesso('notifiche:read')`
- [ ] Smontare commento in `server.js`: `app.use('/api/v1/notifiche', require('./src/routes/notificheRoutes'))`

**Verifica Postman manuale**: GET `/notifiche` con token valido → risposta `{ status: success, data: [] }`

---

## GIORNO 2 — M11 Frontend + Export Excel

### Blocco 2A — `notificheApi.ts` + integrazione Dashboard
**AF ref**: AF V6 §M11 — tipi: SOTTO_SCORTA, PO_IN_RITARDO, RICEZIONE_PARZIALE, CAMBIO_STATO_SPEDIZIONE, RICHIESTA_ACCETTATA, RICHIESTA_RIFIUTATA, MESSAGGIO_FORNITORE, ALTRO

- [ ] Creare `frontend/src/api/notificheApi.ts`
  - `list()` → `GET /notifiche`
  - `getNonLette()` → `GET /notifiche/non-lette`
  - `count()` → `GET /notifiche/count`
  - `markAsRead(id)` → `PATCH /notifiche/:id/letta`
  - `markAllAsRead()` → `PATCH /notifiche/letta-tutto`
- [ ] Tipi: `Notifica` (id, tipo, messaggio, letto, riferimento_tipo?, riferimento_id?, created_at), `NotifType` (enum completo da AF)

---

### Blocco 2B — Dashboard: notifiche reali
**AF ref**: AF V6 §M11 + DashboardPage esistente

- [ ] Rimuovere `notificheIniziali` mock dal `DashboardPage`
- [ ] `useEffect` al mount → `notificheApi.list()` → `setNotificheState(data)`
- [ ] `markAsRead(id)` → `notificheApi.markAsRead(id)` + aggiorna stato locale (ottimistico)
- [ ] `markAllRead()` → `notificheApi.markAllAsRead()` + aggiorna stato locale
- [ ] Gestione errore silente (tabella resta vuota, non crash)

**Verifica**: tab Alert in Dashboard mostra notifiche reali da DB; mark as read persiste dopo refresh

---

### Blocco 2C — Badge notifiche in Header
**AF ref**: AF V6 §M11 — count non lette per badge UI

- [ ] `Header.tsx`: polling `notificheApi.count()` ogni 60s con `setInterval` in `useEffect`
- [ ] Badge rosso su icona campanella con numero non lette (nascosto se 0)
- [ ] Click campanella → naviga a `/` tab `alert`
- [ ] Cleanup `clearInterval` on unmount

**Verifica**: creare notifica manuale in DB → badge si aggiorna entro 60s

---

### Blocco 2D — Export Excel Backend
**AF ref**: AF V6 §11 "Export Avanzato" — ExcelJS (già in roadmap AF)

- [ ] `npm install exceljs` nel backend
- [ ] Creare `backend/src/excel/` directory
- [ ] Creare `backend/src/excel/ordiniAcquistoExcel.js`
  - Query completa con fornitore, righe, stato
  - Header colonne: ID, Fornitore, Stato, Data Creazione, Totale Righe, Importo Totale
  - Foglio "Ordini" + foglio "Righe" dettaglio
  - `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `Content-Disposition: attachment; filename="ordini-acquisto-{YYYY-MM-DD}.xlsx"`
- [ ] Aggiungere endpoint `GET /api/v1/ordini-acquisto/export` in `ordini_acquistoRoutes.js` — prima delle route con `:id` per evitare conflitti — permesso `acquisti:read`
- [ ] Creare `backend/src/excel/ordiniVenditaExcel.js` (stessa struttura)
- [ ] Aggiungere `GET /api/v1/ordini/export` in `ordiniRoutes.js` — permesso `ordini:read`
- [ ] Creare `backend/src/excel/giacenzeExcel.js`
  - Colonne: SKU, Prodotto, Magazzino, Ubicazione, Quantità, Scorta Minima, Sotto Scorta
- [ ] Aggiungere `GET /api/v1/giacenze/export` — permesso `giacenze:read`

**Attenzione**: endpoint `/export` devono stare PRIMA di `/:id` in tutte le route per evitare che Express interpreti `"export"` come ID numerico

**Verifica Postman**: GET endpoint export con header `Authorization` → file `.xlsx` scaricato correttamente

---

### Blocco 2E — Export Excel Frontend
**AF ref**: pattern download blob

- [ ] Aggiungere funzione `downloadBlob(path, filename)` in `api/client.ts` — usa `fetch` raw con token, risposta `blob()`, crea `<a>` e clicca
- [ ] `PurchasesPage` tab Ordini: bottone "Esporta Excel" → `downloadBlob('/ordini-acquisto/export', 'ordini-acquisto.xlsx')`
- [ ] `SalesPage` tab Ordini: bottone "Esporta Excel" → `downloadBlob('/ordini/export', 'ordini-vendita.xlsx')`
- [ ] `WarehousePage` tab Stock: bottone "Esporta Excel" → `downloadBlob('/giacenze/export', 'giacenze.xlsx')`
- [ ] Stato loading sul bottone durante download (disable + spinner)

**Verifica**: click bottone → file scaricato correttamente nel browser

---

## GIORNO 3 — Import CSV/Excel + M10 Backend (base)

### Blocco 3A — Import Backend: Prodotti
**AF ref**: AF V6 — M02 Prodotti; stack note: "Zero dipendenze aggiuntive da servizi esterni a pagamento" → `multer` + `csv-parse` (già disponibili o npm install)

- [ ] `npm install multer csv-parse xlsx` nel backend
- [ ] Creare `backend/src/middleware/upload.js` — multer memStorage, accetta `.csv` e `.xlsx`, limite 5MB
- [ ] Creare `backend/src/services/importService.js`
  - `parseCSV(buffer)` → array righe
  - `parseXLSX(buffer)` → array righe (sheet 0, riga 1 = header)
  - `importProdotti(righe, client)` — per ogni riga: verifica campi obbligatori (nome, sku, prezzo), chiama `prodottiModel.create()` o upsert su SKU, accumula `{ importati, saltati, errori[] }`
- [ ] Aggiungere `POST /api/v1/prodotti/import` in `prodottiRoutes.js` — multipart/form-data, campo `file`, permesso `prodotti:write`
  - Risposta: `{ importati: N, saltati: N, errori: [{riga: N, motivo: "..."}] }`
  - Transazione atomica: se troppi errori (>50%) rollback tutto; altrimenti commit parziale con report
- [ ] Template CSV scaricabile: `GET /api/v1/prodotti/import/template` → file CSV con header + 2 righe esempio

**Verifica Postman**: POST con file CSV valido → `{ importati: N, saltati: 0, errori: [] }`; POST con riga malformata → errore riportato per riga senza bloccare le altre

---

### Blocco 3B — Import Frontend: Prodotti
**AF ref**: pattern UX: upload → preview/report → conferma

- [ ] Aggiungere bottone "Importa" nella toolbar `ProductsTab.tsx`
- [ ] Creare `frontend/src/modules/magazzino/components/ImportProdottiModal.tsx`
  - Step 1: drag & drop o file picker (accept `.csv,.xlsx`)
  - Step 2: loading durante POST
  - Step 3: report risultati (`importati`, `saltati`, `errori[]` con riga e motivo)
  - Bottone "Scarica Template" → `GET /api/v1/prodotti/import/template`
- [ ] Dopo import con successo: refresh lista prodotti (`reloadKey++`)

**Verifica**: upload CSV da UI → modal mostra report → prodotti visibili in tabella

---

### Blocco 3C — M10 Backend: Spedizioni (base)
**AF ref**: AF V6 §M10 — `spedizioniModel.js` presente; stati: IN_PREPARAZIONE, SPEDITA, CONSEGNATA, PROBLEMA; permessi: `spedizioni:read`, `spedizioni:write`

- [ ] Creare `backend/src/controllers/spedizioniController.js`
  - `getAll` → `spedizioniModel.findAll()`
  - `getById` → `spedizioniModel.findById(id)`
  - `create` → `spedizioniModel.create()` — body: `ordine_id`, `cliente_id`, `destinazione_id`, `corriere_id?`, `tracking_number?`
  - `updateStato` → `PATCH /spedizioni/:id/stato` — stati: `IN_PREPARAZIONE→SPEDITA→CONSEGNATA` / qualsiasi→`PROBLEMA`
- [ ] Creare `backend/src/routes/spedizioniRoutes.js`
  - `GET /` — `spedizioni:read`
  - `GET /:id` — `spedizioni:read`
  - `POST /` — `spedizioni:write`
  - `PATCH /:id/stato` — `spedizioni:write`
- [ ] Smontare commento in `server.js`: `app.use('/api/v1/spedizioni', require('./src/routes/spedizioniRoutes'))`
- [ ] **DDT — rimandato**: `ddtModel.js` presente ma generazione DDT con `seq_ddt_numero_progressivo` e PDF pdfkit è fuori scope 3 giorni → lasciare commentato

**Verifica Postman manuale**: GET `/spedizioni` → `[]`; POST spedizione → 201; PATCH stato → 200

---

### Blocco 3D — M10 Frontend: `spedizioniApi.ts` + ShipmentsTable reale

- [ ] Creare `frontend/src/api/spedizioniApi.ts`
  - `list()` → `GET /spedizioni`
  - `getById(id)` → `GET /spedizioni/:id`
  - `create(body)` → `POST /spedizioni`
  - `updateStato(id, stato)` → `PATCH /spedizioni/:id/stato`
- [ ] Tipi TypeScript: `Spedizione`, `StatoSpedizione`, `SpedizioneCreateRequest`
- [ ] `ShipmentsTable.tsx`: sostituire array `shipments[]` hardcoded con `useEffect` + `spedizioniApi.list()`
- [ ] `LogisticsPage.tsx`: aggiungere `useEffect` e stato loading
- [ ] `NewShipmentModal.tsx`: collegare POST reale a `spedizioniApi.create()` (verificare se il modale ha già form dati o è UI-only)

**Verifica**: tabella logistica mostra dati reali (o array vuoto se DB è vuoto)

---

## Checkpoint di chiusura sprint (fine Giorno 3)

### Test manuali end-to-end obbligatori

- [ ] **Vendite**: crea ordine da UI → visibile in tabella → cambia stato → picking completato → movimenti SCARICO_VENDITA generati in DB
- [ ] **Notifiche**: inserisci notifica manuale in DB (`INSERT INTO notifiche ...`) → compare in Dashboard tab Alert → mark as read → badge Header si azzera
- [ ] **Export**: scarica Excel ordini acquisto, ordini vendita, giacenze → file apribile, dati corretti
- [ ] **Import**: carica CSV prodotti con 5 righe → report corretto → 5 prodotti in tabella
- [ ] **Spedizioni**: GET lista → vuota; POST nuova spedizione → PATCH stato a SPEDITA → tabella logistica aggiornata

### Verifica conformità AF
- [ ] Nessun endpoint aggiunto fuori dalle route AF (nessuna route inventata)
- [ ] Permessi RBAC rispettati su ogni endpoint nuovo (cross-check con `seed_ruoli_permessi.js`)
- [ ] Pattern risposta `{ status: "success", data: ... }` su tutti i nuovi endpoint
- [ ] Errori restituiti con `{ status: "error", code: "...", message: "...", details: [] }`
- [ ] `source=ecosystem` protection invariata su fornitori e clienti (nessun impatto da nuove route)

### Deferred (fuori scope 3 giorni — documentare in AF V7)
- DDT generation con `seq_ddt_numero_progressivo` + PDF pdfkit → M10 fase 2
- Notifiche automatiche (trigger DB su scorta minima, PO in ritardo) → M11 fase 2
- Import fornitori, clienti, dipendenti → post-sprint
- Notifiche real-time WebSocket → roadmap post-stabilizzazione AF V6 §11
- Fatturazione elettronica / FatturaPA → roadmap post-stabilizzazione

---

## Note implementative trasversali (invarianti da rispettare)

- **Migrations**: nessuna migration nuova richiesta per questo sprint — lo schema DB è già completo per M09/M10/M11
- **Postman collections**: aggiornare collection M09 con test vendite; creare collection M11 con test notifiche
- **OpenAPI**: aggiungere path `/notifiche`, `/spedizioni`, `/prodotti/import`, `/*/export` dopo ogni blocco completato
- **Pattern `(client || pool)`**: tutti i nuovi model che partecipano a transazioni devono accettare client opzionale
- **No comments nel codice generato**: spiegazioni solo in chat
- **Nessuna migration manuale**: se si scopre che manca un campo in DB durante i test → migration numerata progressiva (attuale ultima: 113 → prossima 114)
