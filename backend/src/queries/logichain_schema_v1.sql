-- DrawDB-compatible SQL generated from logichain_schema_v1.3.sql
-- Removed PostgreSQL-only CREATE TYPE, IDENTITY, triggers, sequence and indexes for import compatibility.

CREATE TABLE ruoli (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nome        TEXT    NOT NULL UNIQUE,
    descrizione TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permessi (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    codice      TEXT    NOT NULL UNIQUE,
    descrizione TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorie (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    nome               TEXT    NOT NULL UNIQUE,
    categoria_padre_id INT,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_categorie_padre
        FOREIGN KEY (categoria_padre_id) REFERENCES categorie(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE fornitori (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    ragione_sociale  TEXT    NOT NULL,
    piva             TEXT    UNIQUE,
    indirizzo        TEXT,
    email            TEXT,
    telefono         TEXT,
    lead_time_giorni INT,
    attivo           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clienti (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    ragione_sociale TEXT    NOT NULL,
    piva_cf         TEXT    UNIQUE,
    email           TEXT,
    telefono        TEXT,
    attivo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE magazzini (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    codice      TEXT    NOT NULL UNIQUE,
    nome        TEXT    NOT NULL,
    indirizzo   TEXT,
    cap         TEXT,
    citta       TEXT,
    provincia   TEXT,
    paese       TEXT,
    attiva      BOOLEAN NOT NULL DEFAULT TRUE,
    descrizione TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ubicazioni (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    magazzino_id            INT NOT NULL,
    corsia                  INT NOT NULL,
    scaffale                INT NOT NULL,
    codice                  TEXT    NOT NULL UNIQUE,
    attiva                  BOOLEAN NOT NULL DEFAULT TRUE,
    temperatura_controllata BOOLEAN          DEFAULT FALSE,
    descrizione             TEXT,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ubicazioni_magazzino
        FOREIGN KEY (magazzino_id) REFERENCES magazzini(id)
        ON DELETE CASCADE ON UPDATE NO ACTION,

    CONSTRAINT uq_ubicazioni_slot
        UNIQUE (magazzino_id, corsia, scaffale)
);

CREATE TABLE utenti (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nome          TEXT    NOT NULL,
    cognome       TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    ruolo_id      INT NOT NULL,
    attivo        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_utenti_ruolo
        FOREIGN KEY (ruolo_id) REFERENCES ruoli(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE corrieri (
    id                     INT AUTO_INCREMENT PRIMARY KEY,
    nome                   TEXT    NOT NULL UNIQUE,
    codice                 TEXT    NOT NULL UNIQUE,
    email_operativa        TEXT,
    telefono               TEXT,
    utente_responsabile_id INT,
    note                   TEXT,
    created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_corrieri_utente_responsabile
        FOREIGN KEY (utente_responsabile_id) REFERENCES utenti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE ruoli_permessi (
    ruolo_id    INT NOT NULL,
    permesso_id INT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nome            TEXT    NOT NULL,
    cognome         TEXT    NOT NULL,
    codice_fiscale  TEXT    NOT NULL UNIQUE,
    ruolo_operativo TEXT,
    data_assunzione DATE,
    utente_id       INT,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_dipendenti_utente
        FOREIGN KEY (utente_id) REFERENCES utenti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE notifiche (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    utente_id        INT           NOT NULL,
    tipo             VARCHAR(50) NOT NULL,
    messaggio        TEXT              NOT NULL,
    letto            BOOLEAN           NOT NULL DEFAULT FALSE,
    riferimento_tipo TEXT,
    riferimento_id   INT,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifiche_utente
        FOREIGN KEY (utente_id) REFERENCES utenti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE prodotti (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    sku           TEXT    NOT NULL UNIQUE,
    nome          TEXT    NOT NULL,
    descrizione   TEXT,
    categoria_id  INT,
    unita_misura  TEXT,
    peso_kg       DECIMAL(12,2),
    scorta_minima INT NOT NULL DEFAULT 0,
    attivo        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_prodotti_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorie(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE contatti_fornitori (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    fornitore_id INT NOT NULL,
    nome         TEXT,
    ruolo        TEXT,
    email        TEXT,
    telefono     TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_contatti_fornitori_fornitore
        FOREIGN KEY (fornitore_id) REFERENCES fornitori(id)
        ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE destinazioni_clienti (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id  INT NOT NULL,
    etichetta   TEXT,
    indirizzo   TEXT,
    cap         TEXT,
    citta       TEXT,
    provincia   TEXT,
    paese       TEXT,
    predefinita BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_destinazioni_clienti_cliente
        FOREIGN KEY (cliente_id) REFERENCES clienti(id)
        ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE ordini_acquisto (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    fornitore_id   INT              NOT NULL,
    stato          VARCHAR(50) NOT NULL DEFAULT 'BOZZA',
    data_prevista  DATE,
    importo_totale DECIMAL(12,2),
    note           TEXT,
    utente_id      INT,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ordini_acquisto_fornitore
        FOREIGN KEY (fornitore_id) REFERENCES fornitori(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_ordini_acquisto_utente
        FOREIGN KEY (utente_id) REFERENCES utenti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE ordini (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id              INT                   NOT NULL,
    destinazione_id         INT                   NOT NULL,
    stato                   VARCHAR(50)         NOT NULL DEFAULT 'BOZZA',
    stato_picking           VARCHAR(50) NOT NULL DEFAULT 'NON_AVVIATO',
    data_ordine             TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_consegna_richiesta DATE,
    importo_totale          DECIMAL(12,2),
    utente_id               INT,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

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

CREATE TABLE giacenze (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    prodotto_id   INT NOT NULL,
    ubicazione_id INT NOT NULL,
    quantita      INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

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

CREATE TABLE movimenti_stock (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    prodotto_id      INT        NOT NULL,
    ubicazione_da_id INT,
    ubicazione_a_id  INT,
    quantita         INT        NOT NULL,
    tipo             VARCHAR(50) NOT NULL,
    utente_id        INT,
    riferimento_tipo TEXT,
    riferimento_id   INT,
    note             TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

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

CREATE TABLE righe_po (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    ordine_acquisto_id INT NOT NULL,
    prodotto_id        INT NOT NULL,
    quantita_ordinata  INT NOT NULL,
    quantita_ricevuta  INT NOT NULL DEFAULT 0,
    prezzo_unitario    DECIMAL(12,2),
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_righe_po_ordine_acquisto
        FOREIGN KEY (ordine_acquisto_id) REFERENCES ordini_acquisto(id)
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT fk_righe_po_prodotto
        FOREIGN KEY (prodotto_id) REFERENCES prodotti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE ricezioni (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    ordine_acquisto_id INT                  NOT NULL,
    data_ricezione     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note               TEXT,
    utente_id          INT,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ricezioni_ordine_acquisto
        FOREIGN KEY (ordine_acquisto_id) REFERENCES ordini_acquisto(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_ricezioni_utente
        FOREIGN KEY (utente_id) REFERENCES utenti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE righe_ordine (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    ordine_id       INT NOT NULL,
    prodotto_id     INT NOT NULL,
    quantita        INT NOT NULL,
    prezzo_unitario DECIMAL(12,2),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_righe_ordine_ordine
        FOREIGN KEY (ordine_id) REFERENCES ordini(id)
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT fk_righe_ordine_prodotto
        FOREIGN KEY (prodotto_id) REFERENCES prodotti(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE spedizioni (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    ordine_id       INT        NOT NULL,
    corriere_id     INT        NOT NULL,
    tracking_number TEXT,
    stato           VARCHAR(50) NOT NULL DEFAULT 'IN_PREPARAZIONE',
    data_spedizione TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_spedizioni_ordine
        FOREIGN KEY (ordine_id) REFERENCES ordini(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_spedizioni_corriere
        FOREIGN KEY (corriere_id) REFERENCES corrieri(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT uq_spedizioni_ordine
        UNIQUE (ordine_id)
);

CREATE TABLE ddt (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    spedizione_id      INT NOT NULL,
    numero_progressivo INT NOT NULL,
    anno               INT NOT NULL,
    data_emissione     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pdf_path           TEXT,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ddt_spedizione
        FOREIGN KEY (spedizione_id) REFERENCES spedizioni(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT uq_ddt_spedizione
        UNIQUE (spedizione_id),
    CONSTRAINT uq_ddt_numero_anno
        UNIQUE (numero_progressivo, anno)
);

CREATE TABLE righe_ricezione (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    ricezione_id      INT NOT NULL,
    prodotto_id       INT NOT NULL,
    quantita_ricevuta INT NOT NULL,
    ubicazione_id     INT NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

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

