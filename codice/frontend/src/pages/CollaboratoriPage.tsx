import { useState } from 'react';
import {
  Users, Plus, Search, Filter, MoreVertical, Mail, Phone, MapPin,
  Briefcase, Calendar, Shield, Edit2, Trash2, X, ChevronDown,
  CheckCircle, Clock, UserCheck, AlertCircle, Download, Upload,
  Star, Activity, Key, Lock
} from 'lucide-react';

interface Collaboratore {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  ruolo: string;
  dipartimento: string;
  sede: string;
  dataAssunzione: string;
  stato: 'attivo' | 'inattivo' | 'ferie' | 'malattia';
  avatar: string;
  accesso: 'admin' | 'manager' | 'operatore' | 'viewer';
  ultimoAccesso: string;
  note: string;
}

const MOCK_COLLABORATORI: Collaboratore[] = [
  { id: 'C001', nome: 'Marco', cognome: 'Rossi', email: 'marco.rossi@logichain.it', telefono: '+39 02 1234567', ruolo: 'Direttore Operazioni', dipartimento: 'Operations', sede: 'Milano', dataAssunzione: '2019-03-15', stato: 'attivo', avatar: 'MR', accesso: 'admin', ultimoAccesso: '2026-06-04 09:12', note: 'Responsabile della supervisione delle operazioni quotidiane.' },
  { id: 'C002', nome: 'Giulia', cognome: 'Ferrari', email: 'giulia.ferrari@logichain.it', telefono: '+39 02 1234568', ruolo: 'Responsabile Magazzino', dipartimento: 'Magazzino', sede: 'Milano', dataAssunzione: '2020-07-01', stato: 'attivo', avatar: 'GF', accesso: 'manager', ultimoAccesso: '2026-06-04 08:45', note: 'Gestisce il team di magazzino (12 persone).' },
  { id: 'C003', nome: 'Luca', cognome: 'Bianchi', email: 'luca.bianchi@logichain.it', telefono: '+39 02 1234569', ruolo: 'Responsabile Acquisti', dipartimento: 'Acquisti', sede: 'Roma', dataAssunzione: '2021-01-10', stato: 'ferie', avatar: 'LB', accesso: 'manager', ultimoAccesso: '2026-06-01 16:30', note: 'Gestisce i rapporti con i fornitori principali.' },
  { id: 'C004', nome: 'Sara', cognome: 'Conti', email: 'sara.conti@logichain.it', telefono: '+39 02 1234570', ruolo: 'Commerciale Senior', dipartimento: 'Vendite', sede: 'Milano', dataAssunzione: '2021-09-15', stato: 'attivo', avatar: 'SC', accesso: 'operatore', ultimoAccesso: '2026-06-04 10:02', note: '' },
  { id: 'C005', nome: 'Andrea', cognome: 'Moretti', email: 'andrea.moretti@logichain.it', telefono: '+39 02 1234571', ruolo: 'Logistica & Trasporti', dipartimento: 'Logistica', sede: 'Torino', dataAssunzione: '2022-03-20', stato: 'attivo', avatar: 'AM', accesso: 'operatore', ultimoAccesso: '2026-06-04 07:55', note: '' },
  { id: 'C006', nome: 'Elena', cognome: 'Romano', email: 'elena.romano@logichain.it', telefono: '+39 02 1234572', ruolo: 'Contabile', dipartimento: 'Amministrazione', sede: 'Milano', dataAssunzione: '2020-11-05', stato: 'attivo', avatar: 'ER', accesso: 'manager', ultimoAccesso: '2026-06-03 17:20', note: 'Gestisce contabilità e fatturazione attiva/passiva.' },
  { id: 'C007', nome: 'Fabio', cognome: 'Gallo', email: 'fabio.gallo@logichain.it', telefono: '+39 02 1234573', ruolo: 'IT Manager', dipartimento: 'IT', sede: 'Milano', dataAssunzione: '2019-06-01', stato: 'malattia', avatar: 'FG', accesso: 'admin', ultimoAccesso: '2026-05-30 12:00', note: 'Gestisce infrastruttura IT e sicurezza sistemi.' },
  { id: 'C008', nome: 'Chiara', cognome: 'Leone', email: 'chiara.leone@logichain.it', telefono: '+39 02 1234574', ruolo: 'Addetta Vendite', dipartimento: 'Vendite', sede: 'Roma', dataAssunzione: '2023-02-01', stato: 'inattivo', avatar: 'CL', accesso: 'viewer', ultimoAccesso: '2026-05-15 09:30', note: '' },
];

