> **DOCUMENTO INTEGRATIVO — ALLEGATO DATABASE**

# LogiChain ERP — Analisi Schema Database V1.3

*Specifica completa del database relazionale — 25 tabelle · 6 enum · 1
sequence · PostgreSQL ≥ 14*

|                   |                                                                   |
|-------------------|-------------------------------------------------------------------|
| **Documento**     | LogiChain ERP — Analisi Funzionale Integrativa — Sezione Database |
| **Versione**      | V1.3 — Schema SQL Definitivo                                      |
| **File sorgente** | logichain_schema_v1.3.sql                                         |
| **Data**          | Giugno 2025                                                       |
| **Tech Lead**     | Simone Iengo                                                      |
| **Team**          | 5 sviluppatori (1 Tech Lead + 4 Junior)                           |
| **PostgreSQL**    | >= 14                                                            |
| **Stato**         | Approvato — baseline migration GG 1                               |

## 1. Panoramica Schema

Lo schema è implementato nel file logichain_schema_v1.3.sql ed è la
fonte autoritativa per la migration di GG 1. Il documento descrive la
logica e le regole di ogni elemento — in caso di discrepanza prevale
sempre il file SQL.

Il database è strutturato in 25 tabelle relazionali con 6 enum
PostgreSQL nativi. Le transazioni ACID di PostgreSQL garantiscono la
coerenza tra tabelle collegate (giacenze, movimenti_stock, righe_po,
righe_ricezione) in tutte le operazioni multi-step.

**Principi architetturali applicati:**

- Soft delete su prodotti, fornitori, clienti, utenti, magazzini: i
  record non vengono mai eliminati fisicamente per proteggere lo
  storico.

- Audit log immutabile: movimenti_stock riceve solo INSERT — nessun
  UPDATE o DELETE è esposto dal layer service.

- Transazioni atomiche: ogni operazione multi-tabella (ricezione merce,
  conferma picking, spostamento stock) è racchiusa in BEGIN/COMMIT con
  ROLLBACK automatico su qualsiasi errore.

- Lock pessimistico: SELECT FOR UPDATE su giacenze previene race
  condition nel picking concorrente. Il CHECK(quantita >= 0) è il
  secondo livello di protezione.

- State machine applicative: le transizioni di stato sono validate nel
  layer service con controllo RBAC. Il DB gestisce solo il tipo ENUM,
  non le regole di transizione.

## 2. Enum Types (6)

I tipi enum PostgreSQL sono nativi e case-sensitive. Vanno usati
esattamente come definiti (MAIUSCOLO) nelle query SQL e nel codice
applicativo.

|                               |                                                                                              |                                                                                                                                                                                                                    |
|-------------------------------|----------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Enum**                      | **Valori**                                                                                   | **Logica e utilizzo**                                                                                                                                                                                              |
| **purchase_order_state**      | BOZZA · INVIATO · CONFERMATO IN_RICEZIONE · COMPLETATO · ANNULLATO                           | State machine ordini in entrata (M08). Gestita nel layer service con controllo RBAC per ogni transizione. La giacenza viene aggiornata solo alla transizione IN_RICEZIONE → COMPLETATO, mai alla creazione del PO. |
| **sales_order_state**         | BOZZA · CONFERMATO SPEDITO · ANNULLATO                                                       | Ciclo commerciale ordine cliente (M09). Separato da sales_order_picking_state per indipendenza tra flusso commerciale e flusso logistico di magazzino.                                                             |
| **sales_order_picking_state** | NON_AVVIATO · IN_PICKING PICKING_COMPLETATO                                                  | Ciclo picking (M09). Lo scarico giacenze avviene in transazione atomica alla conferma IN_PICKING → PICKING_COMPLETATO. Se il picking viene annullato, la giacenza viene ripristinata con un movimento RESO.        |
| **shipping_state**            | IN_PREPARAZIONE · SPEDITA CONSEGNATA · PROBLEMA                                              | State machine spedizione (M10). DEFAULT IN_PREPARAZIONE alla creazione. CONSEGNATA e PROBLEMA sono stati terminali. PROBLEMA genera notifica CAMBIO_STATO_SPEDIZIONE automatica.                                   |
| **movimento_tipo**            | CARICO_ACQUISTO · SCARICO_VENDITA SPOSTAMENTO · RETTIFICA_POSITIVA RETTIFICA_NEGATIVA · RESO | Tipo di movimento nella tabella movimenti_stock (M07). Determina la logica: CARICO usa solo ubicazione_a_id; SCARICO usa solo ubicazione_da_id; SPOSTAMENTO usa entrambe. La tabella è append-only — solo INSERT.  |
| **notification_type**         | SOTTO_SCORTA · PO_IN_RITARDO RICEZIONE_PARZIALE CAMBIO_STATO_SPEDIZIONE · ALTRO              | Tipo notifica operativa (M11). Generata nel layer service al verificarsi dell'evento. Il frontend esegue polling GET /notifications ogni 30 secondi e filtra per tipo e letto=false.                               |

## 3. Definizione Tabelle (25)

Le 25 tabelle sono documentate per dominio funzionale. Ogni campo
riporta: nome, tipo PostgreSQL, vincoli attivi, note operative sulla
logica applicativa collegata.

### 3.1 Auth & Sistema — 6 tabelle

Gestione identità, RBAC granulare, dipendenti e notifiche operative.

#### `ruoli`

|             |                     |                        |                                           |
|-------------|---------------------|------------------------|-------------------------------------------|
| **Campo**   | **Tipo**            | **Vincoli**            | **Note operative**                        |
| **id**      | INTEGER IDENTITY PK | PRIMARY KEY            | *Generato dal DB, non modificabile*       |
| nome        | TEXT                | **NOT NULL UNIQUE**    | *Es. Admin, Operatore, Corriere*          |
| descrizione | TEXT                | —                      | *Descrizione estesa del ruolo*            |
| created_at  | TIMESTAMPTZ         | NOT NULL DEFAULT NOW() | *Auto-valorizzato*                        |
| updated_at  | TIMESTAMPTZ         | NOT NULL DEFAULT NOW() | *Aggiornato da trigger fn_set_updated_at* |

#### `permessi`

|             |                     |                        |                                                          |
|-------------|---------------------|------------------------|----------------------------------------------------------|
| **Campo**   | **Tipo**            | **Vincoli**            | **Note operative**                                       |
| **id**      | INTEGER IDENTITY PK | PRIMARY KEY            |                                                          |
| codice      | TEXT                | **NOT NULL UNIQUE**    | *Es. ordini:approve, magazzino:move, giacenze:rettifica* |
| descrizione | TEXT                | —                      |                                                          |
| created_at  | TIMESTAMPTZ         | NOT NULL DEFAULT NOW() |                                                          |
| updated_at  | TIMESTAMPTZ         | NOT NULL DEFAULT NOW() | *Trigger*                                                |

#### `ruoli_permessi`

