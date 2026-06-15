import { Edit, KeyRound, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import type { UtenteAPI } from '../../../types/utenti';

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

type UsersTableRow = {
  id: number;
  nome: string;
  email: string;
  ruolo: string;
  ruoloColor: string;
  ultimoAccesso: string;
  attivo: boolean;
};

type UsersTableProps = {
  utenti: UtenteAPI[];
  loading: boolean;
};

const mapUtenteToRow = (utente: UtenteAPI): UsersTableRow => {
  const ruolo = utente.ruolo_nome ?? utente.ruolo ?? 'Utente';
  return {
    id: utente.id,
    nome: `${utente.nome} ${utente.cognome}`.trim(),
    email: utente.email,
    ruolo,
    ruoloColor: ruoloColorMap[ruolo] ?? '#6B7280',
    ultimoAccesso: '-',
    attivo: utente.attivo ?? false,
  };
};

export function UsersTable({ utenti, loading }: UsersTableProps) {
  const rows = utenti.map(mapUtenteToRow);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F7F9FC] border-b border-[#E5EAF2]">
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Utente</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Email</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ruolo</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ultimo Accesso</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Stato</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Azioni</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5EAF2]">
          {loading && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#6B7280]">Caricamento utenti...</td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#6B7280]">Nessun utente trovato</td>
            </tr>
          )}
          {rows.map((u) => (
            <tr key={u.id} className={`hover:bg-[#F7F9FC] transition-colors ${!u.attivo ? 'opacity-50' : ''}`}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: u.ruoloColor }}
                  >
                    {u.nome.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <span className="text-sm font-medium text-[#2D2D2D]">{u.nome}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-[#6B7280]">{u.email}</td>
              <td className="px-4 py-3">
                <span
                  className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: u.ruoloColor }}
                >
                  {u.ruolo}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-[#6B7280]">{u.ultimoAccesso}</td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${u.attivo ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                  {u.attivo ? 'Attivo' : 'Disabilitato'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1.5">
                  <button className="p-1.5 hover:bg-[#E5EAF2] rounded-lg transition-colors" title="Modifica">
                    <Edit className="w-4 h-4 text-[#6B7280]" />
                  </button>
                  <button className="p-1.5 hover:bg-[#E5EAF2] rounded-lg transition-colors" title="Reset Password">
                    <KeyRound className="w-4 h-4 text-[#6B7280]" />
                  </button>
                  <button className="p-1.5 hover:bg-[#E5EAF2] rounded-lg transition-colors" title={u.attivo ? 'Disabilita' : 'Abilita'}>
                    {u.attivo
                      ? <ToggleRight className="w-4 h-4 text-[#16A34A]" />
                      : <ToggleLeft className="w-4 h-4 text-[#9CA3AF]" />
                    }
                  </button>
                  <button className="p-1.5 hover:bg-[#FEE2E2] rounded-lg transition-colors" title="Elimina">
                    <Trash2 className="w-4 h-4 text-[#DC2626]" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
