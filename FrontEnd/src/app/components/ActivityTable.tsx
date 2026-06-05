import { Search, ArrowUpDown } from 'lucide-react';

const movements = [
  { id: 1, prodotto: 'Pallet Standard EUR 1200x800', sku: 'PLT-EUR-001', tipo: 'Entrata Stock', quantita: '+150', operatore: 'Giovanni Bianchi', data: '03/06/2026 10:15' },
  { id: 2, prodotto: 'Scatola Cartone Ondulato 40x30x30', sku: 'SCT-OND-045', tipo: 'Uscita Stock', quantita: '-500', operatore: 'Laura Verdi', data: '03/06/2026 10:08' },
  { id: 3, prodotto: 'Film Estensibile Trasparente 50cm', sku: 'FLM-EST-012', tipo: 'Entrata Stock', quantita: '+80', operatore: 'Marco Ferrari', data: '03/06/2026 09:52' },
  { id: 4, prodotto: 'Etichette Adesive A4 Bianche', sku: 'ETI-ADE-098', tipo: 'Rettifica', quantita: '+25', operatore: 'Sofia Romano', data: '03/06/2026 09:47' },
  { id: 5, prodotto: 'Reggetta PP Automatica 12mm', sku: 'REG-PP-034', tipo: 'Trasferimento', quantita: '200', operatore: 'Andrea Ricci', data: '03/06/2026 09:33' },
  { id: 6, prodotto: 'Nastro Adesivo Avana 50mm', sku: 'NST-AVA-056', tipo: 'Uscita Stock', quantita: '-120', operatore: 'Chiara Colombo', data: '03/06/2026 09:28' },
  { id: 7, prodotto: 'Angolare Cartone Protezione 50x50', sku: 'ANG-CRT-067', tipo: 'Entrata Stock', quantita: '+300', operatore: 'Francesco Marino', data: '03/06/2026 09:14' },
  { id: 8, prodotto: 'Busta Pluriball 30x45cm', sku: 'BST-PLU-089', tipo: 'Uscita Stock', quantita: '-200', operatore: 'Elena Greco', data: '03/06/2026 09:05' },
  { id: 9, prodotto: 'Dispenser Nastro Adesivo Manuale', sku: 'DIS-NST-023', tipo: 'Rettifica', quantita: '-5', operatore: 'Luca Bruno', data: '03/06/2026 08:58' },
  { id: 10, prodotto: 'Scatola Fustellata 60x40x40', sku: 'SCT-FUS-078', tipo: 'Entrata Stock', quantita: '+250', operatore: 'Giulia Gallo', data: '03/06/2026 08:42' },
  { id: 11, prodotto: 'Film Stretch Nero 23my', sku: 'FLM-STR-045', tipo: 'Trasferimento', quantita: '150', operatore: 'Roberto Costa', data: '03/06/2026 08:35' },
  { id: 12, prodotto: 'Etichette Termiche 100x150mm', sku: 'ETI-TRM-112', tipo: 'Uscita Stock', quantita: '-1000', operatore: 'Anna Fontana', data: '03/06/2026 08:21' },
  { id: 13, prodotto: 'Pallet in Plastica 1200x1000', sku: 'PLT-PLA-003', tipo: 'Entrata Stock', quantita: '+75', operatore: 'Davide Russo', data: '03/06/2026 08:09' },
  { id: 14, prodotto: 'Carta Kraft Bobina 70cm', sku: 'CRT-KRF-067', tipo: 'Uscita Stock', quantita: '-40', operatore: 'Sara Ferrara', data: '03/06/2026 07:56' },
  { id: 15, prodotto: 'Angolare EPS Espanso L-Shape', sku: 'ANG-EPS-089', tipo: 'Rettifica', quantita: '+100', operatore: 'Paolo Conti', data: '03/06/2026 07:43' },
  { id: 16, prodotto: 'Reggetta PET Verde 15mm', sku: 'REG-PET-045', tipo: 'Entrata Stock', quantita: '+200', operatore: 'Martina Longo', data: '03/06/2026 07:28' },
  { id: 17, prodotto: 'Film Pluriball 100cm Rotolo', sku: 'FLM-PLU-123', tipo: 'Trasferimento', quantita: '60', operatore: 'Simone Gatti', data: '03/06/2026 07:15' },
  { id: 18, prodotto: 'Scatola Americana 50x30x30', sku: 'SCT-AME-034', tipo: 'Uscita Stock', quantita: '-400', operatore: 'Valentina Mancini', data: '03/06/2026 07:02' },
  { id: 19, prodotto: 'Nastro PPL Trasparente 48mm', sku: 'NST-PPL-056', tipo: 'Entrata Stock', quantita: '+180', operatore: 'Matteo Villa', data: '03/06/2026 06:48' },
  { id: 20, prodotto: 'Etichette Fragile 100x100mm', sku: 'ETI-FRG-078', tipo: 'Uscita Stock', quantita: '-350', operatore: 'Alessia Lombardi', data: '03/06/2026 06:35' },
];

const getBadgeColor = (tipo: string) => {
  switch (tipo) {
    case 'Entrata Stock':
      return 'bg-[#DCFCE7] text-[#22C55E]';
    case 'Uscita Stock':
      return 'bg-[#FEE2E2] text-[#EF4444]';
    case 'Rettifica':
      return 'bg-[#FEF3C7] text-[#F59E0B]';
    case 'Trasferimento':
      return 'bg-[#DBEAFE] text-[#3B82F6]';
    default:
      return 'bg-[#F3F4F6] text-[#6B7280]';
  }
};

export function ActivityTable() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[#2D2D2D]">Ultimi Movimenti di Magazzino</h3>
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca movimento..."
            className="w-64 h-9 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  Prodotto
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  Codice SKU
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  Tipo Movimento
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  Quantità
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  Operatore
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  Data e Ora
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement, index) => (
              <tr
                key={movement.id}
                className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                }`}
              >
                <td className="py-3 px-4 text-sm text-[#2D2D2D]">{movement.prodotto}</td>
                <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{movement.sku}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getBadgeColor(movement.tipo)}`}>
                    {movement.tipo}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{movement.quantita}</td>
                <td className="py-3 px-4 text-sm text-[#6B7280]">{movement.operatore}</td>
                <td className="py-3 px-4 text-sm text-[#6B7280]">{movement.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