|             |             |                                                 |                                                                 |
|-------------|-------------|-------------------------------------------------|-----------------------------------------------------------------|
| **Campo**   | **Tipo**    | **Vincoli**                                     | **Note operative**                                              |
| ruolo_id    | INTEGER     | **PK composta FK → ruoli ON DELETE CASCADE**    | *Eliminare un ruolo rimuove tutte le sue associazioni permesso* |
| permesso_id | INTEGER     | **PK composta FK → permessi ON DELETE CASCADE** | *Eliminare un permesso rimuove tutte le sue associazioni ruolo* |
| created_at  | TIMESTAMPTZ | NOT NULL DEFAULT NOW()                          |                                                                 |
| updated_at  | TIMESTAMPTZ | NOT NULL DEFAULT NOW()                          | *Trigger*                                                       |

#### `utenti`

|               |                     |                               |                                                                                 |
|---------------|---------------------|-------------------------------|---------------------------------------------------------------------------------|
| **Campo**     | **Tipo**            | **Vincoli**                   | **Note operative**                                                              |
| **id**        | INTEGER IDENTITY PK | PRIMARY KEY                   |                                                                                 |
| nome          | TEXT                | NOT NULL                      |                                                                                 |
| cognome       | TEXT                | NOT NULL                      |                                                                                 |
| email         | TEXT                | **NOT NULL UNIQUE**           | *Identificativo login. Duplicati bloccati a livello DB*                         |
| password_hash | TEXT                | NOT NULL                      | *bcryptjs rounds=12. La password in chiaro non viene mai memorizzata*           |
| ruolo_id      | INTEGER             | NOT NULL FK → ruoli NO ACTION | *Delete ruolo bloccato se esistono utenti con quel ruolo*                       |
| attivo        | BOOLEAN             | NOT NULL DEFAULT TRUE         | *Soft disable senza eliminazione fisica. Utente disattivo non può autenticarsi* |
| created_at    | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()        |                                                                                 |
| updated_at    | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()        | *Trigger*                                                                       |

#### `dipendenti`

|                 |                     |                                |                                                                                |
|-----------------|---------------------|--------------------------------|--------------------------------------------------------------------------------|
| **Campo**       | **Tipo**            | **Vincoli**                    | **Note operative**                                                             |
| **id**          | INTEGER IDENTITY PK | PRIMARY KEY                    |                                                                                |
| nome            | TEXT                | NOT NULL                       |                                                                                |
| cognome         | TEXT                | NOT NULL                       |                                                                                |
| codice_fiscale  | TEXT                | **NOT NULL UNIQUE**            | *Identificativo fiscale univoco*                                               |
| ruolo_operativo | TEXT                | —                              | *Es. Picker, Magazziniere — ruolo fisico, distinto dal ruolo RBAC applicativo* |
| data_assunzione | DATE                | —                              |                                                                                |
| utente_id       | INTEGER             | NULLABLE FK → utenti NO ACTION | *NULL se il dipendente non ha accesso all'applicazione*                        |
| created_at      | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()         |                                                                                |
| updated_at      | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()         | *Trigger*                                                                      |

#### `notifiche`

|                  |                     |                                |                                                                   |
|------------------|---------------------|--------------------------------|-------------------------------------------------------------------|
| **Campo**        | **Tipo**            | **Vincoli**                    | **Note operative**                                                |
| **id**           | INTEGER IDENTITY PK | PRIMARY KEY                    |                                                                   |
| utente_id        | INTEGER             | NOT NULL FK → utenti NO ACTION | *Destinatario. Delete utente bloccato se ha notifiche*            |
| tipo             | notification_type   | NOT NULL                       | *Enum che determina l'icona e il filtro nel frontend*             |
| messaggio        | TEXT                | NOT NULL                       | *Testo leggibile generato applicativamente nel layer service*     |
| letto            | BOOLEAN             | NOT NULL DEFAULT FALSE         | *Aggiornato da mark-as-read singolo o massivo*                    |
| riferimento_tipo | TEXT                | —                              | *Es. ordine_acquisto, prodotto, spedizione*                       |
| riferimento_id   | INTEGER             | —                              | *ID del record sorgente — link diretto dal frontend alla risorsa* |
| created_at       | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()         | *Usato per ordinamento cronologico e filtro data*                 |
| updated_at       | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()         | *Trigger*                                                         |

### 3.2 Prodotti & Categorie — 2 tabelle

Catalogo centralizzato con gerarchia categorie a 2 livelli tramite
self-reference nullable.

#### `categorie`

|                    |                     |                                   |                                                                          |
|--------------------|---------------------|-----------------------------------|--------------------------------------------------------------------------|
| **Campo**          | **Tipo**            | **Vincoli**                       | **Note operative**                                                       |
| **id**             | INTEGER IDENTITY PK | PRIMARY KEY                       |                                                                          |
| nome               | TEXT                | **NOT NULL UNIQUE**               |                                                                          |
| categoria_padre_id | INTEGER             | NULLABLE FK → categorie NO ACTION | *Self-reference per gerarchia a 2 livelli. NULL indica categoria radice* |
| created_at         | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()            |                                                                          |
| updated_at         | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()            | *Trigger*                                                                |

#### `prodotti`

|               |                     |                                   |                                                                                                               |
|---------------|---------------------|-----------------------------------|---------------------------------------------------------------------------------------------------------------|
| **Campo**     | **Tipo**            | **Vincoli**                       | **Note operative**                                                                                            |
| **id**        | INTEGER IDENTITY PK | PRIMARY KEY                       |                                                                                                               |
| sku           | TEXT                | **NOT NULL UNIQUE**               | *Stock Keeping Unit — identificativo univoco di magazzino. Constraint a livello DB*                           |
| nome          | TEXT                | NOT NULL                          |                                                                                                               |
| descrizione   | TEXT                | —                                 |                                                                                                               |
| categoria_id  | INTEGER             | NULLABLE FK → categorie NO ACTION |                                                                                                               |
| unita_misura  | TEXT                | —                                 | *Es. PZ, KG, MT, L*                                                                                           |
| peso_kg       | NUMERIC             | —                                 | *Usato nel calcolo del peso totale spedizione nel DDT*                                                        |
| scorta_minima | INTEGER             | NOT NULL DEFAULT 0                | *Soglia per trigger alert automatico SOTTO_SCORTA in M11*                                                     |
| attivo        | BOOLEAN             | NOT NULL DEFAULT TRUE             | *Soft delete — i prodotti non vengono mai eliminati fisicamente per proteggere lo storico ordini e movimenti* |
| created_at    | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()            |                                                                                                               |
| updated_at    | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()            | *Trigger*                                                                                                     |

### 3.3 Fornitori & Ciclo Acquisti — 6 tabelle

Anagrafica fornitori e intero ciclo di acquisto. Le transazioni
PostgreSQL garantiscono coerenza tra ordini_acquisto, righe_po,
ricezioni, righe_ricezione, giacenze e movimenti_stock.

#### `fornitori`

