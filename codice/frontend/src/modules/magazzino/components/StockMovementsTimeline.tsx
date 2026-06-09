import { useEffect, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightCircle,
  Plus,
  Minus,
  RotateCcw,
  Clock,
} from "lucide-react";
import { movimentiStockApi } from "../../../api/movimentiStockApi";
import type { MovimentoStock } from "../../../types/magazzino";

// Mappa ENUM backend → label UI
const mapTipo: Record<string, string> = {
  CARICO_ACQUISTO: "Carico Acquisto",
  SCARICO_VENDITA: "Scarico Vendita",
  SPOSTAMENTO: "Trasferimento",
  RETTIFICA_POSITIVA: "Rettifica Positiva",
  RETTIFICA_NEGATIVA: "Rettifica Negativa",
  RESO: "Reso",
};

// Icone e colori per ogni tipo
const getMovementIcon = (label: string) => {
  switch (label) {
    case "Carico Acquisto":
      return { icon: ArrowDownCircle, color: "text-[#22C55E]", bg: "bg-[#DCFCE7]" };
    case "Scarico Vendita":
      return { icon: ArrowUpCircle, color: "text-[#EF4444]", bg: "bg-[#FEE2E2]" };
    case "Trasferimento":
      return { icon: ArrowRightCircle, color: "text-[#3B82F6]", bg: "bg-[#DBEAFE]" };
    case "Rettifica Positiva":
      return { icon: Plus, color: "text-[#F59E0B]", bg: "bg-[#FEF3C7]" };
    case "Rettifica Negativa":
      return { icon: Minus, color: "text-[#F59E0B]", bg: "bg-[#FEF3C7]" };
    case "Reso":
      return { icon: RotateCcw, color: "text-[#8B5CF6]", bg: "bg-[#EDE9FE]" };
    default:
      return { icon: ArrowRightCircle, color: "text-[#6B7280]", bg: "bg-[#F3F4F6]" };
  }
};

// Quantità con segno
const formatQuantita = (tipo: string, quantita: number) => {
  if (tipo === "SCARICO_VENDITA" || tipo === "RETTIFICA_NEGATIVA") return `-${quantita}`;
  return `+${quantita}`;
};

// Ora formattata
const formatOra = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
};

export function StockMovementsTimeline({ refreshTrigger }: { refreshTrigger?: number }) {
  const [movements, setMovements] = useState<
    {
      id: number;
      tipo: string;
      prodotto: string;
      sku: string;
      quantita: string;
      ora: string;
      utente: string;
      ubicazione?: string | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Funzione centralizzata per caricare i movimenti
  const loadMovimenti = async () => {
    setLoading(true);

    const data: MovimentoStock[] = await movimentiStockApi.list();

    const mapped = data.map((m) => {
      const tipoLabel = mapTipo[m.tipo] ?? m.tipo;

      return {
        id: m.id,
        tipo: tipoLabel,
        prodotto: m.prodotto,
        sku: m.sku,
        quantita: formatQuantita(m.tipo, m.quantita),
        ora: formatOra(m.created_at),
        utente: m.utente ?? "Sistema",
        ubicazione: m.ubicazione,
      };
    });

    setMovements(mapped);
    setLoading(false);
  };

  // Caricamento iniziale
  useEffect(() => {
    loadMovimenti();
  }, []);

  // Refresh automatico dopo creazione movimento
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadMovimenti();
    }
  }, [refreshTrigger]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      {/* HEADER */}
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

      {/* LOADING */}
      {loading && (
        <div className="py-10 text-center text-[#6B7280] text-sm">Caricamento movimenti…</div>
      )}

      {/* EMPTY */}
      {!loading && movements.length === 0 && (
        <div className="py-10 text-center text-[#6B7280] text-sm">Nessun movimento trovato.</div>
      )}

      {/* TIMELINE */}
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

              <div
                className={`w-12 h-12 ${iconConfig.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform z-10`}
              >
                <Icon className={`w-6 h-6 ${iconConfig.color}`} />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[#2D2D2D]">{movement.tipo}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          movement.quantita.startsWith("+")
                            ? "bg-[#DCFCE7] text-[#22C55E]"
                            : "bg-[#FEE2E2] text-[#EF4444]"
                        }`}
                      >
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

      {/* FOOTER */}
      {!loading && (
        <div className="flex items-center justify-center mt-6 pt-4 border-t border-[#E5EAF2]">
          <button
            onClick={loadMovimenti}
            className="px-4 py-2 text-sm text-[#17E88F] hover:bg-[#F0FDF7] rounded-lg transition-all font-medium"
          >
            Carica Altri Movimenti
          </button>
        </div>
      )}
    </div>
  );
}
