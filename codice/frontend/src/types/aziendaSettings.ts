export interface AziendaSettings {
  id: number;
  ragione_sociale: string | null;
  piva: string | null;
  codice_fiscale: string | null;
  indirizzo: string | null;
  citta: string | null;
  provincia: string | null;
  cap: string | null;
  nazione: string | null;
  email: string | null;
  pec: string | null;
  telefono: string | null;
  sito_web: string | null;
  iban: string | null;
  sdi: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AziendaSettingsUpdateRequest {
  ragione_sociale?: string;
  piva?: string;
  codice_fiscale?: string;
  indirizzo?: string;
  citta?: string;
  provincia?: string;
  cap?: string;
  nazione?: string;
  email?: string;
  pec?: string;
  telefono?: string;
  sito_web?: string;
  iban?: string;
  sdi?: string;
  logo_url?: string;
}

export type AziendaSettingsFieldKey = keyof AziendaSettingsUpdateRequest;

export type AziendaSettingsFieldConfig = {
  key: AziendaSettingsFieldKey;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url';
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  inputMode?: 'text' | 'numeric' | 'email' | 'tel' | 'url';
  autoComplete?: string;
  placeholder?: string;
  title?: string;
};

export const AZIENDA_SETTINGS_FIELDS: AziendaSettingsFieldConfig[] = [
  { key: 'ragione_sociale', label: 'Ragione Sociale', type: 'text', maxLength: 180, autoComplete: 'organization' },
  { key: 'piva', label: 'P.IVA', type: 'text', minLength: 11, maxLength: 11, inputMode: 'numeric', pattern: '^[0-9]{11}$', title: 'Inserire 11 cifre numeriche' },
  { key: 'codice_fiscale', label: 'Codice Fiscale', type: 'text', minLength: 16, maxLength: 16, pattern: '^[A-Za-z0-9]{16}$', title: 'Inserire 16 caratteri alfanumerici' },
  { key: 'indirizzo', label: 'Indirizzo', type: 'text', maxLength: 255, autoComplete: 'street-address' },
  { key: 'citta', label: 'Città', type: 'text', maxLength: 120, autoComplete: 'address-level2' },
  { key: 'provincia', label: 'Provincia', type: 'text', minLength: 2, maxLength: 2, pattern: '^[A-Za-z]{2}$', autoComplete: 'address-level1', title: 'Inserire 2 lettere, es. MI' },
  { key: 'cap', label: 'CAP', type: 'text', minLength: 5, maxLength: 5, inputMode: 'numeric', pattern: '^[0-9]{5}$', autoComplete: 'postal-code', title: 'Inserire 5 cifre numeriche' },
  { key: 'nazione', label: 'Nazione', type: 'text', maxLength: 80, autoComplete: 'country-name' },
  { key: 'email', label: 'Email Aziendale', type: 'text', maxLength: 180, inputMode: 'email', autoComplete: 'email', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', title: 'Inserire un indirizzo email valido, es. nome@dominio.it' },
  { key: 'pec', label: 'PEC', type: 'text', maxLength: 180, inputMode: 'email', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', title: 'Inserire un indirizzo PEC valido, es. nome@dominio.it' },
  { key: 'telefono', label: 'Telefono', type: 'tel', maxLength: 50, inputMode: 'tel', autoComplete: 'tel', pattern: '^[0-9+()\\-./ ]{6,50}$', title: 'Inserire un numero di telefono valido' },
  { key: 'sito_web', label: 'Sito Web', type: 'text', maxLength: 180, inputMode: 'url', pattern: '^((https?:\\/\\/)?(www\\.)?)?[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\/[^\s]*)?$', title: 'Inserire un sito valido, anche senza http://, https:// o www' },
  { key: 'iban', label: 'IBAN', type: 'text', minLength: 15, maxLength: 34, pattern: '^[A-Za-z]{2}[0-9]{2}[A-Za-z0-9]{11,30}$', title: 'Inserire un IBAN valido' },
  { key: 'sdi', label: 'SDI', type: 'text', minLength: 7, maxLength: 7, pattern: '^[A-Za-z0-9]{7}$', title: 'Inserire 7 caratteri alfanumerici' },
  { key: 'logo_url', label: 'Logo URL', type: 'url', inputMode: 'url' },
];

export const EMPTY_AZIENDA_SETTINGS: AziendaSettingsUpdateRequest = {
  ragione_sociale: '',
  piva: '',
  codice_fiscale: '',
  indirizzo: '',
  citta: '',
  provincia: '',
  cap: '',
  nazione: '',
  email: '',
  pec: '',
  telefono: '',
  sito_web: '',
  iban: '',
  sdi: '',
  logo_url: '',
};
