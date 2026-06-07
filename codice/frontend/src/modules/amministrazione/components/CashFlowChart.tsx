import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
  { mese: 'Gen', entrate: 1240000, uscite: 820000, saldo: 420000 },
  { mese: 'Feb', entrate: 1180000, uscite: 890000, saldo: 290000 },
  { mese: 'Mar', entrate: 1420000, uscite: 950000, saldo: 470000 },
  { mese: 'Apr', entrate: 1350000, uscite: 880000, saldo: 470000 },
  { mese: 'Mag', entrate: 1480000, uscite: 920000, saldo: 560000 },
  { mese: 'Giu', entrate: 1248000, uscite: 923000, saldo: 325000 },
  { mese: 'Lug', entrate: 1320000, uscite: 870000, saldo: 450000 },
  { mese: 'Ago', entrate: 980000, uscite: 720000, saldo: 260000 },
  { mese: 'Set', entrate: 1520000, uscite: 1020000, saldo: 500000 },
  { mese: 'Ott', entrate: 1380000, uscite: 940000, saldo: 440000 },
  { mese: 'Nov', entrate: 1420000, uscite: 980000, saldo: 440000 },
  { mese: 'Dic', entrate: 1680000, uscite: 1120000, saldo: 560000 },
];

export function CashFlowChart() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[#2D2D2D]">Andamento Cash Flow</h3>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#22C55E]" />
          <span className="text-sm text-[#6B7280]">Ultimi 12 mesi</span>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF2" />
            <XAxis dataKey="mese" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5EAF2',
                borderRadius: '12px',
                padding: '12px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="entrate"
              stroke="#22C55E"
              strokeWidth={2}
              dot={{ fill: '#22C55E', r: 4 }}
              name="Entrate"
            />
            <Line
              type="monotone"
              dataKey="uscite"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ fill: '#EF4444', r: 4 }}
              name="Uscite"
            />
            <Line
              type="monotone"
              dataKey="saldo"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              name="Saldo"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
