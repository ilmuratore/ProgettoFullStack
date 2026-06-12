import { useState } from 'react';
import { Search, Filter, Eye, FileText } from 'lucide-react';
import { SortableHeader } from '../../../components/shared/SortableHeader';
import { applySort, compareNumber, compareText, toggleSort, type SortConfig } from '../../../utils/sorting';

interface InvoicesTableProps {
  onInvoiceClick: (id: string) => void;
}

interface InvoiceRow {
  id: string;
  tipo: string;
  soggetto: string;
  dataEmissione: string;
  dataScadenza: string;
  importo: string;
  stato: string;
  pagamento: string;
  responsabile: string;
}

type SortKey = 'id' | 'tipo' | 'soggetto' | 'dataEmissione' | 'dataScadenza' | 'importo' | 'stato' | 'pagamento' | 'responsabile';

const parseDataBreve = (value: string): number => {
  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day).getTime();
};

const parseImporto = (value: string): number =>
  Number(value.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;

const compareInvoicesByKey = (left: InvoiceRow, right: InvoiceRow, key: SortKey) => {
  switch (key) {
    case 'id': return compareText(left.id, right.id);
    case 'tipo': return compareText(left.tipo, right.tipo);
    case 'soggetto': return compareText(left.soggetto, right.soggetto);
    case 'dataEmissione': return compareNumber(parseDataBreve(left.dataEmissione), parseDataBreve(right.dataEmissione));
    case 'dataScadenza': return compareNumber(parseDataBreve(left.dataScadenza), parseDataBreve(right.dataScadenza));
    case 'importo': return compareNumber(parseImporto(left.importo), parseImporto(right.importo));
    case 'stato': return compareText(left.stato, right.stato);
    case 'pagamento': return compareText(left.pagamento, right.pagamento);
    case 'responsabile': return compareText(left.responsabile, right.responsabile);
    default: return 0;
  }
};

const invoices: InvoiceRow[] = [
  { id: 'FT-2026-0842', tipo: 'ATTIVA', soggetto: 'Ferrero S.p.A.', dataEmissione: '01/06/2026', dataScadenza: '01/07/2026', importo: '€ 24.850,00', stato: 'DA_INCASSARE', pagamento: 'Bonifico', responsabile: 'Maria Rossi' },
  { id: 'FT-2026-0841', tipo: 'PASSIVA', soggetto: 'Packaging Solutions', dataEmissione: '28/05/2026', dataScadenza: '28/06/2026', importo: '€ 8.420,00', stato: 'PAGATA', pagamento: 'Bonifico', responsabile: 'Luca Bianchi' },
  { id: 'NC-2026-0124', tipo: 'NOTA_CREDITO', soggetto: 'Barilla Group', dataEmissione: '30/05/2026', dataScadenza: '-', importo: '€ 1.200,00', stato: 'PAGATA', pagamento: 'Storno', responsabile: 'Anna Verdi' },
  { id: 'FT-2026-0840', tipo: 'ATTIVA', soggetto: 'Lavazza S.p.A.', dataEmissione: '25/05/2026', dataScadenza: '25/05/2026', importo: '€ 18.500,00', stato: 'SCADUTA', pagamento: 'RiBa', responsabile: 'Maria Rossi' },
  { id: 'FT-2026-0839', tipo: 'PASSIVA', soggetto: 'Trasporti Rossi', dataEmissione: '20/05/2026', dataScadenza: '20/06/2026', importo: '€ 4.200,00', stato: 'PARZIALE', pagamento: 'Bonifico', responsabile: 'Luca Bianchi' },
  { id: 'FT-2026-0838', tipo: 'ATTIVA', soggetto: 'Mutti S.p.A.', dataEmissione: '15/05/2026', dataScadenza: '15/06/2026', importo: '€ 32.800,00', stato: 'DA_INCASSARE', pagamento: 'Bonifico', responsabile: 'Maria Rossi' },
  { id: 'FT-2026-0837', tipo: 'PASSIVA', soggetto: 'Energia Italia', dataEmissione: '10/05/2026', dataScadenza: '10/06/2026', importo: '€ 2.840,00', stato: 'PAGATA', pagamento: 'SDD', responsabile: 'Anna Verdi' },
];

const getTipoBadge = (tipo: string) => {
  const styles = {
    ATTIVA: 'bg-[#DBEAFE] text-[#3B82F6] border-[#BFDBFE]',
    PASSIVA: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
    NOTA_CREDITO: 'bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]',
    NOTA_DEBITO: 'bg-[#FECACA] text-[#EF4444] border-[#FCA5A5]',
  };
  const labels = {
    ATTIVA: 'Fattura Attiva',
    PASSIVA: 'Fattura Passiva',
    NOTA_CREDITO: 'Nota Credito',
    NOTA_DEBITO: 'Nota Debito',
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${styles[tipo as keyof typeof styles]}`}>
      {labels[tipo as keyof typeof labels]}
    </span>
  );
};

const getStatoBadge = (stato: string) => {
  const styles = {
    DA_INCASSARE: 'bg-[#DBEAFE] text-[#3B82F6] border-[#BFDBFE]',
    PARZIALE: 'bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]',
    PAGATA: 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]',
    SCADUTA: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
    ANNULLATA: 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]',
  };
  const labels = {
    DA_INCASSARE: 'Da Incassare',
    PARZIALE: 'Parzialmente Pagata',
    PAGATA: 'Pagata',
    SCADUTA: 'Scaduta',
    ANNULLATA: 'Annullata',
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${styles[stato as keyof typeof styles]}`}>
      {labels[stato as keyof typeof labels]}
    </span>
  );
};