|                  |                     |                        |                                                                                                                         |
|------------------|---------------------|------------------------|-------------------------------------------------------------------------------------------------------------------------|
| **Campo**        | **Tipo**            | **Vincoli**            | **Note operative**                                                                                                      |
| **id**           | INTEGER IDENTITY PK | PRIMARY KEY            |                                                                                                                         |
| ragione_sociale  | TEXT                | NOT NULL               |                                                                                                                         |
| piva             | TEXT                | **UNIQUE**             | *Nullable — alcuni fornitori esteri non hanno P.IVA italiana*                                                           |
| indirizzo        | TEXT                | —                      |                                                                                                                         |
| email            | TEXT                | —                      |                                                                                                                         |
| telefono         | TEXT                | —                      |                                                                                                                         |
| lead_time_giorni | INTEGER             | —                      | *Aggiornato automaticamente dalla view SQL aggregata sullo storico ricezioni (differenza data_ordine - data_ricezione)* |
| attivo           | BOOLEAN             | NOT NULL DEFAULT TRUE  | *Soft delete*                                                                                                           |
| created_at       | TIMESTAMPTZ         | NOT NULL DEFAULT NOW() |                                                                                                                         |
| updated_at       | TIMESTAMPTZ         | NOT NULL DEFAULT NOW() | *Trigger*                                                                                                               |

#### `contatti_fornitori`

|              |                     |                                               |                                                        |
|--------------|---------------------|-----------------------------------------------|--------------------------------------------------------|
| **Campo**    | **Tipo**            | **Vincoli**                                   | **Note operative**                                     |
| **id**       | INTEGER IDENTITY PK | PRIMARY KEY                                   |                                                        |
| fornitore_id | INTEGER             | **NOT NULL FK → fornitori ON DELETE CASCADE** | *Eliminare il fornitore rimuove tutti i suoi contatti* |
| nome         | TEXT                | —                                             |                                                        |
| ruolo        | TEXT                | —                                             | *Es. Commerciale, Logistica, Amministrazione*          |
| email        | TEXT                | —                                             |                                                        |
| telefono     | TEXT                | —                                             |                                                        |
| created_at   | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                        |                                                        |
| updated_at   | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                        | *Trigger*                                              |

#### `ordini_acquisto`

|                |                      |                                   |                                                                                  |
|----------------|----------------------|-----------------------------------|----------------------------------------------------------------------------------|
| **Campo**      | **Tipo**             | **Vincoli**                       | **Note operative**                                                               |
| **id**         | INTEGER IDENTITY PK  | PRIMARY KEY                       |                                                                                  |
| fornitore_id   | INTEGER              | NOT NULL FK → fornitori NO ACTION |                                                                                  |
| stato          | purchase_order_state | NOT NULL DEFAULT BOZZA            | *State machine — vedi sezione 4.1*                                               |
| data_prevista  | DATE                 | —                                 | *Usata dal job di rilevamento PO_IN_RITARDO per generare la notifica automatica* |
| importo_totale | NUMERIC              | —                                 | *Calcolato dalla somma di (quantita_ordinata × prezzo_unitario) su righe_po*     |
| note           | TEXT                 | —                                 |                                                                                  |
| utente_id      | INTEGER              | NULLABLE FK → utenti NO ACTION    | *Utente che ha creato il PO*                                                     |
| created_at     | TIMESTAMPTZ          | NOT NULL DEFAULT NOW()            |                                                                                  |
| updated_at     | TIMESTAMPTZ          | NOT NULL DEFAULT NOW()            | *Trigger*                                                                        |

#### `righe_po`

|                    |                     |                                                     |                                                                                                      |
|--------------------|---------------------|-----------------------------------------------------|------------------------------------------------------------------------------------------------------|
| **Campo**          | **Tipo**            | **Vincoli**                                         | **Note operative**                                                                                   |
| **id**             | INTEGER IDENTITY PK | PRIMARY KEY                                         |                                                                                                      |
| ordine_acquisto_id | INTEGER             | **NOT NULL FK → ordini_acquisto ON DELETE CASCADE** | *Eliminare il PO rimuove tutte le sue righe*                                                         |
| prodotto_id        | INTEGER             | NOT NULL FK → prodotti NO ACTION                    |                                                                                                      |
| quantita_ordinata  | INTEGER             | NOT NULL                                            |                                                                                                      |
| quantita_ricevuta  | INTEGER             | NOT NULL DEFAULT 0                                  | *Incrementato a ogni ricezione parziale. Quando uguale a quantita_ordinata il PO passa a COMPLETATO* |
| prezzo_unitario    | NUMERIC             | —                                                   |                                                                                                      |
| created_at         | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                              |                                                                                                      |
| updated_at         | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                              | *Trigger*                                                                                            |

#### `ricezioni`

|                    |                     |                                         |                                                                         |
|--------------------|---------------------|-----------------------------------------|-------------------------------------------------------------------------|
| **Campo**          | **Tipo**            | **Vincoli**                             | **Note operative**                                                      |
| **id**             | INTEGER IDENTITY PK | PRIMARY KEY                             |                                                                         |
| ordine_acquisto_id | INTEGER             | NOT NULL FK → ordini_acquisto NO ACTION | *Un PO può avere N eventi di ricezione (ricezioni parziali successive)* |
| data_ricezione     | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                  |                                                                         |
| note               | TEXT                | —                                       |                                                                         |
| utente_id          | INTEGER             | NULLABLE FK → utenti NO ACTION          |                                                                         |
| created_at         | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                  |                                                                         |
| updated_at         | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                  | *Trigger*                                                               |

#### `righe_ricezione`

|                   |                     |                                               |                                                                                   |
|-------------------|---------------------|-----------------------------------------------|-----------------------------------------------------------------------------------|
| **Campo**         | **Tipo**            | **Vincoli**                                   | **Note operative**                                                                |
| **id**            | INTEGER IDENTITY PK | PRIMARY KEY                                   |                                                                                   |
| ricezione_id      | INTEGER             | **NOT NULL FK → ricezioni ON DELETE CASCADE** | *Eliminare la ricezione rimuove il suo dettaglio righe*                           |
| prodotto_id       | INTEGER             | NOT NULL FK → prodotti NO ACTION              |                                                                                   |
| quantita_ricevuta | INTEGER             | NOT NULL                                      |                                                                                   |
| ubicazione_id     | INTEGER             | NOT NULL FK → ubicazioni NO ACTION            | *Slot fisico di destinazione della merce ricevuta — a livello di corsia+scaffale* |
| created_at        | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                        |                                                                                   |
| updated_at        | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                        | *Trigger*                                                                         |

### 3.4 Clienti & Destinazioni — 2 tabelle

Anagrafica clienti con supporto indirizzi multipli. La destinazione
selezionata viene inclusa nel DDT come indirizzo destinatario.

#### `clienti`

|                 |                     |                        |                                                       |
|-----------------|---------------------|------------------------|-------------------------------------------------------|
| **Campo**       | **Tipo**            | **Vincoli**            | **Note operative**                                    |
| **id**          | INTEGER IDENTITY PK | PRIMARY KEY            |                                                       |
| ragione_sociale | TEXT                | NOT NULL               |                                                       |
| piva_cf         | TEXT                | **UNIQUE**             | *P.IVA o Codice Fiscale. Nullable per clienti esteri* |
| email           | TEXT                | —                      |                                                       |
| telefono        | TEXT                | —                      |                                                       |
| attivo          | BOOLEAN             | NOT NULL DEFAULT TRUE  | *Soft delete*                                         |
| created_at      | TIMESTAMPTZ         | NOT NULL DEFAULT NOW() |                                                       |
| updated_at      | TIMESTAMPTZ         | NOT NULL DEFAULT NOW() | *Trigger*                                             |

