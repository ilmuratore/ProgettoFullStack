import { useEffect, useState } from 'react';
import { Plus, Users, ShieldCheck, Settings } from 'lucide-react';
import { PageTabBar, type TabConfig } from '../../components/ui/PageTabBar';
import { toast } from 'sonner';
import { utentiApi } from '../../api/utentiApi';
import type { UtenteAPI, UtenteCreateRequest, UtenteUpdateRequest } from '../../types/utenti';
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

export function AdministrationPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('utenti');
  const [utenti, setUtenti] = useState<UtenteAPI[]>([]);
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

  useEffect(() => {
    loadUtenti();
  }, []);

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

  const handleSaveUser = async (payload: UtenteCreateRequest | UtenteUpdateRequest, id?: number, passwordReset?: string) => {
    try {
      if (userModalMode === 'create') {
        await utentiApi.create(payload as UtenteCreateRequest);
        toast.success('Utente creato');
      } else if (id) {
        await utentiApi.update(id, payload as UtenteUpdateRequest);
        if (passwordReset) {
          await utentiApi.resetPassword(id, passwordReset);
        }
        toast.success('Utente aggiornato');
      }

      await loadUtenti();
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
        {activeTab === 'utenti' && (
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
            <UsersTable utenti={utenti} loading={loadingUtenti} onEdit={handleEditUser} onToggleAttivo={handleToggleUser} />
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
        onCancel={() => {
          setUserModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />
    </div>
  );
}
