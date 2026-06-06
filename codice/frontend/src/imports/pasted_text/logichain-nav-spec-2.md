================================================================================
LOGICHAIN ERP — NAVIGATION & CONTENT SPECIFICATION V1.0
Descrizione completa del documento allegato a Figma
================================================================================
File di riferimento : LogiChain_Navigation_UX_Spec_V1.docx
Versione documento  : V1.0 — Giugno 2025
Autori              : Tech Lead + PM + UX/UI Lead
Destinatari         : Team Design (Figma) + Team Frontend (React)
Stato               : Approvato — Baseline Design System
Classificazione     : CONFIDENZIALE
================================================================================


SCOPO DEL DOCUMENTO
───────────────────
Questo documento definisce l'intera struttura navigazionale e i contenuti
dell'interfaccia utente di LogiChain ERP. Stabilisce:

  - Quali sezioni della sidebar sono visibili per ogni ruolo
  - Quali tab esistono all'interno di ogni pagina/sezione
  - Quali KPI, widget e componenti vanno inseriti in ogni tab
  - I 30 permessi RBAC granulari e la loro assegnazione ai 5 ruoli
  - La libreria dei componenti UI riutilizzabili
  - La mappatura colori per tutti gli stati degli enum di database
  - La gestione standardizzata degli errori HTTP nel frontend

È il documento di riferimento da importare in Figma per strutturare
l'architettura dell'informazione e organizzare i frame/artboard.


================================================================================
STRUTTURA DEL DOCUMENTO — 6 SEZIONI
================================================================================


────────────────────────────────────────────────────────────────────────────────
SEZIONE 1 — PANORAMICA ARCHITETTURA NAVIGAZIONE
────────────────────────────────────────────────────────────────────────────────

Descrive i principi fondamentali su cui si basa tutta la navigazione.

PRINCIPI UX ADOTTATI (5 principi):

  1. Tab Navigation
     Ogni pagina principale usa una tab bar orizzontale interna per raggruppare
     contenuti correlati. Massimo 4-5 tab per pagina. Su mobile la tab bar
     collassa in un dropdown select.

  2. Role-Based View
     Ogni ruolo vede solo le sezioni di sua competenza. Sidebar e tab si
     adattano dinamicamente al ruolo autenticato tramite RBAC frontend.
     Il controllo reale è sempre lato backend; la UI si adegua per UX.

  3. Generale = Sunto
     La pagina "Generale" di ogni ruolo è una dashboard aggregata con KPI,
     widget e link rapidi alle pagine di dettaglio pertinenti al ruolo.
     Non replica i contenuti — li sintetizza con dati chiave.

  4. Progressive Disclosure
     I dettagli operativi sono accessibili via drill-down (modale o pagina
     dettaglio), non inline nella lista. Le liste mostrano solo i dati
     essenziali per la scansione rapida.

  5. Feedback Immediato
     Ogni azione critica mostra un Toast di conferma. Gli errori 422
     (stock insufficiente, transizione stato non valida) vengono mostrati
     inline nel form con il dettaglio del vincolo violato.

MATRICE SIDEBAR × RUOLO:

  La sezione include una tabella che mostra, per ogni voce della sidebar
  e per ogni ruolo, il livello di accesso:

  Legenda:
    ✅           = accesso completo
    ✅ (parz.)   = accesso parziale (solo alcune funzionalità)
    ✅ (read)    = sola lettura
    —            = sezione non visibile per il ruolo

  Voci sidebar    | Admin | Resp.Acq. | Resp.Mag. | Operatore | Corriere
  ─────────────────────────────────────────────────────────────────────
  Generale        |  ✅   |    ✅     |    ✅     |    ✅     |   ✅
  Anagrafiche     |  ✅   |  ✅ parz. |    —      |  ✅ read  |   —
  Magazzino       |  ✅   |    —      |    ✅     |  ✅ read  |   —
  Acquisti        |  ✅   |    ✅     |    —      |    —      |   —
  Vendite         |  ✅   |    —      |  ✅ parz. |    ✅     |   —
  Logistica       |  ✅   |    —      |    ✅     |    —      |   ✅
  Amministrazione |  ✅   |    —      |    —      |    —      |   —


────────────────────────────────────────────────────────────────────────────────
SEZIONE 2 — SPECIFICA DETTAGLIATA PER RUOLO
────────────────────────────────────────────────────────────────────────────────

