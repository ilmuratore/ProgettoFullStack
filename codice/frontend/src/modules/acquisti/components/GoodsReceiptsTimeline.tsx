import { Package, Clock, User, MapPin } from 'lucide-react';

const receipts = [
  { id: 1, numeroPO: 'PO-2026-003', fornitore: 'Film Protezione Italia S.p.A.', prodotti: 'Film Stretch Nero 23my, Film Estensibile 50cm', quantita: '150 unità', operatore: 'Giovanni Bianchi', dataOra: '03/06 14:30', ubicazione: 'B-01-08' },
  { id: 2, numeroPO: 'PO-2026-010', fornitore: 'Pallet Systems Europe S.p.A.', prodotti: 'Pallet Standard EUR 1200x800', quantita: '200 unità', operatore: 'Laura Verdi', dataOra: '03/06 11:15', ubicazione: 'A-01-05' },
  { id: 3, numeroPO: 'PO-2026-004', fornitore: 'Etichette Professionali S.r.l.', prodotti: 'Etichette Termiche 100x150mm, Etichette A4 Bianche', quantita: '500 unità', operatore: 'Marco Ferrari', dataOra: '03/06 09:45', ubicazione: 'A-03-04' },
  { id: 4, numeroPO: 'PO-2026-002', fornitore: 'Scatole Cartone Europa S.p.A.', prodotti: 'Scatola Ondulato 40x30x30 (PARZIALE)', quantita: '1.000 unità', operatore: 'Sofia Romano', dataOra: '03/06 08:20', ubicazione: 'A-02-12' },
  { id: 5, numeroPO: 'PO-2026-009', fornitore: 'Nastri & Reggette S.r.l.', prodotti: 'Nastro Adesivo Avana 50mm, Reggetta PP 12mm', quantita: '300 unità', operatore: 'Andrea Ricci', dataOra: '02/06 16:50', ubicazione: 'B-02-15' },
  { id: 6, numeroPO: 'PO-2026-001', fornitore: 'Packaging Solutions Italia S.p.A.', prodotti: 'Angolare Cartone 50x50, Busta Pluriball 30x45', quantita: '750 unità', operatore: 'Chiara Colombo', dataOra: '02/06 14:10', ubicazione: 'B-03-07' },
];

export function GoodsReceiptsTimeline() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[#2D2D2D]">Ricezioni Merce</h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#F0FDF7] border border-[#17E88F]/20 rounded-lg">
            <div className="w-2 h-2 bg-[#17E88F] rounded-full animate-pulse" />
            <span className="text-xs font-medium text-[#17E88F]">Aggiornato</span>
          </div>
        </div>
        <div className="text-xs text-[#6B7280]">Ultime 48 ore</div>
      </div>

      <div className="space-y-4">
        {receipts.map((receipt, index) => (
          <div
            key={receipt.id}
            className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#F7F9FC] transition-all group relative"
          >
            {index !== receipts.length - 1 && (
              <div className="absolute left-[30px] top-[60px] w-0.5 h-[calc(100%+16px)] bg-[#E5EAF2]" />
            )}

            <div className="w-12 h-12 bg-gradient-to-br from-[#17E88F] to-[#0FA67A] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform z-10">
              <Package className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[#2D2D2D] font-mono">{receipt.numeroPO}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#DCFCE7] text-[#22C55E]">
                      {receipt.quantita}
                    </span>
                  </div>
                  <div className="text-sm text-[#6B7280]">{receipt.fornitore}</div>
                  <div className="text-sm text-[#2D2D2D] font-medium mt-1">{receipt.prodotti}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-[#6B7280]">
                    <Clock className="w-3 h-3" />
                    {receipt.dataOra}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
                    <User className="w-3 h-3" />
                    {receipt.operatore}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-[#F7F9FC] rounded-lg inline-flex">
                <MapPin className="w-3 h-3 text-[#6B7280]" />
                <span className="text-xs text-[#6B7280]">Ubicazione:</span>
                <span className="text-xs font-mono text-[#2D2D2D]">{receipt.ubicazione}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center mt-6 pt-4 border-t border-[#E5EAF2]">
        <button className="px-4 py-2 text-sm text-[#17E88F] hover:bg-[#F0FDF7] rounded-lg transition-all font-medium">
          Carica Altre Ricezioni
        </button>
      </div>
    </div>
  );
}
