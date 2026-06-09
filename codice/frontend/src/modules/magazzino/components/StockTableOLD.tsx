import { Search, Filter, Download, ArrowUpDown } from 'lucide-react';

interface StockItem {
  sku: string;
  prodotto: string;
  categoria: string;
  magazzino: string;
  ubicazione: string;
  quantita: number;
  scortaMinima: number;
  valoreStock: string;
  stato: 'Disponibile' | 'Scorta Bassa' | 'Critico';
  ultimoMovimento: string;
}

const stockData: StockItem[] = [
  { sku: 'PLT-EUR-001', prodotto: 'Pallet Standard EUR 1200x800', categoria: 'Pallet', magazzino: 'Mag. Principale', ubicazione: 'A-01-05', quantita: 450, scortaMinima: 200, valoreStock: '€ 5.625', stato: 'Disponibile', ultimoMovimento: '03/06 10:15' },
  { sku: 'SCT-OND-045', prodotto: 'Scatola Cartone Ondulato 40x30', categoria: 'Scatole', magazzino: 'Mag. Principale', ubicazione: 'A-02-12', quantita: 2500, scortaMinima: 1000, valoreStock: '€ 2.125', stato: 'Disponibile', ultimoMovimento: '03/06 10:08' },
  { sku: 'FLM-EST-012', prodotto: 'Film Estensibile Trasparente 50cm', categoria: 'Film', magazzino: 'Mag. Principale', ubicazione: 'B-01-08', quantita: 12, scortaMinima: 50, valoreStock: '€ 227', stato: 'Critico', ultimoMovimento: '03/06 09:52' },
  { sku: 'ETI-ADE-098', prodotto: 'Etichette Adesive A4 Bianche', categoria: 'Etichette', magazzino: 'Mag. Principale', ubicazione: 'A-03-04', quantita: 180, scortaMinima: 100, valoreStock: '€ 4.410', stato: 'Disponibile', ultimoMovimento: '03/06 09:47' },
  { sku: 'REG-PP-034', prodotto: 'Reggetta PP Automatica 12mm', categoria: 'Reggette', magazzino: 'Mag. Principale', ubicazione: 'B-02-15', quantita: 95, scortaMinima: 80, valoreStock: '€ 3.040', stato: 'Disponibile', ultimoMovimento: '03/06 09:33' },
  { sku: 'NST-AVA-056', prodotto: 'Nastro Adesivo Avana 50mm', categoria: 'Nastri', magazzino: 'Mag. Principale', ubicazione: 'A-01-18', quantita: 8, scortaMinima: 30, valoreStock: '€ 10', stato: 'Critico', ultimoMovimento: '03/06 09:28' },
  { sku: 'ANG-CRT-067', prodotto: 'Angolare Cartone Protezione 50x50', categoria: 'Protezione', magazzino: 'Mag. Principale', ubicazione: 'B-03-07', quantita: 850, scortaMinima: 500, valoreStock: '€ 383', stato: 'Disponibile', ultimoMovimento: '03/06 09:14' },
  { sku: 'BST-PLU-089', prodotto: 'Busta Pluriball 30x45cm', categoria: 'Protezione', magazzino: 'Mag. Principale', ubicazione: 'A-02-22', quantita: 1200, scortaMinima: 800, valoreStock: '€ 456', stato: 'Disponibile', ultimoMovimento: '03/06 09:05' },
  { sku: 'DIS-NST-023', prodotto: 'Dispenser Nastro Adesivo Manuale', categoria: 'Attrezzature', magazzino: 'Mag. Principale', ubicazione: 'REF-01-03', quantita: 45, scortaMinima: 20, valoreStock: '€ 675', stato: 'Disponibile', ultimoMovimento: '03/06 08:58' },
  { sku: 'SCT-FUS-078', prodotto: 'Scatola Fustellata 60x40x40', categoria: 'Scatole', magazzino: 'Mag. Principale', ubicazione: 'A-03-16', quantita: 580, scortaMinima: 300, valoreStock: '€ 1.160', stato: 'Disponibile', ultimoMovimento: '03/06 08:42' },
  { sku: 'FLM-STR-045', prodotto: 'Film Stretch Nero 23my', categoria: 'Film', magazzino: 'Mag. Principale', ubicazione: 'B-01-11', quantita: 68, scortaMinima: 60, valoreStock: '€ 1.360', stato: 'Scorta Bassa', ultimoMovimento: '03/06 08:35' },
  { sku: 'ETI-TRM-112', prodotto: 'Etichette Termiche 100x150mm', categoria: 'Etichette', magazzino: 'Mag. Principale', ubicazione: 'A-02-09', quantita: 45, scortaMinima: 100, valoreStock: '€ 2.025', stato: 'Scorta Bassa', ultimoMovimento: '03/06 08:21' },
  { sku: 'PLT-PLA-003', prodotto: 'Pallet in Plastica 1200x1000', categoria: 'Pallet', magazzino: 'Mag. Principale', ubicazione: 'SPED-01-02', quantita: 220, scortaMinima: 150, valoreStock: '€ 6.160', stato: 'Disponibile', ultimoMovimento: '03/06 08:09' },
  { sku: 'CRT-KRF-067', prodotto: 'Carta Kraft Bobina 70cm', categoria: 'Carta', magazzino: 'Mag. Principale', ubicazione: 'B-02-19', quantita: 85, scortaMinima: 50, valoreStock: '€ 1.275', stato: 'Disponibile', ultimoMovimento: '03/06 07:56' },
  { sku: 'ANG-EPS-089', prodotto: 'Angolare EPS Espanso L-Shape', categoria: 'Protezione', magazzino: 'Mag. Principale', ubicazione: 'A-01-14', quantita: 620, scortaMinima: 400, valoreStock: '€ 930', stato: 'Disponibile', ultimoMovimento: '03/06 07:43' },
];

