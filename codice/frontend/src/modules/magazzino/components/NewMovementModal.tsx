import { useEffect, useState } from "react";
import { X, Package, MapPin, Hash, FileText } from "lucide-react";

import { movimentiStockApi } from "../../../api/movimentiStockApi";
import { prodottiApi } from "../../../api/prodottiApi";
import { magazzinoApi } from "../../../api/magazzinoApi";

import type { MovimentoStockCreateRequest } from "../../../types/magazzino";

interface NewMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function NewMovementModal({ isOpen, onClose, onCreated }: NewMovementModalProps) {
  const [prodotti, setProdotti] = useState<any[]>([]);
  const [ubicazioni, setUbicazioni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    prodotto_id: "",
    origine: "",
    destinazione: "",
    quantita: "",
    note: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);

    Promise.all([
      prodottiApi.list(),
      magazzinoApi.listUbicazioni()
    ])
      .then(([prodottiRes, ubicazioniRes]) => {
        setProdotti(prodottiRes);
        setUbicazioni(ubicazioniRes);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!form.prodotto_id || !form.origine || !form.destinazione || !form.quantita) {
      alert("Compila tutti i campi obbligatori.");
      return;
    }

    const body: MovimentoStockCreateRequest = {
      prodotto_id: Number(form.prodotto_id),
      quantita: Number(form.quantita),
      movimento_tipo: "SPOSTAMENTO",
      ubicazione_da_id: Number(form.origine),
      ubicazione_a_id: Number(form.destinazione),
      riferimento: form.note || null,
      note: form.note || null,
    };

    await movimentiStockApi.create(body);

    onClose();
    onCreated?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in duration-200">

        <div className="flex items-center justify-between p-6 border-b border-[#E5EAF2]">
          <div>
            <h2 className="text-xl font-semibold text-[#2D2D2D]">Nuovo Movimento Stock</h2>
            <p className="text-sm text-[#6B7280] mt-1">Sposta prodotti tra ubicazioni</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-[#F7F9FC] rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
          <div className="text-sm text-[#6B7280]">Caricamento dati…</div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-2">
              <Package className="w-4 h-4 text-[#6B7280]" />
              Prodotto
            </label>
            <select
              value={form.prodotto_id}
              onChange={(e) => setForm({ ...form, prodotto_id: e.target.value })}
              className="w-full h-11 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl"
            >
              <option value="">Seleziona prodotto...</option>
              {prodotti.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-2">
                <MapPin className="w-4 h-4 text-[#6B7280]" />
                Ubicazione Origine
              </label>
              <select
                value={form.origine}
                onChange={(e) => setForm({ ...form, origine: e.target.value })}
                className="w-full h-11 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl"
              >
                <option value="">Seleziona origine...</option>
                {ubicazioni.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.codice_composto}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-2">
                <MapPin className="w-4 h-4 text-[#17E88F]" />
                Ubicazione Destinazione
              </label>
              <select
                value={form.destinazione}
                onChange={(e) => setForm({ ...form, destinazione: e.target.value })}
                className="w-full h-11 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl"
              >
                <option value="">Seleziona destinazione...</option>
                {ubicazioni.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.codice_composto}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-2">
              <Hash className="w-4 h-4 text-[#6B7280]" />
              Quantità
            </label>
            <input
              type="number"
              value={form.quantita}
              onChange={(e) => setForm({ ...form, quantita: e.target.value })}
              placeholder="Inserisci quantità..."
              className="w-full h-11 px-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-2">
              <FileText className="w-4 h-4 text-[#6B7280]" />
              Note (opzionale)
            </label>
            <textarea
              rows={3}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Aggiungi note sul movimento..."
              className="w-full px-4 py-3 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E5EAF2]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC]"
          >
            Annulla
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Conferma Spostamento
          </button>
        </div>
      </div>
    </div>
  );
}
