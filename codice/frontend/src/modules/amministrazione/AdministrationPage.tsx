import { useState } from 'react';
import { Plus, Users, ShieldCheck, Settings, Edit, Trash2, ToggleLeft, ToggleRight, KeyRound, Check, X, Bell, Building2, AlertTriangle } from 'lucide-react';
import { PageTabBar, type TabConfig } from '../../components/ui/PageTabBar';

type AdminTab = 'utenti' | 'ruoli' | 'impostazioni';

const tabs: TabConfig[] = [
  { id: 'utenti', label: 'Utenti', icon: Users },
  { id: 'ruoli', label: 'Ruoli & Permessi', icon: ShieldCheck },
  { id: 'impostazioni', label: 'Impostazioni', icon: Settings },
];

const utenti: {id:number;nome:string;email:string;ruolo:string;ruoloColor:string;ultimoAccesso:string;attivo:boolean}[] = [];

const permessi: {codice:string;descrizione:string;admin:boolean;respAcq:boolean;respMag:boolean;operatore:boolean;corriere:boolean}[] = [];

const ruoli: {nome:string;colore:string;permessiCount:number;descrizione:string}[] = [];

export function AdministrationPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('utenti');
  const [sogliaScorta, setSogliaScorta] = useState('50');
  const [pollingInterval, setPollingInterval] = useState('30');
  const [notificheSottoscorta, setNotificheSottoscorta] = useState(true);
  const [notificheRicezione, setNotificheRicezione] = useState(true);
  const [notificheSpedizioni, setNotificheSpedizioni] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Amministrazione</h1>
          <p className="text-sm text-[#6B7280] mt-1">Gestione utenti, ruoli, permessi e impostazioni sistema</p>
        </div>
        {activeTab === 'utenti' && (
          <button className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium">
            <Plus className="w-4 h-4" />
            Nuovo Utente
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
        <PageTabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as AdminTab)} />

        <div className="p-6 space-y-6">
          {activeTab === 'utenti' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F7F9FC] border-b border-[#E5EAF2]">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Utente</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ruolo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ultimo Accesso</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Stato</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAF2]">
                  {utenti.map((u) => (
                    <tr key={u.id} className={`hover:bg-[#F7F9FC] transition-colors ${!u.attivo ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: u.ruoloColor }}
                          >
                            {u.nome.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-medium text-[#2D2D2D]">{u.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: u.ruoloColor }}
                        >
                          {u.ruolo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">{u.ultimoAccesso}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${u.attivo ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                          {u.attivo ? 'Attivo' : 'Disabilitato'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button className="p-1.5 hover:bg-[#E5EAF2] rounded-lg transition-colors" title="Modifica">
                            <Edit className="w-4 h-4 text-[#6B7280]" />
                          </button>
                          <button className="p-1.5 hover:bg-[#E5EAF2] rounded-lg transition-colors" title="Reset Password">
                            <KeyRound className="w-4 h-4 text-[#6B7280]" />
                          </button>
                          <button className="p-1.5 hover:bg-[#E5EAF2] rounded-lg transition-colors" title={u.attivo ? 'Disabilita' : 'Abilita'}>
                            {u.attivo
                              ? <ToggleRight className="w-4 h-4 text-[#16A34A]" />
                              : <ToggleLeft className="w-4 h-4 text-[#9CA3AF]" />
                            }
                          </button>
                          <button className="p-1.5 hover:bg-[#FEE2E2] rounded-lg transition-colors" title="Elimina">
                            <Trash2 className="w-4 h-4 text-[#DC2626]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'ruoli' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {ruoli.map((r) => (
                  <div key={r.nome} className="border border-[#E5EAF2] rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.colore }} />
                      <span className="text-sm font-semibold text-[#2D2D2D]">{r.nome}</span>
                    </div>
                    <p className="text-xs text-[#6B7280]">{r.descrizione}</p>
                    <span className="text-xs font-medium text-[#17E88F]">{r.permessiCount} permessi</span>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#2D2D2D] mb-3">Matrice Ruoli × Permessi</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#F7F9FC] border-b border-[#E5EAF2]">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider min-w-[200px]">Permesso</th>
                        {ruoli.map((r) => (
                          <th key={r.nome} className="text-center px-3 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: r.colore }}>
                            {r.nome}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EAF2]">
                      {permessi.map((p) => (
                        <tr key={p.codice} className="hover:bg-[#F7F9FC] transition-colors">
                          <td className="px-4 py-2.5">
                            <span className="text-xs font-mono text-[#6B7280]">{p.codice}</span>
                            <span className="text-xs text-[#9CA3AF] ml-2">— {p.descrizione}</span>
                          </td>
                          {[p.admin, p.respAcq, p.respMag, p.operatore, p.corriere].map((has, i) => (
                            <td key={i} className="px-3 py-2.5 text-center">
                              {has
                                ? <Check className="w-4 h-4 text-[#16A34A] mx-auto" />
                                : <X className="w-4 h-4 text-[#E5EAF2] mx-auto" />
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'impostazioni' && (
            <div className="space-y-8 max-w-2xl">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-[#17E88F]" />
                  <h3 className="text-base font-semibold text-[#2D2D2D]">Dati Aziendali</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Ragione Sociale', value: 'LogiChain S.r.l.' },
                    { label: 'P.IVA', value: 'IT12345678901' },
                    { label: 'Indirizzo', value: 'Via della Logistica 42' },
                    { label: 'Città', value: 'Milano, 20121' },
                    { label: 'Email Aziendale', value: 'info@logichain.it' },
                    { label: 'Telefono', value: '+39 02 1234567' },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1">{field.label}</label>
                      <input
                        type="text"
                        defaultValue={field.value}
                        className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl text-sm text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#17E88F] focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-[#17E88F]" />
                  <h3 className="text-base font-semibold text-[#2D2D2D]">Soglia Scorta Minima Globale</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-xs">
                    <label className="block text-xs font-medium text-[#6B7280] mb-1">Unità (default per nuovi prodotti)</label>
                    <input
                      type="number"
                      value={sogliaScorta}
                      onChange={(e) => setSogliaScorta(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl text-sm text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#17E88F] focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-[#6B7280] mt-4">Valore usato come default per la scorta minima di nuovi prodotti. Ogni prodotto può avere un valore personalizzato.</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-[#17E88F]" />
                  <h3 className="text-base font-semibold text-[#2D2D2D]">Impostazioni Notifiche</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1">Frequenza polling notifiche (secondi)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={pollingInterval}
                        onChange={(e) => setPollingInterval(e.target.value)}
                        className="w-24 px-3 py-2 border border-[#E5EAF2] rounded-xl text-sm text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#17E88F] focus:border-transparent"
                      />
                      <span className="text-xs text-[#6B7280]">Valore consigliato: 30 secondi</span>
                    </div>
                  </div>

                  {[
                    { label: 'Notifiche sotto scorta (SOTTO_SCORTA)', value: notificheSottoscorta, set: setNotificheSottoscorta },
                    { label: 'Notifiche ricezione parziale (RICEZIONE_PARZIALE)', value: notificheRicezione, set: setNotificheRicezione },
                    { label: 'Notifiche cambio stato spedizione (CAMBIO_STATO_SPEDIZIONE)', value: notificheSpedizioni, set: setNotificheSpedizioni },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#E5EAF2] last:border-0">
                      <span className="text-sm text-[#374151]">{item.label}</span>
                      <button
                        onClick={() => item.set(!item.value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.value ? 'bg-[#17E88F]' : 'bg-[#E5EAF2]'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${item.value ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-5 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all font-medium text-sm">
                  Salva Impostazioni
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