Per ognuno dei 5 ruoli viene fornita la specifica completa di ogni
sezione visibile, con tutti i tab e i loro contenuti precisi.

╔══════════════════════════════════════════════════════════════════════════════╗
║  RUOLO 1 — ADMIN                                                            ║
║  Colore identificativo: Nero (#0F172A)                                      ║
║  Accesso: completo a tutte le 7 sezioni della sidebar                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

  GENERALE (Dashboard globale)
  ├── Tab "Dashboard"
  │     KPI card: Prodotti sotto scorta (contatore + lista rapida)
  │     KPI card: Valore totale stock (somma quantità × prezzo medio)
  │     KPI card: Ordini in entrata per stato (grafico barre)
  │     KPI card: Ordini in uscita per stato (grafico torta)
  │     Widget: Spedizioni del giorno (tabella corriere/tracking/stato)
  │     Widget: Ultimi 20 movimenti stock (feed cronologico)
  │     Widget: Top 5 prodotti più movimentati (settimana corrente)
  │     Widget: Notifiche non lette (anteprima ultime 5)
  └── Tab "Alert & Notifiche"
        Lista completa notifiche (tutti i tipi, tutti gli utenti)
        Filtri: tipo / utente destinatario / letto-non letto / data range
        Azioni: mark-as-read singola e massiva
        Badge contatore per tipo notifica

  ANAGRAFICHE
  ├── Tab "Prodotti"
  │     Lista prodotti con filtri: categoria / SKU / nome / stato attivo
  │     Alert visivo SKU sotto scorta minima
  │     CRUD prodotto: SKU, nome, descrizione, categoria, UM, peso, scorta minima
  │     Toggle attivo/disattivato (soft delete)
  ├── Tab "Categorie"
  │     Albero categorie a 2 livelli (padre/figlio)
  │     CRUD categoria con assegnazione categoria padre
  │     Contatore prodotti per categoria
  ├── Tab "Fornitori"
  │     Lista fornitori con filtri: nome / P.IVA / stato
  │     CRUD fornitore completo
  │     Gestione contatti multipli per fornitore
  │     Lead time medio calcolato da storico ricezioni
  │     Storico ordini di acquisto del fornitore
  ├── Tab "Clienti"
  │     Lista clienti con filtri: nome / P.IVA-CF / città
  │     CRUD cliente completo
  │     Gestione destinazioni di consegna multiple + flag predefinita
  │     Storico ordini in uscita per cliente
  ├── Tab "Corrieri"
  │     Lista corrieri con conteggio spedizioni per stato
  │     CRUD corriere: nome, codice, email operativa, telefono, note
  │     Assegnazione utente responsabile
  └── Tab "Dipendenti"
        Lista dipendenti con filtri: nome / CF / ruolo operativo
        CRUD dipendente completo
        Collegamento opzionale dipendente → account utente di sistema

  MAGAZZINO
  ├── Tab "Struttura"
  │     Tree view interattivo: Magazzino → Corsia → Scaffale → Ubicazione
  │     CRUD magazzino e ubicazioni
  │     Attivazione/disattivazione slot per manutenzione/quarantena
  │     Contatore giacenze per ubicazione nel tree
  ├── Tab "Giacenze"
  │     Vista giacenze per prodotto (somma su tutte le ubicazioni)
  │     Vista giacenze per ubicazione (dettaglio slot)
  │     Alert visivo prodotti sotto scorta minima
  │     Filtri: prodotto / magazzino / ubicazione / solo sotto-scorta
  ├── Tab "Movimenti"
  │     Audit log immutabile completo
  │     Filtri: prodotto / tipo movimento / ubicazione / utente / data range
  │     Spostamento stock inter-ubicazione (transazione atomica)
  └── Tab "Rettifiche"
        Form rettifica manuale giacenza (solo Admin + Resp. Magazzino)
        Campi: prodotto, ubicazione, nuova quantità, nota obbligatoria
        Storico rettifiche filtrate per prodotto/data/utente

  ACQUISTI
  ├── Tab "Ordini"
  │     Lista PO con filtri: stato / fornitore / data range
  │     CRUD PO: testata (fornitore, data prevista) + righe (prodotto, qtà, prezzo)
  │     Transizioni di stato con controllo RBAC
  │     Badge stato colorato per ogni PO
  ├── Tab "Ricezioni"
  │     Form ricezione totale/parziale per PO in stato IN_RICEZIONE
  │     Selezione ubicazione destinazione per ogni riga ricevuta
  │     Storico ricezioni per PO con dettaglio quantità e ubicazioni
  │     Notifica automatica RICEZIONE_PARZIALE al completamento
  └── Tab "KPI Acquisti"
        Grafico: PO per stato (barre)
        KPI: importo totale ordini aperti
        Tabella: PO in ritardo (data prevista superata)
        Lead time medio per fornitore

  VENDITE
  ├── Tab "Ordini"
  │     Lista ordini con filtri: stato commerciale / stato picking / cliente / data
  │     CRUD ordine: cliente, destinazione, data consegna, righe prodotto
  │     Verifica disponibilità stock inline per ogni riga
  │     Transizioni stato commerciale con RBAC
  ├── Tab "Picking"
  │     Picking list per ordine ordinata per ubicazione
  │     Conferma picking con scarico automatico giacenze (transazione atomica)
  │     Annullamento con ripristino giacenze se picking in corso
  │     Filtri: solo ordini IN_PICKING / per operatore
  └── Tab "KPI Vendite"
        Grafico: ordini per stato commerciale (torta)
        KPI: fatturato ordini confermati del mese
        Top 10 prodotti più venduti
        Tabella: ordini con data consegna imminente

  LOGISTICA
  ├── Tab "Spedizioni"
  │     Lista spedizioni con filtri: stato / corriere / data range
  │     Creazione spedizione da ordine in PICKING_COMPLETATO
  │     Inserimento tracking number
  │     Transizioni stato: IN_PREPARAZIONE → SPEDITA → CONSEGNATA | PROBLEMA
  ├── Tab "DDT"
  │     Lista DDT con numero progressivo/anno, download PDF
  │     Generazione automatica DDT PDF alla creazione spedizione
  │     Storico DDT per ordine/per corriere
  │     Numerazione atomica via SEQUENCE PostgreSQL
  └── Tab "KPI Logistica"
        Spedizioni del giorno per corriere
        Tasso consegna: CONSEGNATA vs PROBLEMA
        Tempo medio spedizione → consegna

  AMMINISTRAZIONE
  ├── Tab "Utenti"
  │     Lista utenti con filtri: ruolo / stato attivo
  │     Creazione utente (solo Admin): nome, email, password temporanea, ruolo
  │     Attivazione/disattivazione utente (soft disable)
  │     Reset password
  ├── Tab "Ruoli & Permessi"
  │     Matrice ruoli × permessi con toggle attivazione/disattivazione
  │     CRUD ruolo: nome, descrizione
  │     Lista permessi codificati
  └── Tab "Impostazioni"
        Configurazione dati aziendali (per intestazione DDT)
        Soglia scorta minima globale (default per nuovi prodotti)
        Impostazioni notifiche: frequenza polling, tipi abilitati


╔══════════════════════════════════════════════════════════════════════════════╗
║  RUOLO 2 — RESPONSABILE ACQUISTI                                            ║
║  Colore identificativo: Blu (#1D4ED8)                                       ║
║  Sezioni visibili: Generale, Anagrafiche (parziale), Acquisti               ║
╚══════════════════════════════════════════════════════════════════════════════╝

  GENERALE (Dashboard ciclo acquisti)
  ├── Tab "Dashboard"
  │     KPI card: PO aperti per stato (barre)
  │     KPI card: Importo totale ordini aperti
  │     Widget: PO in ritardo (data prevista superata)
  │     Widget: Lead time medio per fornitore
  │     Widget: Notifiche non lette (RICEZIONE_PARZIALE, PO_IN_RITARDO)
  │     Widget: Ultimi movimenti CARICO_ACQUISTO (ultimi 10)
  └── Tab "Alert"
        Lista notifiche personali: PO_IN_RITARDO, RICEZIONE_PARZIALE
        Filtri: letto/non letto / data
        Mark-as-read singola e massiva

  ANAGRAFICHE
  ├── Tab "Prodotti"  [sola lettura]
  │     Lista prodotti con filtri: categoria / SKU / nome
  │     Dettaglio prodotto: scorta minima, unità misura, peso
  │     Alert visivo SKU sotto scorta minima
  └── Tab "Fornitori"  [accesso completo CRUD]
        Lista fornitori con filtri: nome / P.IVA / stato
        CRUD fornitore: ragione sociale, P.IVA, indirizzo, email, telefono
        Gestione contatti multipli
        Lead time medio (view SQL storico ricezioni)
        Storico PO per fornitore

  ACQUISTI
  ├── Tab "Ordini"
  │     Lista PO con filtri: stato / fornitore / data range
  │     Creazione PO: testata + righe multiple (prodotto, qtà, prezzo)
  │     Transizioni: BOZZA → INVIATO → CONFERMATO
  │     Annullamento PO (BOZZA / INVIATO)
  ├── Tab "Ricezioni"
  │     Form ricezione totale/parziale per PO CONFERMATO o IN_RICEZIONE
  │     Selezione ubicazione per ogni riga ricevuta
  │     Transizione automatica IN_RICEZIONE → COMPLETATO quando tutto ricevuto
  │     Storico ricezioni per PO
  └── Tab "KPI"
        Grafico PO per stato
        Tabella PO in ritardo
        Importo totale ordinato nel mese


╔══════════════════════════════════════════════════════════════════════════════╗
║  RUOLO 3 — RESPONSABILE MAGAZZINO                                           ║
║  Colore identificativo: Teal (#0D9488)                                      ║
║  Sezioni visibili: Generale, Magazzino, Vendite (parziale), Logistica       ║
╚══════════════════════════════════════════════════════════════════════════════╝

  GENERALE (Dashboard magazzino e logistica)
  ├── Tab "Dashboard"
  │     KPI card: Prodotti sotto scorta (lista rapida con alert)
  │     KPI card: Valore totale stock
  │     Widget: Ordini in stato PICKING_COMPLETATO pronti per spedizione
  │     Widget: Spedizioni del giorno per stato
  │     Widget: Ultimi 20 movimenti stock
  │     Widget: Ubicazioni disattive (manutenzione/quarantena)
  └── Tab "Alert"
        Notifiche: SOTTO_SCORTA, CAMBIO_STATO_SPEDIZIONE
        Mark-as-read singola e massiva

  MAGAZZINO  [accesso completo]
  ├── Tab "Struttura"    → Tree view + CRUD magazzini/ubicazioni
  ├── Tab "Giacenze"     → Per prodotto e per ubicazione + alert
  ├── Tab "Movimenti"    → Audit log + spostamento inter-ubicazione
  └── Tab "Rettifiche"   → Form rettifica manuale + storico

  VENDITE  [parziale: no KPI commerciali]
  ├── Tab "Ordini"
  │     Lista ordini con filtri: stato / cliente / data
  │     Conferma ordine (BOZZA → CONFERMATO)
  │     Annullamento con ripristino giacenze
  └── Tab "Picking"
        Lista ordini IN_PICKING
        Picking list per ubicazione
        Approvazione picking completato → PICKING_COMPLETATO

  LOGISTICA  [accesso completo]
  ├── Tab "Spedizioni"   → Lista + creazione + aggiornamento stato
  └── Tab "DDT"          → Lista + download PDF


╔══════════════════════════════════════════════════════════════════════════════╗
║  RUOLO 4 — OPERATORE                                                        ║
║  Colore identificativo: Verde (#16A34A)                                     ║
║  Sezioni visibili: Generale, Anagrafiche (read), Vendite, Magazzino (read)  ║
╚══════════════════════════════════════════════════════════════════════════════╝

  GENERALE (Dashboard personale)
  ├── Tab "Dashboard"
  │     KPI card: I miei ordini per stato
  │     Widget: Ordini IN_PICKING assegnati a me
  │     Widget: Prodotti sotto scorta (sola lettura, alert visivo)
  │     Widget: Notifiche personali non lette
  │     Widget: Ultimi movimenti generati da me
  └── Tab "Alert"
        Notifiche personali: CAMBIO_STATO_SPEDIZIONE per ordini miei
        Mark-as-read

  ANAGRAFICHE  [sola lettura]
  ├── Tab "Prodotti"   → Lista + disponibilità stock inline
  └── Tab "Clienti"   → Lista + destinazioni (per selezione in ordine)

  VENDITE  [creazione ordini + picking]
  ├── Tab "Ordini"
  │     Lista ordini personali con filtri: stato / data
  │     Creazione ordine: cliente, destinazione, righe con verifica stock
  │     Annullamento ordine in BOZZA
  └── Tab "Picking"
        Picking list per ordine ordinata per ubicazione
        Avvio picking (CONFERMATO → IN_PICKING)
        Conferma picking completato con scarico giacenze

  MAGAZZINO  [sola lettura]
  └── Tab "Giacenze"
        Vista giacenze per prodotto (read-only)
        Vista per ubicazione (per navigare durante il picking)
        Alert visivo sotto scorta


╔══════════════════════════════════════════════════════════════════════════════╗
║  RUOLO 5 — CORRIERE                                                         ║
║  Colore identificativo: Arancione (#EA580C)                                 ║
║  Sezioni visibili: Generale, Logistica                                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

  GENERALE (Dashboard spedizioni assegnate)
  └── Tab "Dashboard"
        KPI card: Spedizioni di oggi (contatore per stato)
        Widget: Lista spedizioni IN_PREPARAZIONE da ritirare
        Widget: Lista spedizioni SPEDITA in transito
        Widget: Notifiche CAMBIO_STATO_SPEDIZIONE personali

  LOGISTICA  [solo spedizioni assegnate al proprio codice corriere]
  ├── Tab "Spedizioni"
  │     Lista spedizioni filtrate per il mio codice corriere
  │     Filtri: stato / data spedizione
  │     Aggiornamento stato: SPEDITA → CONSEGNATA | PROBLEMA
  │     Inserimento/aggiornamento tracking number
  │     Dettaglio spedizione: DDT allegato, indirizzo destinatario
  └── Tab "DDT"
        Download PDF DDT per spedizioni assegnate
        Dettaglio merci: prodotti, quantità, peso totale


────────────────────────────────────────────────────────────────────────────────
SEZIONE 3 — LIBRERIA COMPONENTI UI RIUTILIZZABILI (12 componenti)
────────────────────────────────────────────────────────────────────────────────

Definisce i componenti standard da implementare nel design system Figma
e nel codice React. Tutti devono supportare tema chiaro/scuro e rispettare
i token colore definiti.

  1. KPI Card
     Valore principale grande, etichetta, variazione % con freccia (▲▼),
     colore per soglia (verde/ambra/rosso). Usata in tutte le dashboard.

  2. Data Table
     Tabella con ordinamento colonne, paginazione (10/20/50 righe), filtri
     inline nell'intestazione. Supporta selezione multipla righe. Colonna
     azioni con dropdown menu.

  3. Badge Stato
     Pill colorato per gli enum di stato. Colore fisso per valore:
     BOZZA=grigio, CONFERMATO=blu, IN_RICEZIONE=ambra, COMPLETATO=verde,
     ANNULLATO=rosso. Consistente in tutti i moduli.

  4. Tab Bar
     Barra navigazione orizzontale interna alla pagina. Tab evidenziato
     con bordo inferiore colorato (colore ruolo). Su mobile collassa in
     dropdown select.

  5. Form con Righe Dinamiche
     Form con pulsante "+ Aggiungi riga" per PO e ordini. Ogni riga:
     select prodotto con ricerca, input quantità con counter, input prezzo.
     Riga eliminabile con icona X. Totale calcolato in tempo reale.

  6. Stock Indicator
     Inline nella form ordine: mostra disponibilità stock per il prodotto
     selezionato. Verde se sufficiente, rosso se insufficiente con quantità
     disponibile. Aggiornato al cambio prodotto/quantità.

  7. Toast Notification
     Notifica pop-up angolo basso destra. Tipi: success (verde),
     error (rosso), warning (ambra), info (blu). Auto-dismiss 4 secondi.
     Stackable (più toast simultanei).

  8. Confirm Dialog
     Modal di conferma per azioni distruttive. Richiede testo di conferma
     per azioni ad alto impatto (annullamento ordine, rettifica giacenza,
     disattivazione utente).

  9. State Machine Button
     Pulsante con le transizioni di stato disponibili per il ruolo
     autenticato. Mostra solo le azioni permesse. Stato corrente visibile
     come Badge.

  10. Tree View Magazzino
      Albero interattivo: Magazzino → Corsia → Scaffale → Ubicazione.
      Espandibile per livello. Ogni nodo mostra codice + contatore giacenze.
      Click su ubicazione apre dettaglio giacenze.

  11. Picking List
      Lista prodotti da prelevare ordinata per ubicazione (ottimizzazione
      percorso). Ogni riga: ubicazione / SKU / prodotto / quantità /
      checkbox prelevato. Progressione visibile (X/N prelevati).

  12. Notification Bell
      Icona campanella nell'header con badge contatore non letti. Click
      apre dropdown con anteprima ultime 5. Link "Vedi tutte" naviga alla
      pagina notifiche. Polling ogni 30 secondi via API.


────────────────────────────────────────────────────────────────────────────────
SEZIONE 4 — MAPPATURA COLORI STATO (Badge & UI)
────────────────────────────────────────────────────────────────────────────────

Definisce i colori fissi per ogni valore degli enum di database.
Consistenti in tutti i moduli — lo stesso stato ha sempre lo stesso colore.

  Enum purchase_order_state (ordini in entrata):
    BOZZA          → Grigio     #6B7280   (neutro, ancora modificabile)
    INVIATO        → Blu chiaro #3B82F6   (trasmesso, in attesa conferma)
    CONFERMATO     → Blu        #1D4ED8   (confermato, operativo)
    IN_RICEZIONE   → Ambra      #D97706   (in lavorazione, parziale)
    COMPLETATO     → Verde      #16A34A   (terminale positivo)
    ANNULLATO      → Rosso      #DC2626   (terminale negativo)

  Enum sales_order_state (ordini in uscita):
    BOZZA          → Grigio     #6B7280
    CONFERMATO     → Blu        #1D4ED8
    SPEDITO        → Blu        #1D4ED8
    ANNULLATO      → Rosso      #DC2626

  Enum sales_order_picking_state:
    NON_AVVIATO        → Grigio       #9CA3AF  (picking non ancora iniziato)
    IN_PICKING         → Ambra        #D97706  (prelievo in corso)
    PICKING_COMPLETATO → Verde chiaro #22C55E  (pronto per spedizione)

  Enum shipping_state (spedizioni):
    IN_PREPARAZIONE → Grigio blu #64748B  (in preparazione al ritiro)
    SPEDITA         → Blu        #3B82F6  (in transito verso destinazione)
    CONSEGNATA      → Verde      #16A34A  (terminale positivo)
    PROBLEMA        → Rosso      #DC2626  (terminale, richiede intervento)


────────────────────────────────────────────────────────────────────────────────
SEZIONE 5 — GESTIONE ERRORI — COMPORTAMENTO FRONTEND
────────────────────────────────────────────────────────────────────────────────

Mappatura standard degli errori HTTP su componenti UI.
Tutti i ruoli seguono le stesse regole — varia solo il testo del messaggio.

  HTTP 400 — VALIDATION_ERROR
    Componente : Form field inline
    Comportamento: Errori mappati per campo, bordo rosso, messaggio
                   sotto il campo. Array details dal backend.

  HTTP 401 — AUTH_REQUIRED
    Componente : Redirect automatico
    Comportamento: Clear token store Zustand → redirect a /login.

  HTTP 403 — ACCESS_DENIED
    Componente : Banner persistente (pagina 403 dedicata)
    Comportamento: L'utente è autenticato ma non autorizzato. Non mostra
                   mai dati parziali. Link di ritorno alla pagina precedente.

  HTTP 404 — RESOURCE_NOT_FOUND
    Componente : Toast warning + pagina 404 di cortesia
    Comportamento: Toast warning + pagina con link di ritorno.

  HTTP 409 — DUPLICATE_ENTRY
    Componente : Toast conflitto (rosso)
    Comportamento: Toast rosso (es. SKU già esistente). Non cancella
                   il form — l'utente può correggere e riprovare.

  HTTP 422 — INSUFFICIENT_STOCK
    Componente : Toast prominente in primo piano
    Comportamento: Mostra quantità disponibile vs quantità richiesta.
                   Blocca l'invio.

  HTTP 422 — STATE_TRANSITION_INVALID
    Componente : Toast prominente in primo piano
    Comportamento: Mostra stato corrente e transizioni permesse per il ruolo.

  HTTP 500 — INTERNAL_SERVER_ERROR
    Componente : Toast generico
    Comportamento: Messaggio generico di cortesia. Dettagli tecnici
                   nascosti — solo nei log del server.


────────────────────────────────────────────────────────────────────────────────
SEZIONE 6 — PERMESSI GRANULARI — 30 CODICI
────────────────────────────────────────────────────────────────────────────────

Il sistema RBAC si basa su 30 permessi atomici assegnati ai ruoli tramite
la tabella ruoli_permessi del database. Ogni endpoint del backend verifica
il permesso specifico richiesto — non solo il ruolo dell'utente.

SOTTOSEZIONE 6.1 — LISTA PERMESSI PER DOMINIO

  Dominio UTENTI (3 permessi)
    utenti:read    → Visualizza utenti
    utenti:write   → Crea/modifica utenti
    utenti:delete  → Elimina utenti

  Dominio PRODOTTI (3 permessi)
    prodotti:read    → Visualizza prodotti
    prodotti:write   → Crea/modifica prodotti
    prodotti:delete  → Elimina prodotti

  Dominio FORNITORI (3 permessi)
    fornitori:read    → Visualizza fornitori
    fornitori:write   → Crea/modifica fornitori
    fornitori:delete  → Elimina fornitori

  Dominio CLIENTI (3 permessi)
    clienti:read    → Visualizza clienti
    clienti:write   → Crea/modifica clienti
    clienti:delete  → Elimina clienti

  Dominio MAGAZZINO (2 permessi)
    magazzino:read   → Visualizza magazzino
    magazzino:write  → Gestisce ubicazioni

  Dominio GIACENZE (2 permessi)
    giacenze:read   → Visualizza giacenze
    giacenze:write  → Modifica giacenze

  Dominio ORDINI (3 permessi)
    ordini:read     → Visualizza ordini
    ordini:write    → Crea/modifica ordini e gestisce stato picking
    ordini:approve  → Approva ordini commerciali

  Dominio ACQUISTI (3 permessi)
    acquisti:read     → Visualizza acquisti
    acquisti:write    → Crea/modifica acquisti
    acquisti:approve  → Approva acquisti

  Dominio SPEDIZIONI (2 permessi)
    spedizioni:read   → Visualizza spedizioni
    spedizioni:write  → Gestisce spedizioni

  Dominio NOTIFICHE (1 permesso)
    notifiche:read  → Visualizza notifiche

  Dominio DASHBOARD (1 permesso)
    dashboard:read  → Visualizza dashboard

  Dominio ECOSYSTEM (2 permessi)
    ecosystem:read   → Ricerca nell'ecosistema globale
    ecosystem:write  → Interagisce con ecosistema (chat fornitore,
                       aggiunta fornitore da ecosistema)

  Dominio RICHIESTE (2 permessi)
    richieste:read   → Visualizza richieste acquisto
    richieste:write  → Crea e invia richieste acquisto


SOTTOSEZIONE 6.2 — MATRICE COMPLETA RUOLI × PERMESSI (30×5)

  Legenda:  ✅ = assegnato   |   — = non assegnato

  PERMESSO               | Admin | Resp.Acq. | Resp.Mag. | Operatore | Corriere
  ─────────────────────────────────────────────────────────────────────────────
  utenti:read            |  ✅   |    —      |    —      |    —      |   —
  utenti:write           |  ✅   |    —      |    —      |    —      |   —
  utenti:delete          |  ✅   |    —      |    —      |    —      |   —
  prodotti:read          |  ✅   |    ✅     |    ✅     |    ✅     |   —
  prodotti:write         |  ✅   |    —      |    —      |    —      |   —
  prodotti:delete        |  ✅   |    —      |    —      |    —      |   —
  fornitori:read         |  ✅   |    ✅     |    —      |    —      |   —
  fornitori:write        |  ✅   |    ✅     |    —      |    —      |   —
  fornitori:delete       |  ✅   |    ✅     |    —      |    —      |   —
  clienti:read           |  ✅   |    —      |    —      |    —      |   —
  clienti:write          |  ✅   |    —      |    —      |    —      |   —
  clienti:delete         |  ✅   |    —      |    —      |    —      |   —
  magazzino:read         |  ✅   |    —      |    ✅     |    —      |   —
  magazzino:write        |  ✅   |    —      |    ✅     |    —      |   —
  giacenze:read          |  ✅   |    —      |    ✅     |    ✅     |   —
  giacenze:write         |  ✅   |    —      |    ✅     |    —      |   —
  ordini:read            |  ✅   |    ✅     |    ✅     |    ✅     |   —
  ordini:write           |  ✅   |    —      |    ✅     |    ✅     |   —
  ordini:approve         |  ✅   |    —      |    —      |    —      |   —
  acquisti:read          |  ✅   |    ✅     |    —      |    —      |   —
  acquisti:write         |  ✅   |    ✅     |    —      |    —      |   —
  acquisti:approve       |  ✅   |    ✅     |    —      |    —      |   —
  spedizioni:read        |  ✅   |    —      |    ✅     |    ✅     |   ✅
  spedizioni:write       |  ✅   |    —      |    ✅     |    —      |   ✅
  notifiche:read         |  ✅   |    ✅     |    ✅     |    ✅     |   ✅
  dashboard:read         |  ✅   |    ✅     |    ✅     |    —      |   —
  ecosystem:read         |  ✅   |    ✅     |    —      |    ✅     |   —
  ecosystem:write        |  ✅   |    ✅     |    —      |    —      |   —
  richieste:read         |  ✅   |    ✅     |    —      |    —      |   —
  richieste:write        |  ✅   |    ✅     |    —      |    ✅     |   —
  ─────────────────────────────────────────────────────────────────────────────
  TOTALE PERMESSI        |  30   |    14     |    11     |     8     |    3


SOTTOSEZIONE 6.3 — RIEPILOGO PER RUOLO

  Admin (30/30 permessi)
    Tutti i 30 permessi. Unico ruolo con accesso a utenti:*, clienti:delete,
    prodotti:delete, ordini:approve e all'intera sezione Amministrazione.

  Responsabile Acquisti (14/30 permessi)
    acquisti:read, acquisti:write, acquisti:approve
    fornitori:read, fornitori:write, fornitori:delete
    prodotti:read
    ordini:read
    richieste:read, richieste:write
    ecosystem:read, ecosystem:write
    notifiche:read
    dashboard:read

  Responsabile Magazzino (11/30 permessi)
    magazzino:read, magazzino:write
    giacenze:read, giacenze:write
    prodotti:read
    spedizioni:read, spedizioni:write
    ordini:read, ordini:write
    notifiche:read
    dashboard:read

  Operatore (8/30 permessi)
    ordini:read, ordini:write
    giacenze:read
    prodotti:read
    spedizioni:read
    richieste:write
    ecosystem:read
    notifiche:read

  Corriere (3/30 permessi)
    spedizioni:read
    spedizioni:write
    notifiche:read


================================================================================
NOTE IMPLEMENTATIVE PER IL TEAM FRONTEND (REACT)
================================================================================

  1. Il controllo dei permessi nel frontend è SOLO per UX (nascondere menu
     e pulsanti). La sicurezza reale è sempre nel backend: ogni endpoint
     verifica il permesso specifico nel middleware RBAC.

  2. I permessi del ruolo autenticato vengono inclusi nel payload JWT
     (o caricati al login) e salvati nello store Zustand. Il componente
     <ProtectedRoute> legge lo store per decidere se renderizzare.

  3. La Tab Bar di ogni sezione deve renderizzare solo i tab per cui
     l'utente ha il permesso corrispondente. Es: il tab "Rettifiche" in
     Magazzino è visibile solo se l'utente ha giacenze:write.

  4. I colori dei Badge Stato sono invarianti — non cambiano mai in base
     al ruolo. Un COMPLETATO è sempre verde per tutti i ruoli.

  5. Il polling delle notifiche (GET /api/v1/notifiche ogni 30s) è attivo
     per tutti i ruoli che hanno il permesso notifiche:read.

  6. Le tab bar devono essere responsive: su viewport < 768px collassano
     in un <select> nativo per evitare overflow orizzontale.


================================================================================
NOTE PER IL TEAM DESIGN (FIGMA)
================================================================================

  1. Creare un frame/page per ogni ruolo in Figma.
     Struttura suggerita: [Ruolo] / [Sezione] / [Tab] / [Stato variante]

  2. I colori identificativi dei ruoli (header sidebar, tab bar active,
     badge ruolo) sono:
       Admin                 → #0F172A  (Nero slate)
       Responsabile Acquisti → #1D4ED8  (Blu)
       Responsabile Magazzino→ #0D9488  (Teal)
       Operatore             → #16A34A  (Verde)
       Corriere              → #EA580C  (Arancione)

  3. Ogni componente della libreria (sezione 3) deve avere una pagina
     dedicata nel Figma con tutte le varianti di stato:
     default / hover / active / disabled / loading / error.

  4. I Badge Stato usano i colori esatti definiti nella sezione 4.
     Vanno creati come componenti Figma con variante per ogni valore enum.

  5. La struttura ad albero del magazzino (Tree View) deve essere
     prototipata con interazione expand/collapse a tutti i livelli.

  6. Per la Dashboard "Generale" di ogni ruolo, i widget e le KPI card
     devono essere posizionati secondo una grid a 12 colonne con breakpoint
     a 1280px (desktop) e 768px (tablet).


================================================================================
FINE DOCUMENTO
================================================================================
LogiChain ERP — Navigation & Content Specification V1.0
Giugno 2025 — CONFIDENZIALE
File: LogiChain_Navigation_UX_Spec_V1_DESCRIZIONE.txt
================================================================================
