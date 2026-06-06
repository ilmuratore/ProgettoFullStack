-- ================================================================
-- LogiChain ERP — Schema Database V1.1
-- ================================================================
-- Autore schema originale : Simone Iengo (Tech Lead Project)
-- Revisione               : Analisi Funzionale Integrativa V1.1
-- Data                    : Giugno 2025
-- PostgreSQL              : >= 14
-- ================================================================

BEGIN;

-- ── 1. ENUM TYPES ───────────────────────────────────────────────────────────

CREATE TYPE purchase_order_state AS ENUM (
    'BOZZA',
    'INVIATO',
    'CONFERMATO',
    'IN_RICEZIONE',
    'COMPLETATO',
    'ANNULLATO'
);

-- M-06: stato commerciale separato dallo stato logistico
CREATE TYPE sales_order_state AS ENUM (
    'BOZZA',
    'CONFERMATO',
    'SPEDITO',
    'ANNULLATO'
);

-- M-06: ciclo picking indipendente dallo stato ordine
CREATE TYPE sales_order_picking_state AS ENUM (
    'NON_AVVIATO',
    'IN_PICKING',
    'PICKING_COMPLETATO'
);

CREATE TYPE shipping_state AS ENUM (
    'IN_PREPARAZIONE',
    'SPEDITA',
    'CONSEGNATA',
    'PROBLEMA'
);

CREATE TYPE movimento_tipo AS ENUM (
    'CARICO_ACQUISTO',
    'SCARICO_VENDITA',
    'SPOSTAMENTO',
    'RETTIFICA_POSITIVA',
    'RETTIFICA_NEGATIVA',
    'RESO'
);

CREATE TYPE notification_type AS ENUM (
    'SOTTO_SCORTA',
    'PO_IN_RITARDO',
    'RICEZIONE_PARZIALE',
    'CAMBIO_STATO_SPEDIZIONE',
    'ALTRO'
);

-- ── 2. TABELLE (ordine di dipendenza FK) ────────────────────────────────────

-- ── 2.1  Auth — base (nessuna FK) ──────────────────────────────

