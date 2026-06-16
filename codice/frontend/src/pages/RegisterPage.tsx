import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { authApi } from '../api/authApi';
import { utentiApi } from '../api/utentiApi';
import { useAuthStore } from '../store/authStore';
import type { RegisterData } from '../api/authApi';
import type { UtenteAPI } from '../types/auth';
import type { UtenteCreateRequest, UtenteUpdateRequest } from '../types/utenti';
import type { Ruolo } from '../types/ruoli';
import { toast } from 'sonner';

interface FieldError {
  field: string;
  message: string;
}

const PROTECTED_ROLE_IDS = [1] as const;
const NON_DEACTIVATABLE_ROLE_IDS = [1] as const;

const ROLE_LABELS: Record<string, string> = {
  Dev: 'Developer',
};

const DISALLOWED_CREATE_ROLES_BY_ACTOR: Record<number, string[]> = {
  1: ['Admin', 'Dev'],
  2: ['Admin', 'Dev'],
  3: ['Admin', 'Dev', 'Supporto'],
};

interface RegisterPageProps {
  open?: boolean;
  mode?: 'create' | 'edit';
  initialData?: UtenteAPI | null;
  onSuccess?: (utente: UtenteAPI) => void;
  onCancel?: () => void;
  onSave?: (data: UtenteCreateRequest | UtenteUpdateRequest, options?: { id?: number; passwordReset?: string }) => Promise<void>;
}

type RegisterFormState = RegisterData & {
  attivo: boolean;
  confirmPassword: string;
};

const EMPTY_FORM: RegisterFormState = {
  nome: '',
  cognome: '',
  email: '',
  password: '',
  ruolo_id: 2,
  attivo: true,
  confirmPassword: '',
};