#### `destinazioni_clienti`

|             |                     |                                             |                                                                                            |
|-------------|---------------------|---------------------------------------------|--------------------------------------------------------------------------------------------|
| **Campo**   | **Tipo**            | **Vincoli**                                 | **Note operative**                                                                         |
| **id**      | INTEGER IDENTITY PK | PRIMARY KEY                                 |                                                                                            |
| cliente_id  | INTEGER             | **NOT NULL FK → clienti ON DELETE CASCADE** | *Eliminare il cliente rimuove tutte le sue destinazioni*                                   |
| etichetta   | TEXT                | —                                           | *Es. Sede Principale, Deposito Nord, Punto Vendita Milano*                                 |
| indirizzo   | TEXT                | —                                           |                                                                                            |
| cap         | TEXT                | —                                           |                                                                                            |
| citta       | TEXT                | —                                           |                                                                                            |
| provincia   | TEXT                | —                                           |                                                                                            |
| paese       | TEXT                | —                                           |                                                                                            |
| predefinita | BOOLEAN             | NOT NULL DEFAULT FALSE                      | *Una sola destinazione predefinita per cliente. Applicativo garantisce l'unicità del flag* |
| created_at  | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                      |                                                                                            |
| updated_at  | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                      | *Trigger*                                                                                  |

### 3.5 Magazzino & Inventario — 4 tabelle

> *ℹ Struttura a due livelli: magazzini (edificio fisico con indirizzo
> proprio) → ubicazioni (slot preciso: magazzino + corsia + scaffale).
> Giacenze e movimenti_stock referenziano sempre ubicazioni.id — il
> livello più granulare.*

#### `magazzini`

|             |                     |                        |                                                                                   |
|-------------|---------------------|------------------------|-----------------------------------------------------------------------------------|
| **Campo**   | **Tipo**            | **Vincoli**            | **Note operative**                                                                |
| **id**      | INTEGER IDENTITY PK | PRIMARY KEY            |                                                                                   |
| codice      | TEXT                | **NOT NULL UNIQUE**    | *Codice breve identificativo es. MAG-A, MAG-B*                                    |
| nome        | TEXT                | NOT NULL               | *Es. Magazzino Principale, Deposito Esterno*                                      |
| indirizzo   | TEXT                | —                      | *Indirizzo fisico del magazzino — può differire dalla sede aziendale*             |
| cap         | TEXT                | —                      |                                                                                   |
| citta       | TEXT                | —                      |                                                                                   |
| provincia   | TEXT                | —                      |                                                                                   |
| paese       | TEXT                | —                      |                                                                                   |
| attiva      | BOOLEAN             | NOT NULL DEFAULT TRUE  | *Soft disable — un magazzino disattivato non accetta nuove ubicazioni o giacenze* |
| descrizione | TEXT                | —                      |                                                                                   |
| created_at  | TIMESTAMPTZ         | NOT NULL DEFAULT NOW() |                                                                                   |
| updated_at  | TIMESTAMPTZ         | NOT NULL DEFAULT NOW() | *Trigger*                                                                         |

#### `ubicazioni`

|                         |                     |                                               |                                                                                                             |
|-------------------------|---------------------|-----------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| **Campo**               | **Tipo**            | **Vincoli**                                   | **Note operative**                                                                                          |
| **id**                  | INTEGER IDENTITY PK | PRIMARY KEY                                   |                                                                                                             |
| magazzino_id            | INTEGER             | **NOT NULL FK → magazzini ON DELETE CASCADE** | *Slot orfano non ha senso — eliminare il magazzino rimuove tutti i suoi slot*                               |
| corsia                  | INTEGER             | NOT NULL                                      | *Numero intero della corsia nel magazzino. Es. 1..10*                                                       |
| scaffale                | INTEGER             | NOT NULL                                      | *Numero intero dello scaffale nella corsia. Es. 1..10*                                                      |
| codice                  | TEXT                | **NOT NULL UNIQUE**                           | *Generato applicativamente: "{magazzino_id}-{corsia:02d}-{scaffale:02d}". Es. 1-03-04*                      |
| attiva                  | BOOLEAN             | NOT NULL DEFAULT TRUE                         | *FALSE durante manutenzione o quarantena. Slot disattivo non accetta nuove giacenze*                        |
| temperatura_controllata | BOOLEAN             | DEFAULT FALSE                                 | *Flag per slot che richiedono gestione speciale (celle frigorifere, aree sterili)*                          |
| descrizione             | TEXT                | —                                             | *Note operative sullo slot fisico*                                                                          |
| created_at              | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                        |                                                                                                             |
| updated_at              | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                        | *Trigger*                                                                                                   |
| —                       | —                   | **UNIQUE (magazzino_id, corsia, scaffale)**   | *Impedisce duplicati di slot nello stesso magazzino. Stessa corsia+scaffale è ammessa in magazzini diversi* |

#### `giacenze`

|               |                     |                                               |                                                                                                            |
|---------------|---------------------|-----------------------------------------------|------------------------------------------------------------------------------------------------------------|
| **Campo**     | **Tipo**            | **Vincoli**                                   | **Note operative**                                                                                         |
| **id**        | INTEGER IDENTITY PK | PRIMARY KEY                                   |                                                                                                            |
| prodotto_id   | INTEGER             | NOT NULL FK → prodotti NO ACTION              |                                                                                                            |
| ubicazione_id | INTEGER             | NOT NULL FK → ubicazioni NO ACTION            | *Lo slot preciso (magazzino + corsia + scaffale) dove si trova il prodotto*                                |
| quantita      | INTEGER             | **NOT NULL DEFAULT 0 CHECK (quantita >= 0)** | *Vincolo critico: impedisce stock negativo a livello DB anche in caso di bug applicativo o race condition* |
| created_at    | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                        |                                                                                                            |
| updated_at    | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                        | *Trigger*                                                                                                  |
| —             | —                   | **UNIQUE (prodotto_id, ubicazione_id)**       | *Una sola riga giacenza per coppia prodotto-slot*                                                          |

**movimenti_stock \[APPEND-ONLY\]**

|                  |                     |                                    |                                                                                                      |
|------------------|---------------------|------------------------------------|------------------------------------------------------------------------------------------------------|
| **Campo**        | **Tipo**            | **Vincoli**                        | **Note operative**                                                                                   |
| **id**           | INTEGER IDENTITY PK | PRIMARY KEY                        | *Registro immutabile. Il layer service non espone mai endpoint di UPDATE o DELETE su questa tabella* |
| prodotto_id      | INTEGER             | NOT NULL FK → prodotti NO ACTION   |                                                                                                      |
| ubicazione_da_id | INTEGER             | NULLABLE FK → ubicazioni NO ACTION | *NULL per movimenti di tipo CARICO_ACQUISTO e RETTIFICA_POSITIVA (nessuna origine)*                  |
| ubicazione_a_id  | INTEGER             | NULLABLE FK → ubicazioni NO ACTION | *NULL per movimenti di tipo SCARICO_VENDITA e RETTIFICA_NEGATIVA (nessuna destinazione)*             |
| quantita         | INTEGER             | NOT NULL                           | *Sempre positivo. Il campo tipo determina la direzione del flusso*                                   |
| tipo             | movimento_tipo      | NOT NULL                           | *Determina quale delle due ubicazioni viene usata e la logica di aggiornamento giacenze*             |
| utente_id        | INTEGER             | NULLABLE FK → utenti NO ACTION     |                                                                                                      |
| riferimento_tipo | TEXT                | —                                  | *Es. ordine_acquisto, ordine. Riferimento polimorfico al documento sorgente*                         |
| riferimento_id   | INTEGER             | —                                  | *ID del documento sorgente del movimento*                                                            |
| note             | TEXT                | —                                  | *Obbligatorio per RETTIFICA_POSITIVA e RETTIFICA_NEGATIVA (validazione applicativa)*                 |
| created_at       | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()             |                                                                                                      |
| updated_at       | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()             |                                                                                                      |

