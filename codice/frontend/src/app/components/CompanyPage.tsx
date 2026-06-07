import { Save, Building2, MapPin, Image, Settings, Shield, Award } from 'lucide-react';

export function CompanyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Azienda</h1>
          <p className="text-sm text-[#6B7280] mt-1">Admin / Azienda</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium">
          <Save className="w-4 h-4" />
          Salva Modifiche
        </button>
      </div>

      {/* Informazioni Azienda */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-[#3B82F6]" />
          <h3 className="font-semibold text-[#2D2D2D]">Informazioni Azienda</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#9CA3AF] mb-2 block">Ragione Sociale</label>
            <input type="text" defaultValue="LogiChain S.p.A." className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-2 block">Nome Commerciale</label>
            <input type="text" defaultValue="LogiChain ERP" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-2 block">Partita IVA</label>
            <input type="text" defaultValue="IT01234567890" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-2 block">Codice Fiscale</label>
            <input type="text" defaultValue="01234567890" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-2 block">REA</label>
            <input type="text" defaultValue="MI-1234567" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-2 block">PEC</label>
            <input type="email" defaultValue="info@pec.logichain.it" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-2 block">Codice SDI</label>
            <input type="text" defaultValue="ABCDEFG" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-2 block">Telefono</label>
            <input type="tel" defaultValue="+39 02 12345678" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-2 block">Email</label>
            <input type="email" defaultValue="info@logichain.it" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-2 block">Website</label>
            <input type="url" defaultValue="https://www.logichain.it" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
        </div>
      </div>

      {/* Sede Legale */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <MapPin className="w-5 h-5 text-[#3B82F6]" />
          <h3 className="font-semibold text-[#2D2D2D]">Sede Legale</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-[#9CA3AF] mb-2 block">Indirizzo</label>
            <input type="text" defaultValue="Via Milano 123" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-2 block">Città</label>
            <input type="text" defaultValue="Milano" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-2 block">Provincia</label>
            <input type="text" defaultValue="MI" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-2 block">CAP</label>
            <input type="text" defaultValue="20100" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] mb-2 block">Nazione</label>
            <input type="text" defaultValue="Italia" className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20" />
          </div>
        </div>
      </div>

      {/* Parametri ERP + Sicurezza + Licenza in grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parametri ERP */}
        <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="w-5 h-5 text-[#3B82F6]" />
            <h3 className="font-semibold text-[#2D2D2D]">Parametri ERP</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#9CA3AF] mb-2 block">Lingua Piattaforma</label>
              <select className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20">
                <option>Italiano</option>
                <option>English</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] mb-2 block">Timezone</label>
              <select className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20">
                <option>Europe/Rome</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] mb-2 block">Valuta</label>
              <select className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20">
                <option>EUR (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sicurezza */}
        <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-[#22C55E]" />
            <h3 className="font-semibold text-[#2D2D2D]">Sicurezza</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B7280]">2FA Obbligatoria</span>
              <button className="w-11 h-6 bg-[#17E88F] rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" /></button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B7280]">Whitelist IP</span>
              <button className="w-11 h-6 bg-[#E5E7EB] rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1" /></button>
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] mb-2 block">Durata Sessione</label>
              <select className="w-full h-10 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20">
                <option>8 ore</option>
                <option>24 ore</option>
              </select>
            </div>
          </div>
        </div>

        {/* Licenza */}
        <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Award className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="font-semibold text-[#2D2D2D]">Licenza</h3>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-[#9CA3AF]">Piano Attivo</span>
              <p className="text-sm font-semibold text-[#2D2D2D] mt-1">Enterprise</p>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[#9CA3AF]">Utenti</span>
                <span className="font-medium text-[#2D2D2D]">48 / 100</span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                <div className="h-2 bg-[#17E88F] rounded-full" style={{ width: '48%' }} />
              </div>
            </div>
            <div>
              <span className="text-xs text-[#9CA3AF]">Moduli Attivi</span>
              <p className="text-sm font-medium text-[#2D2D2D] mt-1">7 / 7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
