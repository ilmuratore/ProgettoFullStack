import { useEffect, useState } from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { giacenzeApi } from "../../../api/giacenzeApi";
import { magazzinoApi } from "../../../api/magazzinoApi";
import type { Giacenza, Magazzino } from "../../../types/magazzino";

const getStatoBadge = (item: Giacenza) => {
  if (item.sotto_scorta) {
    return { bg: "bg-[#FEE2E2]", text: "text-[#EF4444]", icon: "🔴", label: "Critico" };
  }
  if (item.quantita <= item.scorta_minima * 1.2) {
    return { bg: "bg-[#FEF3C7]", text: "text-[#F59E0B]", icon: "🟠", label: "Scorta Bassa" };
  }
  return { bg: "bg-[#DCFCE7]", text: "text-[#22C55E]", icon: "🟢", label: "Disponibile" };
};

export function StockTable() {
  const [rows, setRows] = useState<Giacenza[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [magazzini, setMagazzini] = useState<Magazzino[]>([]);

  useEffect(() => {
    magazzinoApi.list().then(setMagazzini).catch(() => {});
  }, []);

  // FILTRI AVANZATI
  const [filters, setFilters] = useState({
    magazzino: "",
    categoria: "",
    ubicazione: "",
    scorta: "",
    q_min: "",
    q_max: "",
  });

  useEffect(() => {
    setLoading(true);

    const params: Record<string, any> = {
      search,
      ...filters,
    };

    // Rimuove parametri vuoti
    Object.keys(params).forEach((k) => {
      if (params[k] === "" || params[k] === null) delete params[k];
    });

    giacenzeApi
      .list(params)
      .then((res) => setRows(res))
      .finally(() => setLoading(false));
  }, [search, filters]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[#2D2D2D]">Giacenze per Prodotto</h3>

        <div className="flex items-center gap-3">
          {/* SEARCH */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca SKU o prodotto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 h-9 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
            />
          </div>

          {/* FILTRI */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 bg-[#F7F9FC] border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-white transition-all flex items-center gap-2 text-sm"
          >
            <Filter className="w-4 h-4" />
            Filtri
          </button>
        </div>
      </div>

      {/* FILTRI AVANZATI */}
      {showFilters && (
        <div className="mb-4 p-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg text-sm text-[#6B7280] space-y-4">

          {/* MAGAZZINO */}
          <div className="flex items-center gap-3">
            <label className="w-32 font-medium text-[#2D2D2D]">Magazzino</label>
            <select
              value={filters.magazzino}
              onChange={(e) => setFilters({ ...filters, magazzino: e.target.value })}
              className="h-9 px-3 bg-white border border-[#E5EAF2] rounded-lg"
            >
              <option value="">Tutti</option>
              {magazzini.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>

          {/* CATEGORIA */}
          <div className="flex items-center gap-3">
            <label className="w-32 font-medium text-[#2D2D2D]">Categoria</label>
            <input
              type="text"
              value={filters.categoria}
              onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
              className="h-9 px-3 bg-white border border-[#E5EAF2] rounded-lg"
              placeholder="Es. Alimentari"
            />
          </div>

          {/* UBICAZIONE */}
          <div className="flex items-center gap-3">
            <label className="w-32 font-medium text-[#2D2D2D]">Ubicazione</label>
            <input
              type="text"
              value={filters.ubicazione}
              onChange={(e) => setFilters({ ...filters, ubicazione: e.target.value })}
              className="h-9 px-3 bg-white border border-[#E5EAF2] rounded-lg"
              placeholder="Es. A-01-03"
            />
          </div>

          {/* SOTTO SCORTA */}
          <div className="flex items-center gap-3">
            <label className="w-32 font-medium text-[#2D2D2D]">Sotto Scorta</label>
            <input
              type="checkbox"
              checked={filters.scorta === "sotto"}
              onChange={(e) =>
                setFilters({ ...filters, scorta: e.target.checked ? "sotto" : "" })
              }
            />
          </div>

          {/* RANGE QUANTITÀ */}
          <div className="flex items-center gap-3">
            <label className="w-32 font-medium text-[#2D2D2D]">Quantità</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.q_min}
              onChange={(e) => setFilters({ ...filters, q_min: e.target.value })}
              className="h-9 w-24 px-3 bg-white border border-[#E5EAF2] rounded-lg"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.q_max}
              onChange={(e) => setFilters({ ...filters, q_max: e.target.value })}
              className="h-9 w-24 px-3 bg-white border border-[#E5EAF2] rounded-lg"
            />
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="py-10 text-center text-[#6B7280] text-sm">
          Caricamento giacenze…
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && rows.length === 0 && (
        <div className="py-10 text-center text-[#6B7280] text-sm">
          Nessuna giacenza trovata.
        </div>
      )}

      {/* TABLE */}
      {!loading && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-[#E5EAF2]">
                {[
                  "SKU",
                  "Prodotto",
                  "Categoria",
                  "Magazzino",
                  "Ubicazione",
                  "Quantità",
                  "Scorta Min.",
                  "Stato",
                  "Ultimo Mov."
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]"
                  >
                    <button className="flex items-center gap-2 hover:text-[#2D2D2D]">
                      {col}
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((item, index) => {
                const badge = getStatoBadge(item);

                return (
                  <tr
                    key={`${item.prodotto_id}-${item.ubicazione}`}
                    className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]"
                    }`}
                  >
                    <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{item.sku}</td>
                    <td className="py-3 px-4 text-sm text-[#2D2D2D] font-medium">{item.prodotto}</td>
                    <td className="py-3 px-4">
                      {item.categoria ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#6366F1]">
                          {item.categoria}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6B7280]">{item.magazzino}</td>
                    <td className="py-3 px-4 text-sm text-[#2D2D2D] font-mono">{item.ubicazione}</td>
                    <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{item.quantita}</td>
                    <td className="py-3 px-4 text-sm text-[#6B7280]">{item.scorta_minima}</td>

                    {/* STATO */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}
                      >
                        {badge.icon} {badge.label}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-sm text-[#6B7280]">
                      {item.ultimo_movimento || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* FOOTER */}
      {!loading && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E5EAF2]">
          <div className="text-sm text-[#6B7280]">
            Mostrando{" "}
            <span className="font-medium text-[#2D2D2D]">{rows.length}</span> risultati
          </div>
        </div>
      )}
    </div>
  );
}