### 3.6 Ciclo Vendite — 2 tabelle

Ordini cliente con doppio stato indipendente: commerciale (stato) e
logistico (stato_picking). Lo scarico giacenze avviene solo alla
conferma del picking fisico, mai alla creazione dell'ordine.

#### `ordini`

|                         |                           |                                              |                                                                                                |
|-------------------------|---------------------------|----------------------------------------------|------------------------------------------------------------------------------------------------|
| **Campo**               | **Tipo**                  | **Vincoli**                                  | **Note operative**                                                                             |
| **id**                  | INTEGER IDENTITY PK       | PRIMARY KEY                                  |                                                                                                |
| cliente_id              | INTEGER                   | NOT NULL FK → clienti NO ACTION              |                                                                                                |
| destinazione_id         | INTEGER                   | NOT NULL FK → destinazioni_clienti NO ACTION | *Indirizzo di consegna specifico selezionato alla creazione ordine*                            |
| stato                   | sales_order_state         | NOT NULL DEFAULT BOZZA                       | *Ciclo commerciale. Vedi sezione 4.2*                                                          |
| stato_picking           | sales_order_picking_state | NOT NULL DEFAULT NON_AVVIATO                 | *Ciclo logistico parallelo. Lo scarico giacenze avviene alla transizione → PICKING_COMPLETATO* |
| data_ordine             | TIMESTAMPTZ               | NOT NULL DEFAULT NOW()                       |                                                                                                |
| data_consegna_richiesta | DATE                      | —                                            |                                                                                                |
| importo_totale          | NUMERIC                   | —                                            | *Aggiornato alla conferma ordine dalla somma delle righe_ordine*                               |
| utente_id               | INTEGER                   | NULLABLE FK → utenti NO ACTION               | *Destinatario notifiche di cambio stato*                                                       |
| created_at              | TIMESTAMPTZ               | NOT NULL DEFAULT NOW()                       |                                                                                                |
| updated_at              | TIMESTAMPTZ               | NOT NULL DEFAULT NOW()                       | *Trigger*                                                                                      |

#### `righe_ordine`

|                 |                     |                                            |                                                 |
|-----------------|---------------------|--------------------------------------------|-------------------------------------------------|
| **Campo**       | **Tipo**            | **Vincoli**                                | **Note operative**                              |
| **id**          | INTEGER IDENTITY PK | PRIMARY KEY                                |                                                 |
| ordine_id       | INTEGER             | **NOT NULL FK → ordini ON DELETE CASCADE** | *Eliminare l'ordine rimuove tutte le sue righe* |
| prodotto_id     | INTEGER             | NOT NULL FK → prodotti NO ACTION           |                                                 |
| quantita        | INTEGER             | NOT NULL                                   |                                                 |
| prezzo_unitario | NUMERIC             | —                                          |                                                 |
| created_at      | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                     |                                                 |
| updated_at      | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                     | *Trigger*                                       |

### 3.7 Logistica & DDT — 3 tabelle

Corrieri, spedizioni e Documento di Trasporto con numerazione
progressiva annuale atomica garantita da SEQUENCE PostgreSQL.

#### `corrieri`

|                        |                     |                                |                                                                        |
|------------------------|---------------------|--------------------------------|------------------------------------------------------------------------|
| **Campo**              | **Tipo**            | **Vincoli**                    | **Note operative**                                                     |
| **id**                 | INTEGER IDENTITY PK | PRIMARY KEY                    |                                                                        |
| nome                   | TEXT                | **NOT NULL UNIQUE**            |                                                                        |
| codice                 | TEXT                | **NOT NULL UNIQUE**            | *Codice operativo breve es. BRT, GLS, SDA*                             |
| email_operativa        | TEXT                | —                              |                                                                        |
| telefono               | TEXT                | —                              |                                                                        |
| utente_responsabile_id | INTEGER             | NULLABLE FK → utenti NO ACTION | *Se l'utente è eliminato il delete è bloccato finché il link è attivo* |
| note                   | TEXT                | —                              |                                                                        |
| created_at             | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()         |                                                                        |
| updated_at             | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()         | *Trigger*                                                              |

#### `spedizioni`

|                 |                     |                                           |                                                                |
|-----------------|---------------------|-------------------------------------------|----------------------------------------------------------------|
| **Campo**       | **Tipo**            | **Vincoli**                               | **Note operative**                                             |
| **id**          | INTEGER IDENTITY PK | PRIMARY KEY                               |                                                                |
| ordine_id       | INTEGER             | **NOT NULL FK → ordini NO ACTION UNIQUE** | *Un solo ordine per spedizione — constraint UNIQUE(ordine_id)* |
| corriere_id     | INTEGER             | NOT NULL FK → corrieri NO ACTION          |                                                                |
| tracking_number | TEXT                | —                                         |                                                                |
| stato           | shipping_state      | NOT NULL DEFAULT IN_PREPARAZIONE          | *State machine — vedi sezione 4.3*                             |
| data_spedizione | TIMESTAMPTZ         | —                                         | *Valorizzato alla transizione → SPEDITA*                       |
| created_at      | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                    |                                                                |
| updated_at      | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                    | *Trigger*                                                      |

#### `ddt`

|                    |                     |                                               |                                                                                                        |
|--------------------|---------------------|-----------------------------------------------|--------------------------------------------------------------------------------------------------------|
| **Campo**          | **Tipo**            | **Vincoli**                                   | **Note operative**                                                                                     |
| **id**             | INTEGER IDENTITY PK | PRIMARY KEY                                   |                                                                                                        |
| spedizione_id      | INTEGER             | **NOT NULL FK → spedizioni NO ACTION UNIQUE** | *Un solo DDT per spedizione*                                                                           |
| numero_progressivo | INTEGER             | **NOT NULL UNIQUE con anno**                  | *Alimentato da nextval(seq_ddt_numero_progressivo). Atomico per design — sicuro in concorrenza*        |
| anno               | INTEGER             | **NOT NULL UNIQUE con numero_progressivo**    | *UNIQUE(numero_progressivo, anno). La sequence viene resettata a inizio anno con migration schedulata* |
| data_emissione     | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                        |                                                                                                        |
| pdf_path           | TEXT                | —                                             | *Path relativo del file PDF generato da pdfkit sul server*                                             |
| created_at         | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                        |                                                                                                        |
| updated_at         | TIMESTAMPTZ         | NOT NULL DEFAULT NOW()                        | *Trigger*                                                                                              |