CREATE TABLE ruoli (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome        TEXT    NOT NULL UNIQUE,      
    descrizione TEXT,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE permessi (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codice      TEXT    NOT NULL UNIQUE,      
    descrizione TEXT,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── 2.2  Prodotti — base (self-ref FK aggiunta via ALTER sotto) ─

CREATE TABLE categorie (
    id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome               TEXT NOT NULL UNIQUE,
    categoria_padre_id INTEGER,                
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── 2.3  Anagrafiche — base (nessuna FK dipendente da utenti) ──

CREATE TABLE fornitori (
    id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ragione_sociale  TEXT    NOT NULL,
    piva             TEXT    UNIQUE,             
    indirizzo        TEXT,                        
    email            TEXT,
    telefono         TEXT,
    lead_time_giorni INTEGER,
    attivo           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE clienti (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ragione_sociale TEXT    NOT NULL,
    piva_cf         TEXT    UNIQUE,              
    email           TEXT,
    telefono        TEXT,
    attivo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── 2.4  Magazzino — flat ──────────────────
--
--  La struttura fisica è codificata nel campo 'codice' (es. "A-03-05").
--  Non esistono tabelle zone / corsie / scaffali: la gerarchia è
--  implicita nella convenzione di naming del codice, gestita applicativamente.

CREATE TABLE ubicazioni (
    id                      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codice                  TEXT    NOT NULL UNIQUE,  
    attiva                  BOOLEAN NOT NULL DEFAULT TRUE,
    temperatura_controllata BOOLEAN          DEFAULT FALSE, 
    descrizione             TEXT,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── 2.5  Utenti (dipende da ruoli) ─────────────────────────────

CREATE TABLE utenti (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome          TEXT    NOT NULL,
    cognome       TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,        
    password_hash TEXT    NOT NULL,
    ruolo_id      INTEGER NOT NULL,
    attivo        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_utenti_ruolo
        FOREIGN KEY (ruolo_id) REFERENCES ruoli(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ── 2.6  Corrieri (dipende da utenti) ──────────────────────────

CREATE TABLE corrieri (
    id                     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome                   TEXT    NOT NULL UNIQUE,   
    codice                 TEXT    NOT NULL UNIQUE,  
    email_operativa        TEXT,
    telefono               TEXT,
    utente_responsabile_id INTEGER,                   
    note                   TEXT,
    created_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_corrieri_utente_responsabile
        FOREIGN KEY (utente_responsabile_id) REFERENCES utenti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION       
);

-- ── 2.7  Auth — junction e dipendenti ──────────────────────────

CREATE TABLE ruoli_permessi (
    ruolo_id    INTEGER NOT NULL,
    permesso_id INTEGER NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_ruoli_permessi
        PRIMARY KEY (ruolo_id, permesso_id),
    CONSTRAINT fk_ruoli_permessi_ruolo
        FOREIGN KEY (ruolo_id) REFERENCES ruoli(id)
        ON DELETE CASCADE ON UPDATE NO ACTION,       
    CONSTRAINT fk_ruoli_permessi_permesso
        FOREIGN KEY (permesso_id) REFERENCES permessi(id)
        ON DELETE CASCADE ON UPDATE NO ACTION         
);

CREATE TABLE dipendenti (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome            TEXT NOT NULL,
    cognome         TEXT NOT NULL,
    codice_fiscale  TEXT NOT NULL UNIQUE,            
    ruolo_operativo TEXT,
    data_assunzione DATE,
    utente_id       INTEGER,                          
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_dipendenti_utente
        FOREIGN KEY (utente_id) REFERENCES utenti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ── 2.8  Notifiche (dipende da utenti) ─────────────────────────

CREATE TABLE notifiche (
    id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    utente_id        INTEGER           NOT NULL,
    tipo             notification_type NOT NULL,
    messaggio        TEXT              NOT NULL,
    letto            BOOLEAN           NOT NULL DEFAULT FALSE,
    riferimento_tipo TEXT,                             
    riferimento_id   INTEGER,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notifiche_utente
        FOREIGN KEY (utente_id) REFERENCES utenti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ── 2.9  Prodotti (dipende da categorie) ───────────────────────

CREATE TABLE prodotti (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sku           TEXT    NOT NULL UNIQUE,          
    nome          TEXT    NOT NULL,
    descrizione   TEXT,
    categoria_id  INTEGER,
    unita_misura  TEXT,
    peso_kg       NUMERIC,
    scorta_minima INTEGER NOT NULL DEFAULT 0,
    attivo        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_prodotti_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorie(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ── 2.10  Anagrafiche figlie ────────────────────────────────────

CREATE TABLE contatti_fornitori (
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fornitore_id INTEGER NOT NULL,
    nome         TEXT,
    ruolo        TEXT,
    email        TEXT,
    telefono     TEXT,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_contatti_fornitori_fornitore
        FOREIGN KEY (fornitore_id) REFERENCES fornitori(id)
        ON DELETE CASCADE ON UPDATE NO ACTION          
);

CREATE TABLE destinazioni_clienti (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id  INTEGER NOT NULL,
    etichetta   TEXT,
    indirizzo   TEXT,
    cap         TEXT,
    citta       TEXT,
    provincia   TEXT,
    paese       TEXT,                                
    predefinita BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_destinazioni_clienti_cliente
        FOREIGN KEY (cliente_id) REFERENCES clienti(id)
        ON DELETE CASCADE ON UPDATE NO ACTION         
);

-- ── 2.11  Ordini acquisto (dipende da fornitori, utenti) ────────

CREATE TABLE ordini_acquisto (
    id             INTEGER              GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fornitore_id   INTEGER              NOT NULL,
    stato          purchase_order_state NOT NULL DEFAULT 'BOZZA',
    data_prevista  DATE,
    importo_totale NUMERIC,
    note           TEXT,
    utente_id      INTEGER,                          
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ordini_acquisto_fornitore
        FOREIGN KEY (fornitore_id) REFERENCES fornitori(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_ordini_acquisto_utente
        FOREIGN KEY (utente_id) REFERENCES utenti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ── 2.12  Ordini vendita (dipende da clienti, destinazioni, utenti)

CREATE TABLE ordini (
    id                      INTEGER                   GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id              INTEGER                   NOT NULL,
    destinazione_id         INTEGER                   NOT NULL,
    stato                   sales_order_state         NOT NULL DEFAULT 'BOZZA',
    stato_picking           sales_order_picking_state NOT NULL DEFAULT 'NON_AVVIATO',
    data_ordine             TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT NOW(),
    data_consegna_richiesta DATE,
    importo_totale          NUMERIC,                 
    utente_id               INTEGER,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ordini_cliente
        FOREIGN KEY (cliente_id) REFERENCES clienti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_ordini_destinazione
        FOREIGN KEY (destinazione_id) REFERENCES destinazioni_clienti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_ordini_utente
        FOREIGN KEY (utente_id) REFERENCES utenti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ── 2.13  Giacenze (dipende da prodotti, ubicazioni) ───────────

CREATE TABLE giacenze (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    prodotto_id   INTEGER NOT NULL,
    ubicazione_id INTEGER NOT NULL,
    quantita      INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_giacenze_prodotto
        FOREIGN KEY (prodotto_id) REFERENCES prodotti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_giacenze_ubicazione
        FOREIGN KEY (ubicazione_id) REFERENCES ubicazioni(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT uq_giacenze_prodotto_ubicazione
        UNIQUE (prodotto_id, ubicazione_id),
    CONSTRAINT chk_giacenze_quantita_non_negativa
        CHECK (quantita >= 0)                      
);

-- ── 2.14  Movimenti stock — audit log immutabile ────────────────
--
--  REGOLA: solo INSERT. Vietati UPDATE e DELETE su questa tabella.
--  La business rule è applicativa (il layer service non espone mai
--  endpoint di update/delete su movimenti). Non esiste un trigger
--  di blocco a livello DB per semplicità V1 (aggiungibile in V2).

CREATE TABLE movimenti_stock (
    id               INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    prodotto_id      INTEGER        NOT NULL,
    ubicazione_da_id INTEGER,                         
    ubicazione_a_id  INTEGER,                        
    quantita         INTEGER        NOT NULL,
    tipo             movimento_tipo NOT NULL,
    utente_id        INTEGER,
    riferimento_tipo TEXT,                           
    riferimento_id   INTEGER,                        
    note             TEXT,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_movimenti_prodotto
        FOREIGN KEY (prodotto_id) REFERENCES prodotti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_movimenti_ubicazione_da
        FOREIGN KEY (ubicazione_da_id) REFERENCES ubicazioni(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_movimenti_ubicazione_a
        FOREIGN KEY (ubicazione_a_id) REFERENCES ubicazioni(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_movimenti_utente
        FOREIGN KEY (utente_id) REFERENCES utenti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ── 2.15  Righe PO (dipende da ordini_acquisto CASCADE, prodotti) ─

CREATE TABLE righe_po (
    id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ordine_acquisto_id INTEGER NOT NULL,
    prodotto_id        INTEGER NOT NULL,
    quantita_ordinata  INTEGER NOT NULL,
    quantita_ricevuta  INTEGER NOT NULL DEFAULT 0,    
    prezzo_unitario    NUMERIC,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_righe_po_ordine_acquisto
        FOREIGN KEY (ordine_acquisto_id) REFERENCES ordini_acquisto(id)
        ON DELETE CASCADE ON UPDATE NO ACTION,      
    CONSTRAINT fk_righe_po_prodotto
        FOREIGN KEY (prodotto_id) REFERENCES prodotti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ── 2.16  Ricezioni (dipende da ordini_acquisto, utenti) ────────

CREATE TABLE ricezioni (
    id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ordine_acquisto_id INTEGER                  NOT NULL,
    data_ricezione     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    note               TEXT,
    utente_id          INTEGER,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ricezioni_ordine_acquisto
        FOREIGN KEY (ordine_acquisto_id) REFERENCES ordini_acquisto(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_ricezioni_utente
        FOREIGN KEY (utente_id) REFERENCES utenti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ── 2.17  Righe ordine (dipende da ordini CASCADE, prodotti) ────

CREATE TABLE righe_ordine (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ordine_id       INTEGER NOT NULL,
    prodotto_id     INTEGER NOT NULL,
    quantita        INTEGER NOT NULL,
    prezzo_unitario NUMERIC,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_righe_ordine_ordine
        FOREIGN KEY (ordine_id) REFERENCES ordini(id)
        ON DELETE CASCADE ON UPDATE NO ACTION,       
    CONSTRAINT fk_righe_ordine_prodotto
        FOREIGN KEY (prodotto_id) REFERENCES prodotti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ── 2.18  Spedizioni (dipende da ordini, corrieri) ───────────────

CREATE TABLE spedizioni (
    id              INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ordine_id       INTEGER       NOT NULL,
    corriere_id     INTEGER       NOT NULL,
    tracking_number TEXT,
    stato           shipping_state NOT NULL DEFAULT 'IN_PREPARAZIONE',
    data_spedizione TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_spedizioni_ordine
        FOREIGN KEY (ordine_id) REFERENCES ordini(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_spedizioni_corriere
        FOREIGN KEY (corriere_id) REFERENCES corrieri(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT uq_spedizioni_ordine
        UNIQUE (ordine_id)                            
);

-- ── 2.19  DDT (dipende da spedizioni) ───────────────────────────

CREATE TABLE ddt (
    id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    spedizione_id      INTEGER NOT NULL,
    numero_progressivo INTEGER NOT NULL,             
    anno               INTEGER NOT NULL,
    data_emissione     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    pdf_path           TEXT,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ddt_spedizione
        FOREIGN KEY (spedizione_id) REFERENCES spedizioni(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT uq_ddt_spedizione
        UNIQUE (spedizione_id),                      
    CONSTRAINT uq_ddt_numero_anno
        UNIQUE (numero_progressivo, anno)           
);

-- ── 2.20  Righe ricezione (dipende da ricezioni CASCADE, prodotti, ubicazioni)

CREATE TABLE righe_ricezione (
    id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ricezione_id      INTEGER NOT NULL,
    prodotto_id       INTEGER NOT NULL,
    quantita_ricevuta INTEGER NOT NULL,
    ubicazione_id     INTEGER NOT NULL,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_righe_ricezione_ricezione
        FOREIGN KEY (ricezione_id) REFERENCES ricezioni(id)
        ON DELETE CASCADE ON UPDATE NO ACTION,        
    CONSTRAINT fk_righe_ricezione_prodotto
        FOREIGN KEY (prodotto_id) REFERENCES prodotti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_righe_ricezione_ubicazione
        FOREIGN KEY (ubicazione_id) REFERENCES ubicazioni(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ── 3. FK DEFERRED (self-reference) ─────────────────────────────────────────

ALTER TABLE categorie
    ADD CONSTRAINT fk_categorie_padre
        FOREIGN KEY (categoria_padre_id) REFERENCES categorie(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ── 4. SEQUENCE DDT ──────────────────────────────────────────────────────────
--
--  Sequence atomica per la numerazione progressiva dei DDT.
--  nextval('seq_ddt_numero_progressivo') garantisce unicità anche
--  con richieste concorrenti.
--
--  Reset annuale: eseguire la migration schedulata a inizio anno:
--    ALTER SEQUENCE seq_ddt_numero_progressivo RESTART WITH 1;
--
--  Utilizzo nel service:
--    SELECT nextval('seq_ddt_numero_progressivo') AS numero;

CREATE SEQUENCE seq_ddt_numero_progressivo
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- ── 5. TRIGGER updated_at ────────────────────────────────────────────────────
--
--  Aggiorna automaticamente updated_at a ogni UPDATE su tutte le tabelle.
--  movimenti_stock è escluso: è append-only (solo INSERT).

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'ruoli', 'permessi', 'categorie', 'prodotti',
        'fornitori', 'contatti_fornitori',
        'clienti', 'destinazioni_clienti',
        'corrieri', 'dipendenti', 'utenti', 'ruoli_permessi',
        'notifiche',
        'ordini_acquisto', 'righe_po', 'ricezioni', 'righe_ricezione',
        'ubicazioni', 'giacenze',
        'ordini', 'righe_ordine',
        'spedizioni', 'ddt'
      
    ]
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_set_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at()',
            tbl, tbl
        );
    END LOOP;
END;
$$;

-- ── 6. INDICI DI PERFORMANCE ─────────────────────────────────────────────────
--
--  Gli indici UNIQUE sono già creati dalle CONSTRAINT sopra.
--  Qui solo indici aggiuntivi per le query operative più frequenti.

-- Notifiche: polling ogni 30s per utente — filtra non lette
CREATE INDEX idx_notifiche_utente_letto   ON notifiche(utente_id, letto);
CREATE INDEX idx_notifiche_created_at     ON notifiche(created_at DESC);

-- Movimenti stock: filtri audit log (prodotto, tipo, data)
CREATE INDEX idx_movimenti_prodotto_id    ON movimenti_stock(prodotto_id);
CREATE INDEX idx_movimenti_tipo           ON movimenti_stock(tipo);
CREATE INDEX idx_movimenti_created_at     ON movimenti_stock(created_at DESC);

-- Ordini acquisto: lista per stato e fornitore
CREATE INDEX idx_ordini_acquisto_stato    ON ordini_acquisto(stato);
CREATE INDEX idx_ordini_acquisto_forn     ON ordini_acquisto(fornitore_id);

-- Ordini vendita: lista per stato commerciale e stato picking
CREATE INDEX idx_ordini_stato             ON ordini(stato);
CREATE INDEX idx_ordini_stato_picking     ON ordini(stato_picking);
CREATE INDEX idx_ordini_cliente           ON ordini(cliente_id);
CREATE INDEX idx_ordini_data_ordine       ON ordini(data_ordine DESC);

-- Prodotti: ricerca per categoria e stato attivo
CREATE INDEX idx_prodotti_categoria       ON prodotti(categoria_id);
CREATE INDEX idx_prodotti_attivo          ON prodotti(attivo);

-- Giacenze: query stock per prodotto (somma per ubicazione)
CREATE INDEX idx_giacenze_prodotto        ON giacenze(prodotto_id);

-- Spedizioni: lista per corriere e stato
CREATE INDEX idx_spedizioni_corriere      ON spedizioni(corriere_id);
CREATE INDEX idx_spedizioni_stato         ON spedizioni(stato);
CREATE INDEX idx_spedizioni_data          ON spedizioni(data_spedizione DESC);

-- Ricezioni: storico per PO
CREATE INDEX idx_ricezioni_po             ON ricezioni(ordine_acquisto_id);

COMMIT;

-- ================================================================
-- RIEPILOGO TABELLE (24) E SEQUENZE (1)
-- ================================================================
--
--  Auth & Sistema  : ruoli, permessi, ruoli_permessi, utenti, dipendenti, notifiche
--  Prodotti        : categorie, prodotti
--  Fornitori       : fornitori, contatti_fornitori
--  Clienti         : clienti, destinazioni_clienti
--  Magazzino       : ubicazioni  [flat — E-01 intenzionale]
--  Inventario      : giacenze, movimenti_stock
--  Acquisti        : ordini_acquisto, righe_po, ricezioni, righe_ricezione
--  Vendite         : ordini, righe_ordine
--  Logistica       : corrieri, spedizioni, ddt
--
--  Sequenze        : seq_ddt_numero_progressivo
--
-- Enum definiti    : 6
-- Indici totali    : UNIQUE (da constraint) + 14 di performance
-- Trigger          : fn_set_updated_at applicata a 23 tabelle
--                    (movimenti_stock escluso — append-only)
-- ================================================================
