--
-- PostgreSQL database dump
--

\restrict 9xqYMsRargVyWb7s4KjndsmSUwmSTES315D6YSLvv5fCH5XE8xnhFnuUOOyZVpS

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-06-04 22:45:13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE logichain;
--
-- TOC entry 5512 (class 1262 OID 65968)
-- Name: logichain; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE logichain WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Italian_Italy.1252';


ALTER DATABASE logichain OWNER TO postgres;

\unrestrict 9xqYMsRargVyWb7s4KjndsmSUwmSTES315D6YSLvv5fCH5XE8xnhFnuUOOyZVpS
\connect logichain
\restrict 9xqYMsRargVyWb7s4KjndsmSUwmSTES315D6YSLvv5fCH5XE8xnhFnuUOOyZVpS

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 921 (class 1247 OID 66856)
-- Name: movimento_tipo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.movimento_tipo AS ENUM (
    'CARICO_ACQUISTO',
    'SCARICO_VENDITA',
    'SPOSTAMENTO',
    'RETTIFICA_POSITIVA',
    'RETTIFICA_NEGATIVA',
    'RESO'
);


ALTER TYPE public.movimento_tipo OWNER TO postgres;

--
-- TOC entry 924 (class 1247 OID 66870)
-- Name: notification_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_type AS ENUM (
    'SOTTO_SCORTA',
    'PO_IN_RITARDO',
    'RICEZIONE_PARZIALE',
    'CAMBIO_STATO_SPEDIZIONE',
    'ALTRO',
    'RICHIESTA_ACCETTATA',
    'RICHIESTA_RIFIUTATA',
    'MESSAGGIO_FORNITORE'
);


ALTER TYPE public.notification_type OWNER TO postgres;

--
-- TOC entry 909 (class 1247 OID 66815)
-- Name: purchase_order_state; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.purchase_order_state AS ENUM (
    'BOZZA',
    'INVIATO',
    'CONFERMATO',
    'IN_RICEZIONE',
    'COMPLETATO',
    'ANNULLATO'
);


ALTER TYPE public.purchase_order_state OWNER TO postgres;

--
-- TOC entry 999 (class 1247 OID 67576)
-- Name: richiesta_acquisto_state; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.richiesta_acquisto_state AS ENUM (
    'BOZZA',
    'INVIATA',
    'IN_VALUTAZIONE',
    'ACCETTATA',
    'RIFIUTATA'
);


ALTER TYPE public.richiesta_acquisto_state OWNER TO postgres;

--
-- TOC entry 915 (class 1247 OID 66838)
-- Name: sales_order_picking_state; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sales_order_picking_state AS ENUM (
    'NON_AVVIATO',
    'IN_PICKING',
    'PICKING_COMPLETATO'
);


ALTER TYPE public.sales_order_picking_state OWNER TO postgres;

--
-- TOC entry 912 (class 1247 OID 66828)
-- Name: sales_order_state; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sales_order_state AS ENUM (
    'BOZZA',
    'CONFERMATO',
    'SPEDITO',
    'ANNULLATO'
);


ALTER TYPE public.sales_order_state OWNER TO postgres;

--
-- TOC entry 918 (class 1247 OID 66846)
-- Name: shipping_state; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.shipping_state AS ENUM (
    'IN_PREPARAZIONE',
    'SPEDITA',
    'CONSEGNATA',
    'PROBLEMA'
);


ALTER TYPE public.shipping_state OWNER TO postgres;

--
-- TOC entry 273 (class 1255 OID 66813)
-- Name: fn_set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$;


ALTER FUNCTION public.fn_set_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 233 (class 1259 OID 67021)
-- Name: categorie; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorie (
    id integer NOT NULL,
    nome text NOT NULL,
    categoria_padre_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categorie OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 67020)
-- Name: categorie_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorie_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorie_id_seq OWNER TO postgres;

--
-- TOC entry 5513 (class 0 OID 0)
-- Dependencies: 232
-- Name: categorie_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorie_id_seq OWNED BY public.categorie.id;


--
-- TOC entry 241 (class 1259 OID 67121)
-- Name: clienti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clienti (
    id integer NOT NULL,
    ragione_sociale text NOT NULL,
    piva_cf text,
    email text,
    telefono text,
    attivo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    source text DEFAULT '''manual'''::text NOT NULL,
    CONSTRAINT chk_clienti_source CHECK ((source = ANY (ARRAY['manual'::text, 'ecosystem'::text])))
);


ALTER TABLE public.clienti OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 67120)
-- Name: clienti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clienti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clienti_id_seq OWNER TO postgres;

--
-- TOC entry 5514 (class 0 OID 0)
-- Dependencies: 240
-- Name: clienti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clienti_id_seq OWNED BY public.clienti.id;


--
-- TOC entry 239 (class 1259 OID 67097)
-- Name: contatti_fornitori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contatti_fornitori (
    id integer NOT NULL,
    fornitore_id integer NOT NULL,
    nome text,
    ruolo text,
    email text,
    telefono text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contatti_fornitori OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 67096)
-- Name: contatti_fornitori_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contatti_fornitori_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contatti_fornitori_id_seq OWNER TO postgres;

--
-- TOC entry 5515 (class 0 OID 0)
-- Dependencies: 238
-- Name: contatti_fornitori_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contatti_fornitori_id_seq OWNED BY public.contatti_fornitori.id;


--
-- TOC entry 267 (class 1259 OID 67524)
-- Name: ddt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ddt (
    id integer NOT NULL,
    spedizione_id integer NOT NULL,
    numero_ddt text NOT NULL,
    data_ddt date DEFAULT CURRENT_DATE NOT NULL,
    trasportatore text,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ddt OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 67523)
-- Name: ddt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ddt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ddt_id_seq OWNER TO postgres;

--
-- TOC entry 5516 (class 0 OID 0)
-- Dependencies: 266
-- Name: ddt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ddt_id_seq OWNED BY public.ddt.id;


--
-- TOC entry 243 (class 1259 OID 67141)
-- Name: destinazioni_clienti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destinazioni_clienti (
    id integer NOT NULL,
    cliente_id integer NOT NULL,
    etichetta text,
    indirizzo text,
    cap text,
    citta text,
    provincia text,
    paese text,
    predefinita boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.destinazioni_clienti OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 67140)
-- Name: destinazioni_clienti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.destinazioni_clienti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destinazioni_clienti_id_seq OWNER TO postgres;

--
-- TOC entry 5517 (class 0 OID 0)
-- Dependencies: 242
-- Name: destinazioni_clienti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.destinazioni_clienti_id_seq OWNED BY public.destinazioni_clienti.id;


--
-- TOC entry 229 (class 1259 OID 66969)
-- Name: dipendenti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dipendenti (
    id integer NOT NULL,
    nome text NOT NULL,
    cognome text NOT NULL,
    codice_fiscale text NOT NULL,
    ruolo_operativo text,
    data_assunzione date,
    utente_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dipendenti OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 66968)
-- Name: dipendenti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dipendenti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dipendenti_id_seq OWNER TO postgres;

--
-- TOC entry 5518 (class 0 OID 0)
-- Dependencies: 228
-- Name: dipendenti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dipendenti_id_seq OWNED BY public.dipendenti.id;


--
-- TOC entry 237 (class 1259 OID 67077)
-- Name: fornitori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fornitori (
    id integer NOT NULL,
    ragione_sociale text NOT NULL,
    piva text,
    indirizzo text,
    email text,
    telefono text,
    lead_time_giorni integer,
    attivo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    source text DEFAULT '''manual'''::text NOT NULL,
    sito_web text,
    descrizione_aziendale text,
    CONSTRAINT chk_fornitori_source CHECK ((source = ANY (ARRAY['manual'::text, 'ecosystem'::text])))
);


ALTER TABLE public.fornitori OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 67076)
-- Name: fornitori_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fornitori_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fornitori_id_seq OWNER TO postgres;

--
-- TOC entry 5519 (class 0 OID 0)
-- Dependencies: 236
-- Name: fornitori_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fornitori_id_seq OWNED BY public.fornitori.id;


--
-- TOC entry 249 (class 1259 OID 67224)
-- Name: giacenze; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.giacenze (
    id integer NOT NULL,
    prodotto_id integer NOT NULL,
    ubicazione_id integer NOT NULL,
    quantita integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_giacenze_quantita CHECK ((quantita >= 0))
);


