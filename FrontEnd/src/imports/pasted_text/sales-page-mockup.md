Agisci come un Senior UX/UI Designer specializzato in ERP, Supply Chain Management, Order Management Systems (OMS), Logistics Software e piattaforme SaaS Enterprise.

Progetta un mockup High-Fidelity della pagina "Vendite" di LogiChain ERP.

⚠️ Mantieni rigorosamente lo stesso design system, palette colori, componenti UI, tipografia, spacing, griglie, card, sidebar, header, stile dei grafici, iconografia e pattern UX già definiti nel progetto Figma esistente.

Non introdurre nuovi stili grafici.

L'obiettivo è garantire continuità visiva perfetta con Dashboard, Magazzino e Acquisti.

OBIETTIVO DELLA PAGINA

La pagina Vendite rappresenta il centro operativo dell'intero ciclo Order-to-Delivery.

L'utente deve poter monitorare:

ordini clienti
stato commerciale degli ordini
avanzamento picking
spedizioni associate
performance vendite
evasione ordini
clienti principali
ordini bloccati o critici

La schermata deve trasmettere:

controllo operativo
velocità di evasione
efficienza logistica
tracciabilità
visibilità end-to-end dell'ordine
HEADER PAGINA

Titolo:

VENDITE

Breadcrumb:

Dashboard / Vendite

Azioni rapide:

Nuovo Ordine Cliente
Esporta Ordini
Filtri Avanzati
KPI PRINCIPALI

Prima riga composta da 6 KPI card.

Ordini Attivi

245

+8,4%

Valore Ordini

€ 3.875.420

Ordini da Spedire

87

Ordini in Picking

42

Ordini Completati Oggi

31

Tasso Evasione

96,8%

LAYOUT CENTRALE

Distribuzione 70 / 30

SINISTRA — ORDINI CLIENTE

Card principale.

Titolo:

Ordini di Vendita

Toolbar superiore:

Ricerca ordine
Ricerca cliente
Filtro stato ordine
Filtro picking
Filtro data
Ordinamento

Tabella enterprise avanzata.

Colonne:

Numero Ordine

Cliente

Data Ordine

Destinazione

Importo

Stato Ordine

Picking

Spedizione

Responsabile

Ultimo Aggiornamento

Azioni

STATI ORDINE

Utilizzare badge coerenti con il design system.

Gli ordini seguono il ciclo commerciale previsto dal sistema:

BOZZA → grigio
CONFERMATO → blu
SPEDITO → verde
ANNULLATO → rosso
STATI PICKING

Visualizzare badge secondari.

Il flusso logistico di picking è indipendente dal ciclo commerciale dell'ordine.

NON_AVVIATO → grigio
IN_PICKING → arancione
PICKING_COMPLETATO → verde
DESTRA — WIDGET OPERATIVI
Stato Ordini

Donut chart moderno.

Distribuzione:

Bozza
Confermato
Spedito
Annullato
Picking in Corso

Visualizzare:

numero ordine
operatore
avanzamento %

Progress bar moderna.

Alert Operativi

Lista alert:

Ordini bloccati
Picking in ritardo
Problemi spedizione
Ordini annullati oggi
Ultima Sincronizzazione

ERP Sync

08:41:32

Tutti i dati aggiornati

SEZIONE PERFORMANCE VENDITE

Card full-width.

Titolo:

Andamento Vendite

Visualizzare un grafico lineare moderno.

Periodo:

Ultimi 12 mesi

Metriche:

Fatturato
Numero Ordini

Grafico enterprise con tooltip avanzati.

SEZIONE CLIENTI PRINCIPALI

Card full-width.

Titolo:

Top Clienti

Tabella con:

Cliente

Ordini Totali

Valore Ordini

Ultimo Ordine

Destinazioni Attive

Performance

I clienti rappresentano il soggetto obbligatorio associato agli ordini di vendita e possono avere più destinazioni di consegna.

SEZIONE SPEDIZIONI ASSOCIATE

Card ampia.

Titolo:

Spedizioni Ordini

Tabella moderna.

Colonne:

Numero Spedizione

Ordine

Cliente

Corriere

Data Spedizione

Stato

Tracking

Destinazione

Gli stati della spedizione devono rispettare il workflow applicativo previsto dal sistema.

Badge:

IN_PREPARAZIONE
SPEDITA
CONSEGNATA
PROBLEMA
DRAWER DETTAGLIO ORDINE

Apertura cliccando una riga ordine.

Layout laterale elegante.

Informazioni Generali
Numero Ordine
Cliente
Data Ordine
Destinazione
Stato
Responsabile
Prodotti Ordinati

Tabella:

SKU

Prodotto

Quantità

Disponibilità

Prezzo Unitario

Totale Riga

Ogni ordine cliente contiene più righe prodotto collegate alle giacenze di magazzino.

Timeline Operativa

Visualizzare cronologia:

Ordine Creato
Ordine Confermato
Picking Avviato
Picking Completato
Spedizione Creata
Spedizione Consegnata

Timeline verticale moderna.

MODALE "NUOVO ORDINE CLIENTE"

CTA primaria:

Nuovo Ordine Cliente

Workflow multi-step.

Step 1

Selezione Cliente

Ricerca anagrafica cliente

Step 2

Destinazione Consegna

Dropdown destinazioni cliente

Step 3

Prodotti

ricerca SKU
quantità
disponibilità stock
prezzo
Step 4

Riepilogo

totale ordine
numero righe
peso totale
note
Step 5

Conferma

Generazione ordine

SEZIONE ATTIVITÀ RECENTI

Card finale.

Titolo:

Ultime Attività Vendite

Timeline cronologica.

Eventi:

nuovo ordine creato
ordine confermato
picking completato
spedizione partita
consegna effettuata
ordine annullato
MICROINTERAZIONI
Hover KPI
Hover righe tabella
Drawer animato
Badge dinamici
Tooltip avanzati
Skeleton loading
Empty state elegante
Ricerca realtime
Progress animation sui picking
OUTPUT DESIDERATO

Mockup High-Fidelity ultra realistico, completamente coerente con il design system già presente nel progetto Figma di LogiChain ERP, con focus su gestione ordini cliente, monitoraggio picking, spedizioni, performance commerciali e controllo operativo dell'intero processo Order-to-Delivery.