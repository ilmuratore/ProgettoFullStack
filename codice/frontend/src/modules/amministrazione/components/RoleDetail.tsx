import { useState } from 'react';

const permessoColorMap: Record<string, { bg: string; text: string; border: string }> = {
  utenti: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
  prodotti: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  fornitori: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  clienti: { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  dipendenti: { bg: '#FDF2F8', text: '#BE185D', border: '#FBCFE8' },
  magazzino: { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' },
  giacenze: { bg: '#ECFEFF', text: '#0E7490', border: '#A5F3FC' },
  acquisti: { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  ordini: { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' },
  spedizioni: { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
  notifiche: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  dashboard: { bg: '#F8FAFC', text: '#475569', border: '#CBD5E1' },
  ecosystem: { bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF' },
};

const getPermessoColors = (permesso: string) =>
  permessoColorMap[permesso.split(':')[0]] ?? { bg: '#F9FAFB', text: '#374151', border: '#E5E7EB' };

const formatCategoriaLabel = (categoria: string) =>
  categoria.charAt(0).toUpperCase() + categoria.slice(1);

const formatAzioneLabel = (azione: string) =>
  azione.charAt(0).toUpperCase() + azione.slice(1);

type RoleDetailProps = {
  roleId: number;
  permessi: string[];
};

export function RoleDetail({ roleId, permessi }: RoleDetailProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const groupedPermessi = Object.entries(
    permessi.reduce<Record<string, string[]>>((acc, permesso) => {
      const [categoria, azione = 'read'] = permesso.split(':');
      if (!acc[categoria]) acc[categoria] = [];
      acc[categoria].push(azione);
      return acc;
    }, {})
  );

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 items-start">
      {groupedPermessi.length > 0 ? groupedPermessi.map(([categoria, azioni]) => {
        const colors = getPermessoColors(categoria);
        const isOpen = openAccordion === categoria;
        return (
          <div
            key={`${roleId}-${categoria}`}
            className="self-start rounded-2xl border shadow-sm overflow-hidden"
            style={{ backgroundColor: colors.bg, borderColor: colors.border }}
          >
            <button
              type="button"
              onClick={() => setOpenAccordion((prev) => prev === categoria ? null : categoria)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ backgroundColor: '#FFFFFFAA', color: colors.text }}
                >
                  {formatCategoriaLabel(categoria)}
                </span>
                <span className="text-xs font-medium" style={{ color: colors.text }}>
                  {azioni.length} permessi
                </span>
              </div>
              <span className="text-xs font-semibold" style={{ color: colors.text }}>
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <div className="border-t px-4 py-3" style={{ borderColor: colors.border }}>
                <div className="flex flex-wrap gap-2">
                  {azioni.map((azione) => (
                    <span
                      key={`${roleId}-${categoria}-${azione}`}
                      className="inline-flex items-center rounded-full border bg-white px-3 py-1.5 text-xs font-semibold shadow-sm"
                      style={{ color: colors.text, borderColor: colors.border }}
                    >
                      {formatAzioneLabel(azione)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }) : (
        <span className="text-sm text-[#9CA3AF]">Nessun permesso associato</span>
      )}
    </div>
  );
}
