import { Warehouse } from 'lucide-react';

export function WarehouseCapacity() {
  const capacity = 78;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center">
          <Warehouse className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-[#2D2D2D]">Capacità Magazzino</h3>
          <p className="text-xs text-[#6B7280]">Utilizzo corrente</p>
        </div>
      </div>

      <div className="relative">
        <div className="w-full h-3 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#17E88F] to-[#0FA67A] rounded-full transition-all duration-500"
            style={{ width: `${capacity}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-[#6B7280]">0%</span>
          <span className="text-2xl font-semibold text-[#2D2D2D]">{capacity}%</span>
          <span className="text-sm text-[#6B7280]">100%</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#E5EAF2] grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-[#6B7280] mb-1">Spazio Occupato</div>
          <div className="text-lg font-semibold text-[#2D2D2D]">7.800 m²</div>
        </div>
        <div>
          <div className="text-xs text-[#6B7280] mb-1">Spazio Disponibile</div>
          <div className="text-lg font-semibold text-[#17E88F]">2.200 m²</div>
        </div>
      </div>
    </div>
  );
}
