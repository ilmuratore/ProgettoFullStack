import { useAuthStore, RUOLO_ID_TO_NOME } from '../store/authStore';

const ROLE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  'Admin':                    { color: '#0F172A', bg: '#F1F5F9', label: 'Admin'           },
  'Responsabile Acquisti':    { color: '#1D4ED8', bg: '#DBEAFE', label: 'Resp. Acquisti'  },
  'Responsabile Magazzino':   { color: '#0D9488', bg: '#CCFBF1', label: 'Resp. Magazzino' },
  'Operatore':                { color: '#16A34A', bg: '#DCFCE7', label: 'Operatore'        },
  'Corriere':                 { color: '#EA580C', bg: '#FEE2E2', label: 'Corriere'         },
};

export function NavBar() {
  const { utente, logout } = useAuthStore();
  if (!utente) return null;

  const ruoloNome = utente.ruolo_nome ?? RUOLO_ID_TO_NOME[utente.ruolo_id] ?? 'Utente';
  const conf = ROLE_CONFIG[ruoloNome] ?? { color: '#6B7280', bg: '#F3F4F6', label: ruoloNome };
  const initials = `${utente.nome?.[0] ?? ''}${utente.cognome?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E5EAF2] bg-[#F8FAFC]">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: conf.color === '#0F172A' ? '#17E88F' : conf.color }} />
        <span className="text-xs font-medium text-[#374151]">{conf.label}</span>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: conf.color === '#0F172A' ? '#0F172A' : conf.color }}
        >
          {initials}
        </div>
        <span className="hidden md:block text-sm font-medium text-[#374151]">
          {utente.nome} {utente.cognome}
        </span>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl border border-[#E5EAF2] transition-all"
        title="Esci"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
        </svg>
        <span className="hidden sm:inline">Esci</span>
      </button>
    </div>
  );
}