const getStatoBadge = (stato: string) => {
  switch (stato) {
    case 'Disponibile':
      return { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', icon: '🟢' };
    case 'Scorta Bassa':
      return { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]', icon: '🟠' };
    case 'Critico':
      return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', icon: '🔴' };
    default:
      return { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', icon: '⚪' };
  }
};

export function StockTable() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[#2D2D2D]">Giacenze per Prodotto</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca SKU o prodotto..."
              className="w-64 h-9 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
            />
          </div>
          <button className="px-3 py-2 bg-[#F7F9FC] border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-white transition-all flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4" />
            Filtri
          </button>
          <button className="px-3 py-2 bg-[#17E88F] text-white rounded-lg hover:bg-[#0FA67A] transition-all flex items-center gap-2 text-sm font-medium">
            <Download className="w-4 h-4" />
            Esporta Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-[#E5EAF2]">
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  SKU
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  Prodotto
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  Categoria
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  Magazzino
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  Ubicazione
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
                  Scorta Min.
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  Valore Stock
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  Stato
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
                <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                  Ultimo Mov.
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {stockData.map((item, index) => {
              const badge = getStatoBadge(item.stato);
              return (
                <tr
                  key={item.sku}
                  className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                  }`}
                >
                  <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{item.sku}</td>
                  <td className="py-3 px-4 text-sm text-[#2D2D2D] font-medium">{item.prodotto}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#6366F1]">
                      {item.categoria}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{item.magazzino}</td>
                  <td className="py-3 px-4 text-sm text-[#2D2D2D] font-mono">{item.ubicazione}</td>
                  <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{item.quantita}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{item.scortaMinima}</td>
                  <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{item.valoreStock}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                      {badge.icon} {item.stato}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{item.ultimoMovimento}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E5EAF2]">
        <div className="text-sm text-[#6B7280]">
          Mostrando <span className="font-medium text-[#2D2D2D]">{stockData.length}</span> di{' '}
          <span className="font-medium text-[#2D2D2D]">{stockData.length}</span> prodotti
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all text-sm">
            Precedente
          </button>
          <button className="px-3 py-1.5 bg-[#17E88F] text-white rounded-lg font-medium text-sm">1</button>
          <button className="px-3 py-1.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all text-sm">
            2
          </button>
          <button className="px-3 py-1.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all text-sm">
            Successivo
          </button>
        </div>
      </div>
    </div>
  );
}
