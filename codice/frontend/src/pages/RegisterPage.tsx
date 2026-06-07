import { useState } from 'react';
import { authApi } from '../api/authApi';
import type { RegisterData, UtenteAPI } from '../api/authApi';
import { toast } from 'sonner';

const RUOLI = [
  { id: 1, label: 'Admin' },
  { id: 2, label: 'Responsabile Acquisti' },
  { id: 3, label: 'Responsabile Magazzino' },
  { id: 4, label: 'Operatore' },
  { id: 5, label: 'Corriere' },
];

interface FieldError {
  field: string;
  message: string;
}

interface RegisterPageProps {
  onSuccess?: (utente: UtenteAPI) => void;
  onCancel?: () => void;
}

export function RegisterPage({ onSuccess, onCancel }: RegisterPageProps) {
  const [form, setForm] = useState<RegisterData>({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    ruolo_id: 4,
  });
  const [loading, setLoading]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [globalError, setGlobalError] = useState('');

  const getFieldError = (field: string) =>
    fieldErrors.find((e) => e.field === field)?.message;

  const handleChange = (field: keyof RegisterData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => prev.filter((e) => e.field !== field));
    setGlobalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors([]);
    setGlobalError('');
    try {
      const utente = await authApi.register(form);
      toast.success(`Utente ${utente.nome} ${utente.cognome} creato con successo`);
      onSuccess?.(utente);
    } catch (err: unknown) {
      const e = err as { code?: string; details?: FieldError[]; message?: string };
      if (e.code === 'VALIDATION_ERROR' && e.details?.length) {
        setFieldErrors(e.details);
      } else if (e.code === 'DUPLICATE_ENTRY') {
        setFieldErrors([{ field: 'email', message: 'Email già registrata nel sistema' }]);
      } else {
        setGlobalError(e.message ?? 'Errore durante la registrazione');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-3.5 py-2.5 border rounded-xl text-sm text-[#2D2D2D] bg-white focus:outline-none focus:ring-2 transition-all placeholder:text-[#C4C9D4] ${
      getFieldError(field)
        ? 'border-[#FECACA] focus:ring-[#EF4444]/30 focus:border-[#EF4444]'
        : 'border-[#E5EAF2] focus:ring-[#17E88F]/40 focus:border-[#17E88F]'
    }`;

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6 w-full max-w-md">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#0F172A]">Registra nuovo utente</h3>
        <p className="text-sm text-[#6B7280] mt-1">Solo gli Admin possono creare nuovi account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#374151]">Nome *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Mario"
              className={inputClass('nome')}
              required
              disabled={loading}
            />
            {getFieldError('nome') && (
              <p className="text-xs text-[#DC2626]">{getFieldError('nome')}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#374151]">Cognome *</label>
            <input
              type="text"
              value={form.cognome}
              onChange={(e) => handleChange('cognome', e.target.value)}
              placeholder="Rossi"
              className={inputClass('cognome')}
              required
              disabled={loading}
            />
            {getFieldError('cognome') && (
              <p className="text-xs text-[#DC2626]">{getFieldError('cognome')}</p>
            )}
          </div>
        </div>

        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#374151]">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="mario.rossi@logichain.it"
            className={inputClass('email')}
            required
            autoComplete="off"
            disabled={loading}
          />
          {getFieldError('email') && (
            <p className="text-xs text-[#DC2626]">{getFieldError('email')}</p>
          )}
        </div>

        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#374151]">Password *</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Min. 6 caratteri"
            className={inputClass('password')}
            required
            autoComplete="new-password"
            disabled={loading}
          />
          {getFieldError('password') && (
            <p className="text-xs text-[#DC2626]">{getFieldError('password')}</p>
          )}
        </div>

       
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#374151]">Ruolo *</label>
          <select
            value={form.ruolo_id}
            onChange={(e) => handleChange('ruolo_id', Number(e.target.value))}
            className={`${inputClass('ruolo_id')} cursor-pointer`}
            disabled={loading}
          >
            {RUOLI.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>

        
        {globalError && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
            <p className="text-sm text-[#DC2626]">{globalError}</p>
          </div>
        )}

        
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] border border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors disabled:opacity-50"
            >
              Annulla
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: loading ? '#94A3B8' : 'linear-gradient(135deg, #17E88F, #0FA67A)' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creazione...
              </>
            ) : (
              'Crea utente'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
