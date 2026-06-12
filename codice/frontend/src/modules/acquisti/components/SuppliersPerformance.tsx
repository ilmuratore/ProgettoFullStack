import { useEffect, useState } from 'react';
import { acquistiApi } from '../../../api/acquistiApi';
import { fornitoriApi } from '../../../api/fornitoriApi';
import type { OrdineAcquistoLista } from '../../../types/acquisti';
import type { Fornitore } from '../../../types/fornitori';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

type Stato = 'Eccellente' | 'Buono' | 'Da Migliorare';

interface SupplierRow {
  id: number;
  ragioneSociale: string;
  leadTimeMedio: number | null;
  ordiniTotali: number;
  ordiniCompletati: number;
  ordiniInRitardo: number;
  importoAcquisti: number;
  stato: Stato;
}

const getStatoBadge = (stato: Stato) => {
  switch (stato) {
    case 'Eccellente':
      return { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]' };
    case 'Buono':
      return { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]' };
    case 'Da Migliorare':
      return { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]' };
  }
};

const computeStato = (completionRate: number, ordiniInRitardo: number): Stato => {
  if (ordiniInRitardo === 0 && completionRate >= 90) return 'Eccellente';
  if (ordiniInRitardo <= 1 && completionRate >= 70) return 'Buono';
  return 'Da Migliorare';
};

const normalizeDateOnly = (value: string) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayLocalDateOnly = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function SuppliersPerformance() {
  const [suppliers, setSuppliers] = useState<SupplierRow[] | null>(null);

  useEffect(() => {
    Promise.all([acquistiApi.list(), fornitoriApi.list()])
      .then(([ordini, fornitori]: [OrdineAcquistoLista[], Fornitore[]]) => {
        const oggi = getTodayLocalDateOnly();
        const rows = fornitori
          .map((f) => {
            const ordiniFornitore = ordini.filter((o) => o.fornitore_id === f.id);
            const ordiniCompletati = ordiniFornitore.filter((o) => o.stato === 'COMPLETATO').length;
            const ordiniInRitardo = ordiniFornitore.filter((o) =>
              o.stato !== 'ANNULLATO' && o.stato !== 'COMPLETATO' && o.data_prevista && normalizeDateOnly(o.data_prevista) < oggi
            ).length;
            const importoAcquisti = ordiniFornitore
              .filter((o) => o.stato === 'CONFERMATO')
              .reduce((sum, o) => sum + Number(o.importo_totale ?? 0), 0);
            const completionRate = ordiniFornitore.length ? (ordiniCompletati / ordiniFornitore.length) * 100 : 0;

            return {
              id: f.id,
              ragioneSociale: f.ragione_sociale,
              leadTimeMedio: f.lead_time_giorni,
              ordiniTotali: ordiniFornitore.length,
              ordiniCompletati,
              ordiniInRitardo,
              importoAcquisti,
              stato: computeStato(completionRate, ordiniInRitardo),
            };
          })
          .filter((s) => s.ordiniTotali > 0)
          .sort((a, b) => b.importoAcquisti - a.importoAcquisti);

        setSuppliers(rows);
      })
      .catch(() => setSuppliers([]));
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[#2D2D2D]">Performance Fornitori</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5EAF2]">
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Ragione Sociale</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Lead Time Medio</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Ordini Totali</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Completati</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">In Ritardo</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Importo Acquisti</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Stato</th>
            </tr>
          </thead>
          <tbody>
            {suppliers === null ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-[#6B7280]">Caricamento…</td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-[#6B7280]">Nessun ordine di acquisto registrato</td></tr>
            ) : suppliers.map((supplier, index) => {
              const badge = getStatoBadge(supplier.stato);
              const completionRate = supplier.ordiniTotali ? (supplier.ordiniCompletati / supplier.ordiniTotali) * 100 : 0;

              return (
                <tr
                  key={supplier.id}
                  className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                  }`}
                >
                  <td className="py-3 px-4 text-sm text-[#2D2D2D] font-medium">{supplier.ragioneSociale}</td>
                  <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{supplier.leadTimeMedio != null ? `${supplier.leadTimeMedio} gg` : '—'}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280]">{supplier.ordiniTotali}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#22C55E]">{supplier.ordiniCompletati}</span>
                      <span className="text-xs text-[#6B7280]">({completionRate.toFixed(0)}%)</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {supplier.ordiniInRitardo > 0 ? (
                      <span className="text-sm font-medium text-[#EF4444]">{supplier.ordiniInRitardo}</span>
                    ) : (
                      <span className="text-sm text-[#6B7280]">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{formatCurrency(supplier.importoAcquisti)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                      {supplier.stato}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {suppliers !== null && suppliers.length > 0 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E5EAF2]">
          <div className="text-sm text-[#6B7280]">
            Mostrando <span className="font-medium text-[#2D2D2D]">{suppliers.length}</span> fornitori
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-[#22C55E] rounded-full" />
              <span className="text-[#6B7280]">Eccellente</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-[#3B82F6] rounded-full" />
              <span className="text-[#6B7280]">Buono</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-[#F59E0B] rounded-full" />
              <span className="text-[#6B7280]">Da Migliorare</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