ALTER TABLE public.giacenze OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 67223)
-- Name: giacenze_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.giacenze_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.giacenze_id_seq OWNER TO postgres;

--
-- TOC entry 5520 (class 0 OID 0)
-- Dependencies: 248
-- Name: giacenze_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.giacenze_id_seq OWNED BY public.giacenze.id;


--
-- TOC entry 245 (class 1259 OID 67168)
-- Name: magazzini; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.magazzini (
    id integer NOT NULL,
    codice text NOT NULL,
    nome text NOT NULL,
    indirizzo text,
    cap text,
    citta text,
    provincia text,
    paese text,
    attivo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.magazzini OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 67167)
-- Name: magazzini_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.magazzini_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.magazzini_id_seq OWNER TO postgres;

--
-- TOC entry 5521 (class 0 OID 0)
-- Dependencies: 244
-- Name: magazzini_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.magazzini_id_seq OWNED BY public.magazzini.id;


--
-- TOC entry 251 (class 1259 OID 67257)
-- Name: movimenti_stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimenti_stock (
    id integer NOT NULL,
    prodotto_id integer NOT NULL,
    ubicazione_id integer NOT NULL,
    quantita integer NOT NULL,
    tipo public.movimento_tipo NOT NULL,
    riferimento text,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT movimenti_stock_no_update CHECK (true)
);


ALTER TABLE public.movimenti_stock OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 67256)
-- Name: movimenti_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimenti_stock_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movimenti_stock_id_seq OWNER TO postgres;

--
-- TOC entry 5522 (class 0 OID 0)
-- Dependencies: 250
-- Name: movimenti_stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimenti_stock_id_seq OWNED BY public.movimenti_stock.id;


--
-- TOC entry 231 (class 1259 OID 66994)
-- Name: notifiche; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifiche (
    id integer NOT NULL,
    utente_id integer NOT NULL,
    tipo public.notification_type NOT NULL,
    messaggio text NOT NULL,
    letto boolean DEFAULT false NOT NULL,
    riferimento_tipo text,
    riferimento_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifiche OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 66993)
-- Name: notifiche_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifiche_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifiche_id_seq OWNER TO postgres;

--
-- TOC entry 5523 (class 0 OID 0)
-- Dependencies: 230
-- Name: notifiche_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifiche_id_seq OWNED BY public.notifiche.id;


--
-- TOC entry 261 (class 1259 OID 67414)
-- Name: ordini; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ordini (
    id integer NOT NULL,
    cliente_id integer NOT NULL,
    destinazione_id integer NOT NULL,
    stato public.sales_order_state DEFAULT 'BOZZA'::public.sales_order_state NOT NULL,
    stato_picking public.sales_order_picking_state DEFAULT 'NON_AVVIATO'::public.sales_order_picking_state NOT NULL,
    data_ordine timestamp with time zone DEFAULT now() NOT NULL,
    data_consegna_richiesta date,
    importo_totale numeric,
    utente_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ordini OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 67293)
-- Name: ordini_acquisto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ordini_acquisto (
    id integer NOT NULL,
    fornitore_id integer NOT NULL,
    stato public.purchase_order_state DEFAULT 'BOZZA'::public.purchase_order_state NOT NULL,
    data_prevista date,
    importo_totale numeric,
    note text,
    utente_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ordini_acquisto OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 67292)
-- Name: ordini_acquisto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ordini_acquisto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ordini_acquisto_id_seq OWNER TO postgres;

--
-- TOC entry 5524 (class 0 OID 0)
-- Dependencies: 252
-- Name: ordini_acquisto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ordini_acquisto_id_seq OWNED BY public.ordini_acquisto.id;


--
-- TOC entry 260 (class 1259 OID 67413)
-- Name: ordini_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ordini_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ordini_id_seq OWNER TO postgres;

--
-- TOC entry 5525 (class 0 OID 0)
-- Dependencies: 260
-- Name: ordini_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ordini_id_seq OWNED BY public.ordini.id;


--
-- TOC entry 224 (class 1259 OID 66900)
-- Name: permessi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permessi (
    id integer NOT NULL,
    codice text NOT NULL,
    descrizione text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.permessi OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 66899)
-- Name: permessi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permessi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permessi_id_seq OWNER TO postgres;

--
-- TOC entry 5526 (class 0 OID 0)
-- Dependencies: 223
-- Name: permessi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permessi_id_seq OWNED BY public.permessi.id;


--
-- TOC entry 220 (class 1259 OID 65970)
-- Name: pgmigrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pgmigrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


ALTER TABLE public.pgmigrations OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 65969)
-- Name: pgmigrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pgmigrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pgmigrations_id_seq OWNER TO postgres;

--
-- TOC entry 5527 (class 0 OID 0)
-- Dependencies: 219
-- Name: pgmigrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pgmigrations_id_seq OWNED BY public.pgmigrations.id;


--
-- TOC entry 235 (class 1259 OID 67044)
-- Name: prodotti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prodotti (
    id integer NOT NULL,
    sku text NOT NULL,
    nome text NOT NULL,
    descrizione text,
    categoria_id integer,
    unita_misura text,
    peso_kg numeric,
    scorta_minima integer DEFAULT 0 NOT NULL,
    attivo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    prezzo numeric(12,2) DEFAULT 0 NOT NULL,
    data_agg_prezzo timestamp with time zone DEFAULT now()
);


ALTER TABLE public.prodotti OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 67043)
-- Name: prodotti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prodotti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prodotti_id_seq OWNER TO postgres;

--
-- TOC entry 5528 (class 0 OID 0)
-- Dependencies: 234
-- Name: prodotti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prodotti_id_seq OWNED BY public.prodotti.id;


--
-- TOC entry 257 (class 1259 OID 67351)
-- Name: ricezioni; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ricezioni (
    id integer NOT NULL,
    ordine_acquisto_id integer NOT NULL,
    data_ricezione timestamp with time zone DEFAULT now() NOT NULL,
    note text,
    utente_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ricezioni OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 67350)
-- Name: ricezioni_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ricezioni_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ricezioni_id_seq OWNER TO postgres;

--
-- TOC entry 5529 (class 0 OID 0)
-- Dependencies: 256
-- Name: ricezioni_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ricezioni_id_seq OWNED BY public.ricezioni.id;


--
-- TOC entry 270 (class 1259 OID 67588)
-- Name: richieste_acquisto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.richieste_acquisto (
    id integer NOT NULL,
    fornitore_id integer NOT NULL,
    stato public.richiesta_acquisto_state DEFAULT 'BOZZA'::public.richiesta_acquisto_state NOT NULL,
    data_richiesta timestamp with time zone DEFAULT now() NOT NULL,
    note text,
    utente_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.richieste_acquisto OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 67587)
-- Name: richieste_acquisto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.richieste_acquisto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.richieste_acquisto_id_seq OWNER TO postgres;

--
-- TOC entry 5530 (class 0 OID 0)
-- Dependencies: 269
-- Name: richieste_acquisto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.richieste_acquisto_id_seq OWNED BY public.richieste_acquisto.id;


--
-- TOC entry 263 (class 1259 OID 67452)
-- Name: righe_ordine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.righe_ordine (
    id integer NOT NULL,
    ordine_id integer NOT NULL,
    prodotto_id integer NOT NULL,
    quantita integer NOT NULL,
    prezzo_unitario numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.righe_ordine OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 67451)
-- Name: righe_ordine_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.righe_ordine_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.righe_ordine_id_seq OWNER TO postgres;

--
-- TOC entry 5531 (class 0 OID 0)
-- Dependencies: 262
-- Name: righe_ordine_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.righe_ordine_id_seq OWNED BY public.righe_ordine.id;


--
-- TOC entry 255 (class 1259 OID 67321)
-- Name: righe_po; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.righe_po (
    id integer NOT NULL,
    ordine_acquisto_id integer NOT NULL,
    prodotto_id integer NOT NULL,
    quantita_ordinata integer NOT NULL,
    quantita_ricevuta integer DEFAULT 0 NOT NULL,
    prezzo_unitario numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.righe_po OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 67320)
-- Name: righe_po_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.righe_po_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.righe_po_id_seq OWNER TO postgres;

--
-- TOC entry 5532 (class 0 OID 0)
-- Dependencies: 254
-- Name: righe_po_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.righe_po_id_seq OWNED BY public.righe_po.id;