## 4. Vincoli di Integrità

### 4.1 Constraint UNIQUE e CHECK (18 vincoli)

I constraint a livello DB garantiscono l'integrità indipendentemente da
bug applicativi o insert concorrenti non serializzati.

> *✗ Il CHECK(quantita >= 0) su giacenze è il vincolo più critico del
> sistema. È il backstop finale contro race condition nel picking
> concorrente e contro qualsiasi bug nel layer applicativo che tenti di
> portare lo stock in negativo.*

|            |                                             |                                                                                                                                                  |                                                                            |
|------------|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| **Tipo**   | **Campo / Constraint**                      | **Motivazione**                                                                                                                                  | **Tabella / Dettaglio**                                                    |
| **CHECK**  | giacenze.quantita >= 0                     | Backstop critico — impedisce stock negativo a livello DB anche in presenza di bug applicativi o race condition non gestite dal SELECT FOR UPDATE | giacenze — prima linea di difesa: lock pessimistico; seconda: questo CHECK |
| **UNIQUE** | ruoli.nome                                  | Nome ruolo univoco nel sistema RBAC                                                                                                              | ruoli                                                                      |
| **UNIQUE** | permessi.codice                             | Codice permesso è l'identificativo usato nel middleware RBAC                                                                                     | permessi                                                                   |
| **UNIQUE** | utenti.email                                | Identificativo login — duplicati bloccherebbero l'autenticazione                                                                                 | utenti                                                                     |
| **UNIQUE** | dipendenti.codice_fiscale                   | Identificativo fiscale univoco per persona                                                                                                       | dipendenti                                                                 |
| **UNIQUE** | fornitori.piva                              | P.IVA univoca — impedisce duplicati in anagrafica                                                                                                | fornitori                                                                  |
| **UNIQUE** | clienti.piva_cf                             | P.IVA o C.F. univoco per cliente                                                                                                                 | clienti                                                                    |
| **UNIQUE** | prodotti.sku                                | SKU è l'identificativo di magazzino — il duplicato causerebbe movimenti errati                                                                   | prodotti                                                                   |
| **UNIQUE** | magazzini.codice                            | Codice magazzino univoco nel sistema                                                                                                             | magazzini                                                                  |
| **UNIQUE** | ubicazioni.codice                           | Codice slot univoco — es. "1-03-04"                                                                                                              | ubicazioni                                                                 |
| **UNIQUE** | ubicazioni (magazzino_id, corsia, scaffale) | Impedisce due slot identici nello stesso magazzino. Stessa posizione è ammessa in magazzini diversi                                              | ubicazioni                                                                 |
| **UNIQUE** | corrieri.nome                               | Nome corriere univoco                                                                                                                            | corrieri                                                                   |
| **UNIQUE** | corrieri.codice                             | Codice operativo corriere univoco                                                                                                                | corrieri                                                                   |
| **UNIQUE** | giacenze (prodotto_id, ubicazione_id)       | Una sola riga giacenza per coppia prodotto-slot                                                                                                  | giacenze                                                                   |
| **UNIQUE** | spedizioni.ordine_id                        | 1 spedizione per ordine                                                                                                                          | spedizioni                                                                 |
| **UNIQUE** | ddt.spedizione_id                           | 1 DDT per spedizione                                                                                                                             | ddt                                                                        |
| **UNIQUE** | ddt (numero_progressivo, anno)              | Unicità numerazione DDT per anno fiscale — seconda protezione oltre alla SEQUENCE                                                                | ddt                                                                        |

### 4.2 Foreign Key — ON DELETE CASCADE vs NO ACTION

8 FK hanno ON DELETE CASCADE (record figlio eliminato automaticamente
con il padre). Tutte le altre hanno ON DELETE NO ACTION (il delete del
padre è bloccato se esistono figli).

Logica applicata: il CASCADE è giustificato quando il record figlio non
ha significato semantico senza il padre (righe di un ordine, contatti di
un fornitore, slot di un magazzino). Il NO ACTION protegge i dati
storici che devono sopravvivere al padre (ordini, movimenti, giacenze,
DDT).

|                                     |                      |               |                                                                                                                                                                      |
|-------------------------------------|----------------------|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **FK (tabella.campo)**              | **Riferimento**      | **ON DELETE** | **Motivazione**                                                                                                                                                      |
| **ruoli_permessi.ruolo_id**         | → ruoli.id           | **CASCADE**   | Eliminare un ruolo rimuove tutte le sue associazioni permesso                                                                                                        |
| **ruoli_permessi.permesso_id**      | → permessi.id        | **CASCADE**   | Eliminare un permesso rimuove tutte le sue associazioni ruolo                                                                                                        |
| **contatti_fornitori.fornitore_id** | → fornitori.id       | **CASCADE**   | I contatti non hanno senso senza il fornitore padre                                                                                                                  |
| **destinazioni_clienti.cliente_id** | → clienti.id         | **CASCADE**   | Le destinazioni non hanno senso senza il cliente padre                                                                                                               |
| **ubicazioni.magazzino_id**         | → magazzini.id       | **CASCADE**   | Uno slot non ha senso senza il magazzino padre — il cascade è bloccato se gli slot hanno giacenze attive                                                             |
| **righe_po.ordine_acquisto_id**     | → ordini_acquisto.id | **CASCADE**   | Le righe non hanno senso senza il PO padre                                                                                                                           |
| **righe_ricezione.ricezione_id**    | → ricezioni.id       | **CASCADE**   | Il dettaglio righe non ha senso senza la ricezione padre                                                                                                             |
| **righe_ordine.ordine_id**          | → ordini.id          | **CASCADE**   | Le righe non hanno senso senza l'ordine padre                                                                                                                        |
| Tutte le altre FK                   | —                    | **NO ACTION** | Il delete del record padre è bloccato se esistono record figli. Protegge l'integrità dello storico: ordini, movimenti, giacenze, DDT non possono essere orfanizzati. |

## 5. State Machine

Le state machine sono implementate e validate nel layer service del
backend. Il DB memorizza il valore ENUM corrente; le regole di
transizione valida e i controlli RBAC sono interamente responsabilità
applicativa.

### 5.1 Ordini in Entrata — purchase_order_state

La giacenza viene aggiornata esclusivamente alla ricezione fisica della
merce, mai alla creazione o conferma del PO. Ogni ricezione esegue:
INSERT ricezioni → INSERT righe_ricezione → UPDATE
righe_po.quantita_ricevuta → UPDATE giacenze → INSERT movimenti_stock —
tutto in singola transazione.

