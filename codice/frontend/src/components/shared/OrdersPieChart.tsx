import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export interface OrdersPieChartItem {
  name: string;
  value: number;
  color: string;
}

interface OrdersPieChartProps {
  data: OrdersPieChartItem[];
}

export function OrdersPieChart({ data }: OrdersPieChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2] h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[#2D2D2D]">Ordini in Uscita</h3>
        <div className="text-xs text-[#6B7280]">Situazione attuale</div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5EAF2',
              borderRadius: '12px',
              padding: '8px 12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-[#6B7280]">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#2D2D2D]">{item.value}</span>
              <span className="text-xs text-[#6B7280]">
                ({total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
