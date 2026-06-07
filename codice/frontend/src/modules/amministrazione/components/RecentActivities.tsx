import { FileText, DollarSign, CreditCard, FileX, Bell, Send } from 'lucide-react';

const activities = [
  { id: 1, tipo: 'Fattura Emessa', descrizione: 'FT-2026-0845 - Ferrero S.p.A. - € 24.850', timestamp: '14:32', icon: FileText, color: 'text-[#3B82F6]', bgColor: 'bg-[#DBEAFE]' },
  { id: 2, tipo: 'Pagamento Registrato', descrizione: 'Bonifico ricevuto da Barilla Group - € 32.100', timestamp: '13:15', icon: CreditCard, color: 'text-[#22C55E]', bgColor: 'bg-[#DCFCE7]' },
  { id: 3, tipo: 'Incasso Ricevuto', descrizione: 'FT-2026-0842 - Lavazza S.p.A. - € 18.500', timestamp: '12:48', icon: DollarSign, color: 'text-[#17E88F]', bgColor: 'bg-[#F0FDF7]' },
  { id: 4, tipo: 'Nota Credito Generata', descrizione: 'NC-2026-0125 - Mutti S.p.A. - € 1.200', timestamp: '11:22', icon: FileX, color: 'text-[#F59E0B]', bgColor: 'bg-[#FEF3C7]' },
  { id: 5, tipo: 'Documento Scaduto', descrizione: 'FT-2026-0838 - Illy Caffè - € 18.500', timestamp: '10:05', icon: Bell, color: 'text-[#EF4444]', bgColor: 'bg-[#FEE2E2]' },
  { id: 6, tipo: 'Sollecito Inviato', descrizione: 'Sollecito pagamento FT-2026-0840', timestamp: '09:30', icon: Send, color: 'text-[#6B7280]', bgColor: 'bg-[#F3F4F6]' },
];

export function RecentActivities() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
      <h3 className="font-semibold text-[#2D2D2D] mb-5">Ultime Attività Amministrative</h3>

      <div className="relative">
        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-[#E5EAF2]" />
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="relative flex items-start gap-4 group">
                <div className={`relative z-10 w-12 h-12 ${activity.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-[#2D2D2D]">{activity.tipo}</p>
                    <span className="text-xs text-[#9CA3AF]">{activity.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#6B7280]">{activity.descrizione}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
