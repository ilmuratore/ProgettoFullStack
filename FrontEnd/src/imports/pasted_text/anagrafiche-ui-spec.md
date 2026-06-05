Sezione: Anagrafiche — Specifiche UI per tutte le Tab
================================================================================
Documento    : LogiChain_Figma_Prompt_Anagrafiche_V1.txt
Data         : Giugno 2025
Riferimento  : LogiChain_Navigation_UX_Spec_V1.docx — Sezione Anagrafiche
Destinatari  : Team Design Figma
================================================================================
 
 
REGOLA GLOBALE — KEBAB MENU (si applica a TUTTE le tab di Anagrafiche)
───────────────────────────────────────────────────────────────────────
In ogni tabella presente nelle tab di Anagrafiche, l'ultima colonna
"Azioni" deve essere implementata con un Kebab Menu (icona ⋮ verticale).
 
Comportamento:
  - Click sull'icona ⋮ apre un dropdown contestuale alla riga
  - Il dropdown contiene le azioni disponibili per quella specifica tab
    (dettagliate singolarmente nelle sezioni qui sotto)
  - Le voci del dropdown seguono l'ordine: Visualizza → Modifica → Elimina
    (o azioni specifiche della tab prima di quelle standard)
  - L'azione "Elimina" ha colore rosso (#DC2626) nel dropdown
  - Il dropdown si chiude al click su qualsiasi voce o fuori dall'area
  - Su mobile il dropdown diventa un bottom sheet
 