export function RegisterPage({ open, mode = 'create', initialData, onSuccess, onCancel, onSave }: RegisterPageProps) {
  const { utente } = useAuthStore();
  const [form, setForm] = useState<RegisterFormState>(EMPTY_FORM);
  const [ruoli, setRuoli] = useState<Ruolo[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [globalError, setGlobalError] = useState('');

  const isModal = typeof open === 'boolean';
  const isProtectedRoleUser = PROTECTED_ROLE_IDS.includes((initialData?.ruolo_id ?? -1) as (typeof PROTECTED_ROLE_IDS)[number]);
  const isNonDeactivatableUser = NON_DEACTIVATABLE_ROLE_IDS.includes((initialData?.ruolo_id ?? -1) as (typeof NON_DEACTIVATABLE_ROLE_IDS)[number]);

  const roleOptions = useMemo(() => {
    const blockedRoleNames = DISALLOWED_CREATE_ROLES_BY_ACTOR[utente?.ruolo_id ?? -1] ?? [];
    const options = ruoli
      .filter((ruolo) => mode === 'edit' || !blockedRoleNames.includes(String(ruolo.nome)))
      .map((ruolo) => ({
        id: ruolo.id,
        label: ROLE_LABELS[String(ruolo.nome)] ?? String(ruolo.nome),
      }));

    if (mode === 'edit' && initialData && !options.some((option) => option.id === initialData.ruolo_id)) {
      return [
        { id: initialData.ruolo_id, label: ROLE_LABELS[initialData.ruolo_nome ?? initialData.ruolo ?? ''] ?? initialData.ruolo_nome ?? initialData.ruolo ?? 'Ruolo attuale' },
        ...options,
      ];
    }

    return options;
  }, [mode, initialData, ruoli, utente]);

  useEffect(() => {
    utentiApi.getRuoli()
      .then(setRuoli)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mode !== 'create' || !ruoli.length) return;
    setForm((prev) => (
      ruoli.some((ruolo) => ruolo.id === Number(prev.ruolo_id))
        ? prev
        : { ...prev, ruolo_id: ruoli[0].id }
    ));
  }, [mode, ruoli]);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        nome: initialData.nome ?? '',
        cognome: initialData.cognome ?? '',
        email: initialData.email ?? '',
        password: '',
        ruolo_id: initialData.ruolo_id ?? 2,
        attivo: initialData.attivo ?? true,
        confirmPassword: '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setFieldErrors([]);
    setGlobalError('');
  }, [mode, initialData, open]);

  const getFieldError = (field: string) =>
    fieldErrors.find((e) => e.field === field)?.message;

  const handleChange = (field: keyof RegisterFormState, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => prev.filter((e) => e.field !== field));
    setGlobalError('');
  };

  const validate = () => {
    const errors: FieldError[] = [];
    const wantsPasswordChange = mode === 'create' || !!form.password.trim() || !!form.confirmPassword.trim();

    if (!form.nome.trim()) errors.push({ field: 'nome', message: 'Nome obbligatorio' });
    if (!form.cognome.trim()) errors.push({ field: 'cognome', message: 'Cognome obbligatorio' });
    if (!form.email.trim()) {
      errors.push({ field: 'email', message: 'Email obbligatoria' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.push({ field: 'email', message: 'Email non valida' });
    }
    if (!form.ruolo_id) errors.push({ field: 'ruolo_id', message: 'Ruolo obbligatorio' });
    if (wantsPasswordChange && form.password.trim().length < 6) {
      errors.push({ field: 'password', message: 'Minimo 6 caratteri' });
    }
    if (mode === 'create' && !form.confirmPassword.trim()) {
      errors.push({ field: 'confirmPassword', message: 'Conferma password obbligatoria' });
    }
    if (wantsPasswordChange && form.password !== form.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Le password non coincidono' });
    }

    setFieldErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFieldErrors([]);
    setGlobalError('');

    try {
      if (mode === 'create') {
        const payload: UtenteCreateRequest = {
          nome: form.nome.trim(),
          cognome: form.cognome.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
          ruolo_id: Number(form.ruolo_id),
          attivo: form.attivo,
        };

        if (onSave) {
          await onSave(payload);
        } else {
          const created = await authApi.register(payload);
          toast.success(`Utente ${created.nome} ${created.cognome} creato con successo`);
          onSuccess?.(created);
        }
      } else {
        await onSave?.({
          nome: form.nome.trim(),
          cognome: form.cognome.trim(),
          email: form.email.trim(),
          ruolo_id: isProtectedRoleUser ? initialData?.ruolo_id : Number(form.ruolo_id),
          attivo: isNonDeactivatableUser ? true : form.attivo,
        }, {
          id: initialData?.id,
          passwordReset: form.password.trim() ? form.password.trim() : undefined,
        });
      }
    } catch (err: unknown) {
      const e = err as { code?: string; details?: FieldError[]; message?: string };
      if (e.code === 'VALIDATION_ERROR' && e.details?.length) {
        setFieldErrors(e.details);
      } else if (e.code === 'DUPLICATE_ENTRY' || e.code === 'EMAIL_GIA_ESISTENTE') {
        setFieldErrors([{ field: 'email', message: 'Email già registrata nel sistema' }]);
      } else {
        setGlobalError(e.message ?? (mode === 'create' ? 'Errore durante la registrazione' : 'Errore durante il salvataggio'));
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

  const content = (
    <>
      {!isModal && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#0F172A]">{mode === 'create' ? 'Registra nuovo utente' : 'Modifica utente'}</h3>
          <p className="text-sm text-[#6B7280] mt-1">{mode === 'create' ? 'Solo gli Admin possono creare nuovi account' : 'Aggiorna dati, ruolo e stato utente'}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#374151]">Nome *</label>
            <input type="text" value={form.nome} onChange={(e) => handleChange('nome', e.target.value)} placeholder="Mario" className={inputClass('nome')} required disabled={loading} />
            {getFieldError('nome') && <p className="text-xs text-[#DC2626]">{getFieldError('nome')}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#374151]">Cognome *</label>
            <input type="text" value={form.cognome} onChange={(e) => handleChange('cognome', e.target.value)} placeholder="Rossi" className={inputClass('cognome')} required disabled={loading} />
            {getFieldError('cognome') && <p className="text-xs text-[#DC2626]">{getFieldError('cognome')}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#374151]">Email *</label>
          <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="mario.rossi@logichain.it" className={inputClass('email')} required autoComplete="off" disabled={loading} />
          {getFieldError('email') && <p className="text-xs text-[#DC2626]">{getFieldError('email')}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#374151]">Password {mode === 'create' ? '*' : ''}</label>
          <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder={mode === 'create' ? 'Min. 6 caratteri' : 'Lascia vuoto per non cambiarla'} className={inputClass('password')} required={mode === 'create'} autoComplete="new-password" disabled={loading} />
          {getFieldError('password') && <p className="text-xs text-[#DC2626]">{getFieldError('password')}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#374151]">Conferma Password {mode === 'create' ? '*' : ''}</label>
          <input type="password" value={form.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} placeholder="Ripeti password" className={inputClass('confirmPassword')} required={mode === 'create'} autoComplete="new-password" disabled={loading} />
          {getFieldError('confirmPassword') && <p className="text-xs text-[#DC2626]">{getFieldError('confirmPassword')}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#374151]">Ruolo *</label>
            <select
              value={form.ruolo_id}
              onChange={(e) => handleChange('ruolo_id', Number(e.target.value))}
              className={`${inputClass('ruolo_id')} cursor-pointer ${mode === 'edit' && isProtectedRoleUser ? 'opacity-60 cursor-not-allowed bg-[#F7F9FC]' : ''}`}
              disabled={loading || (mode === 'edit' && isProtectedRoleUser)}
            >
              {roleOptions.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
            {getFieldError('ruolo_id') && <p className="text-xs text-[#DC2626]">{getFieldError('ruolo_id')}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#374151]">Stato</label>
            <label className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-[#E5EAF2] ${isNonDeactivatableUser ? 'opacity-60 cursor-not-allowed bg-[#F7F9FC]' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={form.attivo}
                onChange={(e) => handleChange('attivo', e.target.checked)}
                disabled={loading || isNonDeactivatableUser}
                className="w-4 h-4 accent-[#17E88F]"
              />
              <span className="text-sm text-[#374151]">{form.attivo ? 'Utente attivo' : 'Utente disattivo'}</span>
            </label>
          </div>
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
                {mode === 'create' ? 'Creazione...' : 'Salvataggio...'}
              </>
            ) : (
              mode === 'create' ? 'Crea utente' : 'Salva modifiche'
            )}
          </button>
        </div>
      </form>
    </>
  );

  if (isModal) {
    return (
      <Dialog open={open} onOpenChange={(value) => { if (!value && !loading) onCancel?.(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Nuovo Utente' : 'Modifica Utente'}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6 w-full max-w-md">
      {content}
    </div>
  );
}
