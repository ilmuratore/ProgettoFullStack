import { useEffect, useMemo, useState } from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { giacenzeApi } from "../../../api/giacenzeApi";
import { magazzinoApi } from "../../../api/magazzinoApi";
import { ordiniApi } from "../../../api/ordiniApi";
import type { Giacenza, Magazzino } from "../../../types/magazzino";
import type { DisponibilitaOrdineVendita } from "../../../types/ordini";

type Filters = {
  magazzino: string;
  categoria: string;
  ubicazione: string;
  scorta: string;
  q_min: string;
  q_max: string;
};

type ProductStockRow = {
  prodotto_id: Giacenza["prodotto_id"];
  sku: Giacenza["sku"];
  prodotto: Giacenza["prodotto"];
  attivo: Giacenza["attivo"];
  categoria: Giacenza["categoria"];
  quantita_totale: number;
  quantita_impegnata: number;
  quantita_disponibile: number;
  disponibilita_reale_loaded: boolean;
  scorta_minima: number;
  ubicazioni_count: number;
  ultimo_movimento?: Giacenza["ultimo_movimento"];
};

type ProductStockAggregation = ProductStockRow & {
  ubicazioni_set: Set<string>;
};

type SortDirection = "asc" | "desc";

type SortConfig<T extends string> = {
  key: T;
  direction: SortDirection;
};

type LocationSortKey =
  | "sku"
  | "prodotto"
  | "attivo"
  | "categoria"
  | "magazzino"
  | "ubicazione"
  | "quantita"
  | "scorta_minima"
  | "stato"
  | "ultimo_movimento";

type ProductSortKey =
  | "sku"
  | "prodotto"
  | "attivo"
  | "categoria"
  | "ubicazioni_count"
  | "quantita_totale"
  | "quantita_impegnata"
  | "quantita_disponibile"
  | "scorta_minima"
  | "stato"
  | "ultimo_movimento";

type SortableHeaderProps<T extends string> = {
  label: string;
  sortKey: T;
  sortConfig: SortConfig<T>;
  onSort: (key: T) => void;
};

const EMPTY_FILTERS: Filters = {
  magazzino: "",
  categoria: "",
  ubicazione: "",
  scorta: "",
  q_min: "",
  q_max: "",
};

const buildParams = (
  values: Record<string, string | null | undefined>,
): Record<string, string> => {
  return Object.entries(values).reduce<Record<string, string>>(
    (params, [key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params[key] = value;
      }

      return params;
    },
    {},
  );
};

