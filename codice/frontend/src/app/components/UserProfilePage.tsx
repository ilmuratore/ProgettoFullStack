import { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Camera, Save, Lock, Bell, Shield,
  Smartphone, Key, Eye, EyeOff, CheckCircle, AlertCircle, Monitor,
  Clock, Activity, Download, Globe, Palette, Moon, Sun, LogOut,
  Edit2, Plus, X, ChevronRight
} from 'lucide-react';

type Tab = 'profilo' | 'sicurezza' | 'notifiche' | 'preferenze' | 'sessioni';

const RECENT_SESSIONS = [
  { device: 'MacBook Pro 14"', browser: 'Chrome 124', location: 'Milano, IT', time: '04/06/2026 09:12', current: true },
  { device: 'iPhone 15 Pro', browser: 'Safari iOS', location: 'Milano, IT', time: '03/06/2026 18:30', current: false },
  { device: 'Windows PC', browser: 'Edge 123', location: 'Roma, IT', time: '02/06/2026 14:15', current: false },
];

const ACTIVITY_LOG = [
  { action: 'Login effettuato', detail: 'Chrome 124 — Milano', time: '04/06/2026 09:12', type: 'login' },
  { action: 'Password modificata', detail: 'Sicurezza account', time: '02/06/2026 10:00', type: 'security' },
  { action: 'Profilo aggiornato', detail: 'Telefono e sede modificati', time: '01/06/2026 15:40', type: 'edit' },
  { action: 'Export dati', detail: 'Report vendite Q1 2026', time: '30/05/2026 11:20', type: 'export' },
  { action: '2FA abilitato', detail: 'App authenticator', time: '28/05/2026 09:00', type: 'security' },
];

