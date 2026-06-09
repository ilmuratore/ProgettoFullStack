# Piano operativo issue 16

## Obiettivo

Dividere le attivita del modulo magazzino tra 4 sviluppatori riducendo al minimo i conflitti Git, soprattutto sul file centrale:

`codice/frontend/src/modules/magazzino/WarehousePage.tsx`

Il modulo attuale ha molte responsabilita concentrate nello stesso componente. Per questo il piano prevede una PR iniziale piccola di riallineamento, poi una divisione per aree funzionali.

## Regola generale anti-conflitto

Prima di aprire PR parallele, completare e mergiare la PR 0.

Dopo la PR 0:

| Regola | Descrizione |
| --- | --- |
| `WarehousePage.tsx` | Deve essere toccato solo da `dev1`, salvo accordo esplicito |
| Prodotti | Responsabilita di `dev2` |
| Categorie | Responsabilita di `dev3` |
| Giacenze e movimenti | Responsabilita di `dev4` |
| Backend condiviso | Ogni dev modifica solo il backend necessario alla propria area |

## PR 0 - Allineamento base

Owner: `dev1`

Questa PR va fatta per prima e mergiata prima che gli altri inizino le proprie PR operative.

| Problemi | Attivita | File principali |
| --- | --- | --- |
| 1, 17 | Riordinare i tab e rimuovere il tab `rettifiche` | `codice/frontend/src/modules/magazzino/WarehousePage.tsx` | FATTO!!
| 1 | Impostare ordine finale tab: `prodotti`, `categorie`, `struttura`, `giacenze`, `movimenti` | `WarehousePage.tsx` | FATTO!!
| 17 | Eliminare tipo `rettifiche`, dati statici `rettificheData`, action button rettifiche e render della sezione rettifiche | `WarehousePage.tsx` |
| Refactor consigliato | Estrarre tab prodotti e categorie in componenti dedicati per ridurre conflitti futuri | `ProductsTab.tsx`, `CategoriesTab.tsx` |

Ordine tab finale:

```text
prodotti
categorie
struttura
giacenze
movimenti
```

Nota: il problema 1 cita anche `rettifiche`, ma il problema 17 chiede di eliminarlo. Quindi l'ordine finale non deve includere `rettifiche`.

## Dev1 - Shell modulo e struttura magazzino

Owner: `dev1`

Problemi assegnati:

| Problema | Descrizione |
| --- | --- |
| 1 | Riordinare i tab |
| 3 | Risolvere salvataggio `cap`, `provincia`, `paese`, `citta` in database |
| 17 | Eliminare tab rettifiche |

File frontend principali:

| File | Note |
| --- | --- |
| `codice/frontend/src/modules/magazzino/WarehousePage.tsx` | Owner esclusivo dopo PR 0 |
| `codice/frontend/src/types/magazzino.ts` | Aggiornare solo se cambia il contratto dati |
| `codice/frontend/src/api/magazzinoApi.ts` | Aggiornare solo se cambia API magazzini |

File backend principali:

| File | Note |
| --- | --- |
| `codice/backend/src/services/magazziniService.js` | Oggi scarta `cap`, `citta`, `provincia`, `paese` in create/update |
| `codice/backend/src/routes/magazziniRoutes.js` | Aggiungere i campi indirizzo strutturato nei blueprint |
| `codice/backend/src/models/magazziniModel.js` | Il model gia supporta i campi, verificare solo se serve |

Dettaglio problema 3:

Il frontend invia gia i campi:

```text
cap
citta
provincia
paese
```

Il problema principale e lato backend: `magazziniService.create` e `magazziniService.update` usano solo `codice`, `nome`, `indirizzo` e ignorano gli altri campi.

## Dev2 - Prodotti

Owner: `dev2`

Problemi assegnati:

| Problema | Descrizione |
| --- | --- |
| 4 | Aggiungere scheda dettaglio prodotto con slide da destra |
| 5 | Form creazione prodotto incompleto |
| 6 | Tasto filtri prodotti non funzionante |
| 7 | Form modifica prodotto incompleto |
| 8 | Select categoria prodotto con ordine padre/sottocategoria errato |

File frontend principali:

| File | Note |
| --- | --- |
| `codice/frontend/src/modules/magazzino/components/ProductFormModal.tsx` | Creazione e modifica prodotto |
| `codice/frontend/src/modules/magazzino/components/ProductDetailDrawer.tsx` | Nuovo file consigliato |
| `codice/frontend/src/modules/magazzino/components/ProductsTab.tsx` | Se creato in PR 0 |
| `codice/frontend/src/api/prodottiApi.ts` | Aggiungere fetch dettaglio e payload completi |
| `codice/frontend/src/types/prodotti.ts` | Estendere tipi create/update/list/dettaglio |

