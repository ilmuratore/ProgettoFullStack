import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Euro, TrendingDown, Percent, FileText } from 'lucide-react';

const fatturatoData = [{ v: 1.6 }, { v: 1.7 }, { v: 1.65 }, { v: 1.8 }, { v: 1.75 }, { v: 1.84 }];
const costiData = [{ v: 0.9 }, { v: 0.92 }, { v: 0.88 }, { v: 0.95 }, { v: 0.93 }, { v: 0.98 }];

export function EconomicAnalysis() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
      <h3 className="font-semibold text-[#2D2D2D] mb-5">Analisi Economica</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] rounded-xl p-5 border border-[#BFDBFE]">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <Euro className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xs text-[#6B7280] mb-1">Fatturato Mese</p>
          <p className="text-2xl font-bold text-[#2D2D2D] mb-3">€ 1.842.000</p>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fatturatoData}>
                <Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-[#22C55E] mt-2">+8,2% vs mese scorso</p>
        </div>

        <div className="bg-gradient-to-br from-[#FEF2F2] to-[#FEE2E2] rounded-xl p-5 border border-[#FECACA]">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-[#EF4444] rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xs text-[#6B7280] mb-1">Costi Operativi</p>
          <p className="text-2xl font-bold text-[#2D2D2D] mb-3">€ 982.000</p>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costiData}>
                <defs>
                  <linearGradient id="colorCosti" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#EF4444" strokeWidth={2} fill="url(#colorCosti)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-[#22C55E] mt-2">-2,1% vs mese scorso</p>
        </div>

        <div className="bg-gradient-to-br from-[#F0FDF7] to-[#DCFCE7] rounded-xl p-5 border border-[#BBF7D0]">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
              <Percent className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xs text-[#6B7280] mb-1">Margine Operativo</p>
          <p className="text-2xl font-bold text-[#22C55E] mb-3">46,7%</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-white/50 rounded-full h-2">
              <div className="h-2 bg-[#22C55E] rounded-full" style={{ width: '46.7%' }} />
            </div>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-3">Sopra la media</p>
        </div>

        <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] rounded-xl p-5 border border-[#DDD6FE]">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xs text-[#6B7280] mb-1">Documenti Emessi</p>
          <p className="text-2xl font-bold text-[#2D2D2D] mb-1">842</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="px-2 py-0.5 bg-white/70 rounded text-xs font-medium text-[#8B5CF6]">+12,4%</div>
            <span className="text-xs text-[#9CA3AF]">vs mese scorso</span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-3">Ultimi 30 giorni</p>
        </div>
      </div>
    </div>
  );
}
