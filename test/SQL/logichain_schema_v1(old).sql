BEGIN;

CREATE TYPE purchase_order_state AS ENUM (
    'BOZZA',
    'INVIATO',
    'CONFERMATO',
    'IN_RICEZIONE',
    'COMPLETATO',
    'ANNULLATO'
);

CREATE TYPE sales_order_state AS ENUM (
    'BOZZA',
    'CONFERMATO',
    'SPEDITO',
    'ANNULLATO'
);

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

CREATE TABLE ruoli (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    descrizione TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE permessi (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codice TEXT NOT NULL UNIQUE,
    descrizione TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE categorie (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    categoria_padre_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE fornitori (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ragione_sociale TEXT NOT NULL,
    piva TEXT UNIQUE,
    indirizzo TEXT,
    email TEXT,
    telefono TEXT,
    lead_time_giorni INTEGER,
    attivo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE clienti (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ragione_sociale TEXT NOT NULL,
    piva_cf TEXT UNIQUE,
    email TEXT,
    telefono TEXT,
    attivo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE magazzini (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codice TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    indirizzo TEXT,
    cap TEXT,
    citta TEXT,
    provincia TEXT,
    paese TEXT,
    attiva BOOLEAN NOT NULL DEFAULT TRUE,
    descrizione TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE ubicazioni (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    magazzino_id INTEGER NOT NULL,
    corsia INTEGER NOT NULL,
    scaffale INTEGER NOT NULL,
    codice TEXT NOT NULL UNIQUE,
    attiva BOOLEAN NOT NULL DEFAULT TRUE,
    temperatura_controllata BOOLEAN DEFAULT FALSE,
    descrizione TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_ubicazioni_magazzino FOREIGN KEY (magazzino_id) REFERENCES magazzini (id) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT uq_ubicazioni_slot UNIQUE (
        magazzino_id,
        corsia,
        scaffale
    )
);

CREATE TABLE utenti (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    ruolo_id INTEGER NOT NULL,
    attivo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_utenti_ruolo FOREIGN KEY (ruolo_id) REFERENCES ruoli (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE corrieri (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    codice TEXT NOT NULL UNIQUE,
    email_operativa TEXT,
    telefono TEXT,
    utente_responsabile_id INTEGER,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_corrieri_utente_responsabile FOREIGN KEY (utente_responsabile_id) REFERENCES utenti (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE ruoli_permessi (
    ruolo_id INTEGER NOT NULL,
    permesso_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_ruoli_permessi PRIMARY KEY (ruolo_id, permesso_id),
    CONSTRAINT fk_ruoli_permessi_ruolo FOREIGN KEY (ruolo_id) REFERENCES ruoli (id) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT fk_ruoli_permessi_permesso FOREIGN KEY (permesso_id) REFERENCES permessi (id) ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE dipendenti (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    codice_fiscale TEXT NOT NULL UNIQUE,
    ruolo_operativo TEXT,
    data_assunzione DATE,
    utente_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_dipendenti_utente FOREIGN KEY (utente_id) REFERENCES utenti (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE notifiche (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    utente_id INTEGER NOT NULL,
    tipo notification_type NOT NULL,
    messaggio TEXT NOT NULL,
    letto BOOLEAN NOT NULL DEFAULT FALSE,
    riferimento_tipo TEXT,
    riferimento_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_notifiche_utente FOREIGN KEY (utente_id) REFERENCES utenti (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE prodotti (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    descrizione TEXT,
    categoria_id INTEGER,
    unita_misura TEXT,
    peso_kg NUMERIC,
    scorta_minima INTEGER NOT NULL DEFAULT 0,
    attivo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_prodotti_categoria FOREIGN KEY (categoria_id) REFERENCES categorie (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE contatti_fornitori (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fornitore_id INTEGER NOT NULL,
    nome TEXT,
    ruolo TEXT,
    email TEXT,
    telefono TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_contatti_fornitori_fornitore FOREIGN KEY (fornitore_id) REFERENCES fornitori (id) ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE destinazioni_clienti (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    etichetta TEXT,
    indirizzo TEXT,
    cap TEXT,
    citta TEXT,
    provincia TEXT,
    paese TEXT,
    predefinita BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_destinazioni_clienti_cliente FOREIGN KEY (cliente_id) REFERENCES clienti (id) ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE ordini_acquisto (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fornitore_id INTEGER NOT NULL,
    stato purchase_order_state NOT NULL DEFAULT 'BOZZA',
    data_prevista DATE,
    importo_totale NUMERIC,
    note TEXT,
    utente_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_ordini_acquisto_fornitore FOREIGN KEY (fornitore_id) REFERENCES fornitori (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_ordini_acquisto_utente FOREIGN KEY (utente_id) REFERENCES utenti (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE ordini (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    destinazione_id INTEGER NOT NULL,
    stato sales_order_state NOT NULL DEFAULT 'BOZZA',
    stato_picking sales_order_picking_state NOT NULL DEFAULT 'NON_AVVIATO',
    data_ordine TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_consegna_richiesta DATE,
    importo_totale NUMERIC,
    utente_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_ordini_cliente FOREIGN KEY (cliente_id) REFERENCES clienti (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_ordini_destinazione FOREIGN KEY (destinazione_id) REFERENCES destinazioni_clienti (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_ordini_utente FOREIGN KEY (utente_id) REFERENCES utenti (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE giacenze (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    prodotto_id INTEGER NOT NULL,
    ubicazione_id INTEGER NOT NULL,
    quantita INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_giacenze_prodotto FOREIGN KEY (prodotto_id) REFERENCES prodotti (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_giacenze_ubicazione FOREIGN KEY (ubicazione_id) REFERENCES ubicazioni (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT uq_giacenze_prodotto_ubicazione UNIQUE (prodotto_id, ubicazione_id),
    CONSTRAINT chk_giacenze_quantita_non_negativa CHECK (quantita >= 0)
);

CREATE TABLE movimenti_stock (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    prodotto_id INTEGER NOT NULL,
    ubicazione_da_id INTEGER,
    ubicazione_a_id INTEGER,
    quantita INTEGER NOT NULL,
    tipo movimento_tipo NOT NULL,
    utente_id INTEGER,
    riferimento_tipo TEXT,
    riferimento_id INTEGER,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_movimenti_prodotto FOREIGN KEY (prodotto_id) REFERENCES prodotti (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_movimenti_ubicazione_da FOREIGN KEY (ubicazione_da_id) REFERENCES ubicazioni (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_movimenti_ubicazione_a FOREIGN KEY (ubicazione_a_id) REFERENCES ubicazioni (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_movimenti_utente FOREIGN KEY (utente_id) REFERENCES utenti (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE righe_po (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ordine_acquisto_id INTEGER NOT NULL,
    prodotto_id INTEGER NOT NULL,
    quantita_ordinata INTEGER NOT NULL,
    quantita_ricevuta INTEGER NOT NULL DEFAULT 0,
    prezzo_unitario NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_righe_po_ordine_acquisto FOREIGN KEY (ordine_acquisto_id) REFERENCES ordini_acquisto (id) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT fk_righe_po_prodotto FOREIGN KEY (prodotto_id) REFERENCES prodotti (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE ricezioni (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ordine_acquisto_id INTEGER NOT NULL,
    data_ricezione TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    note TEXT,
    utente_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_ricezioni_ordine_acquisto FOREIGN KEY (ordine_acquisto_id) REFERENCES ordini_acquisto (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_ricezioni_utente FOREIGN KEY (utente_id) REFERENCES utenti (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE righe_ordine (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ordine_id INTEGER NOT NULL,
    prodotto_id INTEGER NOT NULL,
    quantita INTEGER NOT NULL,
    prezzo_unitario NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_righe_ordine_ordine FOREIGN KEY (ordine_id) REFERENCES ordini (id) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT fk_righe_ordine_prodotto FOREIGN KEY (prodotto_id) REFERENCES prodotti (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE spedizioni (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ordine_id INTEGER NOT NULL,
    corriere_id INTEGER NOT NULL,
    tracking_number TEXT,
    stato shipping_state NOT NULL DEFAULT 'IN_PREPARAZIONE',
    data_spedizione TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_spedizioni_ordine FOREIGN KEY (ordine_id) REFERENCES ordini (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_spedizioni_corriere FOREIGN KEY (corriere_id) REFERENCES corrieri (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT uq_spedizioni_ordine UNIQUE (ordine_id)
);

CREATE TABLE ddt (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    spedizione_id INTEGER NOT NULL,
    numero_progressivo INTEGER NOT NULL,
    anno INTEGER NOT NULL,
    data_emissione TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    pdf_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_ddt_spedizione FOREIGN KEY (spedizione_id) REFERENCES spedizioni (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT uq_ddt_spedizione UNIQUE (spedizione_id),
    CONSTRAINT uq_ddt_numero_anno UNIQUE (numero_progressivo, anno)
);

CREATE TABLE righe_ricezione (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ricezione_id INTEGER NOT NULL,
    prodotto_id INTEGER NOT NULL,
    quantita_ricevuta INTEGER NOT NULL,
    ubicazione_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_righe_ricezione_ricezione FOREIGN KEY (ricezione_id) REFERENCES ricezioni (id) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT fk_righe_ricezione_prodotto FOREIGN KEY (prodotto_id) REFERENCES prodotti (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_righe_ricezione_ubicazione FOREIGN KEY (ubicazione_id) REFERENCES ubicazioni (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

ALTER TABLE categorie
ADD CONSTRAINT fk_categorie_padre FOREIGN KEY (categoria_padre_id) REFERENCES categorie (id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE SEQUENCE seq_ddt_numero_progressivo START
WITH
    1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

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
        'magazzini', 'ubicazioni', 'giacenze',
        'ordini_acquisto', 'righe_po', 'ricezioni', 'righe_ricezione',
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

CREATE INDEX idx_notifiche_utente_letto ON notifiche (utente_id, letto);

CREATE INDEX idx_notifiche_created_at ON notifiche (created_at DESC);

CREATE INDEX idx_movimenti_prodotto_id ON movimenti_stock (prodotto_id);

CREATE INDEX idx_movimenti_tipo ON movimenti_stock (tipo);

CREATE INDEX idx_movimenti_created_at ON movimenti_stock (created_at DESC);

CREATE INDEX idx_ordini_acquisto_stato ON ordini_acquisto (stato);

CREATE INDEX idx_ordini_acquisto_forn ON ordini_acquisto (fornitore_id);

CREATE INDEX idx_ordini_stato ON ordini (stato);

CREATE INDEX idx_ordini_stato_picking ON ordini (stato_picking);

CREATE INDEX idx_ordini_cliente ON ordini (cliente_id);

CREATE INDEX idx_ordini_data_ordine ON ordini (data_ordine DESC);

CREATE INDEX idx_prodotti_categoria ON prodotti (categoria_id);

CREATE INDEX idx_prodotti_attivo ON prodotti (attivo);

CREATE INDEX idx_giacenze_prodotto ON giacenze (prodotto_id);

CREATE INDEX idx_ubicazioni_magazzino ON ubicazioni (magazzino_id);

CREATE INDEX idx_ubicazioni_corsia ON ubicazioni (magazzino_id, corsia);

CREATE INDEX idx_spedizioni_corriere ON spedizioni (corriere_id);

CREATE INDEX idx_spedizioni_stato ON spedizioni (stato);

CREATE INDEX idx_spedizioni_data ON spedizioni (data_spedizione DESC);

CREATE INDEX idx_ricezioni_po ON ricezioni (ordine_acquisto_id);

COMMIT;