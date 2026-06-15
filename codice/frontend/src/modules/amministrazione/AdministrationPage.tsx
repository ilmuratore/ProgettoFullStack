import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Plus, Users, ShieldCheck, Settings } from 'lucide-react';
import { PageTabBar, type TabConfig } from '../../components/ui/PageTabBar';
import { toast } from 'sonner';
import { utentiApi } from '../../api/utentiApi';
import { dipendentiApi } from '../../api/corrieriApi';
import { useAuthStore } from '../../store/authStore';
import type { UtenteAPI, UtenteCreateRequest, UtenteUpdateRequest } from '../../types/utenti';
import type { Dipendente } from '../../types/corrieri';
import { RegisterPage } from '../../pages/RegisterPage';
import { FirmSettings } from './components/FirmSettings';
import { RolesPermitsTable } from './components/RolesPermitsTable';
import { UsersTable } from './components/UsersTable';

type AdminTab = 'utenti' | 'ruoli' | 'impostazioni';

const tabs: TabConfig[] = [
  { id: 'utenti', label: 'Utenti', icon: Users },
  { id: 'ruoli', label: 'Ruoli & Permessi', icon: ShieldCheck },
  { id: 'impostazioni', label: 'Impostazioni', icon: Settings },
];

const EMPLOYEE_LOCKED_ROLE_IDS = [1, 2, 3, 4] as const;
const USER_MANAGEMENT_ROLE_IDS = [1, 2, 3] as const;

export function AdministrationPage() {
  const { utente } = useAuthStore();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const initialTab: AdminTab = requestedTab === 'ruoli' || requestedTab === 'impostazioni' ? requestedTab : 'utenti';
  const highlightedUserId = Number(searchParams.get('highlightUserId') ?? '') || null;
  const canManageUsers = USER_MANAGEMENT_ROLE_IDS.includes((utente?.ruolo_id ?? -1) as (typeof USER_MANAGEMENT_ROLE_IDS)[number]);
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [utenti, setUtenti] = useState<UtenteAPI[]>([]);
  const [dipendenti, setDipendenti] = useState<Dipendente[]>([]);
  const [loadingUtenti, setLoadingUtenti] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<UtenteAPI | null>(null);

  const loadUtenti = async () => {
    setLoadingUtenti(true);
    try {
      setUtenti(await utentiApi.list());
    } catch (err: any) {
      toast.error('Errore caricamento utenti', { description: err?.message });
    } finally {
      setLoadingUtenti(false);
    }
  };

  const loadDipendenti = async () => {
    try {
      setDipendenti(await dipendentiApi.list());
    } catch (err: any) {
      toast.error('Errore caricamento dipendenti', { description: err?.message });
    }
  };

  useEffect(() => {
    loadUtenti();
    loadDipendenti();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserModalMode('create');
    setUserModalOpen(true);
  };

  const handleEditUser = (utente: UtenteAPI) => {
    setSelectedUser(utente);
    setUserModalMode('edit');
    setUserModalOpen(true);
  };

  const handleToggleUser = async (utente: UtenteAPI) => {
    const isAdmin = utente.ruolo_id === 1 || utente.ruolo === 'Admin' || utente.ruolo_nome === 'Admin';
    if (isAdmin) return;

    try {
      await utentiApi.update(utente.id, { attivo: !(utente.attivo ?? false) });
      toast.success((utente.attivo ?? false) ? 'Utente disattivato' : 'Utente attivato');
      await loadUtenti();
    } catch (err: any) {
      toast.error('Errore aggiornamento stato utente', { description: err?.message });
    }
  };

  const handleSaveUser = async (
    payload: UtenteCreateRequest | UtenteUpdateRequest,
    options?: { id?: number; passwordReset?: string; dipendenteId?: number | null }
  ) => {
    try {
      const selectedDipendenteId = options?.dipendenteId ?? null;
      const selectedRoleId = Number(payload.ruolo_id);
      const shouldLinkDipendente = !EMPLOYEE_LOCKED_ROLE_IDS.includes(selectedRoleId as (typeof EMPLOYEE_LOCKED_ROLE_IDS)[number]);
      let savedUser: UtenteAPI;

      if (userModalMode === 'create') {
        savedUser = await utentiApi.create(payload as UtenteCreateRequest);
        toast.success('Utente creato');
      } else if (options?.id) {
        savedUser = await utentiApi.update(options.id, payload as UtenteUpdateRequest);
        if (options.passwordReset) {
          await utentiApi.resetPassword(options.id, options.passwordReset);
        }
        toast.success('Utente aggiornato');
      } else {
        return;
      }

      const previousDipendenteId = selectedUser?.dipendente?.id ?? null;
      const nextDipendenteId = shouldLinkDipendente ? selectedDipendenteId : null;

      if (previousDipendenteId && previousDipendenteId !== nextDipendenteId) {
        await dipendentiApi.update(previousDipendenteId, { utente_id: null });
      }

      if (nextDipendenteId) {
        await dipendentiApi.update(nextDipendenteId, { utente_id: savedUser.id });
      }

      await loadUtenti();
      await loadDipendenti();
      setUserModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(userModalMode === 'create' ? 'Errore creazione utente' : 'Errore aggiornamento utente', {
        description: err?.message,
      });
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Amministrazione</h1>
          <p className="text-sm text-[#6B7280] mt-1">Gestione utenti, ruoli, permessi e impostazioni sistema</p>
        </div>
        {activeTab === 'utenti' && canManageUsers && (
          <button
            className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            onClick={handleCreateUser}
          >
            <Plus className="w-4 h-4" />
            Nuovo Utente
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
        <PageTabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as AdminTab)} />

        <div className="p-6 space-y-6">
          {activeTab === 'utenti' && (
            <UsersTable utenti={utenti} loading={loadingUtenti} highlightedUserId={highlightedUserId} canManageUsers={canManageUsers} onEdit={handleEditUser} onToggleAttivo={handleToggleUser} />
          )}

          {activeTab === 'ruoli' && (
            <RolesPermitsTable />
          )}

          {activeTab === 'impostazioni' && (
            <FirmSettings />
          )}
        </div>
      </div>

      <RegisterPage
        open={userModalOpen}
        mode={userModalMode}
        initialData={selectedUser}
        dipendenti={dipendenti}
        onCancel={() => {
          setUserModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />
    </div>
  );
}
