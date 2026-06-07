import { ArrowDownCircle, ArrowUpCircle, ArrowRightCircle, Plus, Minus, RotateCcw, Clock } from 'lucide-react';

interface Movement {
  id: number;
  tipo: 'Carico Acquisto' | 'Scarico Vendita' | 'Trasferimento' | 'Rettifica Positiva' | 'Rettifica Negativa' | 'Reso';
  prodotto: string;
  sku: string;
  quantita: string;
  utente: string;
  ora: string;
  ubicazione?: string;
}

const movements: Movement[] = [
  { id: 1, tipo: 'Carico Acquisto', prodotto: 'Pallet Standard EUR 1200x800', sku: 'PLT-EUR-001', quantita: '+150', utente: 'Giovanni Bianchi', ora: '10:15', ubicazione: 'A-01-05' },
  { id: 2, tipo: 'Scarico Vendita', prodotto: 'Scatola Cartone Ondulato 40x30', sku: 'SCT-OND-045', quantita: '-500', utente: 'Laura Verdi', ora: '10:08', ubicazione: 'A-02-12' },
  { id: 3, tipo: 'Trasferimento', prodotto: 'Film Estensibile Trasparente 50cm', sku: 'FLM-EST-012', quantita: '80', utente: 'Marco Ferrari', ora: '09:52', ubicazione: 'B-01-08 → B-02-15' },
  { id: 4, tipo: 'Rettifica Positiva', prodotto: 'Etichette Adesive A4 Bianche', sku: 'ETI-ADE-098', quantita: '+25', utente: 'Sofia Romano', ora: '09:47', ubicazione: 'A-03-04' },
  { id: 5, tipo: 'Carico Acquisto', prodotto: 'Reggetta PP Automatica 12mm', sku: 'REG-PP-034', quantita: '+200', utente: 'Andrea Ricci', ora: '09:33', ubicazione: 'B-02-15' },
  { id: 6, tipo: 'Scarico Vendita', prodotto: 'Nastro Adesivo Avana 50mm', sku: 'NST-AVA-056', quantita: '-120', utente: 'Chiara Colombo', ora: '09:28', ubicazione: 'A-01-18' },
  { id: 7, tipo: 'Reso', prodotto: 'Angolare Cartone Protezione 50x50', sku: 'ANG-CRT-067', quantita: '+50', utente: 'Francesco Marino', ora: '09:14', ubicazione: 'B-03-07' },
  { id: 8, tipo: 'Scarico Vendita', prodotto: 'Busta Pluriball 30x45cm', sku: 'BST-PLU-089', quantita: '-200', utente: 'Elena Greco', ora: '09:05', ubicazione: 'A-02-22' },
  { id: 9, tipo: 'Rettifica Negativa', prodotto: 'Dispenser Nastro Adesivo Manuale', sku: 'DIS-NST-023', quantita: '-5', utente: 'Luca Bruno', ora: '08:58', ubicazione: 'REF-01-03' },
  { id: 10, tipo: 'Carico Acquisto', prodotto: 'Scatola Fustellata 60x40x40', sku: 'SCT-FUS-078', quantita: '+250', utente: 'Giulia Gallo', ora: '08:42', ubicazione: 'A-03-16' },
];

const getMovementIcon = (tipo: string) => {
  switch (tipo) {
    case 'Carico Acquisto':
      return { icon: ArrowDownCircle, color: 'text-[#22C55E]', bg: 'bg-[#DCFCE7]' };
    case 'Scarico Vendita':
      return { icon: ArrowUpCircle, color: 'text-[#EF4444]', bg: 'bg-[#FEE2E2]' };
    case 'Trasferimento':
      return { icon: ArrowRightCircle, color: 'text-[#3B82F6]', bg: 'bg-[#DBEAFE]' };
    case 'Rettifica Positiva':
      return { icon: Plus, color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]' };
    case 'Rettifica Negativa':
      return { icon: Minus, color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]' };
    case 'Reso':
      return { icon: RotateCcw, color: 'text-[#8B5CF6]', bg: 'bg-[#EDE9FE]' };
    default:
      return { icon: ArrowRightCircle, color: 'text-[#6B7280]', bg: 'bg-[#F3F4F6]' };
  }
};

export function StockMovementsTimeline() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[#2D2D2D]">Movimenti Magazzino in Tempo Reale</h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#F0FDF7] border border-[#17E88F]/20 rounded-lg">
            <div className="w-2 h-2 bg-[#17E88F] rounded-full animate-pulse" />
            <span className="text-xs font-medium text-[#17E88F]">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Clock className="w-4 h-4" />
          Aggiornato in tempo reale
        </div>
      </div>

      <div className="space-y-4">
        {movements.map((movement, index) => {
          const iconConfig = getMovementIcon(movement.tipo);
          const Icon = iconConfig.icon;

          return (
            <div
              key={movement.id}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#F7F9FC] transition-all group relative"
            >
              {index !== movements.length - 1 && (
                <div className="absolute left-[30px] top-[60px] w-0.5 h-[calc(100%+16px)] bg-[#E5EAF2]" />
              )}

              <div className={`w-12 h-12 ${iconConfig.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform z-10`}>
                <Icon className={`w-6 h-6 ${iconConfig.color}`} />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[#2D2D2D]">{movement.tipo}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        movement.quantita.startsWith('+') ? 'bg-[#DCFCE7] text-[#22C55E]' :
                        movement.quantita.startsWith('-') ? 'bg-[#FEE2E2] text-[#EF4444]' :
                        'bg-[#DBEAFE] text-[#3B82F6]'
                      }`}>
                        {movement.quantita}
                      </span>
                    </div>
                    <div className="text-sm text-[#2D2D2D] font-medium">{movement.prodotto}</div>
                    <div className="text-xs text-[#6B7280] font-mono mt-0.5">{movement.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-[#6B7280]">{movement.ora}</div>
                    <div className="text-xs text-[#6B7280] mt-1">{movement.utente}</div>
                  </div>
                </div>

                {movement.ubicazione && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-[#F7F9FC] rounded-lg inline-flex">
                    <span className="text-xs text-[#6B7280]">Ubicazione:</span>
                    <span className="text-xs font-mono text-[#2D2D2D]">{movement.ubicazione}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center mt-6 pt-4 border-t border-[#E5EAF2]">
        <button className="px-4 py-2 text-sm text-[#17E88F] hover:bg-[#F0FDF7] rounded-lg transition-all font-medium">
          Carica Altri Movimenti
        </button>
      </div>
    </div>
  );
}