|                  |                  |                                       |                        |                                                                                                              |
|------------------|------------------|---------------------------------------|------------------------|--------------------------------------------------------------------------------------------------------------|
| **Da**           | **A**            | **Condizione**                        | **Ruolo**              | **Effetto DB**                                                                                               |
| **BOZZA**        | **INVIATO**      | PO trasmesso al fornitore             | Resp. Acquisti         | UPDATE ordini_acquisto SET stato=INVIATO                                                                     |
| **INVIATO**      | **CONFERMATO**   | Conferma d'ordine ricevuta            | Resp. Acquisti         | UPDATE ordini_acquisto SET stato=CONFERMATO                                                                  |
| **CONFERMATO**   | **IN_RICEZIONE** | Avvio procedura di ricezione fisica   | Operatore / Resp. Mag. | UPDATE ordini_acquisto SET stato=IN_RICEZIONE                                                                |
| **IN_RICEZIONE** | **IN_RICEZIONE** | Ricezione parziale — residuo pendente | Operatore / Resp. Mag. | Transazione: INSERT ricezioni + righe_ricezione + UPDATE righe_po + UPDATE giacenze + INSERT movimenti_stock |
| **IN_RICEZIONE** | **COMPLETATO**   | Tutta la quantità ordinata ricevuta   | Operatore / Resp. Mag. | Come sopra + UPDATE ordini_acquisto SET stato=COMPLETATO                                                     |
| **BOZZA**        | **ANNULLATO**    | Annullamento prima della ricezione    | Admin / Resp. Acquisti | UPDATE ordini_acquisto SET stato=ANNULLATO                                                                   |
| **INVIATO**      | **ANNULLATO**    | Annullamento prima della ricezione    | Admin / Resp. Acquisti | UPDATE ordini_acquisto SET stato=ANNULLATO                                                                   |

### 5.2 Ordini in Uscita — sales_order_state + sales_order_picking_state

> *ℹ Due state machine parallele e indipendenti: stato (ciclo
> commerciale) e stato_picking (ciclo logistico). Lo scarico giacenze
> avviene solo a PICKING_COMPLETATO — mai alla creazione dell'ordine.
> L'annullamento con picking in corso richiede ripristino giacenze.*

|                                                   |                                                   |                                   |                        |                                                                                                                                   |
|---------------------------------------------------|---------------------------------------------------|-----------------------------------|------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| **Da**                                            | **A**                                             | **Condizione**                    | **Ruolo**              | **Effetto DB**                                                                                                                    |
| **stato: BOZZA picking: NON_AVVIATO**             | **stato: CONFERMATO picking: NON_AVVIATO**        | Conferma disponibilità prodotti   | Operatore / Resp. Mag. | UPDATE ordini SET stato=CONFERMATO                                                                                                |
| **stato: CONFERMATO picking: NON_AVVIATO**        | **stato: CONFERMATO picking: IN_PICKING**         | Avvio prelievo fisico             | Operatore              | UPDATE ordini SET stato_picking=IN_PICKING                                                                                        |
| **stato: CONFERMATO picking: IN_PICKING**         | **stato: CONFERMATO picking: PICKING_COMPLETATO** | Conferma prelievo completato      | Operatore              | Transazione atomica: UPDATE stato_picking=PICKING_COMPLETATO + UPDATE giacenze (scarico) + INSERT movimenti_stock SCARICO_VENDITA |
| **stato: CONFERMATO picking: PICKING_COMPLETATO** | **stato: SPEDITO picking: PICKING_COMPLETATO**    | Creazione spedizione + DDT        | Resp. Magazzino        | INSERT spedizioni + SELECT nextval() + INSERT ddt + UPDATE ordini SET stato=SPEDITO                                               |
| **stato: BOZZA**                                  | **stato: ANNULLATO**                              | Annullamento pre-picking          | Admin / Resp. Mag.     | UPDATE ordini SET stato=ANNULLATO                                                                                                 |
| **stato: CONFERMATO picking: NON_AVVIATO**        | **stato: ANNULLATO**                              | Annullamento pre-picking          | Admin / Resp. Mag.     | UPDATE ordini SET stato=ANNULLATO                                                                                                 |
| **stato: CONFERMATO picking: IN_PICKING**         | **stato: ANNULLATO**                              | Annullamento con picking in corso | Admin / Resp. Mag.     | Transazione: UPDATE giacenze (ripristino) + INSERT movimenti_stock RESO + UPDATE ordini SET stato=ANNULLATO                       |

### 5.3 Spedizioni — shipping_state

|                     |                |                                  |                       |                                                                                           |
|---------------------|----------------|----------------------------------|-----------------------|-------------------------------------------------------------------------------------------|
| **Da**              | **A**          | **Condizione**                   | **Ruolo**             | **Effetto DB**                                                                            |
| **IN_PREPARAZIONE** | **SPEDITA**    | Merce ritirata dal corriere      | Resp. Mag. / Corriere | UPDATE spedizioni SET stato=SPEDITA, data_spedizione=NOW()                                |
| **SPEDITA**         | **CONSEGNATA** | Conferma consegna a destinazione | Corriere              | UPDATE spedizioni SET stato=CONSEGNATA + INSERT notifiche CAMBIO_STATO_SPEDIZIONE         |
| **SPEDITA**         | **PROBLEMA**   | Problema durante la consegna     | Corriere              | UPDATE spedizioni SET stato=PROBLEMA + INSERT notifiche CAMBIO_STATO_SPEDIZIONE (urgente) |
| **PROBLEMA**        | **SPEDITA**    | Problema risolto, ripristino     | Resp. Magazzino       | UPDATE spedizioni SET stato=SPEDITA                                                       |

## 6. Sequence DDT

La numerazione progressiva dei Documenti di Trasporto usa una SEQUENCE
PostgreSQL nativa. Garantisce unicità anche con N richieste concorrenti
simultanee senza necessità di lock espliciti.

|                          |                                                                                                                                                                                                         |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Proprietà**            | **Valore e descrizione**                                                                                                                                                                                |
| **Nome**                 | seq_ddt_numero_progressivo                                                                                                                                                                              |
| **START WITH**           | 1 — primo DDT dell'anno fiscale corrente vale 1                                                                                                                                                         |
| **INCREMENT BY**         | 1                                                                                                                                                                                                       |
| **CACHE**                | 1 — nessuna pre-allocazione, sicuro per reset annuale                                                                                                                                                   |
| **Utilizzo**             | SELECT nextval('seq_ddt_numero_progressivo') AS numero — chiamato nel service prima di ogni INSERT su ddt                                                                                               |
| **Garanzia**             | nextval() è atomico per design PostgreSQL: restituisce valori univoci anche con N transazioni concorrenti simultanee. Nessun lock esplicito necessario.                                                 |
| **Alternativa scartata** | MAX(numero_progressivo)+1 non è sicuro: due richieste concorrenti leggerebbero lo stesso MAX e genererebbero numeri duplicati                                                                           |
| **Reset annuale**        | ALTER SEQUENCE seq_ddt_numero_progressivo RESTART WITH 1 — migration schedulata da eseguire il 1° gennaio. Il constraint UNIQUE(numero_progressivo, anno) garantisce comunque unicità anche senza reset |

## 7. Trigger updated_at

La funzione fn_set_updated_at() viene applicata come BEFORE UPDATE
trigger a 24 delle 25 tabelle. movimenti_stock è l'unica esclusione:
essendo append-only non riceve mai UPDATE, quindi il trigger non si
attiverebbe mai.

