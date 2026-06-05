import { TrendingUp, Euro, FileText, DollarSign, TrendingDown, Activity } from 'lucide-react';

export function AdminKPIs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {/* Crediti Clienti */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center">
            <Euro className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-1">Crediti Clienti</p>
        <p className="text-2xl font-bold text-[#2D2D2D]">€ 842.500</p>
      </div>

      {/* Debiti Fornitori */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#EF4444] to-[#DC2626] rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-1">Debiti Fornitori</p>
        <p className="text-2xl font-bold text-[#2D2D2D]">€ 518.300</p>
      </div>

      {/* Fatture da Incassare */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#17E88F] to-[#0FA67A] rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-1">Fatture da Incassare</p>
        <p className="text-2xl font-bold text-[#2D2D2D]">124</p>
      </div>

      {/* Fatture da Pagare */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-1">Fatture da Pagare</p>
        <p className="text-2xl font-bold text-[#2D2D2D]">87</p>
      </div>

      {/* Incassi Mese */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-1">Incassi Mese</p>
        <p className="text-2xl font-bold text-[#2D2D2D] mb-2">€ 1.248.000</p>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-[#22C55E]" />
          <span className="text-xs font-medium text-[#22C55E]">+12,4%</span>
        </div>
      </div>

      {/* Cash Flow Stimato */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-1">Cash Flow Stimato</p>
        <p className="text-2xl font-bold text-[#17E88F] mb-1">€ 324.800</p>
        <span className="text-xs px-2 py-0.5 bg-[#DCFCE7] text-[#16A34A] rounded-lg font-medium">Positivo</span>
      </div>
    </div>
  );
}
