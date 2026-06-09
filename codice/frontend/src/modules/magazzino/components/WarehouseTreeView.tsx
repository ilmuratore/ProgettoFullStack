import { useState } from 'react';
import {
  ChevronRight, ChevronDown, Warehouse, MapPin,
  ToggleLeft, ToggleRight, Thermometer, Plus, Edit2,
} from 'lucide-react';
import type { MagazzinoConUbicazioni, Ubicazione } from '../../../types/magazzino';

interface WarehouseTreeViewProps {
  magazzini: MagazzinoConUbicazioni[];
  onToggleMagazzino: (id: number) => void;
  onEditMagazzino: (mag: MagazzinoConUbicazioni) => void;
  onAddUbicazione: (magId: number) => void;
  onToggleUbicazione: (ubicId: number, magId: number) => void;
  onEditUbicazione: (ubic: Ubicazione) => void;
}

function OccupancyBadge({ totale }: { totale?: number }) {
  if (totale === undefined) return null;
  const color = totale === 0 ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#DBEAFE] text-[#3B82F6]';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${color}`}>
      {totale} unità
    </span>
  );
}

function UbicazioneRow({
  ubic,
  onToggle,
  onEdit,
}: {
  ubic: Ubicazione;
  onToggle: (id: number) => void;
  onEdit: (ubic: Ubicazione) => void;
}) {
  return (
    <div className={`flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-[#F7F9FC] transition-all group ml-10 ${!ubic.attivo ? 'opacity-50' : ''}`}>
      <div className="w-4" />
      <div className="w-7 h-7 bg-white border border-[#E5EAF2] rounded-lg flex items-center justify-center text-[#6B7280]">
        <MapPin className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-medium text-[#2D2D2D]">{ubic.codice_composto}</span>
          {ubic.temperatura_controllata && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-[#EEF2FF] text-[#6366F1]">
              <Thermometer className="w-3 h-3" />Frigo
            </span>
          )}
          {!ubic.attivo && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-[#FEE2E2] text-[#DC2626]">Disattiva</span>
          )}
        </div>
        <div className="text-xs text-[#9CA3AF] mt-0.5">Corsia {ubic.corsia} · Scaffale {ubic.scaffale}</div>
      </div>
      <OccupancyBadge totale={ubic.totale_giacenza} />
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(ubic)}
          className="p-1.5 hover:bg-white rounded-lg text-[#6B7280] hover:text-[#17E88F] transition-all"
          title="Modifica temperatura"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onToggle(ubic.id)}
          className="p-1.5 hover:bg-white rounded-lg text-[#6B7280] hover:text-[#17E88F] transition-all"
          title={ubic.attivo ? 'Disattiva' : 'Attiva'}
        >
          {ubic.attivo
            ? <ToggleRight className="w-4 h-4 text-[#17E88F]" />
            : <ToggleLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function MagazzinoNode({
  mag,
  onToggleMag,
  onEditMag,
  onAddUbic,
  onToggleUbic,
  onEditUbic,
}: {
  mag: MagazzinoConUbicazioni;
  onToggleMag: (id: number) => void;
  onEditMag: (mag: MagazzinoConUbicazioni) => void;
  onAddUbic: (magId: number) => void;
  onToggleUbic: (ubicId: number, magId: number) => void;
  onEditUbic: (ubic: Ubicazione) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const ubicazioni = Array.isArray(mag.ubicazioni) ? mag.ubicazioni : [];
  
  const ubicAttive = ubicazioni.filter(u => u.attivo).length;
  const totaleUbic = ubicazioni.length;
  const giacenzaTotale = ubicazioni.reduce((s, u) => s + (u.totale_giacenza ?? 0), 0);

  const indirizzo = [mag.citta, mag.provincia].filter(Boolean).join(', ');

  return (
    <div className={`border border-[#E5EAF2] rounded-2xl overflow-hidden ${!mag.attivo ? 'opacity-60' : ''}`}>
      <div
        className={`flex items-center gap-3 p-4 cursor-pointer group transition-colors ${expanded ? 'bg-[#F0FDF7]' : 'bg-[#F7F9FC] hover:bg-[#F0FDF7]'}`}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="text-[#6B7280]">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>

        <div className="w-9 h-9 bg-white border border-[#E5EAF2] rounded-xl flex items-center justify-center text-[#17E88F]">
          <Warehouse className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#2D2D2D]">{mag.nome}</span>
            <span className="text-xs font-mono text-[#6B7280] bg-white border border-[#E5EAF2] px-1.5 py-0.5 rounded">{mag.codice}</span>
            {!mag.attivo && (
              <span className="text-xs px-2 py-0.5 rounded-lg bg-[#FEE2E2] text-[#DC2626]">Disattivo</span>
            )}
          </div>
          {indirizzo && <div className="text-xs text-[#9CA3AF] mt-0.5">{indirizzo}</div>}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <div className="font-medium text-[#2D2D2D]">{ubicAttive}/{totaleUbic}</div>
            <div className="text-xs text-[#9CA3AF]">ubicazioni attive</div>
          </div>
          <div className="text-right">
            <div className="font-medium text-[#2D2D2D]">{giacenzaTotale.toLocaleString('it-IT')}</div>
            <div className="text-xs text-[#9CA3AF]">unità totali</div>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onEditMag(mag)}
            className="p-1.5 hover:bg-white rounded-lg text-[#6B7280] hover:text-[#17E88F] transition-all"
            title="Modifica magazzino"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAddUbic(mag.id)}
            className="p-1.5 hover:bg-white rounded-lg text-[#6B7280] hover:text-[#17E88F] transition-all"
            title="Aggiungi ubicazione"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleMag(mag.id)}
            className="p-1.5 hover:bg-white rounded-lg text-[#6B7280] hover:text-[#17E88F] transition-all"
            title={mag.attivo ? 'Disattiva magazzino' : 'Attiva magazzino'}
          >
            {mag.attivo
              ? <ToggleRight className="w-5 h-5 text-[#17E88F]" />
              : <ToggleLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-3 space-y-1 border-t border-[#E5EAF2] bg-white">
          {ubicazioni.length === 0 ? (
            <div className="py-6 text-center text-sm text-[#9CA3AF]">
              Nessuna ubicazione. Clicca <span className="text-[#17E88F]">+</span> per aggiungerne una.
            </div>
          ) : (
            ubicazioni.map(u => (
              <UbicazioneRow
                key={u.id}
                ubic={u}
                onToggle={(id) => onToggleUbic(id, mag.id)}
                onEdit={onEditUbic}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function WarehouseTreeView({
  magazzini,
  onToggleMagazzino,
  onEditMagazzino,
  onAddUbicazione,
  onToggleUbicazione,
  onEditUbicazione,
}: WarehouseTreeViewProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[#2D2D2D]">Struttura Magazzino</h3>
        <div className="flex items-center gap-4 text-xs text-[#6B7280]">
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3 h-3 text-[#6366F1]" />
            <span>Temperatura controllata</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ToggleRight className="w-4 h-4 text-[#17E88F]" />
            <span>Attivo / Disattivo</span>
          </div>
        </div>
      </div>

      {magazzini.length === 0 ? (
        <div className="py-12 text-center text-[#9CA3AF] text-sm">
          Nessun magazzino configurato.
        </div>
      ) : (
        <div className="space-y-4">
          {magazzini.map(mag => (
            <MagazzinoNode
              key={mag.id}
              mag={mag}
              onToggleMag={onToggleMagazzino}
              onEditMag={onEditMagazzino}
              onAddUbic={onAddUbicazione}
              onToggleUbic={onToggleUbicazione}
              onEditUbic={onEditUbicazione}
            />
          ))}
        </div>
      )}
    </div>
  );
}