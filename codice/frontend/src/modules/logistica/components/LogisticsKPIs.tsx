import { TrendingUp, Package, CheckCircle, AlertTriangle, Truck, Target } from 'lucide-react';

export function LogisticsKPIs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {/* Spedizioni Attive */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-1">Spedizioni Attive</p>
        <p className="text-2xl font-bold text-[#2D2D2D] mb-2">124</p>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-[#22C55E]" />
          <span className="text-xs font-medium text-[#22C55E]">+9,2%</span>
        </div>
      </div>

      {/* Consegne Oggi */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#17E88F] to-[#0FA67A] rounded-xl flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-1">Consegne Oggi</p>
        <p className="text-2xl font-bold text-[#2D2D2D]">87</p>
      </div>

      {/* Spedizioni Completate */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-1">Spedizioni Completate</p>
        <p className="text-2xl font-bold text-[#2D2D2D] mb-1">1.248</p>
        <span className="text-xs text-[#9CA3AF]">Mese corrente</span>
      </div>

      {/* Problemi di Consegna */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-1">Problemi di Consegna</p>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-2xl font-bold text-[#2D2D2D]">6</p>
          <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#D97706] rounded-lg text-xs font-medium">Warning</span>
        </div>
      </div>

      {/* Corrieri Operativi */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-1">Corrieri Operativi</p>
        <p className="text-2xl font-bold text-[#2D2D2D]">18</p>
      </div>

      {/* Delivery Success Rate */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#17E88F] to-[#0FA67A] rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-1">Delivery Success Rate</p>
        <p className="text-2xl font-bold text-[#17E88F]">98,4%</p>
      </div>
    </div>
  );
}
