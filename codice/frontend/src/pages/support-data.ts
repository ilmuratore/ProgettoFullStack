export interface FaqItem {
  id: string;
  domanda: string;
  risposta: string;
}

export interface FaqSection {
  id: string;
  categoria: string;
  domande: FaqItem[];
}

export type ManualeTarget = 'operatore' | 'cliente';
export type ManualeStato = 'disponibile' | 'in-preparazione';

export interface ManualeItem {
  id: string;
  titolo: string;
  descrizione: string;
  modulo: string;
  target: ManualeTarget;
  stato: ManualeStato;
  /** Route interna da aprire quando stato === 'disponibile' */
  url?: string;
}

export type ContactIcon = 'mail' | 'phone' | 'ticket';

export interface ContactItem {
  id: string;
  nome: string;
  valore: string;
  icona: ContactIcon;
  /** Link funzionante (mailto:, tel:, ...). Se assente il canale non è ancora attivo. */
  href?: string;
}

export const faqSections: FaqSection[] = [
  {
    id: 'accesso-sicurezza',
    categoria: 'Accesso e Sicurezza',
    domande: [
      {
        id: 'password-dimenticata',
        domanda: 'Ho dimenticato la password, come la recupero?',
        risposta: 'Se hai ancora accesso al tuo account, vai su Profilo → Sicurezza per impostare una nuova password. Se non riesci ad accedere, contatta un amministratore: solo un account con permessi adeguati può reimpostarla.',
      },
      {
        id: 'requisiti-password',
        domanda: 'Quali sono i requisiti della password?',
        risposta: 'La password deve avere almeno 6 caratteri, contenere una lettera maiuscola e almeno un numero.',
      },
      {
        id: 'verifica-due-passaggi',
        domanda: 'Come abilito la verifica in due passaggi?',
        risposta: 'Nella sezione Profilo → Sicurezza trovi l\'opzione per attivare o disattivare la verifica in due passaggi sul tuo account.',
      },
    ],
  },
  {
    id: 'anagrafiche',
    categoria: 'Anagrafiche',
    domande: [
      {
        id: 'nuovo-cliente-fornitore',
        domanda: 'Come creo un nuovo cliente o fornitore?',
        risposta: 'Vai su Anagrafiche, scegli la scheda Clienti o Fornitori e usa il pulsante "Nuovo Cliente" / "Nuovo Fornitore". Il pulsante è visibile solo agli utenti con i permessi necessari.',
      },
      {
        id: 'fonte-ecosistema',
        domanda: 'Cosa significa "fonte ecosistema" su un fornitore?',
        risposta: 'Indica che il fornitore proviene dalla rete B2B LogiChain: i suoi dati anagrafici sono sincronizzati automaticamente e non possono essere modificati manualmente.',
      },
      {
        id: 'categorie-prodotto',
        domanda: 'Dove gestisco le categorie prodotto?',
        risposta: 'Le categorie si gestiscono dalla sezione Magazzino → Categorie, dove puoi creare, modificare ed eliminare le categorie usate nel catalogo prodotti.',
      },
    ],
  },
  {
    id: 'ordini',
    categoria: 'Ordini',
    domande: [
      {
        id: 'nuovo-ordine-acquisto',
        domanda: 'Come creo un nuovo ordine di acquisto?',
        risposta: 'Vai su Acquisti → Nuovo Ordine, seleziona il fornitore, aggiungi i prodotti e le relative quantità, quindi conferma per salvare l\'ordine.',
      },
      {
        id: 'stati-ordine',
        domanda: 'Cosa indica lo stato di un ordine?',
        risposta: 'Ogni ordine mostra uno stato (es. bozza, confermato, evaso/annullato) visibile sia nell\'elenco ordini sia nel dettaglio, ed evolve in base alle azioni svolte sull\'ordine.',
      },
    ],
  },
  {
    id: 'magazzino',
    categoria: 'Magazzino',
    domande: [
      {
        id: 'tipi-movimento',
        domanda: 'Quali tipi di movimento di magazzino posso registrare?',
        risposta: 'Da Magazzino → Movimenti → Nuovo Movimento puoi registrare: Carico, Scarico, Spostamento, Rettifica positiva, Rettifica negativa e Reso.',
      },
      {
        id: 'prodotto-disattivato',
        domanda: 'Posso movimentare un prodotto disattivato?',
        risposta: 'Sì, un prodotto disattivato resta selezionabile nel modulo Nuovo Movimento e su di esso può essere registrato qualsiasi tipo di movimento.',
      },
      {
        id: 'nuovo-magazzino-ubicazione',
        domanda: 'Come aggiungo un nuovo magazzino o una nuova ubicazione?',
        risposta: 'Vai su Magazzino → Struttura: da qui puoi creare un nuovo magazzino e, all\'interno di ciascun magazzino, aggiungere nuove ubicazioni.',
      },
    ],
  },
  {
    id: 'spedizioni-ddt',
    categoria: 'Spedizioni e DDT',
    domande: [
      {
        id: 'nuova-spedizione',
        domanda: 'Come creo una nuova spedizione?',
        risposta: 'Dalla sezione Logistica puoi avviare una nuova spedizione, associarla a un ordine e seguirne lo stato fino alla consegna.',
      },
      {
        id: 'esporta-ddt',
        domanda: 'Come esporto un DDT?',
        risposta: 'La funzione di esportazione del DDT è in fase di rilascio insieme al modulo Spedizioni & DDT.',
      },
    ],
  },
  {
    id: 'ruoli-permessi',
    categoria: 'Ruoli e Permessi',
    domande: [
      {
        id: 'cambio-ruolo',
        domanda: 'Come cambio il mio ruolo?',
        risposta: 'Il ruolo non è auto-modificabile dall\'utente: contatta un amministratore, che potrà aggiornarlo da Amministrazione → Utenti.',
      },
      {
        id: 'chi-vede-cosa',
        domanda: 'Chi può vedere o modificare una determinata sezione?',
        risposta: 'L\'accesso a sezioni e azioni dipende dal ruolo assegnato (RBAC). Un amministratore può consultare e modificare la matrice ruoli/permessi da Amministrazione → Ruoli & Permessi.',
      },
    ],
  },
];