Colonna Azioni nella tabella:
  - Header: "Azioni" allineato al centro
  - Larghezza colonna: fissa, minima (solo l'icona ⋮)
  - L'icona ⋮ appare sempre visibile (non solo su hover)
 
 
REGOLA GLOBALE — TITOLO PAGINA (si applica a TUTTE le tab di Anagrafiche)
──────────────────────────────────────────────────────────────────────────
Il titolo della sezione deve aggiornarsi dinamicamente al cambio di tab.
 
Formato: "Gestione Anagrafiche — {Titolo Tab}"
 
Esempi:
  Tab Prodotti   → "Gestione Anagrafiche — Prodotti"
  Tab Categorie  → "Gestione Anagrafiche — Categorie"
  Tab Fornitori  → "Gestione Anagrafiche — Fornitori"
  Tab Clienti    → "Gestione Anagrafiche — Clienti"
  Tab Corrieri   → "Gestione Anagrafiche — Corrieri"
 
Specifica visiva del titolo:
  - "Gestione Anagrafiche" in font regular, colore secondario (#6B7280)
  - "—" separatore
  - "{Titolo Tab}" in font semibold, colore primario (#0F172A)
  - Il titolo si trova sopra la tab bar, non dentro di essa
  - Animazione: fade/slide leggero al cambio tab (150ms ease)
 
 
================================================================================
TAB 1 — PRODOTTI
================================================================================
 
TITOLO DINAMICO
  "Gestione Anagrafiche — Prodotti"
 
────────────────────────────────────────────────────────────────────────────────
HEADER SEZIONE
────────────────────────────────────────────────────────────────────────────────
 
Layout header (da sinistra a destra su stessa riga):
  [Titolo dinamico]                          [+ Nuovo Prodotto]
 
Il pulsante "+ Nuovo Prodotto":
  - Posizionato in alto a destra, allineato con il titolo
  - Stile: filled button, colore verde (#16A34A), testo bianco
  - Icona "+" a sinistra del testo
  - Click → apre Modal/Drawer di inserimento (vedi form sotto)
 
────────────────────────────────────────────────────────────────────────────────
BARRA DI RICERCA E FILTRI
────────────────────────────────────────────────────────────────────────────────
 
Sotto l'header, riga dedicata:
  [🔍 Cerca per nome o SKU...]    [Filtro Categoria ▾]    [Filtro Stato ▾]
 
  - Search input: placeholder "Cerca per nome o SKU..."
    Logica: filtra in tempo reale su Nome Prodotto e SKU (debounce 300ms)
 
  - Filtro Categoria: dropdown con lista categorie disponibili
    Voci: "Tutte le categorie" (default) + elenco categorie dal DB
    Logica: filtra la tabella per categoria_id
 
  - Filtro Stato: dropdown
    Voci: "Tutti" (default) | "Attivi" | "Disattivi"
    Logica: filtra per campo attivo=true/false (soft delete)
 
  - Reset filtri: link testo "Azzera filtri" visibile solo se almeno
    un filtro è attivo. Click → ripristina tutti i filtri al default.
 
────────────────────────────────────────────────────────────────────────────────
TABELLA — STILE LISTINO PREZZI
────────────────────────────────────────────────────────────────────────────────
 
La tabella è riprogettata come listino prezzi.
Mantenere SOLO le seguenti colonne, nell'ordine indicato:
 
  | Nome Prodotto | SKU | Categoria | Prezzo | Azioni |
  |---------------|-----|-----------|--------|--------|
 
Specifiche colonne:
  - Nome Prodotto : testo semibold, con eventuale badge "Sotto scorta"
                    in rosso (#DC2626) se giacenza < scorta_minima
  - SKU           : font monospace, colore secondario (#6B7280)
  - Categoria     : badge/pill con nome categoria, sfondo grigio chiaro
  - Prezzo        : allineato a destra, formato "€ 00,00"
  - Azioni        : icona Kebab ⋮ (vedi regola globale)
 
Righe:
  - Altezza riga: 52px
  - Zebra striping: righe alternate con sfondo #F9FAFB
  - Hover: sfondo #F1F5F9, cursore pointer
  - Prodotti disattivi (soft deleted): testo in grigio chiaro, badge
    "Inattivo" nella colonna Nome
 
Paginazione (footer tabella):
  - "Mostrando X–Y di Z prodotti"
  - Selettore: 10 / 20 / 50 righe per pagina
  - Navigazione pagine: < 1 2 3 ... >
 
────────────────────────────────────────────────────────────────────────────────
KEBAB MENU — VOCI AZIONI (Prodotti)
────────────────────────────────────────────────────────────────────────────────
 
  ⋮ dropdown:
  ├── 👁  Visualizza   → apre modal/drawer dettaglio prodotto (read-only)
  ├── ✏️  Modifica     → apre il form di editing pre-compilato
  ├── ─────────────── (separatore)
  └── 🗑  Elimina      → Confirm Dialog prima di procedere con soft delete
                         Testo conferma: "Disattivare il prodotto [Nome]?
                         Lo storico ordini e movimenti verrà preservato."
 
────────────────────────────────────────────────────────────────────────────────
FORM — "+ NUOVO PRODOTTO" (Modal o Drawer laterale)
────────────────────────────────────────────────────────────────────────────────
 
Titolo modal: "Nuovo Prodotto"
Sottotitolo: "Compila i campi per aggiungere un prodotto al catalogo"
 
Campi del form (nell'ordine):
 
  1. Nome Prodotto *
     Tipo: text input
     Placeholder: "Es. Vite M6 x 20mm"
     Validazione: obbligatorio, max 200 caratteri
 
  2. SKU *
     Tipo: text input
     Placeholder: "Es. VIT-M6-020"
     Validazione: obbligatorio, univoco (check real-time con debounce),
                  solo caratteri alfanumerici e trattini
     Helper text: "Identificativo univoco di magazzino. Non modificabile
                   dopo il salvataggio."
 
  3. Categoria
     Tipo: select dropdown con ricerca
     Placeholder: "Seleziona categoria..."
     Voci: albero categorie padre/figlio dal DB
     Opzione "Nessuna categoria" disponibile
 
  4. Fornitore
     Tipo: select dropdown con ricerca
     Placeholder: "Seleziona fornitore..."
     Voci: lista fornitori attivi dal DB
     Nota: campo non presente nel DB prodotti ma utile per pre-compilare
           PO successivi — gestito come campo UI opzionale
 
  5. Prezzo *
     Tipo: number input con prefisso "€"
     Placeholder: "0,00"
     Validazione: obbligatorio, numerico, >= 0
     Formato: 2 decimali
 
Footer modal:
  [Annulla]  →  chiude il modal senza salvare
  [Salva Prodotto]  →  POST /api/v1/prodotti → Toast success + aggiorna tabella
 
Stato loading: il pulsante "Salva" mostra spinner e diventa disabled
               durante la chiamata API.
Errore SKU duplicato: campo SKU mostra inline error "Questo SKU esiste già"
                      (risposta HTTP 409 dal backend).
 
 
================================================================================
TAB 2 — CATEGORIE
================================================================================
 
TITOLO DINAMICO
  "Gestione Anagrafiche — Categorie"
 
────────────────────────────────────────────────────────────────────────────────
HEADER SEZIONE
────────────────────────────────────────────────────────────────────────────────
 
  [Titolo dinamico]                          [+ Nuova Categoria]
 
Il pulsante "+ Nuova Categoria":
  - Stile: filled button, colore verde (#16A34A), testo bianco
  - Click → apre Modal di inserimento (vedi form sotto)
 
────────────────────────────────────────────────────────────────────────────────
BARRA DI RICERCA E FILTRI
────────────────────────────────────────────────────────────────────────────────
 
  [🔍 Cerca categoria...]    [Filtro Livello ▾]
 
  - Search: filtra su nome categoria (categorie padre e figlio)
    Logica: ricerca parziale, case-insensitive, debounce 300ms
 
  - Filtro Livello: dropdown
    Voci: "Tutti i livelli" (default) | "Solo categorie padre"
          | "Solo sottocategorie"
    Logica: filtra per categoria_padre_id IS NULL / IS NOT NULL
 
  - Reset filtri: come da regola globale
 
────────────────────────────────────────────────────────────────────────────────
TABELLA — CATEGORIE CON SOTTOCATEGORIE
────────────────────────────────────────────────────────────────────────────────
 
Colonne:
 
  | Categoria | Prodotti | Azioni |
  |-----------|----------|--------|
 
Specifiche colonne:
  - Categoria : struttura gerarchica visiva con indentazione
                Le categorie PADRE sono mostrate con testo semibold
                Le SOTTOCATEGORIE sono indentate (padding-left 24px)
                con icona "└" o linea verticale a sinistra
  - Prodotti  : contatore totale prodotti.
                Per le categorie PADRE: somma dei prodotti propri +
                somma di tutti i prodotti delle sottocategorie figlie
                (es. "12 totali" con breakdown in tooltip:
                 "8 diretti + 4 da sottocategorie")
                Per le SOTTOCATEGORIE: solo i prodotti della
                sottocategoria stessa (es. "4")
  - Azioni    : icona Kebab ⋮
 
Le righe delle categorie padre hanno sfondo leggermente diverso (#F8FAFC)
per distinguerle visivamente dalle sottocategorie.
 
Toggle espandi/collassa per visualizzare/nascondere le sottocategorie
di una categoria padre (icona ▶ / ▼ a sinistra del nome).
 
────────────────────────────────────────────────────────────────────────────────
KEBAB MENU — VOCI AZIONI (Categorie)
────────────────────────────────────────────────────────────────────────────────
 
  ⋮ dropdown:
  ├── 👁  Visualizza           → modal dettaglio categoria (read-only)
  ├── ✏️  Modifica             → form editing pre-compilato
  ├── ➕  Aggiungi Sottocategoria → apre form "Nuova Sottocategoria"
  │                               con categoria padre pre-selezionata
  │                               (disponibile solo per categorie padre,
  │                               non per sottocategorie già figlie)
  ├── ─────────────────────── (separatore)
  └── 🗑  Elimina              → Confirm Dialog.
                                 Se la categoria ha sottocategorie o prodotti
                                 associati, mostrare warning:
                                 "Questa categoria contiene X prodotti e
                                 Y sottocategorie. Eliminando la categoria
                                 i prodotti rimarranno senza categoria."
                                 Richiedere conferma testuale.
 
────────────────────────────────────────────────────────────────────────────────
FORM — "+ NUOVA CATEGORIA" (Modal)
────────────────────────────────────────────────────────────────────────────────
 
Titolo modal: "Nuova Categoria"
 
Campi:
 
  1. Nome Categoria *
     Tipo: text input
     Placeholder: "Es. Componentistica Elettrica"
     Validazione: obbligatorio, univoco, max 100 caratteri
 
  2. Categoria Padre  (opzionale)
     Tipo: select dropdown
     Placeholder: "Nessuna (categoria radice)"
     Voci: lista delle sole categorie padre (non sottocategorie)
     Helper text: "Lascia vuoto per creare una categoria principale."
     Nota: se si arriva qui tramite "Aggiungi Sottocategoria" dal kebab,
           questo campo è pre-compilato e read-only.
 
Footer modal:
  [Annulla]  |  [Salva Categoria]
 
 
================================================================================
TAB 3 — FORNITORI
================================================================================
 
TITOLO DINAMICO
  "Gestione Anagrafiche — Fornitori"
 
────────────────────────────────────────────────────────────────────────────────
HEADER SEZIONE
────────────────────────────────────────────────────────────────────────────────
 
  [Titolo dinamico]                          [+ Nuovo Fornitore]
 
────────────────────────────────────────────────────────────────────────────────
BARRA DI RICERCA E FILTRI
────────────────────────────────────────────────────────────────────────────────
 
  [🔍 Cerca per nome o P.IVA...]    [Filtro Categoria ▾]    [Filtro Stato ▾]
 
  - Search: filtra su ragione_sociale e piva (debounce 300ms)
 
  - Filtro Categoria: dropdown con le categorie prodotti
    (per trovare fornitori che forniscono quella categoria)
 
  - Filtro Stato: "Tutti" | "Attivi" | "Inattivi"
 
  - Reset filtri: come da regola globale
 
────────────────────────────────────────────────────────────────────────────────
TABELLA — FORNITORI
────────────────────────────────────────────────────────────────────────────────
 
Colonne (rimozione Lead Time come da specifica):
 
  | Codice | Ragione Sociale | P.IVA | Città | Contatti | Categoria | Stato | Azioni |
  |--------|-----------------|-------|-------|----------|-----------|-------|--------|
 
Specifiche colonne:
  - Codice          : generato dall'ID DB, formato "FOR-0001", font monospace
  - Ragione Sociale : testo semibold, cliccabile → va alla scheda fornitore
  - P.IVA           : testo regular, colore secondario
  - Città           : testo regular
  - Contatti        : icona email + icona telefono cliccabili (mailto/tel)
                      Tooltip con email e telefono al hover
  - Categoria       : badge/pill con la categoria principale del fornitore
  - Stato           : badge "Attivo" verde | "Inattivo" grigio
  - Azioni          : icona Kebab ⋮
 
NOTA: la colonna "Lead Time" viene eliminata dalla tabella come da specifica.
 
────────────────────────────────────────────────────────────────────────────────
KEBAB MENU — VOCI AZIONI (Fornitori)
────────────────────────────────────────────────────────────────────────────────
 
  ⋮ dropdown:
  ├── 👁  Visualizza  → apre scheda dettaglio fornitore (drawer o pagina)
  ├── ✏️  Modifica    → apre form editing pre-compilato
  ├── ─────────────── (separatore)
  └── 🗑  Elimina     → Confirm Dialog: "Disattivare il fornitore [Ragione Sociale]?
                         Gli ordini di acquisto esistenti non verranno modificati."
 
────────────────────────────────────────────────────────────────────────────────
FORM — "+ NUOVO FORNITORE" (Modal o Drawer laterale)
────────────────────────────────────────────────────────────────────────────────
 
Titolo modal: "Nuovo Fornitore"
 
Campi del form (nell'ordine):
 
  1. Ragione Sociale *
     Tipo: text input
     Placeholder: "Es. Rossi Componenti S.r.l."
     Validazione: obbligatorio, max 200 caratteri
 
  2. Codice
     Tipo: text input disabilitato (read-only)
     Valore: generato automaticamente dall'ID ("FOR-0001")
     Stile: sfondo grigio (#F1F5F9), cursore not-allowed
     Helper text: "Generato automaticamente dal sistema."
 
  3. P.IVA
     Tipo: text input
     Placeholder: "Es. 01234567890"
     Validazione: formato P.IVA italiana (11 cifre) o nullable per esteri
     Helper text: "Lascia vuoto per fornitori esteri."
 
  4. Città
     Tipo: text input
     Placeholder: "Es. Milano"
 
  5. Contatti
     Sotto-sezione "Contatti" con campi ripetibili (aggiungi/rimuovi):
       - Nome contatto    : text input
       - Ruolo contatto   : select (Commerciale | Logistica | Amministrazione | Altro)
       - Email            : email input
       - Telefono         : tel input
     Pulsante "+ Aggiungi contatto" per aggiungere righe
     Ogni riga ha icona 🗑 per rimuoverla
 
  6. Categoria
     Tipo: select dropdown (multi-select opzionale)
     Placeholder: "Seleziona categoria merceologica..."
     Voci: lista categorie dal DB
 
  7. Stato
     Tipo: toggle switch
     Default: Attivo
     Label: "Attivo / Inattivo"
 
Footer modal:
  [Annulla]  |  [Salva Fornitore]
 
 
================================================================================
TAB 4 — CLIENTI
================================================================================
 
TITOLO DINAMICO
  "Gestione Anagrafiche — Clienti"
 
────────────────────────────────────────────────────────────────────────────────
HEADER SEZIONE
────────────────────────────────────────────────────────────────────────────────
 
  [Titolo dinamico]                          [+ Nuovo Cliente]
 
────────────────────────────────────────────────────────────────────────────────
BARRA DI RICERCA E FILTRI
────────────────────────────────────────────────────────────────────────────────
 
  [🔍 Cerca per nome, P.IVA o CF...]    [Filtro Città ▾]    [Filtro Stato ▾]
 
  - Search: filtra su ragione_sociale, piva_cf (debounce 300ms)
  - Filtro Città: select dinamica con le città presenti nel DB
  - Filtro Stato: "Tutti" | "Attivi" | "Inattivi"
  - Reset filtri: come da regola globale
 
────────────────────────────────────────────────────────────────────────────────
TABELLA — CLIENTI
────────────────────────────────────────────────────────────────────────────────
 
Colonne:
 
  | Codice | Ragione Sociale | P.IVA / CF | Città | Contatti | Fatturato | Stato | Azioni |
  |--------|-----------------|------------|-------|----------|-----------|-------|--------|
 
Specifiche colonne:
  - Codice          : generato automaticamente dall'ID, formato "CLI-0001",
                      font monospace
  - Ragione Sociale : testo semibold, cliccabile → scheda cliente
  - P.IVA / CF      : testo regular, colore secondario
  - Città           : da destinazione predefinita del cliente
  - Contatti        : icona email + icona telefono con tooltip
  - Fatturato       : somma importo_totale degli ordini CONFERMATI/SPEDITI
                      del cliente, formato "€ 00.000,00"
  - Stato           : badge "Attivo" verde | "Inattivo" grigio
  - Azioni          : icona Kebab ⋮
 
────────────────────────────────────────────────────────────────────────────────
KEBAB MENU — VOCI AZIONI (Clienti)
────────────────────────────────────────────────────────────────────────────────
 
  ⋮ dropdown:
  ├── 👁  Visualizza  → scheda dettaglio cliente con storico ordini
  ├── ✏️  Modifica    → form editing pre-compilato
  ├── ─────────────── (separatore)
  └── 🗑  Elimina     → Confirm Dialog: "Disattivare il cliente [Ragione Sociale]?
                         Lo storico ordini verrà preservato."
 
────────────────────────────────────────────────────────────────────────────────
FORM — "+ NUOVO CLIENTE" (Modal o Drawer laterale)
────────────────────────────────────────────────────────────────────────────────
 
Titolo modal: "Nuovo Cliente"
 
Campi del form (nell'ordine):
 
  1. Ragione Sociale *
     Tipo: text input
     Placeholder: "Es. Bianchi Distribuzione S.p.A."
     Validazione: obbligatorio, max 200 caratteri
 
  2. Codice
     Tipo: text input disabilitato (read-only)
     Valore: generato automaticamente ("CLI-0001")
     Stile: sfondo grigio (#F1F5F9)
     Helper text: "Generato automaticamente dal sistema."
 
  3. P.IVA / Codice Fiscale
     Tipo: text input
     Placeholder: "P.IVA o Codice Fiscale"
     Validazione: univoco, nullable per clienti esteri
     Helper text: "Inserisci P.IVA (aziende) o Codice Fiscale (privati).
                   Lascia vuoto per clienti esteri."
 
  4. Città *
     Tipo: text input
     Placeholder: "Es. Roma"
 
  5. Contatti
     Stessa struttura ripetibile dei Fornitori:
       - Email   : email input
       - Telefono: tel input
     Pulsante "+ Aggiungi contatto"
 
  6. Fatturato
     Tipo: campo calcolato, read-only (non inserito manualmente)
     Stile: sfondo grigio, valore "—" alla creazione
     Helper text: "Calcolato automaticamente dagli ordini confermati."
 
  7. Stato
     Tipo: toggle switch
     Default: Attivo
 
  SEZIONE DESTINAZIONI (opzionale alla creazione, gestibile in modifica):
  Sottotitolo: "Destinazioni di Consegna"
  Campi ripetibili per ogni destinazione:
    - Etichetta      : text input (Es. "Sede Principale", "Deposito Nord")
    - Indirizzo      : text input
    - CAP            : text input
    - Città          : text input
    - Provincia      : text input (2 caratteri)
    - Paese          : text input (default "Italia")
    - Predefinita    : radio button (una sola per cliente)
  Pulsante "+ Aggiungi destinazione"
 
Footer modal:
  [Annulla]  |  [Salva Cliente]
 
 
================================================================================
TAB 5 — CORRIERI
================================================================================
 
TITOLO DINAMICO
  "Gestione Anagrafiche — Corrieri"
 
────────────────────────────────────────────────────────────────────────────────
HEADER SEZIONE
────────────────────────────────────────────────────────────────────────────────
 
  [Titolo dinamico]                          [+ Nuovo Corriere]
 
────────────────────────────────────────────────────────────────────────────────
BARRA DI RICERCA E FILTRI
────────────────────────────────────────────────────────────────────────────────
 
  [🔍 Cerca per nome o codice...]    [Filtro Stato ▾]
 
  - Search: filtra su nome e codice corriere (debounce 300ms)
  - Filtro Stato: "Tutti" | "Attivi" | "Inattivi"
  - Reset filtri: come da regola globale
 
────────────────────────────────────────────────────────────────────────────────
TABELLA — CORRIERI
────────────────────────────────────────────────────────────────────────────────
 
Colonne:
 
  | Nome | Codice | Email | Telefono | Spedizioni Attive | Stato | Azioni |
  |------|--------|-------|----------|-------------------|-------|--------|
 
Specifiche colonne:
  - Nome              : testo semibold
  - Codice            : font monospace, colore secondario
                        (inserito manualmente, es. "BRT", "GLS", "SDA")
  - Email             : icona email cliccabile (mailto:) con tooltip
  - Telefono          : icona telefono cliccabile (tel:) con tooltip
  - Spedizioni Attive : contatore spedizioni in stato IN_PREPARAZIONE
                        o SPEDITA assegnate a questo corriere
                        Formato: numero con badge colorato (ambra se > 0)
  - Stato             : badge "Attivo" verde | "Inattivo" grigio
  - Azioni            : icona Kebab ⋮
 
────────────────────────────────────────────────────────────────────────────────
KEBAB MENU — VOCI AZIONI (Corrieri)
────────────────────────────────────────────────────────────────────────────────
 
  ⋮ dropdown:
  ├── 👁  Visualizza  → scheda dettaglio corriere con lista spedizioni
  ├── ✏️  Modifica    → form editing pre-compilato
  ├── ─────────────── (separatore)
  └── 🗑  Elimina     → Confirm Dialog.
                        Se il corriere ha spedizioni attive mostrare warning:
                        "Questo corriere ha X spedizioni attive.
                         Impossibile eliminare. Disattivarlo?"
                        Con 2 opzioni: [Disattiva] | [Annulla]
 
────────────────────────────────────────────────────────────────────────────────
FORM — "+ NUOVO CORRIERE" (Modal)
────────────────────────────────────────────────────────────────────────────────
 
Titolo modal: "Nuovo Corriere"
 
Campi del form (nell'ordine):
 
  1. Nome *
     Tipo: text input
     Placeholder: "Es. BRT Corriere Espresso"
     Validazione: obbligatorio, univoco, max 100 caratteri
 
  2. Codice *
     Tipo: text input (inserito MANUALMENTE a differenza di Fornitore/Cliente)
     Placeholder: "Es. BRT"
     Validazione: obbligatorio, univoco, max 10 caratteri, uppercase automatico
     Helper text: "Codice operativo breve. Inserito manualmente.
                   Es: BRT, GLS, SDA, TNT, UPS"
 
  3. Email Operativa
     Tipo: email input
     Placeholder: "operativo@corriere.it"
     Validazione: formato email valido
 
  4. Telefono
     Tipo: tel input
     Placeholder: "Es. 02 1234567"
 
  5. Spedizioni Attive
     Tipo: campo calcolato, read-only
     Stile: sfondo grigio, valore "0" alla creazione
     Helper text: "Aggiornato automaticamente dalle spedizioni assegnate."
 
  6. Stato
     Tipo: toggle switch
     Default: Attivo
 
Footer modal:
  [Annulla]  |  [Salva Corriere]
 
 
================================================================================
TAB 6 — DIPENDENTI → ELIMINARE
================================================================================
 
⚠️  AZIONE RICHIESTA: ELIMINARE COMPLETAMENTE questa tab da Anagrafiche.
 
Motivazione: La gestione dei dipendenti è già presente nella sezione
             Amministrazione con form e tabella identici. Mantenerla
             anche in Anagrafiche è una ridondanza che crea confusione
             e rischio di disallineamento tra le due viste.
 
Azione da eseguire in Figma:
  1. Rimuovere la tab "Dipendenti" dalla tab bar di Anagrafiche
  2. Eliminare tutti i frame/componenti collegati a questa tab
     nella sezione Anagrafiche
  3. Verificare che i link/prototype connections che puntavano
     a questa tab vengano reindirizzati o rimossi
  4. La tab bar di Anagrafiche passa da 6 tab a 5 tab:
     Prodotti | Categorie | Fornitori | Clienti | Corrieri
 
Riferimento per la gestione Dipendenti:
  → Amministrazione → Tab "Dipendenti" (quella è la versione canonica)
 
 
================================================================================
RIEPILOGO MODIFICHE — CHECKLIST FIGMA
================================================================================
 
  GLOBALE
  ☐  Implementare kebab menu ⋮ in tutte le tabelle di Anagrafiche
  ☐  Implementare titolo dinamico "Gestione Anagrafiche — {Tab}" su tutte le tab
 
  TAB 1 — PRODOTTI
  ☐  Pulsante "+ Nuovo Prodotto" con form (Nome, SKU, Categoria, Fornitore, Prezzo)
  ☐  Barra ricerca + filtri (Categoria, Stato) con logica implementata
  ☐  Tabella ridisegnata come listino: Nome | SKU | Categoria | Prezzo | Azioni
  ☐  Kebab menu: Visualizza | Modifica | Elimina (con confirm dialog)
 
  TAB 2 — CATEGORIE
  ☐  Pulsante "+ Nuova Categoria" con form (Nome, Categoria Padre opzionale)
  ☐  Barra ricerca + filtro Livello con logica implementata
  ☐  Tabella con gerarchia visiva padre/figlio + contatori prodotti sommati
  ☐  Kebab menu: Visualizza | Modifica | Aggiungi Sottocategoria | Elimina
 
  TAB 3 — FORNITORI
  ☐  Pulsante "+ Nuovo Fornitore" con form (RS, Codice auto, P.IVA, Città,
      Contatti multipli, Categoria, Stato)
  ☐  Barra ricerca + filtri (Categoria, Stato) con logica implementata
  ☐  Rimuovere colonna Lead Time dalla tabella
  ☐  Kebab menu: Visualizza | Modifica | Elimina
 
  TAB 4 — CLIENTI
  ☐  Pulsante "+ Nuovo Cliente" con form (RS, Codice auto, P.IVA/CF, Città,
      Contatti, Fatturato calcolato, Stato, Destinazioni)
  ☐  Barra ricerca + filtri (Città, Stato) con logica implementata
  ☐  Kebab menu: Visualizza | Modifica | Elimina
 
  TAB 5 — CORRIERI
  ☐  Pulsante "+ Nuovo Corriere" con form (Nome, Codice manuale, Email,
      Telefono, Spedizioni Attive calcolato, Stato)
  ☐  Barra ricerca + filtro Stato con logica implementata
  ☐  Kebab menu: Visualizza | Modifica | Elimina (con warning spedizioni attive)
 
  TAB 6 — DIPENDENTI
  ☐  ELIMINARE tab e relativi frame da Anagrafiche
 
 
================================================================================
NOTE TECNICHE PER IL BACKEND (da comunicare al team)
================================================================================
 
  - Campo "Fatturato" (Clienti): aggregazione lato server su ordini
    con stato IN (CONFERMATO, SPEDITO, COMPLETATO) per cliente_id.
    Endpoint suggerito: GET /api/v1/clienti/:id/fatturato
 
  - Campo "Spedizioni Attive" (Corrieri): count spedizioni con stato
    IN (IN_PREPARAZIONE, SPEDITA) per corriere_id.
    Già coperto da idx_spedizioni_corriere e idx_spedizioni_stato.
 
  - Campo "Codice Fornitore/Cliente": formato "FOR-{ID:04d}" / "CLI-{ID:04d}"
    generato lato backend al momento della creazione (non un campo separato
    nel DB — derivato dall'ID).
 
  - Campo "Fornitore" nel form Prodotti: non presente nella tabella prodotti
    del DB corrente. Valutare se aggiungere fornitore_id FK a prodotti
    oppure gestirlo come campo UI-only per pre-compilare i PO.
    → Decisione da prendere con il Tech Lead.
 
  - Contatori Categorie: la somma prodotti padre + figlio richiede
    una query ricorsiva o una view SQL dedicata.
    Suggerito: view materializzata o CTE ricorsiva.