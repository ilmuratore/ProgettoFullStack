import { Calendar, Clock } from 'lucide-react';

const activities = [
  { time: '14:30', title: 'Inventario Settore A', type: 'inventory' },
  { time: '16:00', title: 'Arrivo Corriere DHL', type: 'delivery' },
  { time: '17:30', title: 'Chiusura Ordini Export', type: 'deadline' },
];

export function MiniCalendar() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-[#2D2D2D]">Attività Programmate</h3>
          <p className="text-xs text-[#6B7280]">Mercoledì, 03 Giugno 2026</p>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-[#F7F9FC] rounded-xl hover:bg-[#EEF2FF] transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm text-[#2D2D2D]">{activity.title}</div>
              <div className="text-xs text-[#6B7280] mt-0.5">{activity.time}</div>
            </div>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
              activity.type === 'inventory' ? 'bg-[#3B82F6]' :
              activity.type === 'delivery' ? 'bg-[#17E88F]' :
              'bg-[#EF4444]'
            }`} />
          </div>
        ))}
      </div>
    </div>
  );
}
