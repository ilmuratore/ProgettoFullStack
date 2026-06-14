# LogiChain ERP — Backend testing Priority 3

Questa suite certifica il backend su database di test separato `logichain_test`.

## 1. Preparazione ambiente

Copia il file ambiente test:

```bash
cp .env.test.example .env.test
```

Poi modifica `.env.test` con le credenziali PostgreSQL locali.

Valori importanti:

```env
DB_NAME=logichain_test
DATABASE_URL=postgres://postgres:password@localhost:5432/logichain_test
ADMIN_EMAIL=admin@logichain.it
ADMIN_PASSWORD=Admin123!
```

Il database deve essere separato da quello di sviluppo. Lo script rifiuta database che non contengono `test` nel nome.

## 2. Installazione dipendenze

```bash
npm install
```

## 3. Esecuzione test automatici

```bash
npm test
```

Il comando esegue automaticamente:

1. creazione DB `logichain_test` se assente;
2. reset schema `public`;
3. migration complete;
4. seed ruoli/permessi;
5. seed admin;
6. seed utenti test;
7. test E2E Jest + Supertest.

## 4. Comandi utili

Reset/migration/seed manuale:

```bash
npm run test:setup
```

Solo test E2E:

```bash
npm run test:e2e
```

Solo smoke test:

```bash
npm run test:smoke
```

## 5. Utenti test seedati

Password comune per utenti non-admin: `Test123!`.

| Ruolo | Email |
|---|---|
| Admin | `admin@logichain.it` |
| Supporto | `supporto@test.local` |
| Resp. Azienda | `resp.azienda@test.local` |
| Resp. HR | `resp.hr@test.local` |
| Resp. Vendite | `resp.vendite@test.local` |
| Resp. Acquisti | `resp.acquisti@test.local` |
| Resp. Magazzino | `resp.magazzino@test.local` |
| Operatore | `operatore@test.local` |
| Corriere | `corriere@test.local` |

## 6. Cosa copre la suite

- M01 Auth/RBAC e gestione utenti admin.
- Reset password admin.
- Associazione utente ↔ dipendente.
- RBAC negativo: Operatore bloccato su `GET /utenti`.
- M02 SKU sempre unico anche su prodotto disattivato.
- M06 magazzino e ubicazioni.
- M07 giacenze, rettifica positiva, spostamento dual-record, PDF movimento.
- M08 ordine acquisto, transizioni, ricezione, carico giacenza, PDF ordine/ricezione.
- M09 ordine vendita, disponibilità, picking operatore, scarico giacenza, PDF ordine vendita.
- M10 blocco spedizione prima del picking, spedizione post-picking, DDT, PDF DDT, blocco doppia spedizione.
- M11 notifiche.
- M16 richiesta acquisto con righe, state machine, notifica `RICHIESTA_ACCETTATA`, transizione finale non valida.

## 7. PDF: verifica tecnica e modifica layout

Nei test automatici il PDF viene verificato tecnicamente:

- HTTP `200`;
- header `Content-Type: application/pdf`;
- buffer non vuoto.

Il controllo visivo va fatto aprendo i PDF manualmente da browser/Postman. I layout si modificano qui:

```txt
src/pdf/ddtPdf.js
src/pdf/movimentoPdf.js
src/pdf/ordineVenditaPdf.js
src/pdf/ordiniAcquistoPdf.js
src/pdf/ricezioniPdf.js
src/pdf/pdfUtils.js
```

La logica dati resta nei service; nei file `src/pdf/*` devi toccare solo struttura grafica, intestazioni, tabelle, font-size, margini, footer e campi mostrati.

## 8. Postman

La cartella `postman/` contiene:

- `LogiChain_M00_Priority3_E2E_Smoke.postman_collection.json` — runner completo Priority 3.
- `LogiChain_M01_Admin_Gestione_Utenti.postman_collection.json` — focus utenti/admin.
- `LogiChain_M10_Spedizioni_DDT.postman_collection.json` — focus spedizioni/DDT.
- `LogiChain_M16_Richieste_Acquisto.postman_collection.json` — focus richieste acquisto.
- `LogiChain_ENV_Local_Priority3.postman_environment.json` — environment locale.

Prima esegui `npm test` per preparare DB e seed. Poi avvia il backend con `npm run dev` e lancia la collection M00 dal Runner Postman.
