import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Clock, Target, AlertCircle, CheckCircle2 } from 'lucide-react';

const leadTimeData = [
  { day: 1, value: 2.1 },
  { day: 2, value: 2.3 },
  { day: 3, value: 2.0 },
  { day: 4, value: 2.4 },
  { day: 5, value: 2.2 },
  { day: 6, value: 2.4 },
  { day: 7, value: 2.4 },
];

const onTimeData = [
  { day: 1, rate: 97.2 },
  { day: 2, rate: 98.1 },
  { day: 3, rate: 98.5 },
  { day: 4, rate: 97.8 },
  { day: 5, rate: 98.4 },
  { day: 6, rate: 98.2 },
  { day: 7, rate: 98.4 },
];

export function AdvancedKPIs() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
      <h3 className="font-semibold text-[#2D2D2D] mb-5">Analytics Logistiche</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Lead Time Medio */}
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] rounded-xl p-5 border border-[#BFDBFE]">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xs text-[#6B7280] mb-1">Lead Time Medio</p>
          <p className="text-2xl font-bold text-[#2D2D2D] mb-3">2,4 giorni</p>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadTimeData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-2">Ultimi 7 giorni</p>
        </div>

        {/* On Time Delivery */}
        <div className="bg-gradient-to-br from-[#F0FDF7] to-[#DCFCE7] rounded-xl p-5 border border-[#BBF7D0]">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xs text-[#6B7280] mb-1">On Time Delivery</p>
          <p className="text-2xl font-bold text-[#22C55E] mb-3">98,4%</p>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={onTimeData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#22C55E"
                  strokeWidth={2}
                  fill="url(#colorRate)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-2">Trend positivo</p>
        </div>

        {/* Problemi Ultimi 30 Giorni */}
        <div className="bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] rounded-xl p-5 border border-[#FCD34D]">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-[#F59E0B] rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xs text-[#6B7280] mb-1">Problemi Ultimi 30 Giorni</p>
          <p className="text-2xl font-bold text-[#2D2D2D] mb-1">14</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-white/50 rounded-full h-2">
              <div className="h-2 bg-[#F59E0B] rounded-full" style={{ width: '8%' }} />
            </div>
            <span className="text-xs text-[#9CA3AF]">0,8%</span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-3">Su 1.742 spedizioni</p>
        </div>

        {/* Consegne Completate */}
        <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] rounded-xl p-5 border border-[#DDD6FE]">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xs text-[#6B7280] mb-1">Consegne Completate</p>
          <p className="text-2xl font-bold text-[#2D2D2D] mb-1">4.872</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="px-2 py-0.5 bg-white/70 rounded text-xs font-medium text-[#8B5CF6]">
              +12,4%
            </div>
            <span className="text-xs text-[#9CA3AF]">vs mese scorso</span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-3">Ultimi 30 giorni</p>
        </div>
      </div>
    </div>
  );
}
