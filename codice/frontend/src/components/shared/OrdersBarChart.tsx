export interface OrdersBarChartItem {
  name: string;
  value: number;
  color: string;
}

interface OrdersBarChartProps {
  data: OrdersBarChartItem[];
}

export function OrdersBarChart({ data }: OrdersBarChartProps) {
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2] h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[#2D2D2D]">Ordini in Entrata per Stato</h3>
        <div className="text-xs text-[#6B7280]">Ultimi 30 giorni</div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={`order-stat-${index}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#6B7280]">{item.name}</span>
              <span className="text-sm font-semibold text-[#2D2D2D]">{item.value}</span>
            </div>
            <div className="w-full bg-[#F3F4F6] rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