export const operatorManuals: ManualeItem[] = [
  {
    id: 'manuale-acquisti',
    titolo: 'Gestione Ordini di Acquisto',
    descrizione: 'Come creare, modificare e seguire lo stato degli ordini di acquisto verso i fornitori.',
    modulo: 'Acquisti',
    target: 'operatore',
    stato: 'disponibile',
    url: '/acquisti',
  },
  {
    id: 'manuale-magazzino',
    titolo: 'Movimenti di Magazzino',
    descrizione: 'Come registrare carichi, scarichi, spostamenti, rettifiche e resi sui prodotti a magazzino.',
    modulo: 'Magazzino',
    target: 'operatore',
    stato: 'disponibile',
    url: '/magazzino',
  },
  {
    id: 'manuale-utenti-permessi',
    titolo: 'Gestione Utenti e Permessi',
    descrizione: 'Come creare nuovi utenti, assegnare ruoli e gestire i permessi della piattaforma.',
    modulo: 'Amministrazione',
    target: 'operatore',
    stato: 'disponibile',
    url: '/amministrazione',
  },
  {
    id: 'manuale-spedizioni',
    titolo: 'Spedizioni e DDT',
    descrizione: 'Guida alla creazione delle spedizioni e alla generazione dei documenti di trasporto.',
    modulo: 'Logistica',
    target: 'operatore',
    stato: 'in-preparazione',
  },
];

export const clientManuals: ManualeItem[] = [
  {
    id: 'manuale-primi-passi',
    titolo: 'Primi Passi sulla Piattaforma',
    descrizione: 'Come accedere, configurare il profilo e orientarsi tra le sezioni della piattaforma.',
    modulo: 'Onboarding',
    target: 'cliente',
    stato: 'in-preparazione',
  },
  {
    id: 'manuale-ordini-cliente',
    titolo: 'Consultare i Tuoi Ordini',
    descrizione: 'Come visualizzare lo storico ordini e verificarne lo stato di lavorazione.',
    modulo: 'Vendite',
    target: 'cliente',
    stato: 'disponibile',
    url: '/vendite',
  },
  {
    id: 'manuale-fatturazione',
    titolo: 'Fatture e Pagamenti',
    descrizione: 'Guida alla consultazione di fatture, note di credito e scadenze di pagamento.',
    modulo: 'Fatturazione',
    target: 'cliente',
    stato: 'in-preparazione',
  },
];

export const contacts: ContactItem[] = [
  {
    id: 'email',
    nome: 'Email',
    valore: 'supporto@logichain.it',
    icona: 'mail',
    href: 'mailto:supporto@logichain.it',
  },
  {
    id: 'telefono',
    nome: 'Telefono',
    valore: '+39 02 1234 5678',
    icona: 'phone',
    href: 'tel:+390212345678',
  },
  {
    id: 'ticket',
    nome: 'Assistenza Ticket',
    valore: 'Apertura richieste in arrivo',
    icona: 'ticket',
  },
];