const statoConfig = {
  attivo: { label: 'Attivo', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  inattivo: { label: 'Inattivo', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  ferie: { label: 'Ferie', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  malattia: { label: 'Malattia', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
};

const accessoConfig = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700' },
  manager: { label: 'Manager', color: 'bg-blue-100 text-blue-700' },
  operatore: { label: 'Operatore', color: 'bg-green-100 text-green-700' },
  viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-600' },
};

const avatarColors = ['bg-[#17E88F]', 'bg-[#3B82F6]', 'bg-[#F59E0B]', 'bg-[#EF4444]', 'bg-[#8B5CF6]', 'bg-[#EC4899]', 'bg-[#06B6D4]', 'bg-[#10B981]'];

function getAvatarColor(id: string) {
  const idx = parseInt(id.replace('C', '')) - 1;
  return avatarColors[idx % avatarColors.length];
}

interface DrawerProps {
  collaboratore: Collaboratore;
  onClose: () => void;
  onEdit: (c: Collaboratore) => void;
}

function CollaboratoreDrawer({ collaboratore: c, onClose, onEdit }: DrawerProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'accessi' | 'attivita'>('info');

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[480px] bg-white h-full flex flex-col shadow-2xl animate-[slideInRight_0.25s_ease-out]">
        {/* Header */}
        <div className="p-6 border-b border-[#E5EAF2] flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${getAvatarColor(c.id)} flex items-center justify-center text-white font-bold text-lg`}>
              {c.avatar}
            </div>
            <div>
              <h2 className="font-semibold text-[#2D2D2D] text-lg">{c.nome} {c.cognome}</h2>
              <p className="text-sm text-[#6B7280]">{c.ruolo}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statoConfig[c.stato].color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statoConfig[c.stato].dot}`} />
                  {statoConfig[c.stato].label}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${accessoConfig[c.accesso].color}`}>
                  {accessoConfig[c.accesso].label}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F9FC] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5EAF2] px-6">
          {(['info', 'accessi', 'attivita'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab ? 'border-[#17E88F] text-[#17E88F]' : 'border-transparent text-[#6B7280] hover:text-[#2D2D2D]'
              }`}
            >
              {tab === 'info' ? 'Informazioni' : tab === 'accessi' ? 'Accessi & Permessi' : 'Attività'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'info' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <InfoField icon={<Mail className="w-4 h-4" />} label="Email" value={c.email} />
                <InfoField icon={<Phone className="w-4 h-4" />} label="Telefono" value={c.telefono} />
                <InfoField icon={<Briefcase className="w-4 h-4" />} label="Dipartimento" value={c.dipartimento} />
                <InfoField icon={<MapPin className="w-4 h-4" />} label="Sede" value={c.sede} />
                <InfoField icon={<Calendar className="w-4 h-4" />} label="Data Assunzione" value={new Date(c.dataAssunzione).toLocaleDateString('it-IT')} />
                <InfoField icon={<Clock className="w-4 h-4" />} label="Ultimo Accesso" value={c.ultimoAccesso} />
              </div>
              {c.note && (
                <div className="bg-[#F7F9FC] rounded-xl p-4">
                  <p className="text-xs text-[#9CA3AF] mb-1">Note</p>
                  <p className="text-sm text-[#2D2D2D]">{c.note}</p>
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-800">Performance</p>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-amber-400" />)}
                    <div className="w-2 h-2 rounded-full bg-amber-200" />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'accessi' && (
            <>
              <div className="bg-white border border-[#E5EAF2] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#3B82F6]" />
                    <span className="text-sm font-medium text-[#2D2D2D]">Ruolo ERP</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${accessoConfig[c.accesso].color}`}>{accessoConfig[c.accesso].label}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">Moduli Abilitati</p>
                {['Dashboard', 'Anagrafiche', 'Magazzino', 'Acquisti', 'Vendite', 'Logistica', 'Amministrazione'].map((mod, i) => (
                  <div key={mod} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#F7F9FC] transition-colors">
                    <span className="text-sm text-[#2D2D2D]">{mod}</span>
                    <div className={`w-8 h-4 rounded-full transition-colors ${i < (c.accesso === 'admin' ? 7 : c.accesso === 'manager' ? 6 : c.accesso === 'operatore' ? 5 : 1) ? 'bg-[#17E88F]' : 'bg-[#E5EAF2]'}`}>
                      <div className={`w-3 h-3 rounded-full bg-white mt-0.5 transition-transform shadow ${i < (c.accesso === 'admin' ? 7 : c.accesso === 'manager' ? 6 : c.accesso === 'operatore' ? 5 : 1) ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#F7F9FC] rounded-xl p-4 flex items-center gap-3">
                <Key className="w-4 h-4 text-[#6B7280]" />
                <div>
                  <p className="text-xs text-[#9CA3AF]">Autenticazione 2FA</p>
                  <p className="text-sm font-medium text-emerald-600">Abilitata</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'attivita' && (
            <div className="space-y-3">
              {[
                { action: 'Login effettuato', time: '04/06/2026 09:12', icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
                { action: 'Ordine #ORD-2847 creato', time: '04/06/2026 09:25', icon: <Activity className="w-4 h-4 text-blue-500" /> },
                { action: 'Anagrafica fornitore aggiornata', time: '03/06/2026 15:40', icon: <Edit2 className="w-4 h-4 text-orange-500" /> },
                { action: 'Report mensile esportato', time: '03/06/2026 17:10', icon: <Download className="w-4 h-4 text-purple-500" /> },
                { action: 'Password modificata', time: '02/06/2026 10:00', icon: <Lock className="w-4 h-4 text-red-500" /> },
              ].map((ev, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#F7F9FC] rounded-xl">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">{ev.icon}</div>
                  <div>
                    <p className="text-sm text-[#2D2D2D]">{ev.action}</p>
                    <p className="text-xs text-[#9CA3AF]">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5EAF2] flex gap-3">
          <button
            onClick={() => onEdit(c)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Edit2 className="w-4 h-4" />
            Modifica
          </button>
          <button className="px-4 py-2.5 border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-colors">
            <Key className="w-4 h-4" />
          </button>
          <button className="px-4 py-2.5 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#F7F9FC] rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-[#9CA3AF] mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium text-[#2D2D2D] truncate">{value}</p>
    </div>
  );
}

interface NuovoModalProps {
  onClose: () => void;
  onSave: (c: Partial<Collaboratore>) => void;
}

function NuovoCollaboratoreModal({ onClose, onSave }: NuovoModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<Collaboratore>>({
    stato: 'attivo',
    accesso: 'operatore',
    sede: 'Milano',
  });

  const update = (field: keyof Collaboratore, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[600px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#E5EAF2] flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#2D2D2D] text-lg">Nuovo Collaboratore</h2>
            <p className="text-sm text-[#6B7280] mt-0.5">Step {step} di 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F9FC] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="px-6 pt-4 flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 flex flex-col gap-1">
              <div className={`h-1.5 rounded-full transition-colors ${s <= step ? 'bg-[#17E88F]' : 'bg-[#E5EAF2]'}`} />
              <span className="text-xs text-[#9CA3AF]">{s === 1 ? 'Dati Personali' : s === 2 ? 'Ruolo & Sede' : 'Accessi'}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Nome *" placeholder="Mario" value={form.nome || ''} onChange={v => update('nome', v)} />
                <FormField label="Cognome *" placeholder="Rossi" value={form.cognome || ''} onChange={v => update('cognome', v)} />
              </div>
              <FormField label="Email *" type="email" placeholder="mario.rossi@logichain.it" value={form.email || ''} onChange={v => update('email', v)} />
              <FormField label="Telefono" placeholder="+39 02 123456" value={form.telefono || ''} onChange={v => update('telefono', v)} />
              <FormField label="Data Assunzione" type="date" value={form.dataAssunzione || ''} onChange={v => update('dataAssunzione', v)} />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <FormField label="Ruolo *" placeholder="es. Responsabile Logistica" value={form.ruolo || ''} onChange={v => update('ruolo', v)} />
              <div>
                <label className="text-xs text-[#9CA3AF] mb-2 block">Dipartimento</label>
                <select className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" value={form.dipartimento || ''} onChange={e => update('dipartimento', e.target.value)}>
                  <option value="">Seleziona...</option>
                  {['Operations', 'Magazzino', 'Acquisti', 'Vendite', 'Logistica', 'Amministrazione', 'IT', 'HR'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#9CA3AF] mb-2 block">Sede</label>
                <select className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" value={form.sede || 'Milano'} onChange={e => update('sede', e.target.value)}>
                  {['Milano', 'Roma', 'Torino', 'Bologna', 'Firenze', 'Napoli'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#9CA3AF] mb-2 block">Stato</label>
                <div className="flex gap-2">
                  {(['attivo', 'inattivo'] as const).map(s => (
                    <button key={s} onClick={() => update('stato', s)} className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${form.stato === s ? 'border-[#17E88F] bg-[#F0FDF7] text-[#17E88F]' : 'border-[#E5EAF2] text-[#6B7280] hover:bg-[#F7F9FC]'}`}>
                      {statoConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#9CA3AF] mb-2 block">Livello di Accesso</label>
                <div className="space-y-2">
                  {(['admin', 'manager', 'operatore', 'viewer'] as const).map(a => (
                    <button key={a} onClick={() => update('accesso', a)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${form.accesso === a ? 'border-[#17E88F] bg-[#F0FDF7]' : 'border-[#E5EAF2] hover:bg-[#F7F9FC]'}`}>
                      <div className="flex items-center gap-3">
                        <Shield className={`w-4 h-4 ${form.accesso === a ? 'text-[#17E88F]' : 'text-[#9CA3AF]'}`} />
                        <span className={`text-sm font-medium ${form.accesso === a ? 'text-[#2D2D2D]' : 'text-[#6B7280]'}`}>{accessoConfig[a].label}</span>
                      </div>
                      {form.accesso === a && <CheckCircle className="w-4 h-4 text-[#17E88F]" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">Verrà inviata un'email di invito all'indirizzo <strong>{form.email}</strong> con le credenziali di accesso.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5EAF2] flex justify-between">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-colors font-medium">
              Indietro
            </button>
          ) : (
            <button onClick={onClose} className="px-5 py-2.5 border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-colors font-medium">
              Annulla
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} className="px-6 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl font-medium hover:shadow-lg transition-all">
              Continua
            </button>
          ) : (
            <button onClick={() => { onSave(form); onClose(); }} className="px-6 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl font-medium hover:shadow-lg transition-all">
              Crea Collaboratore
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, type = 'text', placeholder = '', value, onChange }: { label: string; type?: string; placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-[#9CA3AF] mb-2 block">{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
    </div>
  );
}

export function CollaboratoriPage() {
  const [collaboratori, setCollaboratori] = useState(MOCK_COLLABORATORI);
  const [search, setSearch] = useState('');
  const [filterStato, setFilterStato] = useState<string>('tutti');
  const [filterDip, setFilterDip] = useState<string>('tutti');
  const [selectedDrawer, setSelectedDrawer] = useState<Collaboratore | null>(null);
  const [showNuovoModal, setShowNuovoModal] = useState(false);

  const filtered = collaboratori.filter(c => {
    const matchSearch = `${c.nome} ${c.cognome} ${c.ruolo} ${c.email}`.toLowerCase().includes(search.toLowerCase());
    const matchStato = filterStato === 'tutti' || c.stato === filterStato;
    const matchDip = filterDip === 'tutti' || c.dipartimento === filterDip;
    return matchSearch && matchStato && matchDip;
  });

  const dipartimenti = [...new Set(collaboratori.map(c => c.dipartimento))];

  const kpis = [
    { label: 'Totale', value: collaboratori.length, icon: <Users className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Attivi', value: collaboratori.filter(c => c.stato === 'attivo').length, icon: <UserCheck className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Ferie / Assenti', value: collaboratori.filter(c => c.stato === 'ferie' || c.stato === 'malattia').length, icon: <Clock className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600' },
    { label: 'Admin / Manager', value: collaboratori.filter(c => c.accesso === 'admin' || c.accesso === 'manager').length, icon: <Shield className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Collaboratori</h1>
          <p className="text-sm text-[#6B7280] mt-1">Admin / Collaboratori</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-colors flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" />
            Importa
          </button>
          <button
            onClick={() => setShowNuovoModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuovo Collaboratore
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-[#E5EAF2] p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.color}`}>
              {k.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2D2D2D]">{k.value}</p>
              <p className="text-xs text-[#6B7280]">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Cerca per nome, ruolo, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#9CA3AF]" />
          <select value={filterStato} onChange={e => setFilterStato(e.target.value)} className="h-10 px-3 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none">
            <option value="tutti">Tutti gli stati</option>
            <option value="attivo">Attivo</option>
            <option value="ferie">In Ferie</option>
            <option value="malattia">Malattia</option>
            <option value="inattivo">Inattivo</option>
          </select>
          <select value={filterDip} onChange={e => setFilterDip(e.target.value)} className="h-10 px-3 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none">
            <option value="tutti">Tutti i dipartimenti</option>
            {dipartimenti.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <span className="text-xs text-[#9CA3AF]">{filtered.length} risultati</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2] bg-[#F7F9FC]">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Collaboratore</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Dipartimento</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Sede</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Stato</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Accesso</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Ultimo Accesso</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr
                key={c.id}
                onClick={() => setSelectedDrawer(c)}
                className={`border-b border-[#F7F9FC] hover:bg-[#F7F9FC] transition-colors cursor-pointer ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${getAvatarColor(c.id)} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                      {c.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#2D2D2D]">{c.nome} {c.cognome}</p>
                      <p className="text-xs text-[#9CA3AF]">{c.ruolo}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-[#6B7280]">{c.dipartimento}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                    <MapPin className="w-3.5 h-3.5" />
                    {c.sede}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statoConfig[c.stato].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statoConfig[c.stato].dot}`} />
                    {statoConfig[c.stato].label}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${accessoConfig[c.accesso].color}`}>
                    {accessoConfig[c.accesso].label}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs text-[#9CA3AF]">{c.ultimoAccesso}</span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedDrawer(c); }}
                    className="p-1.5 hover:bg-[#E5EAF2] rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-[#9CA3AF]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 flex flex-col items-center text-[#9CA3AF]">
            <Users className="w-10 h-10 mb-3" />
            <p className="text-sm">Nessun collaboratore trovato</p>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selectedDrawer && (
        <CollaboratoreDrawer
          collaboratore={selectedDrawer}
          onClose={() => setSelectedDrawer(null)}
          onEdit={c => { setSelectedDrawer(null); }}
        />
      )}

      {/* Nuovo Modal */}
      {showNuovoModal && (
        <NuovoCollaboratoreModal
          onClose={() => setShowNuovoModal(false)}
          onSave={data => {
            const newC: Collaboratore = {
              id: `C00${collaboratori.length + 1}`,
              nome: data.nome || '',
              cognome: data.cognome || '',
              email: data.email || '',
              telefono: data.telefono || '',
              ruolo: data.ruolo || '',
              dipartimento: data.dipartimento || '',
              sede: data.sede || 'Milano',
              dataAssunzione: data.dataAssunzione || '',
              stato: data.stato || 'attivo',
              avatar: `${(data.nome || 'N')[0]}${(data.cognome || 'N')[0]}`.toUpperCase(),
              accesso: data.accesso || 'operatore',
              ultimoAccesso: '-',
              note: '',
            };
            setCollaboratori(prev => [...prev, newC]);
          }}
        />
      )}
    </div>
  );
}
