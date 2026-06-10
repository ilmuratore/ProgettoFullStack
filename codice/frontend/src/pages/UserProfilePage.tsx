import { useState } from 'react';
import {
  User, Camera, Save, Lock, Bell, Shield,
  Smartphone, Key, Eye, EyeOff, CheckCircle, AlertCircle, Monitor,
  Clock, Activity, Download, Globe, LogOut,
  Edit2, X, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore, RUOLO_ID_TO_NOME } from '../store/authStore';
import { authApi } from '../api/authApi';

type Tab = 'profilo' | 'sicurezza' | 'notifiche' ;




const AVATAR_BGS: Record<number, string> = {
  1:  '#0F172A',
  2:  '#4F46E5',
  3:  '#0891B2',
  4:  '#059669',
  5:  '#DC2626',
  6:  '#7C3AED',
  7:  '#1D4ED8',
  8:  '#0D9488',
  9:  '#16A34A',
  10: '#EA580C',
};

const REQUISITI = [
  { label: 'Almeno 6 caratteri',    check: (p: string) => p.length >= 6 },
  { label: 'Una lettera maiuscola', check: (p: string) => /[A-Z]/.test(p) },
  { label: 'Un numero',             check: (p: string) => /[0-9]/.test(p) },
];

export function UserProfilePage() {
  const { utente, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>('profilo');
  const [notifs, setNotifs] = useState({
    ordini: true, magazzino: true, fatture: true, sistema: false,
    email: true, push: false, sms: false,
  });

  const [pwdForm, setPwdForm] = useState({ attuale: '', nuova: '', conferma: '' });
  const [pwdShow, setPwdShow] = useState({ attuale: false, nuova: false, conferma: false });
  const [pwdErrors, setPwdErrors] = useState<Partial<typeof pwdForm>>({});
  const [pwdLoading, setPwdLoading] = useState(false);

  if (!utente) return null;

  const initials  = `${utente.nome?.[0] ?? ''}${utente.cognome?.[0] ?? ''}`.toUpperCase();
  const ruoloNome = utente.ruolo_nome ?? RUOLO_ID_TO_NOME[utente.ruolo_id] ?? 'Utente';
  const avatarBg  = AVATAR_BGS[utente.ruolo_id] ?? '#6B7280';

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profilo',    label: 'Profilo'         },
    { id: 'sicurezza',  label: 'Sicurezza'        },
    { id: 'notifiche',  label: 'Notifiche'        },
  ];

  const setPwd = (field: keyof typeof pwdForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPwdForm(prev => ({ ...prev, [field]: e.target.value }));
      if (pwdErrors[field]) setPwdErrors(prev => ({ ...prev, [field]: undefined }));
    };

  const validatePwd = (): boolean => {
    const errs: Partial<typeof pwdForm> = {};
    if (!pwdForm.attuale) errs.attuale = 'Inserisci la password attuale';
    if (pwdForm.nuova.length < 6) errs.nuova = 'Minimo 6 caratteri';
    if (pwdForm.nuova === pwdForm.attuale) errs.nuova = 'La nuova password deve essere diversa';
    if (pwdForm.conferma !== pwdForm.nuova) errs.conferma = 'Le password non coincidono';
    setPwdErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePwd()) return;
    setPwdLoading(true);
    try {
      await authApi.changePassword(pwdForm.attuale, pwdForm.nuova);
      toast.success('Password aggiornata');
      setPwdForm({ attuale: '', nuova: '', conferma: '' });
      setPwdErrors({});
    } catch (err: any) {
      if (err?.code === 'PASSWORD_NON_VALIDA') {
        setPwdErrors({ attuale: 'La password attuale non è corretta' });
      } else {
        toast.error('Aggiornamento fallito', { description: err?.message });
      }
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Profilo Utente</h1>
          <p className="text-sm text-[#6B7280] mt-1">{ruoloNome} · {utente.email}</p>
        </div>
      </div>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
              style={{ backgroundColor: avatarBg }}
            >
              {initials}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-[#E5EAF2] rounded-lg flex items-center justify-center shadow hover:bg-[#F7F9FC] transition-colors">
              <Camera className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-[#2D2D2D]">{utente.nome} {utente.cognome}</h2>
            <p className="text-sm text-[#6B7280]">{ruoloNome}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F0FDF7] text-[#0FA67A] rounded-full text-xs font-medium">
                <Shield className="w-3 h-3" />
                {ruoloNome}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Account attivo
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                <Clock className="w-3.5 h-3.5" />
                {utente.email}
              </span>
            </div>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium text-sm">
            <Save className="w-4 h-4" />
            Salva Modifiche
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tab */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[#E5EAF2] p-2 space-y-0.5">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${activeTab === t.id ? 'bg-[#F0FDF7] text-[#17E88F] font-medium' : 'text-[#6B7280] hover:bg-[#F7F9FC] hover:text-[#2D2D2D]'}`}
              >
                {t.label}
                <ChevronRight className={`w-4 h-4 transition-opacity ${activeTab === t.id ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            ))}
            <div className="pt-2 mt-2 border-t border-[#E5EAF2]">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Esci
              </button>
            </div>
          </div>
        </div>

        {/* Contenuto */}
        <div className="flex-1 space-y-5">

          {activeTab === 'profilo' && (
            <Section title="Dati Personali" icon={<User className="w-4 h-4 text-[#3B82F6]" />}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nome"    defaultValue={utente.nome} />
                <Field label="Cognome" defaultValue={utente.cognome} />
                <Field label="Email"   type="email" defaultValue={utente.email} />
                <div className="col-span-2">
                  <label className="text-xs text-[#9CA3AF] mb-2 block">Ruolo di sistema</label>
                  <input disabled value={ruoloNome} className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm text-[#9CA3AF] cursor-not-allowed" />
                  <p className="text-xs text-[#9CA3AF] mt-1">Il ruolo può essere modificato solo dall'amministratore.</p>
                </div>
              </div>
            </Section>
          )}

          {activeTab === 'sicurezza' && (
            <>
              <Section title="Cambia Password" icon={<Lock className="w-4 h-4 text-[#3B82F6]" />}>
                <form onSubmit={handlePwdSubmit} className="space-y-4">
                  <PwdField label="Password Attuale"       value={pwdForm.attuale}  show={pwdShow.attuale}  toggle={() => setPwdShow(s => ({ ...s, attuale: !s.attuale }))}  onChange={setPwd('attuale')}  error={pwdErrors.attuale} />
                  <PwdField label="Nuova Password"         value={pwdForm.nuova}    show={pwdShow.nuova}    toggle={() => setPwdShow(s => ({ ...s, nuova: !s.nuova }))}      onChange={setPwd('nuova')}    error={pwdErrors.nuova} />
                  <PwdField label="Conferma Nuova Password" value={pwdForm.conferma} show={pwdShow.conferma} toggle={() => setPwdShow(s => ({ ...s, conferma: !s.conferma }))} onChange={setPwd('conferma')} error={pwdErrors.conferma} />

                  {pwdForm.nuova && (
                    <div className="bg-[#F7F9FC] rounded-xl p-3 space-y-1.5">
                      <p className="text-xs text-[#9CA3AF] mb-2">Requisiti password</p>
                      {REQUISITI.map(r => {
                        const ok = r.check(pwdForm.nuova);
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
                    disabled={pwdLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {pwdLoading && (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    )}
                    Aggiorna Password
                  </button>
                </form>
              </Section>

            </>
          )}

          {activeTab === 'notifiche' && (
            <>
              <Section title="Canali di Notifica" icon={<Bell className="w-4 h-4 text-[#3B82F6]" />}>
                <div className="space-y-3">
                  {([
                    { key: 'email', label: 'Email' },
                    { key: 'push',  label: 'Notifiche Push' },
                    { key: 'sms',   label: 'SMS' },
                  ] as { key: keyof typeof notifs; label: string }[]).map(ch => (
                    <div key={ch.key} className="flex items-center justify-between p-3 bg-[#F7F9FC] rounded-xl">
                      <span className="text-sm font-medium text-[#2D2D2D]">{ch.label}</span>
                      <Toggle value={notifs[ch.key]} onChange={v => setNotifs(prev => ({ ...prev, [ch.key]: v }))} />
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Tipi di Notifica" icon={<AlertCircle className="w-4 h-4 text-[#3B82F6]" />}>
                <div className="space-y-3">
                  {([
                    { key: 'ordini',    label: 'Ordini e spedizioni',     detail: 'Acquisti, vendite, stato spedizioni' },
                    { key: 'magazzino', label: 'Avvisi magazzino',         detail: 'Sottoscorta, inventario' },
                    { key: 'fatture',   label: 'Fatturazione',             detail: 'Scadenze, pagamenti ricevuti/inviati' },
                    { key: 'sistema',   label: 'Aggiornamenti sistema',    detail: 'Manutenzione, nuove funzionalità' },
                  ] as { key: keyof typeof notifs; label: string; detail: string }[]).map(n => (
                    <div key={n.key} className="flex items-center justify-between p-3 border border-[#E5EAF2] rounded-xl hover:bg-[#F7F9FC] transition-colors">
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D]">{n.label}</p>
                        <p className="text-xs text-[#9CA3AF]">{n.detail}</p>
                      </div>
                      <Toggle value={notifs[n.key]} onChange={v => setNotifs(prev => ({ ...prev, [n.key]: v }))} />
                    </div>
                  ))}
                </div>
              </Section>
            </>
          )}

          
         
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h3 className="font-semibold text-[#2D2D2D]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, type = 'text', defaultValue }: { label: string; type?: string; defaultValue: string }) {
  return (
    <div>
      <label className="text-xs text-[#9CA3AF] mb-2 block">{label}</label>
      <input type={type} defaultValue={defaultValue} className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
    </div>
  );
}

function PwdField({
  label, value, show, toggle, onChange, error,
}: {
  label: string; value: string; show: boolean;
  toggle: () => void; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string;
}) {
  return (
    <div>
      <label className="text-xs text-[#9CA3AF] mb-2 block">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'} value={value} onChange={onChange}
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

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-[#17E88F]' : 'bg-[#E5EAF2]'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}