--
-- TOC entry 259 (class 1259 OID 67379)
-- Name: righe_ricezione; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.righe_ricezione (
    id integer NOT NULL,
    ricezione_id integer NOT NULL,
    prodotto_id integer NOT NULL,
    quantita_ricevuta integer NOT NULL,
    ubicazione_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.righe_ricezione OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 67378)
-- Name: righe_ricezione_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.righe_ricezione_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.righe_ricezione_id_seq OWNER TO postgres;

--
-- TOC entry 5533 (class 0 OID 0)
-- Dependencies: 258
-- Name: righe_ricezione_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.righe_ricezione_id_seq OWNED BY public.righe_ricezione.id;


--
-- TOC entry 272 (class 1259 OID 67618)
-- Name: righe_richiesta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.righe_richiesta (
    id integer NOT NULL,
    richiesta_id integer NOT NULL,
    prodotto_id integer NOT NULL,
    quantita_richiesta integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_righe_richiesta_quantita CHECK ((quantita_richiesta > 0))
);


ALTER TABLE public.righe_richiesta OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 67617)
-- Name: righe_richiesta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.righe_richiesta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.righe_richiesta_id_seq OWNER TO postgres;

--
-- TOC entry 5534 (class 0 OID 0)
-- Dependencies: 271
-- Name: righe_richiesta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.righe_richiesta_id_seq OWNED BY public.righe_richiesta.id;


--
-- TOC entry 222 (class 1259 OID 66882)
-- Name: ruoli; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ruoli (
    id integer NOT NULL,
    nome text NOT NULL,
    descrizione text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ruoli OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 66881)
-- Name: ruoli_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ruoli_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ruoli_id_seq OWNER TO postgres;

--
-- TOC entry 5535 (class 0 OID 0)
-- Dependencies: 221
-- Name: ruoli_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ruoli_id_seq OWNED BY public.ruoli.id;


--
-- TOC entry 225 (class 1259 OID 66917)
-- Name: ruoli_permessi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ruoli_permessi (
    ruolo_id integer NOT NULL,
    permesso_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ruoli_permessi OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 67556)
-- Name: seq_ddt_numero_progressivo; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seq_ddt_numero_progressivo
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seq_ddt_numero_progressivo OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 67484)
-- Name: spedizioni; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spedizioni (
    id integer NOT NULL,
    ordine_id integer NOT NULL,
    cliente_id integer NOT NULL,
    destinazione_id integer NOT NULL,
    corriere_id integer,
    stato public.shipping_state DEFAULT 'IN_PREPARAZIONE'::public.shipping_state NOT NULL,
    tracking_number text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.spedizioni OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 67483)
-- Name: spedizioni_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spedizioni_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.spedizioni_id_seq OWNER TO postgres;

--
-- TOC entry 5536 (class 0 OID 0)
-- Dependencies: 264
-- Name: spedizioni_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spedizioni_id_seq OWNED BY public.spedizioni.id;


--
-- TOC entry 247 (class 1259 OID 67189)
-- Name: ubicazioni; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ubicazioni (
    id integer NOT NULL,
    magazzino_id integer NOT NULL,
    codice text NOT NULL,
    corsia integer NOT NULL,
    scaffale integer NOT NULL,
    attivo boolean DEFAULT true NOT NULL,
    temperatura_controllata boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ubicazioni OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 67188)
-- Name: ubicazioni_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ubicazioni_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ubicazioni_id_seq OWNER TO postgres;

--
-- TOC entry 5537 (class 0 OID 0)
-- Dependencies: 246
-- Name: ubicazioni_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ubicazioni_id_seq OWNED BY public.ubicazioni.id;


--
-- TOC entry 227 (class 1259 OID 66940)
-- Name: utenti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utenti (
    id integer NOT NULL,
    nome text NOT NULL,
    cognome text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    ruolo_id integer NOT NULL,
    attivo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.utenti OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 66939)
-- Name: utenti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.utenti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.utenti_id_seq OWNER TO postgres;

--
-- TOC entry 5538 (class 0 OID 0)
-- Dependencies: 226
-- Name: utenti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.utenti_id_seq OWNED BY public.utenti.id;


--
-- TOC entry 5028 (class 2604 OID 67024)
-- Name: categorie id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorie ALTER COLUMN id SET DEFAULT nextval('public.categorie_id_seq'::regclass);


--
-- TOC entry 5046 (class 2604 OID 67124)
-- Name: clienti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clienti ALTER COLUMN id SET DEFAULT nextval('public.clienti_id_seq'::regclass);


--
-- TOC entry 5043 (class 2604 OID 67100)
-- Name: contatti_fornitori id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contatti_fornitori ALTER COLUMN id SET DEFAULT nextval('public.contatti_fornitori_id_seq'::regclass);


--
-- TOC entry 5099 (class 2604 OID 67527)
-- Name: ddt id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ddt ALTER COLUMN id SET DEFAULT nextval('public.ddt_id_seq'::regclass);


--
-- TOC entry 5051 (class 2604 OID 67144)
-- Name: destinazioni_clienti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinazioni_clienti ALTER COLUMN id SET DEFAULT nextval('public.destinazioni_clienti_id_seq'::regclass);


--
-- TOC entry 5021 (class 2604 OID 66972)
-- Name: dipendenti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dipendenti ALTER COLUMN id SET DEFAULT nextval('public.dipendenti_id_seq'::regclass);


--
-- TOC entry 5038 (class 2604 OID 67080)
-- Name: fornitori id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fornitori ALTER COLUMN id SET DEFAULT nextval('public.fornitori_id_seq'::regclass);


--
-- TOC entry 5064 (class 2604 OID 67227)
-- Name: giacenze id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.giacenze ALTER COLUMN id SET DEFAULT nextval('public.giacenze_id_seq'::regclass);


--
-- TOC entry 5055 (class 2604 OID 67171)
-- Name: magazzini id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.magazzini ALTER COLUMN id SET DEFAULT nextval('public.magazzini_id_seq'::regclass);


--
-- TOC entry 5068 (class 2604 OID 67260)
-- Name: movimenti_stock id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimenti_stock ALTER COLUMN id SET DEFAULT nextval('public.movimenti_stock_id_seq'::regclass);


--
-- TOC entry 5024 (class 2604 OID 66997)
-- Name: notifiche id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifiche ALTER COLUMN id SET DEFAULT nextval('public.notifiche_id_seq'::regclass);


--
-- TOC entry 5086 (class 2604 OID 67417)
-- Name: ordini id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordini ALTER COLUMN id SET DEFAULT nextval('public.ordini_id_seq'::regclass);


--
-- TOC entry 5071 (class 2604 OID 67296)
-- Name: ordini_acquisto id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordini_acquisto ALTER COLUMN id SET DEFAULT nextval('public.ordini_acquisto_id_seq'::regclass);


--
-- TOC entry 5012 (class 2604 OID 66903)
-- Name: permessi id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permessi ALTER COLUMN id SET DEFAULT nextval('public.permessi_id_seq'::regclass);


--
-- TOC entry 5008 (class 2604 OID 65973)
-- Name: pgmigrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pgmigrations ALTER COLUMN id SET DEFAULT nextval('public.pgmigrations_id_seq'::regclass);


--
-- TOC entry 5031 (class 2604 OID 67047)
-- Name: prodotti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prodotti ALTER COLUMN id SET DEFAULT nextval('public.prodotti_id_seq'::regclass);


--
-- TOC entry 5079 (class 2604 OID 67354)
-- Name: ricezioni id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ricezioni ALTER COLUMN id SET DEFAULT nextval('public.ricezioni_id_seq'::regclass);


--
-- TOC entry 5103 (class 2604 OID 67591)
-- Name: richieste_acquisto id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.richieste_acquisto ALTER COLUMN id SET DEFAULT nextval('public.richieste_acquisto_id_seq'::regclass);


--
-- TOC entry 5092 (class 2604 OID 67455)
-- Name: righe_ordine id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_ordine ALTER COLUMN id SET DEFAULT nextval('public.righe_ordine_id_seq'::regclass);


--
-- TOC entry 5075 (class 2604 OID 67324)
-- Name: righe_po id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_po ALTER COLUMN id SET DEFAULT nextval('public.righe_po_id_seq'::regclass);


--
-- TOC entry 5083 (class 2604 OID 67382)
-- Name: righe_ricezione id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_ricezione ALTER COLUMN id SET DEFAULT nextval('public.righe_ricezione_id_seq'::regclass);


