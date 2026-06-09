import { useState } from 'react';
import { Lock, Smartphone, Key, CheckCircle, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';

const REQUISITI = [
  { label: 'Almeno 6 caratteri',    check: (p: string) => p.length >= 6 },
  { label: 'Una lettera maiuscola', check: (p: string) => /[A-Z]/.test(p) },
  { label: 'Un numero',             check: (p: string) => /[0-9]/.test(p) },
];

export function SicurezzaPage() {
  const [show, setShow] = useState({ attuale: false, nuova: false, conferma: false });
  const [form, setForm] = useState({ attuale: '', nuova: '', conferma: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);
  const [twoFa, setTwoFa] = useState(true);

  const setF = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

  const validate = (): boolean => {
    const errs: Partial<typeof form> = {};
    if (!form.attuale) errs.attuale = 'Inserisci la password attuale';
    if (form.nuova.length < 6) errs.nuova = 'Minimo 6 caratteri';
    if (form.nuova === form.attuale) errs.nuova = 'La nuova password deve essere diversa';
    if (form.conferma !== form.nuova) errs.conferma = 'Le password non coincidono';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.changePassword(form.attuale, form.nuova);
      toast.success('Password aggiornata');
      setForm({ attuale: '', nuova: '', conferma: '' });
      setErrors({});
    } catch (err: any) {
      if (err?.code === 'PASSWORD_NON_VALIDA') {
        setErrors({ attuale: 'La password attuale non è corretta' });
      } else {
        toast.error('Aggiornamento fallito', { description: err?.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#2D2D2D]">Sicurezza</h1>
        <p className="text-sm text-[#6B7280] mt-1">Gestisci password e autenticazione del tuo account</p>
      </div>

      {/* Cambia password */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="font-semibold text-[#2D2D2D]">Cambia Password</h3>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <PwdField
            label="Password Attuale"
            value={form.attuale}
            show={show.attuale}
            toggle={() => setShow(s => ({ ...s, attuale: !s.attuale }))}
            onChange={setF('attuale')}
            error={errors.attuale}
          />
          <PwdField
            label="Nuova Password"
            value={form.nuova}
            show={show.nuova}
            toggle={() => setShow(s => ({ ...s, nuova: !s.nuova }))}
            onChange={setF('nuova')}
            error={errors.nuova}
          />
          <PwdField
            label="Conferma Nuova Password"
            value={form.conferma}
            show={show.conferma}
            toggle={() => setShow(s => ({ ...s, conferma: !s.conferma }))}
            onChange={setF('conferma')}
            error={errors.conferma}
          />

          {form.nuova && (
            <div className="bg-[#F7F9FC] rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-[#6B7280] mb-1">Requisiti</p>
              {REQUISITI.map(r => {
                const ok = r.check(form.nuova);
                return (
                  <div key={r.label} className="flex items-center gap-2">
                    {ok
                      ? <CheckCircle className="w-3.5 h-3.5 text-[#17E88F]" />
                      : <AlertCircle className="w-3.5 h-3.5 text-[#E5EAF2]" />
                    }
                    <span className={`text-xs ${ok ? 'text-[#2D2D2D]' : 'text-[#9CA3AF]'}`}>{r.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            Aggiorna Password
          </button>
        </form>
      </div>

      {/* 2FA */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Smartphone className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="font-semibold text-[#2D2D2D]">Autenticazione a Due Fattori (2FA)</h3>
        </div>
        <div className="max-w-md space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#F7F9FC] rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl border border-[#E5EAF2] flex items-center justify-center shadow-sm">
                <Key className="w-5 h-5 text-[#17E88F]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#2D2D2D]">App Authenticator</p>
                <p className="text-xs text-[#9CA3AF]">Google Authenticator · Authy</p>
              </div>
            </div>
            <button
              onClick={() => setTwoFa(v => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${twoFa ? 'bg-[#17E88F]' : 'bg-[#E5EAF2]'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${twoFa ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {twoFa && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-800">2FA Attiva</p>
                <p className="text-xs text-emerald-700">Il tuo account è protetto con autenticazione a due fattori.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sessioni */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="font-semibold text-[#2D2D2D]">Sessioni Attive</h3>
        </div>
        <div className="max-w-md space-y-3">
          <div className="flex items-center justify-between p-4 border border-[#17E88F] bg-[#F0FDF7] rounded-xl">
            <div>
              <p className="text-sm font-medium text-[#2D2D2D]">Sessione corrente</p>
              <p className="text-xs text-[#9CA3AF]">Chrome · Milano · Adesso</p>
            </div>
            <span className="px-2 py-0.5 bg-[#17E88F]/10 text-[#17E88F] text-xs rounded-full font-medium">Corrente</span>
          </div>
          <button className="w-full py-2.5 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50 transition-colors">
            Revoca tutte le altre sessioni
          </button>
        </div>
      </div>
    </div>
  );
}

function PwdField({
  label, value, show, toggle, onChange, error,
}: {
  label: string;
  value: string;
  show: boolean;
  toggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="text-xs text-[#9CA3AF] mb-2 block">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={`w-full h-10 px-4 pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all ${
            error ? 'border-red-400 bg-red-50' : 'bg-[#F7F9FC] border-[#E5EAF2]'
          }`}
        />
        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
