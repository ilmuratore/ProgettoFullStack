import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface SalesChartPoint {
  mese: string;
  fatturato: number;
  ordini: number;
}

const formatEuro = (value: number) => `EUR ${(value / 1000).toFixed(0)}k`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E5EAF2] rounded-xl p-4 shadow-lg">
        <p className="text-xs font-semibold text-[#2D2D2D] mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#6B7280]">{entry.name}:</span>
            <span className="font-semibold text-[#2D2D2D]">
              {entry.dataKey === 'fatturato' ? `EUR ${entry.value.toLocaleString('it-IT')}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface SalesChartProps {
  data: SalesChartPoint[];
}

export function SalesChart({ data }: SalesChartProps) {
  const [activeMetric, setActiveMetric] = useState<'both' | 'fatturato' | 'ordini'>('both');

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-[#2D2D2D]">Andamento Vendite</h3>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Ultimi 12 mesi</p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { key: 'both', label: 'Tutti' },
            { key: 'fatturato', label: 'Fatturato' },
            { key: 'ordini', label: 'Ordini' },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setActiveMetric(btn.key as 'both' | 'fatturato' | 'ordini')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeMetric === btn.key
                  ? 'bg-[#17E88F]/10 text-[#17E88F]'
                  : 'bg-[#F7F9FC] text-[#6B7280] hover:bg-[#F0FDF7]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="mese" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tickFormatter={formatEuro} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} hide={activeMetric === 'ordini'} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} hide={activeMetric === 'fatturato'} />
          <Tooltip content={<CustomTooltip />} />
          {(activeMetric === 'both' || activeMetric === 'fatturato') && (
            <Line yAxisId="left" type="monotone" dataKey="fatturato" name="Fatturato" stroke="#17E88F" strokeWidth={2.5} dot={{ fill: '#17E88F', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#17E88F' }} />
          )}
          {(activeMetric === 'both' || activeMetric === 'ordini') && (
            <Line yAxisId="right" type="monotone" dataKey="ordini" name="N. Ordini" stroke="#3B82F6" strokeWidth={2.5} strokeDasharray="6 3" dot={{ fill: '#3B82F6', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#3B82F6' }} />
          )}
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} iconType="circle" iconSize={8} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