--
-- TOC entry 5108 (class 2604 OID 67621)
-- Name: righe_richiesta id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_richiesta ALTER COLUMN id SET DEFAULT nextval('public.righe_richiesta_id_seq'::regclass);


--
-- TOC entry 5009 (class 2604 OID 66885)
-- Name: ruoli id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ruoli ALTER COLUMN id SET DEFAULT nextval('public.ruoli_id_seq'::regclass);


--
-- TOC entry 5095 (class 2604 OID 67487)
-- Name: spedizioni id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spedizioni ALTER COLUMN id SET DEFAULT nextval('public.spedizioni_id_seq'::regclass);


--
-- TOC entry 5059 (class 2604 OID 67192)
-- Name: ubicazioni id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicazioni ALTER COLUMN id SET DEFAULT nextval('public.ubicazioni_id_seq'::regclass);


--
-- TOC entry 5017 (class 2604 OID 66943)
-- Name: utenti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utenti ALTER COLUMN id SET DEFAULT nextval('public.utenti_id_seq'::regclass);


--
-- TOC entry 5467 (class 0 OID 67021)
-- Dependencies: 233
-- Data for Name: categorie; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5475 (class 0 OID 67121)
-- Dependencies: 241
-- Data for Name: clienti; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5473 (class 0 OID 67097)
-- Dependencies: 239
-- Data for Name: contatti_fornitori; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5501 (class 0 OID 67524)
-- Dependencies: 267
-- Data for Name: ddt; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5477 (class 0 OID 67141)
-- Dependencies: 243
-- Data for Name: destinazioni_clienti; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5463 (class 0 OID 66969)
-- Dependencies: 229
-- Data for Name: dipendenti; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5471 (class 0 OID 67077)
-- Dependencies: 237
-- Data for Name: fornitori; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5483 (class 0 OID 67224)
-- Dependencies: 249
-- Data for Name: giacenze; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5479 (class 0 OID 67168)
-- Dependencies: 245
-- Data for Name: magazzini; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5485 (class 0 OID 67257)
-- Dependencies: 251
-- Data for Name: movimenti_stock; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5465 (class 0 OID 66994)
-- Dependencies: 231
-- Data for Name: notifiche; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5495 (class 0 OID 67414)
-- Dependencies: 261
-- Data for Name: ordini; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5487 (class 0 OID 67293)
-- Dependencies: 253
-- Data for Name: ordini_acquisto; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5458 (class 0 OID 66900)
-- Dependencies: 224
-- Data for Name: permessi; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5454 (class 0 OID 65970)
-- Dependencies: 220
-- Data for Name: pgmigrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pgmigrations VALUES (47, '001_create_fn_set_updated_at', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (48, '002_create_enum_types', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (49, '010_create_ruoli', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (50, '011_create_permessi', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (51, '012_create_ruoli_permessi', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (52, '013_create_utenti', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (53, '014_create_dipendenti', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (54, '015_create_notifiche', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (55, '016_indexes_notifiche', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (56, '020_create_categorie', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (57, '021_create_prodotti', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (58, '022_indexes_categorie', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (59, '023_indexes_prodotti', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (60, '030_create_fornitori', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (61, '031_create_contatti_fornitori', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (62, '032_indexes_fornitori', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (63, '040_create_clienti', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (64, '041_create_destinazioni_clienti', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (65, '042_indexes_clienti', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (66, '050_create_magazzini', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (67, '051_create_ubicazioni', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (68, '052_indexes_magazzino', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (69, '060_create_giacenze', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (70, '061_indexes_giacenze', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (71, '062_create_movimenti_stock', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (72, '063_indexes_movimenti_stock', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (73, '070_create_ordini_acquisto', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (74, '071_create_righe_po', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (75, '072_create_ricezioni', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (76, '073_create_righe_ricezione', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (77, '074_indexes_acquisti', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (78, '080_create_ordine', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (79, '081_create_righe_ordine', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (80, '082_indexes_ordini', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (81, '090_create_spedizioni', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (82, '091_create_ddt', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (83, '092_indexes_spedizioni', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (84, '093_create_seq_ddt', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (85, '100_alter_prodotti_v2', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (86, '101_alter_fornitori_v2', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (87, '102_alter_clienti_v2', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (88, '103_extend_notification_type', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (89, '104_create_enum_richiesta_acquisto_state', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (90, '105_create_richieste_acquisto', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (91, '106_create_righe_richiesta', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (92, '107_indexes_richieste_acquisto', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (93, '108_fix_ubicazioni', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (94, '109_fix_giacenze_check', '2026-06-04 22:36:51.160706');
INSERT INTO public.pgmigrations VALUES (95, '110_create_seq_ddt', '2026-06-04 22:36:51.160706');


--
-- TOC entry 5469 (class 0 OID 67044)
-- Dependencies: 235
-- Data for Name: prodotti; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5491 (class 0 OID 67351)
-- Dependencies: 257
-- Data for Name: ricezioni; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5504 (class 0 OID 67588)
-- Dependencies: 270
-- Data for Name: richieste_acquisto; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5497 (class 0 OID 67452)
-- Dependencies: 263
-- Data for Name: righe_ordine; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5489 (class 0 OID 67321)
-- Dependencies: 255
-- Data for Name: righe_po; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5493 (class 0 OID 67379)
-- Dependencies: 259
-- Data for Name: righe_ricezione; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5506 (class 0 OID 67618)
-- Dependencies: 272
-- Data for Name: righe_richiesta; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5456 (class 0 OID 66882)
-- Dependencies: 222
-- Data for Name: ruoli; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5459 (class 0 OID 66917)
-- Dependencies: 225
-- Data for Name: ruoli_permessi; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5499 (class 0 OID 67484)
-- Dependencies: 265
-- Data for Name: spedizioni; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5481 (class 0 OID 67189)
-- Dependencies: 247
-- Data for Name: ubicazioni; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5461 (class 0 OID 66940)
-- Dependencies: 227
-- Data for Name: utenti; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5539 (class 0 OID 0)
-- Dependencies: 232
-- Name: categorie_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorie_id_seq', 1, false);


--
-- TOC entry 5540 (class 0 OID 0)
-- Dependencies: 240
-- Name: clienti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clienti_id_seq', 1, false);


--
-- TOC entry 5541 (class 0 OID 0)
-- Dependencies: 238
-- Name: contatti_fornitori_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contatti_fornitori_id_seq', 1, false);


--
-- TOC entry 5542 (class 0 OID 0)
-- Dependencies: 266
-- Name: ddt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ddt_id_seq', 1, false);


--
-- TOC entry 5543 (class 0 OID 0)
-- Dependencies: 242
-- Name: destinazioni_clienti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.destinazioni_clienti_id_seq', 1, false);


--
-- TOC entry 5544 (class 0 OID 0)
-- Dependencies: 228
-- Name: dipendenti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dipendenti_id_seq', 1, false);


--
-- TOC entry 5545 (class 0 OID 0)
-- Dependencies: 236
-- Name: fornitori_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fornitori_id_seq', 1, false);


--
-- TOC entry 5546 (class 0 OID 0)
-- Dependencies: 248
-- Name: giacenze_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.giacenze_id_seq', 1, false);


--
-- TOC entry 5547 (class 0 OID 0)
-- Dependencies: 244
-- Name: magazzini_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.magazzini_id_seq', 1, false);


--
-- TOC entry 5548 (class 0 OID 0)
-- Dependencies: 250
-- Name: movimenti_stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimenti_stock_id_seq', 1, false);


--
-- TOC entry 5549 (class 0 OID 0)
-- Dependencies: 230
-- Name: notifiche_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifiche_id_seq', 1, false);


--
-- TOC entry 5550 (class 0 OID 0)
-- Dependencies: 252
-- Name: ordini_acquisto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordini_acquisto_id_seq', 1, false);


--
-- TOC entry 5551 (class 0 OID 0)
-- Dependencies: 260
-- Name: ordini_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordini_id_seq', 1, false);


--
-- TOC entry 5552 (class 0 OID 0)
-- Dependencies: 223
-- Name: permessi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permessi_id_seq', 1, false);


--
-- TOC entry 5553 (class 0 OID 0)
-- Dependencies: 219
-- Name: pgmigrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pgmigrations_id_seq', 95, true);


--
-- TOC entry 5554 (class 0 OID 0)
-- Dependencies: 234
-- Name: prodotti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prodotti_id_seq', 1, false);


--
-- TOC entry 5555 (class 0 OID 0)
-- Dependencies: 256
-- Name: ricezioni_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ricezioni_id_seq', 1, false);


--
-- TOC entry 5556 (class 0 OID 0)
-- Dependencies: 269
-- Name: richieste_acquisto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.richieste_acquisto_id_seq', 1, false);


--
-- TOC entry 5557 (class 0 OID 0)
-- Dependencies: 262
-- Name: righe_ordine_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.righe_ordine_id_seq', 1, false);


--
-- TOC entry 5558 (class 0 OID 0)
-- Dependencies: 254
-- Name: righe_po_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.righe_po_id_seq', 1, false);


--
-- TOC entry 5559 (class 0 OID 0)
-- Dependencies: 258
-- Name: righe_ricezione_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.righe_ricezione_id_seq', 1, false);


--
-- TOC entry 5560 (class 0 OID 0)
-- Dependencies: 271
-- Name: righe_richiesta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.righe_richiesta_id_seq', 1, false);


--
-- TOC entry 5561 (class 0 OID 0)
-- Dependencies: 221
-- Name: ruoli_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ruoli_id_seq', 1, false);


--
-- TOC entry 5562 (class 0 OID 0)
-- Dependencies: 268
-- Name: seq_ddt_numero_progressivo; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seq_ddt_numero_progressivo', 1, false);


--
-- TOC entry 5563 (class 0 OID 0)
-- Dependencies: 264
-- Name: spedizioni_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spedizioni_id_seq', 1, false);


--
-- TOC entry 5564 (class 0 OID 0)
-- Dependencies: 246
-- Name: ubicazioni_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ubicazioni_id_seq', 1, false);


--
-- TOC entry 5565 (class 0 OID 0)
-- Dependencies: 226
-- Name: utenti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.utenti_id_seq', 1, false);


--
-- TOC entry 5142 (class 2606 OID 67036)
-- Name: categorie categorie_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorie
    ADD CONSTRAINT categorie_nome_key UNIQUE (nome);


--
-- TOC entry 5144 (class 2606 OID 67034)
-- Name: categorie categorie_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorie
    ADD CONSTRAINT categorie_pkey PRIMARY KEY (id);


--
-- TOC entry 5165 (class 2606 OID 67138)
-- Name: clienti clienti_piva_cf_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clienti
    ADD CONSTRAINT clienti_piva_cf_key UNIQUE (piva_cf);


--
-- TOC entry 5167 (class 2606 OID 67136)
-- Name: clienti clienti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clienti
    ADD CONSTRAINT clienti_pkey PRIMARY KEY (id);


--
-- TOC entry 5161 (class 2606 OID 67110)
-- Name: contatti_fornitori contatti_fornitori_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contatti_fornitori
    ADD CONSTRAINT contatti_fornitori_pkey PRIMARY KEY (id);


--
-- TOC entry 5228 (class 2606 OID 67540)
-- Name: ddt ddt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ddt
    ADD CONSTRAINT ddt_pkey PRIMARY KEY (id);


--
-- TOC entry 5173 (class 2606 OID 67156)
-- Name: destinazioni_clienti destinazioni_clienti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinazioni_clienti
    ADD CONSTRAINT destinazioni_clienti_pkey PRIMARY KEY (id);


--
-- TOC entry 5132 (class 2606 OID 66986)
-- Name: dipendenti dipendenti_codice_fiscale_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dipendenti
    ADD CONSTRAINT dipendenti_codice_fiscale_key UNIQUE (codice_fiscale);


--
-- TOC entry 5134 (class 2606 OID 66984)
-- Name: dipendenti dipendenti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dipendenti
    ADD CONSTRAINT dipendenti_pkey PRIMARY KEY (id);


--
-- TOC entry 5154 (class 2606 OID 67094)
-- Name: fornitori fornitori_piva_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fornitori
    ADD CONSTRAINT fornitori_piva_key UNIQUE (piva);


--
-- TOC entry 5156 (class 2606 OID 67092)
-- Name: fornitori fornitori_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fornitori
    ADD CONSTRAINT fornitori_pkey PRIMARY KEY (id);


--
-- TOC entry 5188 (class 2606 OID 67238)
-- Name: giacenze giacenze_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.giacenze
    ADD CONSTRAINT giacenze_pkey PRIMARY KEY (id);


--
-- TOC entry 5177 (class 2606 OID 67186)
-- Name: magazzini magazzini_codice_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.magazzini
    ADD CONSTRAINT magazzini_codice_key UNIQUE (codice);


--
-- TOC entry 5179 (class 2606 OID 67184)
-- Name: magazzini magazzini_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.magazzini
    ADD CONSTRAINT magazzini_pkey PRIMARY KEY (id);


--
-- TOC entry 5196 (class 2606 OID 67273)
-- Name: movimenti_stock movimenti_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimenti_stock
    ADD CONSTRAINT movimenti_stock_pkey PRIMARY KEY (id);


--
-- TOC entry 5138 (class 2606 OID 67011)
-- Name: notifiche notifiche_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifiche
    ADD CONSTRAINT notifiche_pkey PRIMARY KEY (id);


--
-- TOC entry 5203 (class 2606 OID 67308)
-- Name: ordini_acquisto ordini_acquisto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordini_acquisto
    ADD CONSTRAINT ordini_acquisto_pkey PRIMARY KEY (id);


--
-- TOC entry 5216 (class 2606 OID 67434)
-- Name: ordini ordini_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordini
    ADD CONSTRAINT ordini_pkey PRIMARY KEY (id);


--
-- TOC entry 5122 (class 2606 OID 66915)
-- Name: permessi permessi_codice_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permessi
    ADD CONSTRAINT permessi_codice_key UNIQUE (codice);


--
-- TOC entry 5124 (class 2606 OID 66913)
-- Name: permessi permessi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permessi
    ADD CONSTRAINT permessi_pkey PRIMARY KEY (id);


--
-- TOC entry 5116 (class 2606 OID 65978)
-- Name: pgmigrations pgmigrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pgmigrations
    ADD CONSTRAINT pgmigrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5149 (class 2606 OID 67062)
-- Name: prodotti prodotti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prodotti
    ADD CONSTRAINT prodotti_pkey PRIMARY KEY (id);


--
-- TOC entry 5152 (class 2606 OID 67064)
-- Name: prodotti prodotti_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prodotti
    ADD CONSTRAINT prodotti_sku_key UNIQUE (sku);


--
-- TOC entry 5208 (class 2606 OID 67366)
-- Name: ricezioni ricezioni_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ricezioni
    ADD CONSTRAINT ricezioni_pkey PRIMARY KEY (id);


--
-- TOC entry 5237 (class 2606 OID 67605)
-- Name: richieste_acquisto richieste_acquisto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.richieste_acquisto
    ADD CONSTRAINT richieste_acquisto_pkey PRIMARY KEY (id);


--
-- TOC entry 5218 (class 2606 OID 67467)
-- Name: righe_ordine righe_ordine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_ordine
    ADD CONSTRAINT righe_ordine_pkey PRIMARY KEY (id);


--
-- TOC entry 5205 (class 2606 OID 67338)
-- Name: righe_po righe_po_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_po
    ADD CONSTRAINT righe_po_pkey PRIMARY KEY (id);


--
-- TOC entry 5210 (class 2606 OID 67393)
-- Name: righe_ricezione righe_ricezione_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_ricezione
    ADD CONSTRAINT righe_ricezione_pkey PRIMARY KEY (id);


--
-- TOC entry 5241 (class 2606 OID 67629)
-- Name: righe_richiesta righe_richiesta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_richiesta
    ADD CONSTRAINT righe_richiesta_pkey PRIMARY KEY (id);


--
-- TOC entry 5118 (class 2606 OID 66897)
-- Name: ruoli ruoli_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ruoli
    ADD CONSTRAINT ruoli_nome_key UNIQUE (nome);


--
-- TOC entry 5126 (class 2606 OID 66927)
-- Name: ruoli_permessi ruoli_permessi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ruoli_permessi
    ADD CONSTRAINT ruoli_permessi_pkey PRIMARY KEY (ruolo_id, permesso_id);


--
-- TOC entry 5120 (class 2606 OID 66895)
-- Name: ruoli ruoli_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ruoli
    ADD CONSTRAINT ruoli_pkey PRIMARY KEY (id);


--
-- TOC entry 5224 (class 2606 OID 67501)
-- Name: spedizioni spedizioni_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spedizioni
    ADD CONSTRAINT spedizioni_pkey PRIMARY KEY (id);


--
-- TOC entry 5184 (class 2606 OID 67209)
-- Name: ubicazioni ubicazioni_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicazioni
    ADD CONSTRAINT ubicazioni_pkey PRIMARY KEY (id);


--
-- TOC entry 5186 (class 2606 OID 67217)
-- Name: ubicazioni unique_magazzino_corsia_scaffale; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicazioni
    ADD CONSTRAINT unique_magazzino_corsia_scaffale UNIQUE (magazzino_id, corsia, scaffale);


--
-- TOC entry 5193 (class 2606 OID 67251)
-- Name: giacenze unique_prodotto_ubicazione; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.giacenze
    ADD CONSTRAINT unique_prodotto_ubicazione UNIQUE (prodotto_id, ubicazione_id);


--
-- TOC entry 5231 (class 2606 OID 67548)
-- Name: ddt unique_spedizione_ddt; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ddt
    ADD CONSTRAINT unique_spedizione_ddt UNIQUE (spedizione_id);


--
-- TOC entry 5128 (class 2606 OID 66961)
-- Name: utenti utenti_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utenti
    ADD CONSTRAINT utenti_email_key UNIQUE (email);


--
-- TOC entry 5130 (class 2606 OID 66959)
-- Name: utenti utenti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utenti
    ADD CONSTRAINT utenti_pkey PRIMARY KEY (id);


--
-- TOC entry 5139 (class 1259 OID 67072)
-- Name: categorie_categoria_padre_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categorie_categoria_padre_id_index ON public.categorie USING btree (categoria_padre_id);


--
-- TOC entry 5140 (class 1259 OID 67071)
-- Name: categorie_nome_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categorie_nome_index ON public.categorie USING btree (nome);


--
-- TOC entry 5163 (class 1259 OID 67164)
-- Name: clienti_piva_cf_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clienti_piva_cf_index ON public.clienti USING btree (piva_cf);


--
-- TOC entry 5168 (class 1259 OID 67163)
-- Name: clienti_ragione_sociale_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clienti_ragione_sociale_index ON public.clienti USING btree (ragione_sociale);


--
-- TOC entry 5226 (class 1259 OID 67555)
-- Name: ddt_numero_ddt_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ddt_numero_ddt_index ON public.ddt USING btree (numero_ddt);


--
-- TOC entry 5229 (class 1259 OID 67554)
-- Name: ddt_spedizione_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ddt_spedizione_id_index ON public.ddt USING btree (spedizione_id);


--
-- TOC entry 5170 (class 1259 OID 67165)
-- Name: destinazioni_clienti_cliente_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX destinazioni_clienti_cliente_id_index ON public.destinazioni_clienti USING btree (cliente_id);


--
-- TOC entry 5171 (class 1259 OID 67166)
-- Name: destinazioni_clienti_cliente_id_predefinita_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX destinazioni_clienti_cliente_id_predefinita_index ON public.destinazioni_clienti USING btree (cliente_id, predefinita);


--
-- TOC entry 5189 (class 1259 OID 67253)
-- Name: giacenze_prodotto_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX giacenze_prodotto_id_index ON public.giacenze USING btree (prodotto_id);


--
-- TOC entry 5190 (class 1259 OID 67255)
-- Name: giacenze_prodotto_id_ubicazione_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX giacenze_prodotto_id_ubicazione_id_index ON public.giacenze USING btree (prodotto_id, ubicazione_id);


--
-- TOC entry 5191 (class 1259 OID 67254)
-- Name: giacenze_ubicazione_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX giacenze_ubicazione_id_index ON public.giacenze USING btree (ubicazione_id);


--
-- TOC entry 5169 (class 1259 OID 67568)
-- Name: idx_clienti_source; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clienti_source ON public.clienti USING btree (source);


--
-- TOC entry 5162 (class 1259 OID 67119)
-- Name: idx_contatti_fornitori_fornitore_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contatti_fornitori_fornitore_id ON public.contatti_fornitori USING btree (fornitore_id);


--
-- TOC entry 5157 (class 1259 OID 67117)
-- Name: idx_fornitori_attivo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fornitori_attivo ON public.fornitori USING btree (attivo);


--
-- TOC entry 5158 (class 1259 OID 67118)
-- Name: idx_fornitori_ragione_sociale; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fornitori_ragione_sociale ON public.fornitori USING btree (ragione_sociale);


--
-- TOC entry 5159 (class 1259 OID 67564)
-- Name: idx_fornitori_source; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fornitori_source ON public.fornitori USING btree (source);


--
-- TOC entry 5135 (class 1259 OID 67019)
-- Name: idx_notifiche_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifiche_created_at ON public.notifiche USING btree (created_at DESC);


--
-- TOC entry 5136 (class 1259 OID 67018)
-- Name: idx_notifiche_utente_letto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifiche_utente_letto ON public.notifiche USING btree (utente_id, letto);


--
-- TOC entry 5200 (class 1259 OID 67411)
-- Name: idx_ordini_acquisto_forn; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ordini_acquisto_forn ON public.ordini_acquisto USING btree (fornitore_id);


--
-- TOC entry 5201 (class 1259 OID 67410)
-- Name: idx_ordini_acquisto_stato; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ordini_acquisto_stato ON public.ordini_acquisto USING btree (stato);


--
-- TOC entry 5211 (class 1259 OID 67481)
-- Name: idx_ordini_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ordini_cliente ON public.ordini USING btree (cliente_id);


--
-- TOC entry 5212 (class 1259 OID 67482)
-- Name: idx_ordini_data_ordine; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ordini_data_ordine ON public.ordini USING btree (data_ordine DESC);


--
-- TOC entry 5213 (class 1259 OID 67479)
-- Name: idx_ordini_stato; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ordini_stato ON public.ordini USING btree (stato);


--
-- TOC entry 5214 (class 1259 OID 67480)
-- Name: idx_ordini_stato_picking; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ordini_stato_picking ON public.ordini USING btree (stato_picking);


--
-- TOC entry 5145 (class 1259 OID 67560)
-- Name: idx_prodotti_prezzo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prodotti_prezzo ON public.prodotti USING btree (prezzo);


--
-- TOC entry 5206 (class 1259 OID 67412)
-- Name: idx_ricezioni_po; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ricezioni_po ON public.ricezioni USING btree (ordine_acquisto_id);


--
-- TOC entry 5232 (class 1259 OID 67641)
-- Name: idx_richieste_fornitore_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_richieste_fornitore_id ON public.richieste_acquisto USING btree (fornitore_id);


--
-- TOC entry 5233 (class 1259 OID 67642)
-- Name: idx_richieste_stato; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_richieste_stato ON public.richieste_acquisto USING btree (stato);


--
-- TOC entry 5234 (class 1259 OID 67644)
-- Name: idx_richieste_utente_data; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_richieste_utente_data ON public.richieste_acquisto USING btree (utente_id, data_richiesta DESC);


--
-- TOC entry 5235 (class 1259 OID 67643)
-- Name: idx_richieste_utente_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_richieste_utente_id ON public.richieste_acquisto USING btree (utente_id);


--
-- TOC entry 5238 (class 1259 OID 67646)
-- Name: idx_righe_prodotto_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_righe_prodotto_id ON public.righe_richiesta USING btree (prodotto_id);


--
-- TOC entry 5239 (class 1259 OID 67645)
-- Name: idx_righe_richiesta_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_righe_richiesta_id ON public.righe_richiesta USING btree (richiesta_id);


--
-- TOC entry 5174 (class 1259 OID 67219)
-- Name: magazzini_attivo_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX magazzini_attivo_index ON public.magazzini USING btree (attivo);


--
-- TOC entry 5175 (class 1259 OID 67218)
-- Name: magazzini_codice_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX magazzini_codice_index ON public.magazzini USING btree (codice);


--
-- TOC entry 5194 (class 1259 OID 67290)
-- Name: movimenti_stock_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX movimenti_stock_created_at_index ON public.movimenti_stock USING btree (created_at);


--
-- TOC entry 5197 (class 1259 OID 67291)
-- Name: movimenti_stock_prodotto_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX movimenti_stock_prodotto_id_created_at_index ON public.movimenti_stock USING btree (prodotto_id, created_at);


--
-- TOC entry 5198 (class 1259 OID 67288)
-- Name: movimenti_stock_prodotto_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX movimenti_stock_prodotto_id_index ON public.movimenti_stock USING btree (prodotto_id);


--
-- TOC entry 5199 (class 1259 OID 67289)
-- Name: movimenti_stock_ubicazione_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX movimenti_stock_ubicazione_id_index ON public.movimenti_stock USING btree (ubicazione_id);


--
-- TOC entry 5146 (class 1259 OID 67075)
-- Name: prodotti_categoria_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prodotti_categoria_id_index ON public.prodotti USING btree (categoria_id);


--
-- TOC entry 5147 (class 1259 OID 67074)
-- Name: prodotti_nome_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prodotti_nome_index ON public.prodotti USING btree (nome);


--
-- TOC entry 5150 (class 1259 OID 67073)
-- Name: prodotti_sku_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prodotti_sku_index ON public.prodotti USING btree (sku);


--
-- TOC entry 5219 (class 1259 OID 67550)
-- Name: spedizioni_cliente_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spedizioni_cliente_id_index ON public.spedizioni USING btree (cliente_id);


--
-- TOC entry 5220 (class 1259 OID 67552)
-- Name: spedizioni_corriere_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spedizioni_corriere_id_index ON public.spedizioni USING btree (corriere_id);


--
-- TOC entry 5221 (class 1259 OID 67551)
-- Name: spedizioni_destinazione_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spedizioni_destinazione_id_index ON public.spedizioni USING btree (destinazione_id);


--
-- TOC entry 5222 (class 1259 OID 67549)
-- Name: spedizioni_ordine_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spedizioni_ordine_id_index ON public.spedizioni USING btree (ordine_id);


--
-- TOC entry 5225 (class 1259 OID 67553)
-- Name: spedizioni_stato_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spedizioni_stato_index ON public.spedizioni USING btree (stato);


--
-- TOC entry 5180 (class 1259 OID 67221)
-- Name: ubicazioni_codice_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ubicazioni_codice_index ON public.ubicazioni USING btree (codice);


--
-- TOC entry 5181 (class 1259 OID 67222)
-- Name: ubicazioni_magazzino_id_codice_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ubicazioni_magazzino_id_codice_index ON public.ubicazioni USING btree (magazzino_id, codice);


--
-- TOC entry 5182 (class 1259 OID 67220)
-- Name: ubicazioni_magazzino_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ubicazioni_magazzino_id_index ON public.ubicazioni USING btree (magazzino_id);


--
-- TOC entry 5452 (class 2618 OID 67287)
-- Name: movimenti_stock movimenti_stock_no_delete_rule; Type: RULE; Schema: public; Owner: postgres
--

CREATE RULE movimenti_stock_no_delete_rule AS
    ON DELETE TO public.movimenti_stock DO INSTEAD NOTHING;


--
-- TOC entry 5451 (class 2618 OID 67286)
-- Name: movimenti_stock movimenti_stock_no_update_rule; Type: RULE; Schema: public; Owner: postgres
--

CREATE RULE movimenti_stock_no_update_rule AS
    ON UPDATE TO public.movimenti_stock DO INSTEAD NOTHING;


--
-- TOC entry 5285 (class 2620 OID 67042)
-- Name: categorie set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.categorie FOR EACH STATEMENT EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5289 (class 2620 OID 67139)
-- Name: clienti set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.clienti FOR EACH STATEMENT EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5288 (class 2620 OID 67116)
-- Name: contatti_fornitori set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.contatti_fornitori FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5302 (class 2620 OID 67546)
-- Name: ddt set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ddt FOR EACH STATEMENT EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5290 (class 2620 OID 67162)
-- Name: destinazioni_clienti set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.destinazioni_clienti FOR EACH STATEMENT EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5283 (class 2620 OID 66992)
-- Name: dipendenti set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.dipendenti FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5287 (class 2620 OID 67095)
-- Name: fornitori set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.fornitori FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5293 (class 2620 OID 67249)
-- Name: giacenze set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.giacenze FOR EACH STATEMENT EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5291 (class 2620 OID 67187)
-- Name: magazzini set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.magazzini FOR EACH STATEMENT EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5294 (class 2620 OID 67284)
-- Name: movimenti_stock set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.movimenti_stock FOR EACH STATEMENT EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5284 (class 2620 OID 67017)
-- Name: notifiche set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.notifiche FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5299 (class 2620 OID 67450)
-- Name: ordini set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ordini FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5295 (class 2620 OID 67319)
-- Name: ordini_acquisto set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ordini_acquisto FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5280 (class 2620 OID 66916)
-- Name: permessi set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.permessi FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5286 (class 2620 OID 67070)
-- Name: prodotti set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.prodotti FOR EACH STATEMENT EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5297 (class 2620 OID 67377)
-- Name: ricezioni set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ricezioni FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5303 (class 2620 OID 67616)
-- Name: richieste_acquisto set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.richieste_acquisto FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5300 (class 2620 OID 67478)
-- Name: righe_ordine set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.righe_ordine FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5296 (class 2620 OID 67349)
-- Name: righe_po set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.righe_po FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5298 (class 2620 OID 67409)
-- Name: righe_ricezione set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.righe_ricezione FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5279 (class 2620 OID 66898)
-- Name: ruoli set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ruoli FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5281 (class 2620 OID 66938)
-- Name: ruoli_permessi set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ruoli_permessi FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5301 (class 2620 OID 67522)
-- Name: spedizioni set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.spedizioni FOR EACH STATEMENT EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5292 (class 2620 OID 67215)
-- Name: ubicazioni set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ubicazioni FOR EACH STATEMENT EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5282 (class 2620 OID 66967)
-- Name: utenti set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.utenti FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- TOC entry 5247 (class 2606 OID 67037)
-- Name: categorie categorie_categoria_padre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorie
    ADD CONSTRAINT categorie_categoria_padre_id_fkey FOREIGN KEY (categoria_padre_id) REFERENCES public.categorie(id);


--
-- TOC entry 5249 (class 2606 OID 67111)
-- Name: contatti_fornitori contatti_fornitori_fornitore_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contatti_fornitori
    ADD CONSTRAINT contatti_fornitori_fornitore_id_fkey FOREIGN KEY (fornitore_id) REFERENCES public.fornitori(id) ON DELETE CASCADE;


--
-- TOC entry 5274 (class 2606 OID 67541)
-- Name: ddt ddt_spedizione_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ddt
    ADD CONSTRAINT ddt_spedizione_id_fkey FOREIGN KEY (spedizione_id) REFERENCES public.spedizioni(id) ON DELETE CASCADE;


--
-- TOC entry 5250 (class 2606 OID 67157)
-- Name: destinazioni_clienti destinazioni_clienti_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinazioni_clienti
    ADD CONSTRAINT destinazioni_clienti_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clienti(id) ON DELETE CASCADE;


--
-- TOC entry 5245 (class 2606 OID 66987)
-- Name: dipendenti dipendenti_utente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dipendenti
    ADD CONSTRAINT dipendenti_utente_id_fkey FOREIGN KEY (utente_id) REFERENCES public.utenti(id);


--
-- TOC entry 5252 (class 2606 OID 67239)
-- Name: giacenze giacenze_prodotto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.giacenze
    ADD CONSTRAINT giacenze_prodotto_id_fkey FOREIGN KEY (prodotto_id) REFERENCES public.prodotti(id) ON DELETE RESTRICT;


--
-- TOC entry 5253 (class 2606 OID 67244)
-- Name: giacenze giacenze_ubicazione_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.giacenze
    ADD CONSTRAINT giacenze_ubicazione_id_fkey FOREIGN KEY (ubicazione_id) REFERENCES public.ubicazioni(id) ON DELETE RESTRICT;


--
-- TOC entry 5254 (class 2606 OID 67274)
-- Name: movimenti_stock movimenti_stock_prodotto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimenti_stock
    ADD CONSTRAINT movimenti_stock_prodotto_id_fkey FOREIGN KEY (prodotto_id) REFERENCES public.prodotti(id) ON DELETE RESTRICT;


--
-- TOC entry 5255 (class 2606 OID 67279)
-- Name: movimenti_stock movimenti_stock_ubicazione_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimenti_stock
    ADD CONSTRAINT movimenti_stock_ubicazione_id_fkey FOREIGN KEY (ubicazione_id) REFERENCES public.ubicazioni(id) ON DELETE RESTRICT;


--
-- TOC entry 5246 (class 2606 OID 67012)
-- Name: notifiche notifiche_utente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifiche
    ADD CONSTRAINT notifiche_utente_id_fkey FOREIGN KEY (utente_id) REFERENCES public.utenti(id);


--
-- TOC entry 5256 (class 2606 OID 67309)
-- Name: ordini_acquisto ordini_acquisto_fornitore_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordini_acquisto
    ADD CONSTRAINT ordini_acquisto_fornitore_id_fkey FOREIGN KEY (fornitore_id) REFERENCES public.fornitori(id);


--
-- TOC entry 5257 (class 2606 OID 67314)
-- Name: ordini_acquisto ordini_acquisto_utente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordini_acquisto
    ADD CONSTRAINT ordini_acquisto_utente_id_fkey FOREIGN KEY (utente_id) REFERENCES public.utenti(id);


--
-- TOC entry 5265 (class 2606 OID 67435)
-- Name: ordini ordini_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordini
    ADD CONSTRAINT ordini_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clienti(id);


--
-- TOC entry 5266 (class 2606 OID 67440)
-- Name: ordini ordini_destinazione_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordini
    ADD CONSTRAINT ordini_destinazione_id_fkey FOREIGN KEY (destinazione_id) REFERENCES public.destinazioni_clienti(id);


--
-- TOC entry 5267 (class 2606 OID 67445)
-- Name: ordini ordini_utente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordini
    ADD CONSTRAINT ordini_utente_id_fkey FOREIGN KEY (utente_id) REFERENCES public.utenti(id);


--
-- TOC entry 5248 (class 2606 OID 67065)
-- Name: prodotti prodotti_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prodotti
    ADD CONSTRAINT prodotti_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorie(id);


--
-- TOC entry 5260 (class 2606 OID 67367)
-- Name: ricezioni ricezioni_ordine_acquisto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ricezioni
    ADD CONSTRAINT ricezioni_ordine_acquisto_id_fkey FOREIGN KEY (ordine_acquisto_id) REFERENCES public.ordini_acquisto(id);


--
-- TOC entry 5261 (class 2606 OID 67372)
-- Name: ricezioni ricezioni_utente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ricezioni
    ADD CONSTRAINT ricezioni_utente_id_fkey FOREIGN KEY (utente_id) REFERENCES public.utenti(id);


--
-- TOC entry 5275 (class 2606 OID 67606)
-- Name: richieste_acquisto richieste_acquisto_fornitore_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.richieste_acquisto
    ADD CONSTRAINT richieste_acquisto_fornitore_id_fkey FOREIGN KEY (fornitore_id) REFERENCES public.fornitori(id);


--
-- TOC entry 5276 (class 2606 OID 67611)
-- Name: richieste_acquisto richieste_acquisto_utente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.richieste_acquisto
    ADD CONSTRAINT richieste_acquisto_utente_id_fkey FOREIGN KEY (utente_id) REFERENCES public.utenti(id);


--
-- TOC entry 5268 (class 2606 OID 67468)
-- Name: righe_ordine righe_ordine_ordine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_ordine
    ADD CONSTRAINT righe_ordine_ordine_id_fkey FOREIGN KEY (ordine_id) REFERENCES public.ordini(id) ON DELETE CASCADE;


--
-- TOC entry 5269 (class 2606 OID 67473)
-- Name: righe_ordine righe_ordine_prodotto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_ordine
    ADD CONSTRAINT righe_ordine_prodotto_id_fkey FOREIGN KEY (prodotto_id) REFERENCES public.prodotti(id);


--
-- TOC entry 5258 (class 2606 OID 67339)
-- Name: righe_po righe_po_ordine_acquisto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_po
    ADD CONSTRAINT righe_po_ordine_acquisto_id_fkey FOREIGN KEY (ordine_acquisto_id) REFERENCES public.ordini_acquisto(id) ON DELETE CASCADE;


--
-- TOC entry 5259 (class 2606 OID 67344)
-- Name: righe_po righe_po_prodotto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_po
    ADD CONSTRAINT righe_po_prodotto_id_fkey FOREIGN KEY (prodotto_id) REFERENCES public.prodotti(id);


--
-- TOC entry 5262 (class 2606 OID 67399)
-- Name: righe_ricezione righe_ricezione_prodotto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_ricezione
    ADD CONSTRAINT righe_ricezione_prodotto_id_fkey FOREIGN KEY (prodotto_id) REFERENCES public.prodotti(id);


--
-- TOC entry 5263 (class 2606 OID 67394)
-- Name: righe_ricezione righe_ricezione_ricezione_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_ricezione
    ADD CONSTRAINT righe_ricezione_ricezione_id_fkey FOREIGN KEY (ricezione_id) REFERENCES public.ricezioni(id) ON DELETE CASCADE;


--
-- TOC entry 5264 (class 2606 OID 67404)
-- Name: righe_ricezione righe_ricezione_ubicazione_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_ricezione
    ADD CONSTRAINT righe_ricezione_ubicazione_id_fkey FOREIGN KEY (ubicazione_id) REFERENCES public.ubicazioni(id);


--
-- TOC entry 5277 (class 2606 OID 67635)
-- Name: righe_richiesta righe_richiesta_prodotto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_richiesta
    ADD CONSTRAINT righe_richiesta_prodotto_id_fkey FOREIGN KEY (prodotto_id) REFERENCES public.prodotti(id);


--
-- TOC entry 5278 (class 2606 OID 67630)
-- Name: righe_richiesta righe_richiesta_richiesta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.righe_richiesta
    ADD CONSTRAINT righe_richiesta_richiesta_id_fkey FOREIGN KEY (richiesta_id) REFERENCES public.richieste_acquisto(id) ON DELETE CASCADE;


--
-- TOC entry 5242 (class 2606 OID 66933)
-- Name: ruoli_permessi ruoli_permessi_permesso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ruoli_permessi
    ADD CONSTRAINT ruoli_permessi_permesso_id_fkey FOREIGN KEY (permesso_id) REFERENCES public.permessi(id) ON DELETE CASCADE;


--
-- TOC entry 5243 (class 2606 OID 66928)
-- Name: ruoli_permessi ruoli_permessi_ruolo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ruoli_permessi
    ADD CONSTRAINT ruoli_permessi_ruolo_id_fkey FOREIGN KEY (ruolo_id) REFERENCES public.ruoli(id) ON DELETE CASCADE;


--
-- TOC entry 5270 (class 2606 OID 67507)
-- Name: spedizioni spedizioni_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spedizioni
    ADD CONSTRAINT spedizioni_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clienti(id) ON DELETE RESTRICT;


--
-- TOC entry 5271 (class 2606 OID 67517)
-- Name: spedizioni spedizioni_corriere_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spedizioni
    ADD CONSTRAINT spedizioni_corriere_id_fkey FOREIGN KEY (corriere_id) REFERENCES public.dipendenti(id) ON DELETE SET NULL;


--
-- TOC entry 5272 (class 2606 OID 67512)
-- Name: spedizioni spedizioni_destinazione_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spedizioni
    ADD CONSTRAINT spedizioni_destinazione_id_fkey FOREIGN KEY (destinazione_id) REFERENCES public.destinazioni_clienti(id) ON DELETE RESTRICT;


--
-- TOC entry 5273 (class 2606 OID 67502)
-- Name: spedizioni spedizioni_ordine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spedizioni
    ADD CONSTRAINT spedizioni_ordine_id_fkey FOREIGN KEY (ordine_id) REFERENCES public.ordini(id) ON DELETE RESTRICT;


--
-- TOC entry 5251 (class 2606 OID 67210)
-- Name: ubicazioni ubicazioni_magazzino_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicazioni
    ADD CONSTRAINT ubicazioni_magazzino_id_fkey FOREIGN KEY (magazzino_id) REFERENCES public.magazzini(id) ON DELETE CASCADE;


--
-- TOC entry 5244 (class 2606 OID 66962)
-- Name: utenti utenti_ruolo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utenti
    ADD CONSTRAINT utenti_ruolo_id_fkey FOREIGN KEY (ruolo_id) REFERENCES public.ruoli(id);


-- Completed on 2026-06-04 22:45:13

--
-- PostgreSQL database dump complete
--

\unrestrict 9xqYMsRargVyWb7s4KjndsmSUwmSTES315D6YSLvv5fCH5XE8xnhFnuUOOyZVpS

