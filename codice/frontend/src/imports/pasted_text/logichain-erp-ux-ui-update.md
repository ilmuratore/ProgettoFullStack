Agisci come un Senior UX/UI Designer specializzato in SaaS ERP, Supply Chain Management e Logistics Platforms.

⚠️ Mantieni rigorosamente il design system già presente nel progetto Figma di LogiChain ERP.

Non modificare:

palette colori
typography
spacing system
card design
componenti esistenti
iconografia
struttura generale delle pagine

Le modifiche devono integrarsi perfettamente con il layout attuale e apparire come una naturale evoluzione del prodotto.

1. SIDEBAR COLLASSABILE / ESPANDIBILE

Implementare una sidebar completamente collassabile.

Stato Espanso (Default)

Visualizzare:

Logo LogiChain ERP
Icone
Etichette menu
Dropdown di navigazione

Come attualmente presente.

Stato Collassato

Quando l'utente clicca il pulsante di collapse:

La sidebar si riduce in larghezza mantenendo visibili solamente:

icone delle sezioni
logo compatto

Nascondere:

etichette testuali
descrizioni
titoli di gruppo
Interazioni
Hover

Al passaggio del mouse:

mostrare tooltip con nome sezione
micro animazione fluida

Esempio:

📊 → "Generale"

📦 → "Magazzino"

👥 → "Anagrafiche"

Persistenza

Memorizzare la preferenza dell'utente.

Se l'utente minimizza la sidebar:

mantenerla minimizzata anche dopo refresh
mantenerla minimizzata nei cambi pagina
Animazione

Transizione fluida:

durata 200–300ms
easing moderno

Stile simile a:

Linear
Notion
Jira
Monday.com
2. IMPLEMENTAZIONE COMPLETA TOPBAR

Rendere tutti gli elementi della Topbar completamente funzionali.

Campo Ricerca Globale

Ricerca trasversale su:

Clienti
Fornitori
Prodotti
Ordini
Spedizioni
Magazzini

Funzionalità:

ricerca live
risultati raggruppati per categoria
scorciatoia tastiera (CTRL+K)

Dropdown risultati:

CLIENTI

Cliente ABC

FORNITORI

Fornitore XYZ

PRODOTTI

SKU-001
Campanella Notifiche

Implementare il sistema notifiche completo.

Nel database è già prevista la tabella notifiche con polling frontend ogni 30 secondi.

Aggiornamento automatico

Polling:

GET /notifications

ogni 30 secondi.

Come definito nell'analisi database.

Badge notifiche

Visualizzare:

numero notifiche non lette
badge rosso dinamico

Esempio:

🔔 7

Dropdown notifiche

Al click aprire un pannello con:

titolo
descrizione
timestamp
stato letta/non letta

Categorie supportate:

Sotto Scorta
PO in Ritardo
Ricezione Parziale
Cambio Stato Spedizione
Altro

Coerentemente con gli enum definiti nel database.

Azioni

Consentire:

Segna come letta
Segna tutte come lette
Vai alla risorsa collegata
Profilo Utente

Mantenere il comportamento già definito:

Avatar + Nome + Ruolo

Dropdown con:

Il Mio Profilo
Sicurezza
Notifiche
Preferenze
Attività Recenti
Logout
3. NUOVO COMPORTAMENTO MENU "ANAGRAFICHE"

Modificare la UX della sezione Anagrafiche.

Comportamento al click su "Anagrafiche"

Quando l'utente clicca:

👥 Anagrafiche

devono verificarsi contemporaneamente due azioni.

Azione 1

Aprire automaticamente il dropdown laterale.

Mostrare:

▼ Anagrafiche

Clienti
Fornitori
Prodotti

come avviene attualmente.

Azione 2

Navigare verso una nuova pagina overview:

Anagrafiche

Questa pagina rappresenta il punto di ingresso principale del modulo.

PAGINA OVERVIEW ANAGRAFICHE

Creare una dashboard riepilogativa con KPI e widget aggregati.

Header

Titolo:

Anagrafiche

Sottotitolo:

Panoramica generale di clienti, fornitori e prodotti.

KPI Cards
Clienti

Mostrare:

Totale clienti
Clienti attivi
Nuovi clienti mese

La base dati clienti è presente nell'anagrafica dedicata.

Fornitori

Mostrare:

Totale fornitori
Fornitori attivi
Lead Time medio

La tabella fornitori prevede già il campo lead_time_giorni.

Prodotti

Mostrare:

Totale prodotti
Prodotti attivi
Prodotti sotto scorta

La tabella prodotti include scorta_minima e supporta alert sotto scorta.

Widget
Distribuzione prodotti per categoria

Grafico donut.

Top fornitori

Per volume ordini.

Top clienti

Per fatturato ordini.

Prodotti sotto scorta

Tabella compatta.

Ultime attività anagrafiche

Feed cronologico.

NAVIGAZIONE DETTAGLIO

Dal dropdown sidebar:

Clienti
Fornitori
Prodotti

continuare ad accedere alle rispettive pagine dettaglio complete.

Clienti

Pagina dedicata con:

elenco clienti
scheda cliente
destinazioni
storico ordini
Fornitori

Pagina dedicata con:

elenco fornitori
contatti
lead time
storico acquisti
Prodotti

Pagina dedicata con:

catalogo prodotti
categorie
giacenze
movimenti stock
RIMOZIONE NAVIGAZIONE ORIZZONTALE ATTUALE

Nella parte superiore della tabella è presente una barra di navigazione orizzontale (tab navigation).

⚠️ Rimuovere completamente questo componente.

NUOVA INTESTAZIONE PAGINA

Sostituire la barra orizzontale con una semplice intestazione contestuale.

Esempi:

Se seleziono:

Clienti

mostrare:

Clienti

Gestione anagrafica clienti

Se seleziono:

Fornitori

mostrare:

Fornitori

Gestione anagrafica fornitori

Se seleziono:

Prodotti

mostrare:

Prodotti

Catalogo e gestione articoli

STILE VISIVO

La nuova intestazione deve:

utilizzare la stessa tipografia del sistema
mantenere gli stessi margini delle card esistenti
integrarsi con breadcrumb e topbar
risultare più pulita e leggibile rispetto alla tab navigation attuale
OUTPUT DESIDERATO

Aggiornare il progetto Figma introducendo:

Sidebar collassabile con visualizzazione sole icone e stato persistente.
Topbar completamente funzionale con ricerca globale, notifiche in polling automatico ogni 30 secondi e gestione profilo utente.
Nuova UX del modulo Anagrafiche con pagina overview KPI come landing page, mantenimento del dropdown Clienti/Fornitori/Prodotti per l'accesso ai dettagli e sostituzione della navigazione orizzontale con una moderna intestazione contestuale perfettamente integrata nel design system esistente di LogiChain ERP.