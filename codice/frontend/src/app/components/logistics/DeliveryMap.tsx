import { MapPin, Navigation, Package } from 'lucide-react';

export function DeliveryMap() {
  const deliveryPoints = [
    { id: 1, city: 'Milano', status: 'SPEDITA', lat: '45.4642', lng: '9.1900', count: 18 },
    { id: 2, city: 'Roma', status: 'SPEDITA', lat: '41.9028', lng: '12.4964', count: 12 },
    { id: 3, city: 'Torino', status: 'CONSEGNATA', lat: '45.0703', lng: '7.6869', count: 8 },
    { id: 4, city: 'Napoli', status: 'IN_PREPARAZIONE', lat: '40.8518', lng: '14.2681', count: 6 },
    { id: 5, city: 'Palermo', status: 'PROBLEMA', lat: '38.1157', lng: '13.3615', count: 2 },
    { id: 6, city: 'Genova', status: 'CONSEGNATA', lat: '44.4056', lng: '8.9463', count: 10 },
    { id: 7, city: 'Bologna', status: 'SPEDITA', lat: '44.4949', lng: '11.3426', count: 15 },
    { id: 8, city: 'Firenze', status: 'SPEDITA', lat: '43.7696', lng: '11.2558', count: 9 },
  ];

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'IN_PREPARAZIONE':
        return 'bg-[#9CA3AF]';
      case 'SPEDITA':
        return 'bg-[#3B82F6]';
      case 'CONSEGNATA':
        return 'bg-[#22C55E]';
      case 'PROBLEMA':
        return 'bg-[#EF4444]';
      default:
        return 'bg-[#6B7280]';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[#2D2D2D]">Distribuzione Consegne</h3>
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#17E88F]" />
          <span className="text-sm text-[#6B7280]">Realtime Tracking</span>
        </div>
      </div>

      {/* Mappa Mockup */}
      <div className="relative bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] rounded-xl overflow-hidden h-96 border border-[#E5EAF2]">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Delivery Points */}
        <div className="absolute inset-0 p-8">
          {deliveryPoints.map((point) => (
            <div
              key={point.id}
              className="absolute group"
              style={{
                left: `${(parseFloat(point.lng) + 20) * 3}%`,
                top: `${(50 - parseFloat(point.lat)) * 1.5}%`,
              }}
            >
              {/* Marker */}
              <div className="relative flex items-center justify-center">
                <div className={`w-8 h-8 ${getMarkerColor(point.status)} rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform`}>
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                {/* Pulse Effect */}
                {point.status === 'SPEDITA' && (
                  <div className={`absolute w-8 h-8 ${getMarkerColor(point.status)} rounded-full animate-ping opacity-30`} />
                )}
              </div>

              {/* Tooltip */}
              <div className="absolute left-10 top-0 bg-white rounded-xl shadow-lg p-3 border border-[#E5EAF2] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-10">
                <p className="text-sm font-medium text-[#2D2D2D]">{point.city}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Package className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span className="text-xs text-[#6B7280]">{point.count} spedizioni</span>
                </div>
                <div className="mt-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    point.status === 'CONSEGNATA' ? 'bg-[#DCFCE7] text-[#16A34A]' :
                    point.status === 'SPEDITA' ? 'bg-[#DBEAFE] text-[#3B82F6]' :
                    point.status === 'PROBLEMA' ? 'bg-[#FEE2E2] text-[#DC2626]' :
                    'bg-[#F3F4F6] text-[#6B7280]'
                  }`}>
                    {point.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#E5EAF2]">
          <p className="text-xs font-medium text-[#2D2D2D] mb-2">Legenda</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#9CA3AF] rounded-full" />
              <span className="text-xs text-[#6B7280]">In Preparazione</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#3B82F6] rounded-full" />
              <span className="text-xs text-[#6B7280]">Spedita</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#22C55E] rounded-full" />
              <span className="text-xs text-[#6B7280]">Consegnata</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#EF4444] rounded-full" />
              <span className="text-xs text-[#6B7280]">Problema</span>
            </div>
          </div>
        </div>

        {/* Stats Overlay */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#E5EAF2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#17E88F] to-[#0FA67A] rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF]">Totale Attive</p>
              <p className="text-xl font-bold text-[#2D2D2D]">124</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
