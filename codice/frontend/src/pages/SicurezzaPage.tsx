import { useState } from 'react';
import { Lock, Smartphone, Key, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react';

export function SicurezzaPage() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [twoFa, setTwoFa] = useState(true);

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
        <div className="max-w-md space-y-4">
          <PwdField label="Password Attuale"       show={showOld}  toggle={() => setShowOld(v => !v)} />
          <PwdField label="Nuova Password"         show={showNew}  toggle={() => setShowNew(v => !v)} />
          <PwdField label="Conferma Nuova Password" show={showConf} toggle={() => setShowConf(v => !v)} />

          <div className="bg-[#F7F9FC] rounded-xl p-4 space-y-2">
            <p className="text-xs font-medium text-[#6B7280] mb-1">Requisiti</p>
            {['Almeno 8 caratteri', 'Una lettera maiuscola', 'Un numero', 'Un carattere speciale'].map(r => (
              <div key={r} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#E5EAF2]" />
                <span className="text-xs text-[#6B7280]">{r}</span>
              </div>
            ))}
          </div>

          <button className="w-full py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm">
            Aggiorna Password
          </button>
        </div>
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

      {/* Sessioni attive */}
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
