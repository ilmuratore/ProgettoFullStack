
import { useState } from 'react';
import { Globe, Moon, Sun, Monitor, Download, X, ChevronRight } from 'lucide-react';

export function PreferenzePage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [lang, setLang]   = useState('it');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#2D2D2D]">Preferenze</h1>
        <p className="text-sm text-[#6B7280] mt-1">Personalizza la tua esperienza su LogiChain</p>
      </div>

      {/* Tema */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Monitor className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="font-semibold text-[#2D2D2D]">Aspetto</h3>
        </div>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-xs text-[#9CA3AF] mb-3 block">Tema</label>
            <div className="flex gap-3">
              {([
                { val: 'light', label: 'Chiaro',     icon: <Sun className="w-5 h-5" /> },
                { val: 'dark',  label: 'Scuro',      icon: <Moon className="w-5 h-5" /> },
                { val: 'auto',  label: 'Automatico', icon: <Monitor className="w-5 h-5" /> },
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
        </div>
      </div>

      {/* Lingua e fuso orario */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="font-semibold text-[#2D2D2D]">Lingua e Fuso Orario</h3>
        </div>
        <div className="space-y-4 max-w-md">
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
          <button className="w-full py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm">
            Salva Preferenze
          </button>
        </div>
      </div>

      {/* Dati e privacy */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Download className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="font-semibold text-[#2D2D2D]">Dati e Privacy</h3>
        </div>
        <div className="max-w-md space-y-3">
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
      </div>
    </div>
  );
}
