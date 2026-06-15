import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { authApi } from '../api/authApi';
import type { RegisterData } from '../api/authApi';
import type { UtenteAPI } from '../types/auth';
import type { UtenteCreateRequest, UtenteUpdateRequest } from '../types/utenti';
import type { Dipendente } from '../types/corrieri';
import { toast } from 'sonner';

interface FieldError {
  field: string;
  message: string;
}

const REGISTER_ROLE_IDS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const PROTECTED_ROLE_IDS = [1] as const;
const NON_DEACTIVATABLE_ROLE_IDS = [1] as const;
const EMPLOYEE_LOCKED_ROLE_IDS = [1, 2, 3, 4] as const;
const REGISTER_ROLES = [
  { id: 2, label: 'Developer' },
  { id: 3, label: 'Supporto' },
  { id: 4, label: 'Resp. Azienda' },
  { id: 5, label: 'Resp. HR' },
  { id: 6, label: 'Resp. Vendite' },
  { id: 7, label: 'Resp. Acquisti' },
  { id: 8, label: 'Resp. Magazzino' },
  { id: 9, label: 'Operatore' },
  { id: 10, label: 'Corriere' },
] as const;

interface RegisterPageProps {
  open?: boolean;
  mode?: 'create' | 'edit';
  initialData?: UtenteAPI | null;
  dipendenti?: Dipendente[];
  onSuccess?: (utente: UtenteAPI) => void;
  onCancel?: () => void;
  onSave?: (data: UtenteCreateRequest | UtenteUpdateRequest, options?: { id?: number; passwordReset?: string; dipendenteId?: number | null }) => Promise<void>;
}

type RegisterFormState = RegisterData & {
  attivo: boolean;
  confirmPassword: string;
  dipendente_id: number | '';
};

const EMPTY_FORM: RegisterFormState = {
  nome: '',
  cognome: '',
  email: '',
  password: '',
  ruolo_id: 2,
  attivo: true,
  confirmPassword: '',
  dipendente_id: '',
};

export function RegisterPage({ open, mode = 'create', initialData, dipendenti = [], onSuccess, onCancel, onSave }: RegisterPageProps) {
  const [form, setForm] = useState<RegisterFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [globalError, setGlobalError] = useState('');

  const isModal = typeof open === 'boolean';
  const isProtectedRoleUser = PROTECTED_ROLE_IDS.includes((initialData?.ruolo_id ?? -1) as (typeof PROTECTED_ROLE_IDS)[number]);
  const isNonDeactivatableUser = NON_DEACTIVATABLE_ROLE_IDS.includes((initialData?.ruolo_id ?? -1) as (typeof NON_DEACTIVATABLE_ROLE_IDS)[number]);
  const canLinkDipendente = !EMPLOYEE_LOCKED_ROLE_IDS.includes(Number(form.ruolo_id) as (typeof EMPLOYEE_LOCKED_ROLE_IDS)[number]);

  const roleOptions = useMemo(() => {
    const options = [...REGISTER_ROLES];
    if (
      mode === 'edit' &&
      initialData &&
      !REGISTER_ROLE_IDS.includes(initialData.ruolo_id as (typeof REGISTER_ROLE_IDS)[number])
    ) {
      return [
        { id: initialData.ruolo_id, label: initialData.ruolo_nome ?? initialData.ruolo ?? 'Ruolo attuale' },
        ...options,
      ];
    }
    return options;
  }, [mode, initialData]);

  const dipendenteOptions = useMemo(() => {
    const currentDipendenteId = initialData?.dipendente?.id ?? null;
    return dipendenti.filter((dipendente) =>
      dipendente.utente_id == null || dipendente.id === currentDipendenteId
    );
  }, [dipendenti, initialData]);

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
        dipendente_id: initialData.dipendente?.id ?? '',
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
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'ruolo_id' && EMPLOYEE_LOCKED_ROLE_IDS.includes(Number(value) as (typeof EMPLOYEE_LOCKED_ROLE_IDS)[number])) {
        next.dipendente_id = '';
      }
      return next;
    });
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
          await onSave(payload, {
            dipendenteId: canLinkDipendente && form.dipendente_id !== '' ? Number(form.dipendente_id) : null,
          });
        } else {
          const utente = await authApi.register(payload);
          toast.success(`Utente ${utente.nome} ${utente.cognome} creato con successo`);
          onSuccess?.(utente);
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
          dipendenteId: canLinkDipendente && form.dipendente_id !== '' ? Number(form.dipendente_id) : null,
        });
      }
    } catch (err: unknown) {
      const e = err as { code?: string; details?: FieldError[]; message?: string };
      if (e.code === 'VALIDATION_ERROR' && e.details?.length) {
        setFieldErrors(e.details);
      } else if (e.code === 'DUPLICATE_ENTRY' || e.code === 'EMAIL_GIA_ESISTENTE') {
        setFieldErrors([{ field: 'email', message: 'Email giÃ  registrata nel sistema' }]);
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

        {canLinkDipendente && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#374151]">Dipendente collegato</label>
            <select
              value={form.dipendente_id}
              onChange={(e) => handleChange('dipendente_id', e.target.value ? Number(e.target.value) : '')}
              className={`${inputClass('dipendente_id')} cursor-pointer`}
              disabled={loading}
            >
              <option value="">Nessun collegamento</option>
              {dipendenteOptions.map((dipendente) => (
                <option key={dipendente.id} value={dipendente.id}>
                  {dipendente.cognome} {dipendente.nome} · {dipendente.ruolo_operativo ?? 'Dipendente'}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#9CA3AF]">Disponibili solo dipendenti non ancora collegati.</p>
            {getFieldError('dipendente_id') && <p className="text-xs text-[#DC2626]">{getFieldError('dipendente_id')}</p>}
          </div>
        )}

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