const toNumber = (value: number | string | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getLatestMovement = (
  current?: Giacenza["ultimo_movimento"],
  next?: Giacenza["ultimo_movimento"],
) => {
  if (!next) return current;
  if (!current) return next;

  const currentTime = new Date(String(current)).getTime();
  const nextTime = new Date(String(next)).getTime();

  if (Number.isNaN(currentTime) || Number.isNaN(nextTime)) {
    return next;
  }

  return nextTime > currentTime ? next : current;
};

const getStatoBadge = (quantita: number, scortaMinima: number) => {
  if (quantita <= scortaMinima) {
    return {
      bg: "bg-[#FEE2E2]",
      text: "text-[#EF4444]",
      icon: "🔴",
      label: "Critico",
    };
  }

  if (quantita <= scortaMinima * 1.2) {
    return {
      bg: "bg-[#FEF3C7]",
      text: "text-[#F59E0B]",
      icon: "🟠",
      label: "Scorta Bassa",
    };
  }

  return {
    bg: "bg-[#DCFCE7]",
    text: "text-[#22C55E]",
    icon: "🟢",
    label: "Disponibile",
  };
};

const getStatoOrder = (quantita: number, scortaMinima: number) => {
  if (quantita <= scortaMinima) return 1;
  if (quantita <= scortaMinima * 1.2) return 2;
  return 3;
};

const getAttivoBadge = (attivo: boolean) =>
  attivo
    ? { bg: "bg-[#DCFCE7]", text: "text-[#22C55E]", label: "Attivo" }
    : { bg: "bg-[#FEE2E2]", text: "text-[#EF4444]", label: "Disattivato" };

const normalizeString = (value: unknown) => String(value ?? "").toLowerCase();

const compareString = (a: unknown, b: unknown) => {
  return normalizeString(a).localeCompare(normalizeString(b), "it", {
    numeric: true,
    sensitivity: "base",
  });
};

const compareDate = (a: unknown, b: unknown) => {
  const aTime = a ? new Date(String(a)).getTime() : 0;
  const bTime = b ? new Date(String(b)).getTime() : 0;
  const safeATime = Number.isNaN(aTime) ? 0 : aTime;
  const safeBTime = Number.isNaN(bTime) ? 0 : bTime;

  return safeATime - safeBTime;
};

const SortableHeader = <T extends string>({
  label,
  sortKey,
  sortConfig,
  onSort,
}: SortableHeaderProps<T>) => {
  const isActive = sortConfig.key === sortKey;
  const directionLabel = isActive
    ? sortConfig.direction === "asc"
      ? "↑"
      : "↓"
    : "";

  return (
    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-2 hover:text-[#2D2D2D] ${
          isActive ? "text-[#2D2D2D]" : ""
        }`}
        aria-sort={
          isActive
            ? sortConfig.direction === "asc"
              ? "ascending"
              : "descending"
            : "none"
        }
      >
        {label}
        <ArrowUpDown className="w-3 h-3" />
        {directionLabel && (
          <span className="text-xs font-semibold">{directionLabel}</span>
        )}
      </button>
    </th>
  );
};

const sortLocationRows = (
  rows: Giacenza[],
  sortConfig: SortConfig<LocationSortKey>,
) => {
  return [...rows].sort((a, b) => {
    let result = 0;

    switch (sortConfig.key) {
      case "quantita":
        result = toNumber(a.quantita) - toNumber(b.quantita);
        break;
      case "attivo":
        result = Number(a.attivo) - Number(b.attivo);
        break;
      case "scorta_minima":
        result = toNumber(a.scorta_minima) - toNumber(b.scorta_minima);
        break;
      case "stato":
        result =
          getStatoOrder(toNumber(a.quantita), toNumber(a.scorta_minima)) -
          getStatoOrder(toNumber(b.quantita), toNumber(b.scorta_minima));
        break;
      case "ultimo_movimento":
        result = compareDate(a.ultimo_movimento, b.ultimo_movimento);
        break;
      default:
        result = compareString(a[sortConfig.key], b[sortConfig.key]);
        break;
    }

    return sortConfig.direction === "asc" ? result : -result;
  });
};

const sortProductRows = (
  rows: ProductStockRow[],
  sortConfig: SortConfig<ProductSortKey>,
) => {
  return [...rows].sort((a, b) => {
    let result = 0;

    switch (sortConfig.key) {
      case "ubicazioni_count":
      case "quantita_totale":
      case "quantita_impegnata":
      case "quantita_disponibile":
      case "scorta_minima":
        result = a[sortConfig.key] - b[sortConfig.key];
        break;
      case "attivo":
        result = Number(a.attivo) - Number(b.attivo);
        break;
      case "stato":
        result =
          getStatoOrder(a.quantita_disponibile, a.scorta_minima) -
          getStatoOrder(b.quantita_disponibile, b.scorta_minima);
        break;
      case "ultimo_movimento":
        result = compareDate(a.ultimo_movimento, b.ultimo_movimento);
        break;
      default:
        result = compareString(a[sortConfig.key], b[sortConfig.key]);
        break;
    }

    return sortConfig.direction === "asc" ? result : -result;
  });
};

const getNextSortConfig = <T extends string>(
  current: SortConfig<T>,
  key: T,
): SortConfig<T> => {
  if (current.key !== key) {
    return { key, direction: "asc" };
  }

  return {
    key,
    direction: current.direction === "asc" ? "desc" : "asc",
  };
};

export function StockTable() {
  const [locationRows, setLocationRows] = useState<Giacenza[]>([]);
  const [productSourceRows, setProductSourceRows] = useState<Giacenza[]>([]);
  const [disponibilitaByProduct, setDisponibilitaByProduct] = useState<
    Record<number, DisponibilitaOrdineVendita>
  >({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [magazzini, setMagazzini] = useState<Magazzino[]>([]);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [locationSort, setLocationSort] = useState<SortConfig<LocationSortKey>>(
    {
      key: "sku",
      direction: "asc",
    },
  );
  const [productSort, setProductSort] = useState<SortConfig<ProductSortKey>>({
    key: "sku",
    direction: "asc",
  });

  useEffect(() => {
    magazzinoApi
      .list()
      .then(setMagazzini)
      .catch(() => setMagazzini([]));
  }, []);

  useEffect(() => {
    setLoading(true);

    const locationParams = buildParams({
      search,
      ...filters,
    });

    // Per la tabella prodotto non passo filtri di riga/ubicazione,
    // altrimenti il totale aggregato del prodotto risulterebbe falsato.
    const productParams = buildParams({
      search,
      magazzino: filters.magazzino,
      categoria: filters.categoria,
    });

    Promise.all([
      giacenzeApi.list(locationParams),
      giacenzeApi.list(productParams),
    ])
      .then(([locationRes, productRes]) => {
        setLocationRows(locationRes);
        setProductSourceRows(productRes);
      })
      .catch(() => {
        setLocationRows([]);
        setProductSourceRows([]);
      })
      .finally(() => setLoading(false));
  }, [search, filters]);

  const productRows = useMemo<ProductStockRow[]>(() => {
    const grouped = new Map<string, ProductStockAggregation>();

    productSourceRows.forEach((item) => {
      const productKey = String(item.prodotto_id ?? item.sku ?? item.prodotto);
      const quantita = toNumber(item.quantita);
      const scortaMinima = toNumber(item.scorta_minima);
      const locationKey = [item.magazzino, item.ubicazione]
        .filter(Boolean)
        .join(" / ");
      const existing = grouped.get(productKey);

      if (!existing) {
        grouped.set(productKey, {
          prodotto_id: item.prodotto_id,
          sku: item.sku,
          prodotto: item.prodotto,
          attivo: item.attivo,
          categoria: item.categoria,
          quantita_totale: quantita,
          quantita_impegnata: 0,
          quantita_disponibile: quantita,
          disponibilita_reale_loaded: false,
          scorta_minima: scortaMinima,
          ubicazioni_count: locationKey ? 1 : 0,
          ubicazioni_set: new Set(locationKey ? [locationKey] : []),
          ultimo_movimento: item.ultimo_movimento,
        });
        return;
      }

      existing.quantita_totale += quantita;
      existing.scorta_minima = Math.max(existing.scorta_minima, scortaMinima);
      existing.ultimo_movimento = getLatestMovement(
        existing.ultimo_movimento,
        item.ultimo_movimento,
      );

      if (locationKey) {
        existing.ubicazioni_set.add(locationKey);
        existing.ubicazioni_count = existing.ubicazioni_set.size;
      }
    });

    return Array.from(grouped.values()).map(
      ({ ubicazioni_set, ...item }) => item,
    );
  }, [productSourceRows]);

  useEffect(() => {
    const productIds = Array.from(
      new Set(
        productRows
          .map((item) => item.prodotto_id)
          .filter(
            (id): id is number => typeof id === "number" && Number.isFinite(id),
          ),
      ),
    );

    if (productIds.length === 0) {
      setDisponibilitaByProduct({});
      return;
    }

    let cancelled = false;

    Promise.allSettled(productIds.map((id) => ordiniApi.getDisponibilita(id)))
      .then((results) => {
        if (cancelled) return;

        const next: Record<number, DisponibilitaOrdineVendita> = {};

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            next[productIds[index]] = result.value;
          }
        });

        setDisponibilitaByProduct(next);
      })
      .catch(() => {
        if (!cancelled) setDisponibilitaByProduct({});
      });

    return () => {
      cancelled = true;
    };
  }, [productRows]);

  const productRowsWithAvailability = useMemo<ProductStockRow[]>(() => {
    return productRows.map((item) => {
      const disponibilita = item.prodotto_id
        ? disponibilitaByProduct[item.prodotto_id]
        : undefined;

      if (!disponibilita) {
        return item;
      }

      return {
        ...item,
        quantita_totale: toNumber(disponibilita.totale),
        quantita_impegnata: toNumber(disponibilita.impegnato),
        quantita_disponibile: toNumber(disponibilita.disponibile),
        disponibilita_reale_loaded: true,
      };
    });
  }, [productRows, disponibilitaByProduct]);

  const filteredProductRows = useMemo(() => {
    const qMin = filters.q_min !== "" ? toNumber(filters.q_min) : null;
    const qMax = filters.q_max !== "" ? toNumber(filters.q_max) : null;

    return productRowsWithAvailability.filter((item) => {
      if (
        filters.scorta === "sotto" &&
        item.quantita_disponibile > item.scorta_minima
      ) {
        return false;
      }

      if (qMin !== null && item.quantita_disponibile < qMin) {
        return false;
      }

      if (qMax !== null && item.quantita_disponibile > qMax) {
        return false;
      }

      return true;
    });
  }, [
    productRowsWithAvailability,
    filters.scorta,
    filters.q_min,
    filters.q_max,
  ]);

  const sortedLocationRows = useMemo(() => {
    return sortLocationRows(locationRows, locationSort);
  }, [locationRows, locationSort]);

  const sortedProductRows = useMemo(() => {
    return sortProductRows(filteredProductRows, productSort);
  }, [filteredProductRows, productSort]);

  const handleLocationSort = (key: LocationSortKey) => {
    setLocationSort((current) => getNextSortConfig(current, key));
  };

  const handleProductSort = (key: ProductSortKey) => {
    setProductSort((current) => getNextSortConfig(current, key));
  };

  const locationColumns: Array<{ label: string; key: LocationSortKey }> = [
    { label: "SKU", key: "sku" },
    { label: "Prodotto", key: "prodotto" },
    { label: "Stato Prodotto", key: "attivo" },
    { label: "Categoria", key: "categoria" },
    { label: "Magazzino", key: "magazzino" },
    { label: "Ubicazione", key: "ubicazione" },
    { label: "Quantità", key: "quantita" },
    { label: "Scorta Min.", key: "scorta_minima" },
    { label: "Stato", key: "stato" },
    { label: "Ultimo Mov.", key: "ultimo_movimento" },
  ];

  const productColumns: Array<{ label: string; key: ProductSortKey }> = [
    { label: "SKU", key: "sku" },
    { label: "Prodotto", key: "prodotto" },
    { label: "Stato Prodotto", key: "attivo" },
    { label: "Categoria", key: "categoria" },
    { label: "Ubicazioni", key: "ubicazioni_count" },
    { label: "Giacenza Totale", key: "quantita_totale" },
    { label: "Impegnato", key: "quantita_impegnata" },
    { label: "Disponibile Reale", key: "quantita_disponibile" },
    { label: "Scorta Min.", key: "scorta_minima" },
    { label: "Stato", key: "stato" },
    { label: "Ultimo Mov.", key: "ultimo_movimento" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-[#2D2D2D]">
              Ricerca e filtri giacenze
            </h3>
            <p className="text-sm text-[#6B7280] mt-1">
              Ricerca e filtri sono condivisi tra le due viste.
            </p>
          </div>

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
              type="button"
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
          <div className="mt-4 p-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-lg text-sm text-[#6B7280] space-y-4">
            {/* MAGAZZINO */}
            <div className="flex items-center gap-3">
              <label className="w-32 font-medium text-[#2D2D2D]">
                Magazzino
              </label>
              <select
                value={filters.magazzino}
                onChange={(e) =>
                  setFilters({ ...filters, magazzino: e.target.value })
                }
                className="h-9 px-3 bg-white border border-[#E5EAF2] rounded-lg"
              >
                <option value="">Tutti</option>
                {magazzini.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORIA */}
            <div className="flex items-center gap-3">
              <label className="w-32 font-medium text-[#2D2D2D]">
                Categoria
              </label>
              <input
                type="text"
                value={filters.categoria}
                onChange={(e) =>
                  setFilters({ ...filters, categoria: e.target.value })
                }
                className="h-9 px-3 bg-white border border-[#E5EAF2] rounded-lg"
                placeholder="Es. Alimentari"
              />
            </div>

            {/* UBICAZIONE */}
            <div className="flex items-center gap-3">
              <label className="w-32 font-medium text-[#2D2D2D]">
                Ubicazione
              </label>
              <input
                type="text"
                value={filters.ubicazione}
                onChange={(e) =>
                  setFilters({ ...filters, ubicazione: e.target.value })
                }
                className="h-9 px-3 bg-white border border-[#E5EAF2] rounded-lg"
                placeholder="Es. A-01-03"
              />
            </div>

            {/* SOTTO SCORTA */}
            <div className="flex items-center gap-3">
              <label className="w-32 font-medium text-[#2D2D2D]">
                Sotto Scorta
              </label>
              <input
                type="checkbox"
                checked={filters.scorta === "sotto"}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    scorta: e.target.checked ? "sotto" : "",
                  })
                }
              />
            </div>

            {/* RANGE QUANTITÀ */}
            <div className="flex items-center gap-3">
              <label className="w-32 font-medium text-[#2D2D2D]">
                Quantità
              </label>
              <input
                type="number"
                placeholder="Min"
                value={filters.q_min}
                onChange={(e) =>
                  setFilters({ ...filters, q_min: e.target.value })
                }
                className="h-9 w-24 px-3 bg-white border border-[#E5EAF2] rounded-lg"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.q_max}
                onChange={(e) =>
                  setFilters({ ...filters, q_max: e.target.value })
                }
                className="h-9 w-24 px-3 bg-white border border-[#E5EAF2] rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-[#2D2D2D]">
            Giacenze per Ubicazione
          </h3>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="py-10 text-center text-[#6B7280] text-sm">
            Caricamento giacenze…
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && sortedLocationRows.length === 0 && (
          <div className="py-10 text-center text-[#6B7280] text-sm">
            Nessuna giacenza trovata.
          </div>
        )}

        {/* TABLE UBICAZIONI */}
        {!loading && sortedLocationRows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-[#E5EAF2]">
                  {locationColumns.map((col) => (
                    <SortableHeader
                      key={col.key}
                      label={col.label}
                      sortKey={col.key}
                      sortConfig={locationSort}
                      onSort={handleLocationSort}
                    />
                  ))}
                </tr>
              </thead>

              <tbody>
                {sortedLocationRows.map((item, index) => {
                  const quantita = toNumber(item.quantita);
                  const scortaMinima = toNumber(item.scorta_minima);
                  const badge = getStatoBadge(quantita, scortaMinima);
                  const attivoBadge = getAttivoBadge(item.attivo);

                  return (
                    <tr
                      key={`${item.prodotto_id}-${item.magazzino}-${item.ubicazione}`}
                      className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]"
                      }`}
                    >
                      <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#2D2D2D] font-medium">
                        {item.prodotto}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${attivoBadge.bg} ${attivoBadge.text}`}
                        >
                          {attivoBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.categoria ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#6366F1]">
                            {item.categoria}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#6B7280]">
                        {item.magazzino}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#2D2D2D] font-mono">
                        {item.ubicazione}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">
                        {quantita}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#6B7280]">
                        {scortaMinima}
                      </td>
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
              <span className="font-medium text-[#2D2D2D]">
                {sortedLocationRows.length}
              </span>{" "}
              risultati
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-[#2D2D2D]">
            Giacenze per Prodotto
          </h3>

          <div className="text-sm text-[#6B7280]">
            Disponibile reale = giacenza totale - quantità impegnata su ordini
            non evasi
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="py-10 text-center text-[#6B7280] text-sm">
            Caricamento giacenze…
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && sortedProductRows.length === 0 && (
          <div className="py-10 text-center text-[#6B7280] text-sm">
            Nessuna giacenza trovata.
          </div>
        )}

        {/* TABLE PRODOTTI */}
        {!loading && sortedProductRows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-[#E5EAF2]">
                  {productColumns.map((col) => (
                    <SortableHeader
                      key={col.key}
                      label={col.label}
                      sortKey={col.key}
                      sortConfig={productSort}
                      onSort={handleProductSort}
                    />
                  ))}
                </tr>
              </thead>

              <tbody>
                {sortedProductRows.map((item, index) => {
                  const badge = getStatoBadge(
                    item.quantita_disponibile,
                    item.scorta_minima,
                  );
                  const attivoBadge = getAttivoBadge(item.attivo);

                  return (
                    <tr
                      key={String(
                        item.prodotto_id ?? item.sku ?? item.prodotto,
                      )}
                      className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]"
                      }`}
                    >
                      <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#2D2D2D] font-medium">
                        {item.prodotto}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${attivoBadge.bg} ${attivoBadge.text}`}
                        >
                          {attivoBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.categoria ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#6366F1]">
                            {item.categoria}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#6B7280]">
                        {item.ubicazioni_count}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">
                        {item.quantita_totale}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#F59E0B] font-medium">
                        {item.disponibilita_reale_loaded
                          ? item.quantita_impegnata
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#22C55E] font-semibold">
                        {item.disponibilita_reale_loaded
                          ? item.quantita_disponibile
                          : item.quantita_totale}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#6B7280]">
                        {item.scorta_minima}
                      </td>
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
              <span className="font-medium text-[#2D2D2D]">
                {sortedProductRows.length}
              </span>{" "}
              prodotti
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
