Agisci come un Senior UX/UI Designer specializzato in ERP Enterprise, IAM (Identity & Access Management), User Management Systems e SaaS B2B.



⚠️ Mantieni rigorosamente lo stesso design system già presente nel progetto Figma LogiChain ERP:



stessa sidebar

stessa palette colori

stessa tipografia

stessi componenti UI

stessi spacing

stessi stili card

stessi pattern UX



Non introdurre nuovi stili grafici.



MODIFICA SIDEBAR



Inserire una nuova voce principale sopra "Dashboard".



ADMIN



🔒 Visibile esclusivamente agli utenti con ruolo:



Administrator



Menu collassabile.



Contiene:



▼ Admin



Azienda

Collaboratori

RINOMINARE DASHBOARD



L'attuale voce:



Dashboard



diventa:



📊 Generale



per differenziarla dalla dashboard amministrativa.



PAGINA 1 — AZIENDA



Titolo:



AZIENDA



Breadcrumb:



Admin / Azienda



Scopo:



Gestione completa delle informazioni aziendali.



SEZIONE INFORMAZIONI AZIENDA



Card principale.



Visualizzare:



Ragione Sociale

Nome Commerciale

Partita IVA

Codice Fiscale

REA

PEC

SDI

Telefono

Email

Website



Tutti i campi modificabili.



Pulsante:



Salva Modifiche



SEZIONE SEDE LEGALE



Visualizzare:



indirizzo

città

provincia

CAP

nazione



Con possibilità di modifica.



SEZIONE SEDI OPERATIVE



Tabella moderna.



Colonne:



Nome Sede



Indirizzo



Responsabile



Dipendenti



Magazzino Associato



Stato



Azioni



CTA:



Nuova Sede

SEZIONE BRANDING



Card dedicata.



Permettere upload di:



logo principale

logo compatto

favicon



Preview realtime.



SEZIONE PARAMETRI ERP



Configurazioni generali.



Visualizzare:



lingua piattaforma

timezone

valuta

formato data

formato numerico

SEZIONE SICUREZZA



Visualizzare:



politica password

durata sessione

autenticazione 2FA

whitelist IP



Switch moderni.



SEZIONE LICENZA



Widget informativo.



Visualizzare:



piano attivo

utenti utilizzati

utenti disponibili

moduli attivi



Progress bar elegante.



PAGINA 2 — COLLABORATORI



Titolo:



COLLABORATORI



Breadcrumb:



Admin / Collaboratori



Scopo:



Gestione utenti e controllo accessi.



KPI SUPERIORI

Utenti Attivi



48



Online Ora



17



Amministratori



2



Account Sospesi



3



TABELLA UTENTI



Card principale.



Toolbar:



ricerca collaboratore

filtro ruolo

filtro stato

filtro sede



Colonne:



Avatar



Nome



Email



Ruolo



Sede



Ultimo Accesso



Stato



2FA



Azioni



RUOLI DISPONIBILI



Badge distintivi.



Responsabile Acquisti



Responsabile Magazzino



Operatore Magazzino



Corriere



SISTEMA PERMESSI



Card dedicata.



Titolo:



Matrice Permessi



Visualizzazione stile Notion / Jira Admin.



Moduli:



Generale

Anagrafiche

Magazzino

Acquisti

Vendite

Logistica

Amministrazione



Permessi:



Visualizza



Crea



Modifica



Elimina



Esporta



Approva



Checkbox moderne.



DRAWER DETTAGLIO COLLABORATORE



Apertura cliccando un utente.



Visualizzare:



Informazioni Personali

foto profilo

nome

cognome

email

telefono

Informazioni Aziendali

ruolo

sede

reparto

responsabile

Sicurezza

ultimo accesso

ultimo IP

stato account

2FA attiva

Permessi



Lista completa autorizzazioni.



Storico Accessi



Timeline attività.



MODALE NUOVO COLLABORATORE



CTA:



Nuovo Collaboratore



Workflow guidato.



Step 1



Dati Personali



nome

cognome

email

telefono

Step 2



Ruolo



Dropdown.



Step 3



Permessi



Template automatico.



Step 4



Conferma



Invio email attivazione.



FUNZIONALITÀ AGGIUNTIVE CONSIGLIATE



Aggiungere:



reset password amministrativo

blocco account

sospensione account

impersonificazione utente ("Accedi come...")

esportazione utenti

audit log completo

gestione sessioni attive

cronologia modifiche utente

PROMPT FIGMA — PAGINA PROFILO UTENTE



Questa pagina è accessibile cliccando sul blocco utente presente in alto a destra della navbar:



Avatar + Nome Cognome + Ruolo



APERTURA MENU PROFILO



Dropdown moderno.



Visualizzare:



👤 Il Mio Profilo



🔐 Sicurezza



🔔 Notifiche



🎨 Preferenze



📄 Attività Recenti



🚪 Logout



PAGINA IL MIO PROFILO



Titolo:



PROFILO UTENTE



Breadcrumb:



Profilo / Il Mio Profilo



HEADER PROFILO



Grande card superiore.



Visualizzare:



avatar

nome completo

ruolo

reparto

email



Badge stato:



🟢 Attivo



TAB 1 — DATI PERSONALI



Campi modificabili:



nome

cognome

email

telefono

lingua

foto profilo



Pulsante:



Salva Modifiche



TAB 2 — SICUREZZA



Visualizzare:



Password



Pulsante:



Cambia Password



Autenticazione 2FA



Switch



Sessioni Attive



Visualizzare:



browser

dispositivo

posizione

ultimo accesso



Pulsante:



Termina Sessione



TAB 3 — NOTIFICHE



Preferenze notifiche.



Switch:



email operative

email amministrative

alert magazzino

alert ordini

alert spedizioni

notifiche browser

TAB 4 — PREFERENZE



Configurazioni personali.



Visualizzare:



lingua

timezone

formato data

densità tabella

tema chiaro/scuro (future feature)

TAB 5 — ATTIVITÀ RECENTI



Timeline moderna.



Eventi:



login

logout

modifica dati

creazione ordine

modifica inventario

esportazione report

WIDGET PERSONALE



Sidebar destra.



Visualizzare:



Ruolo



Responsabile Magazzino



Ultimo Accesso



04/06/2026 08:12



Permessi Attivi



32



Account Creato



12/03/2025



Stato Sicurezza



98%



OUTPUT DESIDERATO



Mockup High-Fidelity perfettamente coerente con il design system esistente di LogiChain ERP, con una gestione utenti e permessi in stile enterprise (SAP, Atlassian, Microsoft 365 Admin, Oracle NetSuite), focalizzato su amministrazione aziendale, controllo accessi, sicurezza, configurazione ERP e gestione collaboratori multi-ruolo.