File backend principali:

| File | Note |
| --- | --- |
| `codice/backend/src/routes/prodottiRoutes.js` | Blueprint create/update oggi accetta pochi campi |
| `codice/backend/src/controllers/prodottiController.js` | Oggi passa solo `nome`, `sku`, `prezzo`, `categoria_id` |
| `codice/backend/src/services/prodottiService.js` | Verificare validazioni per nuovi campi |
| `codice/backend/src/models/prodottiModel.js` | Il model gia supporta `descrizione`, `unita_misura`, `peso_kg`, `scorta_minima` |

Campi prodotto da gestire nei form:

| Campo | Note |
| --- | --- |
| `nome` | Obbligatorio |
| `sku` | Obbligatorio e univoco |
| `descrizione` | Opzionale |
| `categoria_id` | Opzionale, ordinata padre/sottocategoria |
| `unita_misura` | Opzionale |
| `peso_kg` | Opzionale numerico |
| `scorta_minima` | Numerico, default 0 |
| `prezzo` | Obbligatorio, maggiore di 0 |

Dettaglio prodotto:

Usare lo stesso pattern visivo dei drawer ordine:

| Riferimento | File |
| --- | --- |
| Ordine acquisto | `codice/frontend/src/modules/acquisti/components/OrderDetailDrawer.tsx` |
| Ordine vendita | `codice/frontend/src/modules/vendite/components/SalesOrderDrawer.tsx` |

Il drawer prodotto deve aprirsi da destra e usare `prodottiApi.getById(id)`.

## Dev3 - Categorie

Owner: `dev3`

Problemi assegnati:

| Problema | Descrizione |
| --- | --- |
| 8 | Ordinamento categoria padre/sottocategoria nelle select |
| 9 | Ricerca categorie non trova sottocategorie |
| 10 | Dropdown categorie non funziona, sottocategorie sempre visibili |

File frontend principali:

| File | Note |
| --- | --- |
| `codice/frontend/src/modules/magazzino/components/CategoryFormModal.tsx` | Select categoria padre |
| `codice/frontend/src/modules/magazzino/components/CategoriesTab.tsx` | Se creato in PR 0 |
| `codice/frontend/src/api/categorieApi.ts` | Probabilmente sufficiente cosi |
| `codice/frontend/src/types/categorie.ts` | Aggiornare solo se necessario |

File backend principali:

| File | Note |
| --- | --- |
| `codice/backend/src/controllers/categorieController.js` | Gia passa `categoria_padre_id` |
| `codice/backend/src/services/categorieService.js` | Gia valida max 2 livelli |
| `codice/backend/src/models/categorieModel.js` | Gia ordina radici e nomi, verificare se basta |

Comportamento atteso ricerca:

| Caso | Risultato atteso |
| --- | --- |
| Ricerca categoria padre | Mostrare padre e relative sottocategorie coerenti |
| Ricerca sottocategoria | Mostrare il padre contenitore e la sottocategoria trovata |
| Nessuna ricerca | Mostrare categorie padre, sottocategorie collassabili |

Comportamento atteso dropdown/collasso:

| Stato | Risultato |
| --- | --- |
| Categoria chiusa | Sottocategorie nascoste |
| Categoria aperta | Sottocategorie visibili |
| Click su chevron/header | Toggle aperto/chiuso |

Nota:

Il problema 10 non riguarda necessariamente il menu kebab Radix. Nel codice attuale le sottocategorie sono sempre renderizzate, quindi manca proprio uno stato `expanded/collapsed` per categoria.

## Dev4 - Giacenze, movimenti e rimozione dati statici

Owner: `dev4`

Problemi assegnati:

| Problema | Descrizione |
| --- | --- |
| 2 | Eliminare dati statici e collegare al backend per area giacenze/movimenti |
| 11 | Giacenze mostra dati statici frontend |
| 12 | Rimuovere tasto esporta Excel |
| 13 | Ricerca giacenze non funziona |
| 14 | Filtri giacenze non funzionano |
| 16 | Movimenti presenta dati statici |

File frontend principali:

| File | Note |
| --- | --- |
| `codice/frontend/src/modules/magazzino/components/StockTable.tsx` | Sostituire `stockData` statico |
| `codice/frontend/src/modules/magazzino/components/StockMovementsTimeline.tsx` | Sostituire `movements` statico/vuoto |
| `codice/frontend/src/modules/magazzino/components/NewMovementModal.tsx` | Attualmente usa dati statici nei select |
| `codice/frontend/src/api/magazzinoApi.ts` | Valutare se tenere tutto qui o creare API dedicate |
| `codice/frontend/src/types/magazzino.ts` | Aggiungere tipi `Giacenza`, `MovimentoStock` |

