import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { utentiApi } from '../../../api/utentiApi';
import { PERMESSI_PER_RUOLO } from '../../../store/authStore';
import type { Ruolo } from '../../../types/ruoli';
import { RoleDetail } from './RoleDetail';

const ruoloColorMap: Record<string, string> = {
  Admin: '#DC2626',
  Dev: '#7C3AED',
  Supporto: '#2563EB',
  'Resp. Azienda': '#0F766E',
  'Resp. HR': '#BE185D',
  'Resp. Vendite': '#EA580C',
  'Resp. Acquisti': '#0891B2',
  'Resp. Magazzino': '#65A30D',
  Operatore: '#4B5563',
  Corriere: '#D97706',
};

export function RolesPermitsTable() {
  const [ruoli, setRuoli] = useState<Ruolo[]>([]);
  const [loadingRuoli, setLoadingRuoli] = useState(false);
  const [openRoleId, setOpenRoleId] = useState<number | null>(null);

  useEffect(() => {
    const loadRuoli = async () => {
      setLoadingRuoli(true);
      try {
        setRuoli(await utentiApi.getRuoli());
      } catch (err: any) {
        toast.error('Errore caricamento ruoli', { description: err?.message });
      } finally {
        setLoadingRuoli(false);
      }
    };

    loadRuoli();
  }, []);

  return (
    <div className="space-y-4">
      {loadingRuoli && (
        <div className="rounded-2xl border border-[#E5EAF2] bg-white px-4 py-8 text-center text-sm text-[#6B7280]">
          Caricamento ruoli...
        </div>
      )}
      {!loadingRuoli && ruoli.length === 0 && (
        <div className="rounded-2xl border border-[#E5EAF2] bg-white px-4 py-8 text-center text-sm text-[#6B7280]">
          Nessun ruolo trovato
        </div>
      )}
      {ruoli.map((ruolo) => {
        const permessi = PERMESSI_PER_RUOLO[ruolo.id] ?? [];
        const ruoloColor = ruoloColorMap[String(ruolo.nome)] ?? '#6B7280';
        return (
          <div key={ruolo.id} className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-sm">
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setOpenRoleId((prev) => prev === ruolo.id ? null : ruolo.id);
                }}
                className="flex w-full items-start justify-between gap-4 text-left"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0"
                    style={{ backgroundColor: ruoloColor }}
                  >
                    {String(ruolo.nome).split(' ').map((chunk) => chunk[0]).join('').slice(0, 2)}
                  </div>
                  <div className="space-y-2 text-left">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-semibold text-[#2D2D2D]">{ruolo.nome}</h3>
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{ backgroundColor: `${ruoloColor}20`, color: ruoloColor }}
                      >
                        {permessi.length} permessi
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-[#6B7280]">
                      {ruolo.descrizione || 'Nessuna descrizione disponibile'}
                    </p>
                  </div>
                </div>
                <span className="pt-2 text-lg font-semibold text-[#6B7280]">
                  {openRoleId === ruolo.id ? '−' : '+'}
                </span>
              </button>
              {openRoleId === ruolo.id && (
                <RoleDetail roleId={ruolo.id} permessi={permessi} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