export function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('profilo');
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [lang, setLang] = useState('it');
  const [twoFa, setTwoFa] = useState(true);
  const [notifs, setNotifs] = useState({
    ordini: true, magazzino: true, fatture: true, sistema: false,
    email: true, push: false, sms: false,
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profilo', label: 'Profilo' },
    { id: 'sicurezza', label: 'Sicurezza' },
    { id: 'notifiche', label: 'Notifiche' },
    { id: 'preferenze', label: 'Preferenze' },
    { id: 'sessioni', label: 'Sessioni & Log' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Profilo Utente</h1>
          <p className="text-sm text-[#6B7280] mt-1">Admin / Profilo</p>
        </div>
      </div>

      {/* Profile hero card */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#17E88F] to-[#0FA67A] flex items-center justify-center text-white font-bold text-2xl">
              MR
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-[#E5EAF2] rounded-lg flex items-center justify-center shadow hover:bg-[#F7F9FC] transition-colors">
              <Camera className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-[#2D2D2D]">Marco Rossi</h2>
            <p className="text-sm text-[#6B7280]">Direttore Operazioni · LogiChain S.p.A.</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                <Shield className="w-3 h-3" />
                Admin
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Account verificato
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                <Clock className="w-3.5 h-3.5" />
                Membro dal Mar 2019
              </span>
            </div>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium text-sm">
            <Save className="w-4 h-4" />
            Salva Modifiche
          </button>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="flex gap-6">
        {/* Sidebar tabs */}
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
              <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
                Esci
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5">
          {/* PROFILO */}
          {activeTab === 'profilo' && (
            <>
              <Section title="Dati Personali" icon={<User className="w-4 h-4 text-[#3B82F6]" />}>
                <div className="grid grid-cols-2 gap-4">
                  <ProfileField label="Nome" defaultValue="Marco" />
                  <ProfileField label="Cognome" defaultValue="Rossi" />
                  <ProfileField label="Email" type="email" defaultValue="marco.rossi@logichain.it" />
                  <ProfileField label="Telefono" defaultValue="+39 02 1234567" />
                  <div className="col-span-2">
                    <label className="text-xs text-[#9CA3AF] mb-2 block">Ruolo</label>
                    <input disabled defaultValue="Direttore Operazioni" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm text-[#9CA3AF] cursor-not-allowed" />
                    <p className="text-xs text-[#9CA3AF] mt-1">Il ruolo può essere modificato solo dall'amministratore di sistema.</p>
                  </div>
                </div>
              </Section>

              <Section title="Sede & Informazioni Aziendali" icon={<MapPin className="w-4 h-4 text-[#3B82F6]" />}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#9CA3AF] mb-2 block">Sede</label>
                    <select className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20">
                      {['Milano', 'Roma', 'Torino', 'Bologna'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <ProfileField label="Dipartimento" defaultValue="Operations" />
                  <div className="col-span-2">
                    <label className="text-xs text-[#9CA3AF] mb-2 block">Bio</label>
                    <textarea rows={3} defaultValue="Responsabile della supervisione delle operazioni quotidiane e della gestione del team operativo." className="w-full px-4 py-3 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 resize-none" />
                  </div>
                </div>
              </Section>
            </>
          )}

          {/* SICUREZZA */}
          {activeTab === 'sicurezza' && (
            <>
              <Section title="Cambia Password" icon={<Lock className="w-4 h-4 text-[#3B82F6]" />}>
                <div className="space-y-4">
                  <PwdField label="Password Attuale" show={showOldPwd} toggle={() => setShowOldPwd(v => !v)} />
                  <PwdField label="Nuova Password" show={showNewPwd} toggle={() => setShowNewPwd(v => !v)} />
                  <div>
                    <label className="text-xs text-[#9CA3AF] mb-2 block">Conferma Nuova Password</label>
                    <input type="password" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
                  </div>
                  <div className="bg-[#F7F9FC] rounded-xl p-3 space-y-1.5">
                    <p className="text-xs text-[#9CA3AF] mb-2">Requisiti password</p>
                    {['Almeno 8 caratteri', 'Una lettera maiuscola', 'Un numero', 'Un carattere speciale'].map((r, i) => (
                      <div key={r} className="flex items-center gap-2">
                        <CheckCircle className={`w-3.5 h-3.5 ${i < 2 ? 'text-emerald-500' : 'text-[#E5EAF2]'}`} />
                        <span className="text-xs text-[#6B7280]">{r}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm">
                    Aggiorna Password
                  </button>
                </div>
              </Section>

              <Section title="Autenticazione a Due Fattori (2FA)" icon={<Smartphone className="w-4 h-4 text-[#3B82F6]" />}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#F7F9FC] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl border border-[#E5EAF2] flex items-center justify-center shadow-sm">
                        <Key className="w-5 h-5 text-[#17E88F]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D]">App Authenticator</p>
                        <p className="text-xs text-[#9CA3AF]">Google Authenticator / Authy</p>
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
              </Section>
            </>
          )}

          {/* NOTIFICHE */}
          {activeTab === 'notifiche' && (
            <>
              <Section title="Canali di Notifica" icon={<Bell className="w-4 h-4 text-[#3B82F6]" />}>
                <div className="space-y-3">
                  {([
                    { key: 'email', label: 'Email', icon: <Mail className="w-4 h-4 text-blue-500" /> },
                    { key: 'push', label: 'Notifiche Push', icon: <Bell className="w-4 h-4 text-purple-500" /> },
                    { key: 'sms', label: 'SMS', icon: <Smartphone className="w-4 h-4 text-orange-500" /> },
                  ] as { key: keyof typeof notifs; label: string; icon: React.ReactNode }[]).map(ch => (
                    <div key={ch.key} className="flex items-center justify-between p-3 bg-[#F7F9FC] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg border border-[#E5EAF2] flex items-center justify-center shadow-sm">{ch.icon}</div>
                        <span className="text-sm font-medium text-[#2D2D2D]">{ch.label}</span>
                      </div>
                      <Toggle value={notifs[ch.key]} onChange={v => setNotifs(prev => ({ ...prev, [ch.key]: v }))} />
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Tipi di Notifica" icon={<AlertCircle className="w-4 h-4 text-[#3B82F6]" />}>
                <div className="space-y-3">
                  {([
                    { key: 'ordini', label: 'Nuovi ordini e aggiornamenti', detail: 'Acquisti, vendite, stato spedizioni' },
                    { key: 'magazzino', label: 'Avvisi magazzino', detail: 'Sottoscorta, inventario, scadenze' },
                    { key: 'fatture', label: 'Fatturazione & Pagamenti', detail: 'Scadenze, pagamenti ricevuti/inviati' },
                    { key: 'sistema', label: 'Aggiornamenti sistema', detail: 'Manutenzione, nuove funzionalità' },
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

          {/* PREFERENZE */}
          {activeTab === 'preferenze' && (
            <>
              <Section title="Aspetto" icon={<Palette className="w-4 h-4 text-[#3B82F6]" />}>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#9CA3AF] mb-3 block">Tema</label>
                    <div className="flex gap-3">
                      {([
                        { val: 'light', label: 'Chiaro', icon: <Sun className="w-5 h-5" /> },
                        { val: 'dark', label: 'Scuro', icon: <Moon className="w-5 h-5" /> },
                        { val: 'auto', label: 'Automatico', icon: <Monitor className="w-5 h-5" /> },
                      ] as const).map(t => (
                        <button
                          key={t.val}
                          onClick={() => setTheme(t.val)}
                          className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border transition-colors ${theme === t.val ? 'border-[#17E88F] bg-[#F0FDF7] text-[#17E88F]' : 'border-[#E5EAF2] text-[#6B7280] hover:bg-[#F7F9FC]'}`}
                        >
                          {t.icon}
                          <span className="text-xs font-medium">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#9CA3AF] mb-2 block">Lingua</label>
                    <select value={lang} onChange={e => setLang(e.target.value)} className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none">
                      <option value="it">Italiano</option>
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#9CA3AF] mb-2 block">Fuso Orario</label>
                    <select className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none">
                      <option>Europe/Rome (UTC+2)</option>
                      <option>Europe/London (UTC+1)</option>
                      <option>America/New_York (UTC-4)</option>
                    </select>
                  </div>
                </div>
              </Section>

              <Section title="Dati e Privacy" icon={<Globe className="w-4 h-4 text-[#3B82F6]" />}>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 border border-[#E5EAF2] rounded-xl hover:bg-[#F7F9FC] transition-colors">
                    <div className="flex items-center gap-3">
                      <Download className="w-4 h-4 text-[#6B7280]" />
                      <span className="text-sm text-[#2D2D2D]">Esporta i tuoi dati</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">Elimina Account</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </Section>
            </>
          )}

          {/* SESSIONI */}
          {activeTab === 'sessioni' && (
            <>
              <Section title="Sessioni Attive" icon={<Monitor className="w-4 h-4 text-[#3B82F6]" />}>
                <div className="space-y-3">
                  {RECENT_SESSIONS.map((s, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${s.current ? 'border-[#17E88F] bg-[#F0FDF7]' : 'border-[#E5EAF2]'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl border border-[#E5EAF2] flex items-center justify-center shadow-sm">
                          <Monitor className="w-5 h-5 text-[#6B7280]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-[#2D2D2D]">{s.device}</p>
                            {s.current && <span className="px-2 py-0.5 bg-[#17E88F]/10 text-[#17E88F] text-xs rounded-full font-medium">Corrente</span>}
                          </div>
                          <p className="text-xs text-[#9CA3AF]">{s.browser} · {s.location} · {s.time}</p>
                        </div>
                      </div>
                      {!s.current && (
                        <button className="text-xs text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50">
                          Revoca
                        </button>
                      )}
                    </div>
                  ))}
                  <button className="w-full py-2.5 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50 transition-colors">
                    Revoca tutte le altre sessioni
                  </button>
                </div>
              </Section>

              <Section title="Log Attività Recenti" icon={<Activity className="w-4 h-4 text-[#3B82F6]" />}>
                <div className="space-y-2">
                  {ACTIVITY_LOG.map((ev, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[#F7F9FC] rounded-xl">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ev.type === 'login' ? 'bg-emerald-100' : ev.type === 'security' ? 'bg-red-100' : ev.type === 'edit' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                        {ev.type === 'login' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                        {ev.type === 'security' && <Shield className="w-4 h-4 text-red-600" />}
                        {ev.type === 'edit' && <Edit2 className="w-4 h-4 text-blue-600" />}
                        {ev.type === 'export' && <Download className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#2D2D2D]">{ev.action}</p>
                        <p className="text-xs text-[#9CA3AF]">{ev.detail}</p>
                      </div>
                      <span className="text-xs text-[#9CA3AF] whitespace-nowrap">{ev.time}</span>
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

function ProfileField({ label, type = 'text', defaultValue }: { label: string; type?: string; defaultValue: string }) {
  return (
    <div>
      <label className="text-xs text-[#9CA3AF] mb-2 block">{label}</label>
      <input type={type} defaultValue={defaultValue} className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
    </div>
  );
}

function PwdField({ label, show, toggle }: { label: string; show: boolean; toggle: () => void }) {
  return (
    <div>
      <label className="text-xs text-[#9CA3AF] mb-2 block">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} className="w-full h-10 px-4 pr-10 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
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