|                     |                                                                                                                                                            |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Proprietà**       | **Dettaglio**                                                                                                                                              |
| **Funzione**        | fn_set_updated_at() — linguaggio PL/pgSQL                                                                                                                  |
| **Tipo**            | BEFORE UPDATE FOR EACH ROW                                                                                                                                 |
| **Effetto**         | Imposta NEW.updated_at = NOW() prima di ogni UPDATE                                                                                                        |
| **Naming trigger**  | trg_{nome_tabella}_set_updated_at — es. trg_ordini_set_updated_at                                                                                        |
| **Tabelle coperte** | 24 — tutte eccetto movimenti_stock                                                                                                                         |
| **Esclusione**      | movimenti_stock — audit log append-only (solo INSERT). Il trigger viene creato nella stessa migrazione tramite blocco DO con loop su array di nomi tabella |

## 8. Indici di Performance (20)

20 indici aggiuntivi oltre a quelli impliciti nei constraint UNIQUE.
Sono ottimizzati per le query operative più frequenti identificate dai
moduli funzionali M06–M12.

|                            |                                                                                               |
|----------------------------|-----------------------------------------------------------------------------------------------|
| **Indice**                 | **Query ottimizzata**                                                                         |
| idx_notifiche_utente_letto | Polling ogni 30s: SELECT notifiche WHERE utente_id=? AND letto=false ORDER BY created_at DESC |
| idx_notifiche_created_at   | Lista notifiche in ordine cronologico inverso                                                 |
| idx_movimenti_prodotto_id  | Audit log: filtro per prodotto — query frequente nella pagina dettaglio prodotto              |
| idx_movimenti_tipo         | Audit log: filtro per tipo movimento                                                          |
| idx_movimenti_created_at   | Feed cronologico movimenti nella Dashboard M12 (ultimi 20)                                    |
| idx_ordini_acquisto_stato  | Lista PO filtrata per stato — query principale della pagina ordini acquisto                   |
| idx_ordini_acquisto_forn   | Storico ordini per fornitore nella scheda fornitore                                           |
| idx_ordini_stato           | Lista ordini filtrata per stato commerciale                                                   |
| idx_ordini_stato_picking   | Lista ordini filtrata per stato picking — operatori magazzino                                 |
| idx_ordini_cliente         | Storico ordini per cliente nella scheda cliente                                               |
| idx_ordini_data_ordine     | Ordinamento cronologico inverso nella lista ordini                                            |
| idx_prodotti_categoria     | Filtro prodotti per categoria nel catalogo                                                    |
| idx_prodotti_attivo        | Esclusione prodotti soft-deleted da tutte le query operative                                  |
| idx_giacenze_prodotto      | Giacenza totale per prodotto (somma quantita su più ubicazioni)                               |
| idx_ubicazioni_magazzino   | Lista slot per magazzino — tree view M06                                                      |
| idx_ubicazioni_corsia      | Raggruppamento slot per corsia — navigazione tree view                                        |
| idx_spedizioni_corriere    | Lista spedizioni per corriere nella scheda corriere                                           |
| idx_spedizioni_stato       | Lista spedizioni per stato                                                                    |
| idx_spedizioni_data        | Spedizioni del giorno nella Dashboard M12                                                     |
| idx_ricezioni_po           | Storico ricezioni per PO nella scheda ordine acquisto                                         |

## 9. Logica Transazionale

Le operazioni che modificano più tabelle in sequenza sono eseguite in
transazioni PostgreSQL native (BEGIN / COMMIT / ROLLBACK). Qualsiasi
errore in qualsiasi step causa ROLLBACK completo — il client riceve un
errore 422 o 500, mai un risultato parzialmente applicato.

|                                              |                                                                                                                                                                                                                                                                                                 |
|----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Operazione**                               | **Sequenza SQL nella transazione**                                                                                                                                                                                                                                                              |
| **Ricezione merce (totale o parziale)**      | BEGIN → INSERT ricezioni → INSERT righe_ricezione (per ogni prodotto ricevuto) → UPDATE righe_po SET quantita_ricevuta → UPDATE giacenze SET quantita = quantita + qty → INSERT movimenti_stock (CARICO_ACQUISTO) → UPDATE ordini_acquisto SET stato (se completato) → COMMIT                   |
| **Conferma picking (scarico giacenze)**      | BEGIN → SELECT giacenze FOR UPDATE (lock pessimistico anti-race condition) → verifica quantita >= qty richiesta → UPDATE giacenze SET quantita = quantita - qty → INSERT movimenti_stock (SCARICO_VENDITA) → UPDATE ordini SET stato_picking = PICKING_COMPLETATO → COMMIT                     |
| **Spostamento stock inter-ubicazione**       | BEGIN → SELECT giacenze FOR UPDATE su entrambe le ubicazioni → UPDATE giacenze SET quantita = quantita - qty WHERE ubicazione_id = da → UPDATE giacenze SET quantita = quantita + qty WHERE ubicazione_id = a → INSERT movimenti_stock (SPOSTAMENTO, con ubicazione_da e ubicazione_a) → COMMIT |
| **Annullamento ordine con picking in corso** | BEGIN → UPDATE giacenze SET quantita = quantita + qty (ripristino) → INSERT movimenti_stock (RESO) → UPDATE ordini SET stato = ANNULLATO, stato_picking = NON_AVVIATO → COMMIT                                                                                                                  |
| **Creazione spedizione e DDT**               | BEGIN → INSERT spedizioni → SELECT nextval('seq_ddt_numero_progressivo') → INSERT ddt (con numero atomico dalla sequence) → UPDATE ordini SET stato = SPEDITO → COMMIT                                                                                                                          |
| **Rettifica giacenza manuale**               | BEGIN → UPDATE giacenze SET quantita = nuova_quantita → INSERT movimenti_stock (RETTIFICA_POSITIVA o RETTIFICA_NEGATIVA con nota obbligatoria) → COMMIT                                                                                                                                         |

## 10. Riepilogo Numerico Schema V1.3

|                         |        |                                                                                                                                 |
|-------------------------|--------|---------------------------------------------------------------------------------------------------------------------------------|
| **Elemento**            | **N.** | **Dettaglio**                                                                                                                   |
| **Enum types**          | **6**  | purchase_order_state · sales_order_state · sales_order_picking_state · shipping_state · movimento_tipo · notification_type      |
| **Tabelle totali**      | **25** | Auth/Sistema (6) · Prodotti (2) · Fornitori+Acquisti (6) · Clienti (2) · Magazzino+Inventario (4) · Vendite (2) · Logistica (3) |
| **Foreign Key**         | **33** | 8 ON DELETE CASCADE · 25 ON DELETE NO ACTION                                                                                    |
| **Constraint UNIQUE**   | **17** | 13 su singolo campo · 4 su coppie/triple                                                                                        |
| **Constraint CHECK**    | **1**  | CHECK(quantita >= 0) su giacenze — vincolo critico                                                                             |
| **Sequence**            | **1**  | seq_ddt_numero_progressivo — reset annuale schedulato                                                                           |
| **Indici performance**  | **20** | Ottimizzati per le query operative più frequenti per modulo                                                                     |
| **Trigger updated_at**  | **24** | Applicato a tutte le tabelle eccetto movimenti_stock (append-only)                                                              |
| **Tabelle append-only** | **1**  | movimenti_stock — solo INSERT, nessun UPDATE o DELETE                                                                           |

*Giugno 2025 — LogiChain ERP — CONFIDENZIALE — Documento integrativo
allegato all'Analisi Funzionale V1.0*