export function InvoicesTable({ onInvoiceClick }: InvoicesTableProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortConfig<SortKey> | null>(null);

  const handleSort = (key: SortKey) => setSort((prev) => toggleSort(prev, key));

  const filtered = applySort(
    invoices.filter((invoice) => {
      const term = search.toLowerCase();
      return (
        invoice.id.toLowerCase().includes(term) ||
        invoice.soggetto.toLowerCase().includes(term)
      );
    }),
    sort,
    compareInvoicesByKey
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[#2D2D2D]">Gestione Fatture</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca documento o soggetto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 w-64"
            />
          </div>
          <button className="h-9 px-3 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl hover:bg-white transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#6B7280]" />
            <span className="text-sm text-[#6B7280]">Filtri</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              <SortableHeader label="Numero Documento" sortKey="id" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Tipo" sortKey="tipo" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Cliente / Fornitore" sortKey="soggetto" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Data Emissione" sortKey="dataEmissione" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Data Scadenza" sortKey="dataScadenza" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Importo" sortKey="importo" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Stato" sortKey="stato" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Metodo Pagamento" sortKey="pagamento" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <SortableHeader label="Responsabile" sortKey="responsabile" sort={sort} onSort={handleSort} thClassName="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]" />
              <th className="text-left py-3 px-3 text-xs font-medium text-[#9CA3AF]">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                onClick={() => onInvoiceClick(invoice.id)}
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#3B82F6]" />
                    <span className="text-sm font-medium text-[#2D2D2D]">{invoice.id}</span>
                  </div>
                </td>
                <td className="py-3 px-3">{getTipoBadge(invoice.tipo)}</td>
                <td className="py-3 px-3">
                  <span className="text-sm text-[#2D2D2D]">{invoice.soggetto}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-sm text-[#6B7280]">{invoice.dataEmissione}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-sm text-[#6B7280]">{invoice.dataScadenza}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-sm font-medium text-[#2D2D2D]">{invoice.importo}</span>
                </td>
                <td className="py-3 px-3">{getStatoBadge(invoice.stato)}</td>
                <td className="py-3 px-3">
                  <span className="text-sm text-[#6B7280]">{invoice.pagamento}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-sm text-[#6B7280]">{invoice.responsabile}</span>
                </td>
                <td className="py-3 px-3">
                  <button className="p-1.5 hover:bg-[#F7F9FC] rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-[#6B7280]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