Nuovi file consigliati:

| File | Scopo |
| --- | --- |
| `codice/frontend/src/api/giacenzeApi.ts` | Fetch giacenze |
| `codice/frontend/src/api/movimentiStockApi.ts` | Fetch e create movimenti |

File backend principali:

| File | Note |
| --- | --- |
| `codice/backend/server.js` | Rotte M07 oggi commentate |
| `codice/backend/src/routes/movimenti_stockRoutes.js` | Import controller probabilmente non allineato al nome file |
| `codice/backend/src/routes/giacenzeRoutes.js` | File non presente, da creare se necessario |
| `codice/backend/src/controllers/giacenzeController.js` | File non presente, da creare se necessario |
| `codice/backend/src/controllers/movimenti_stockController.js` | File non presente, da creare o allineare |
| `codice/backend/src/services/movimenti_stockService.js` | Verificare compatibilita con model |
| `codice/backend/src/models/giacenzeModel.js` | Attenzione: il service usa firme con `client`, il model attuale non sembra accettarlo |

Comportamento atteso giacenze:

| Funzione | Risultato |
| --- | --- |
| Lista | Dati da database, non array statico |
| Ricerca | Filtra per SKU, prodotto, categoria se disponibile, magazzino, ubicazione |
| Filtri | Almeno filtro stato scorta e magazzino |
| Export Excel | Rimosso |

Comportamento atteso movimenti:

| Funzione | Risultato |
| --- | --- |
| Timeline | Dati da `/movimenti-stock` |
| Nuovo movimento | Select prodotto e ubicazioni da backend |
| Submit | POST movimento stock |
| Rettifiche | Non devono avere tab dedicato, ma i tipi movimento possono restare nel backend |

## Dipendenze tra dev

| Dipendenza | Dettaglio |
| --- | --- |
| `dev2` aspetta PR 0 | Per evitare conflitti su tab prodotti dentro `WarehousePage.tsx` |
| `dev3` aspetta PR 0 | Per evitare conflitti su tab categorie dentro `WarehousePage.tsx` |
| `dev4` aspetta PR 0 | Per non toccare rimozione rettifiche e tab rendering |
| `dev2` e `dev3` coordinano problema 8 | Dev3 puo creare helper ordinamento categorie, Dev2 lo usa nella select prodotti |
| `dev4` potrebbe dipendere dal backend M07 | Prima verificare che le rotte siano montate e funzionanti |

## Helper condiviso consigliato

Per evitare duplicazione tra select prodotti e categorie, creare un helper frontend:

`codice/frontend/src/modules/magazzino/utils/categorieTree.ts`

Responsabile consigliato: `dev3`

Funzioni utili:

| Funzione | Scopo |
| --- | --- |
| `buildCategorieTree(categorie)` | Raggruppa padri e sottocategorie |
| `flattenCategorieForSelect(categorie)` | Restituisce ordine padre/sottocategoria per select |
| `filterCategorieTree(categorie, query)` | Cerca anche nelle sottocategorie mantenendo il padre visibile |

`dev2` dovra usare `flattenCategorieForSelect` nel form prodotto.

## Checklist finale PR

Ogni PR deve verificare:

| Check | Descrizione |
| --- | --- |
| Build frontend | `npm run build` dentro `codice/frontend` |
| Nessun dato statico nella propria area | Consentiti solo fallback vuoti/loading/error |
| Nessun conflitto su file non assegnati | Non modificare file di ownership altrui |
| Toast error/success | Gestione minima errori API |
| Stato loading/empty | Ogni tab collegato al backend deve gestire caricamento e lista vuota |

## Mappa problemi

| Problema | Owner | Note |
| --- | --- | --- |
| 1 | `dev1` | Tab order |
| 2 | `dev4` | Limitato a giacenze/movimenti; statici globali fuori modulo vanno trattati in issue separate |
| 3 | `dev1` | Backend magazzini |
| 4 | `dev2` | Nuovo drawer prodotto |
| 5 | `dev2` | Form create prodotto |
| 6 | `dev2` | Filtri prodotti |
| 7 | `dev2` | Form edit prodotto |
| 8 | `dev2` + `dev3` | Helper categorie a `dev3`, uso nel form prodotto a `dev2` |
| 9 | `dev3` | Ricerca sottocategorie |
| 10 | `dev3` | Collasso sottocategorie |
| 11 | `dev4` | Giacenze da backend |
| 12 | `dev4` | Rimuovere export Excel |
| 13 | `dev4` | Ricerca giacenze |
| 14 | `dev4` | Filtri giacenze |
| 16 | `dev4` | Movimenti da backend |
| 17 | `dev1` | Eliminare tab rettifiche |
