import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Calendar, AlertCircle, Clock, FileText } from 'lucide-react';

const documentsData = [
  { name: 'Fatture Attive', value: 124, color: '#3B82F6' },
  { name: 'Fatture Passive', value: 87, color: '#EF4444' },
  { name: 'Note Credito', value: 18, color: '#F59E0B' },
  { name: 'Note Debito', value: 6, color: '#DC2626' },
];

const scadenze = [
  { documento: 'FT-2026-0845', soggetto: 'Ferrero S.p.A.', importo: '€ 24.850', scadenza: '05/06/2026' },
  { documento: 'FT-2026-0843', soggetto: 'Lavazza S.p.A.', importo: '€ 18.500', scadenza: '06/06/2026' },
  { documento: 'FT-2026-0842', soggetto: 'Barilla Group', importo: '€ 32.100', scadenza: '07/06/2026' },
];

const alerts = [
  { tipo: 'Fatture Scadute', descrizione: '3 fatture scadute per € 42.800', urgenza: 'high' },
  { tipo: 'Pagamenti Imminenti', descrizione: '5 pagamenti in scadenza entro 48h', urgenza: 'medium' },
  { tipo: 'Documenti Mancanti', descrizione: '2 ordini senza fattura', urgenza: 'low' },
];

export function FinancialWidgets() {
  return (
    <div className="space-y-6">
      {/* Scadenze Prossimi 7 Giorni */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#3B82F6]" />
          <h3 className="font-semibold text-[#2D2D2D]">Scadenze Prossimi 7 Giorni</h3>
        </div>
        <div className="space-y-3">
          {scadenze.map((scadenza, idx) => (
            <div key={idx} className="p-3 bg-[#F7F9FC] rounded-xl hover:bg-[#F0FDF7] transition-colors">
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs font-mono text-[#6B7280]">{scadenza.documento}</span>
                <span className="text-xs font-medium text-[#17E88F]">{scadenza.importo}</span>
              </div>
              <p className="text-sm text-[#2D2D2D] mb-1">{scadenza.soggetto}</p>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#9CA3AF]" />
                <span className="text-xs text-[#9CA3AF]">{scadenza.scadenza}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribuzione Documenti */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <h3 className="font-semibold text-[#2D2D2D] mb-4">Distribuzione Documenti</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={documentsData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {documentsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-4">
          {documentsData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-[#6B7280]">{item.name}</span>
              </div>
              <span className="text-xs font-medium text-[#2D2D2D]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Amministrativi */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <h3 className="font-semibold text-[#2D2D2D] mb-4">Alert Amministrativi</h3>
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`p-3 rounded-xl border ${
              alert.urgenza === 'high' ? 'bg-[#FEE2E2] border-[#FECACA]' :
              alert.urgenza === 'medium' ? 'bg-[#FEF3C7] border-[#FCD34D]' :
              'bg-[#DBEAFE] border-[#BFDBFE]'
            }`}>
              <div className="flex items-start gap-2">
                <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  alert.urgenza === 'high' ? 'text-[#DC2626]' :
                  alert.urgenza === 'medium' ? 'text-[#D97706]' :
                  'text-[#3B82F6]'
                }`} />
                <div>
                  <p className="text-xs font-medium text-[#2D2D2D]">{alert.tipo}</p>
                  <p className={`text-xs mt-0.5 ${
                    alert.urgenza === 'high' ? 'text-[#991B1B]' :
                    alert.urgenza === 'medium' ? 'text-[#92400E]' :
                    'text-[#1E40AF]'
                  }`}>{alert.descrizione}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stato Sistema ERP */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <h3 className="font-semibold text-[#2D2D2D] mb-4">Stato Sistema ERP</h3>
        <div className="flex items-center justify-between p-4 bg-[#DCFCE7] rounded-xl border border-[#BBF7D0]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#22C55E] rounded-full animate-pulse" />
            <span className="text-sm font-medium text-[#16A34A]">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="text-xs text-[#16A34A]">08:42:18</span>
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-3">Ultima sincronizzazione: 08:42:18</p>
      </div>
    </div>
  );
}
