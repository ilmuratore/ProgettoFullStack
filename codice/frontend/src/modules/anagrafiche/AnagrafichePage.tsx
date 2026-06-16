import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Search, Plus, Download, Upload, MoreVertical,
  Edit, Trash2, Mail, Phone, MapPin, Building2,
  User, Truck, Globe, ExternalLink, Users, Calendar, AlertTriangle, Link2,
} from 'lucide-react';
import { PageTabBar } from '../../components/ui/PageTabBar';
import { FilterButton, FilterPanel } from '../../components/ui/FilterPanel';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../../components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { SupplierFormModal } from '../anagrafiche/components/SupplierFormModal';
import { ClientFormModal } from '../anagrafiche/components/ClientFormModal';
import { CourierFormModal } from '../anagrafiche/components/CourierFormModal';
import { EmployeeFormModal } from '../anagrafiche/components/EmployeeFormModal';
import { AnagraficaDetailDrawer } from '../anagrafiche/components/AnagraficaDetailDrawer';
import { toast } from 'sonner';
import { fornitoriApi } from '../../api/fornitoriApi';
import { clientiApi } from '../../api/clientiApi';
import { corrieriApi, dipendentiApi } from '../../api/corrieriApi';
import { utentiApi } from '../../api/utentiApi';
import { useAuthStore } from '../../store/authStore';
import type { Fornitore, FornitoreCreateRequest, FornitoreUpdateRequest } from '../../types/fornitori';
import type { Cliente, ClienteCreateRequest, ClienteUpdateRequest } from '../../types/clienti';
import type { UtenteAPI } from '../../types/utenti';
import type {
  Corriere, CorriereCreateRequest, CorriereUpdateRequest,
  Dipendente, DipendenteCreateRequest, DipendenteUpdateRequest,
} from '../../types/corrieri';
import { SortableHeader } from '../../components/shared/SortableHeader';
import { applySort, compareBoolean, compareDate, compareText, toggleSort, type SortConfig } from '../../utils/sorting';

type TabType = 'fornitori' | 'clienti' | 'corrieri' | 'dipendenti';

const TAB_IDS: TabType[] = ['fornitori', 'clienti', 'corrieri', 'dipendenti'];

type FornitoriSortKey = 'ragione_sociale' | 'piva' | 'email' | 'indirizzo' | 'source' | 'attivo';
type ClientiSortKey = 'ragione_sociale' | 'piva_cf' | 'email' | 'source' | 'attivo';
type CorrieriSortKey = 'codice' | 'nome' | 'email' | 'telefono';
type DipendentiSortKey = 'nominativo' | 'codice_fiscale' | 'ruolo_operativo' | 'collegamento' | 'data_assunzione';

const compareFornitoriByKey = (left: Fornitore, right: Fornitore, key: FornitoriSortKey) => {
  switch (key) {
    case 'ragione_sociale': return compareText(left.ragione_sociale ?? '', right.ragione_sociale ?? '');
    case 'piva': return compareText(left.piva ?? '', right.piva ?? '');
    case 'email': return compareText(left.email ?? '', right.email ?? '');
    case 'indirizzo': return compareText(left.indirizzo ?? '', right.indirizzo ?? '');
    case 'source': return compareText(left.source ?? '', right.source ?? '');
    case 'attivo': return compareBoolean(left.attivo, right.attivo);
    default: return 0;
  }
};

const compareClientiByKey = (left: Cliente, right: Cliente, key: ClientiSortKey) => {
  switch (key) {
    case 'ragione_sociale': return compareText(left.ragione_sociale ?? '', right.ragione_sociale ?? '');
    case 'piva_cf': return compareText(left.piva_cf ?? '', right.piva_cf ?? '');
    case 'email': return compareText(left.email ?? '', right.email ?? '');
    case 'source': return compareText(left.source ?? '', right.source ?? '');
    case 'attivo': return compareBoolean(left.attivo, right.attivo);
    default: return 0;
  }
};

const compareCorrieriByKey = (left: Corriere, right: Corriere, key: CorrieriSortKey) => {
  switch (key) {
    case 'codice': return compareText(left.codice ?? '', right.codice ?? '');
    case 'nome': return compareText(left.nome ?? '', right.nome ?? '');
    case 'email': return compareText(left.email ?? '', right.email ?? '');
    case 'telefono': return compareText(left.telefono ?? '', right.telefono ?? '');
    default: return 0;
  }
};

const compareDipendentiByKey = (
  left: Dipendente,
  right: Dipendente,
  key: DipendentiSortKey,
  utentiById: Map<number, UtenteAPI>
) => {
  switch (key) {
    case 'nominativo': return compareText(`${left.cognome} ${left.nome}`, `${right.cognome} ${right.nome}`);
    case 'codice_fiscale': return compareText(left.codice_fiscale ?? '', right.codice_fiscale ?? '');
    case 'ruolo_operativo': return compareText(left.ruolo_operativo ?? '', right.ruolo_operativo ?? '');
    case 'collegamento': {
      const leftRole = left.utente_id ? (utentiById.get(left.utente_id)?.ruolo_nome ?? utentiById.get(left.utente_id)?.ruolo ?? `Utente #${left.utente_id}`) : '';
      const rightRole = right.utente_id ? (utentiById.get(right.utente_id)?.ruolo_nome ?? utentiById.get(right.utente_id)?.ruolo ?? `Utente #${right.utente_id}`) : '';
      return compareText(leftRole, rightRole);
    }
    case 'data_assunzione': return compareDate(left.data_assunzione, right.data_assunzione);
    default: return 0;
  }
};

type Ordinamento = 'nessuno' | 'alfabetico';
type StatoFilter = 'tutti' | 'attivo' | 'disattivo';

interface AnagraficaFiltersState {
  ordinamento: Ordinamento;
  stato: StatoFilter;
}

const EMPTY_ANAGRAFICA_FILTERS: AnagraficaFiltersState = { ordinamento: 'nessuno', stato: 'tutti' };

interface CorrieriFiltersState {
  ordinamento: Ordinamento;
}

const EMPTY_CORRIERI_FILTERS: CorrieriFiltersState = { ordinamento: 'nessuno' };

interface DipendentiFiltersState {
  ordinamento: Ordinamento;
  ruolo: string;
  dataAssunzione: string;
}

const EMPTY_DIPENDENTI_FILTERS: DipendentiFiltersState = { ordinamento: 'nessuno', ruolo: 'tutti', dataAssunzione: '' };

const formatDataBreve = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export function AnagrafichePage() {
  const navigate = useNavigate();
  const { hasPermesso } = useAuthStore();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const accessibleTabs = useMemo(
    () => TAB_IDS.filter((tab) => {
      switch (tab) {
        case 'fornitori': return hasPermesso('fornitori:read');
        case 'clienti': return hasPermesso('clienti:read');
        case 'corrieri': return hasPermesso('magazzino:read');
        case 'dipendenti': return hasPermesso('dipendenti:read');
      }
    }),
    [hasPermesso]
  );
  const fallbackTab = accessibleTabs[0] ?? 'fornitori';
  const initialTab = TAB_IDS.includes(requestedTab as TabType) && accessibleTabs.includes(requestedTab as TabType)
    ? (requestedTab as TabType)
    : fallbackTab;

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fornitoriFilters, setFornitoriFilters] = useState<AnagraficaFiltersState>(EMPTY_ANAGRAFICA_FILTERS);
  const [clientiFilters, setClientiFilters] = useState<AnagraficaFiltersState>(EMPTY_ANAGRAFICA_FILTERS);
  const [corrieriFilters, setCorrieriFilters] = useState<CorrieriFiltersState>(EMPTY_CORRIERI_FILTERS);
  const [dipendentiFilters, setDipendentiFilters] = useState<DipendentiFiltersState>(EMPTY_DIPENDENTI_FILTERS);

  const [fornitoriSort, setFornitoriSort] = useState<SortConfig<FornitoriSortKey> | null>(null);
  const [clientiSort, setClientiSort] = useState<SortConfig<ClientiSortKey> | null>(null);
  const [corrieriSort, setCorrieriSort] = useState<SortConfig<CorrieriSortKey> | null>(null);
  const [dipendentiSort, setDipendentiSort] = useState<SortConfig<DipendentiSortKey> | null>(null);

  const handleFornitoriSort = (key: FornitoriSortKey) => setFornitoriSort((prev) => toggleSort(prev, key));
  const handleClientiSort = (key: ClientiSortKey) => setClientiSort((prev) => toggleSort(prev, key));
  const handleCorrieriSort = (key: CorrieriSortKey) => setCorrieriSort((prev) => toggleSort(prev, key));
  const handleDipendentiSort = (key: DipendentiSortKey) => setDipendentiSort((prev) => toggleSort(prev, key));

  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);

  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [itemToDelete, setItemToDelete] = useState<{ tab: TabType; item: any } | null>(null);

  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailEntityType, setDetailEntityType] = useState<'cliente' | 'fornitore' | 'corriere' | 'dipendente' | null>(null);
  const [detailEntityId, setDetailEntityId] = useState<number | null>(null);

  const [fornitori, setFornitori] = useState<Fornitore[]>([]);
  const [loadingFornitori, setLoadingFornitori] = useState(false);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [loadingClienti, setLoadingClienti] = useState(false);
  const [corrieri, setCorrieri] = useState<Corriere[]>([]);
  const [loadingCorrieri, setLoadingCorrieri] = useState(false);
  const [dipendenti, setDipendenti] = useState<Dipendente[]>([]);
  const [loadingDipendenti, setLoadingDipendenti] = useState(false);
  const [utenti, setUtenti] = useState<UtenteAPI[]>([]);

  const fetchFornitori = useCallback(async () => {
    setLoadingFornitori(true);
    try { setFornitori(await fornitoriApi.list()); }
    catch (err: any) { toast.error('Errore caricamento fornitori', { description: err?.message }); }
    finally { setLoadingFornitori(false); }
  }, []);

  const fetchClienti = useCallback(async () => {
    setLoadingClienti(true);
    try { setClienti(await clientiApi.list()); }
    catch (err: any) { toast.error('Errore caricamento clienti', { description: err?.message }); }
    finally { setLoadingClienti(false); }
  }, []);

  const fetchCorrieri = useCallback(async () => {
    setLoadingCorrieri(true);
    try { setCorrieri(await corrieriApi.list()); }
    catch (err: any) { toast.error('Errore caricamento corrieri', { description: err?.message }); }
    finally { setLoadingCorrieri(false); }
  }, []);

  const fetchDipendenti = useCallback(async () => {
    setLoadingDipendenti(true);
    try { setDipendenti(await dipendentiApi.list()); }
    catch (err: any) { toast.error('Errore caricamento dipendenti', { description: err?.message }); }
    finally { setLoadingDipendenti(false); }
  }, []);

  const fetchUtenti = useCallback(async () => {
    try { setUtenti(await utentiApi.list()); }
    catch (err: any) { toast.error('Errore caricamento utenti collegati', { description: err?.message }); }
  }, []);

  const fetchedTabs = useRef(new Set<TabType>());

  const fetchForTab = useCallback(async (tab: TabType) => {
    if (fetchedTabs.current.has(tab)) return;
    fetchedTabs.current.add(tab);
    switch (tab) {
      case 'fornitori':  return fetchFornitori();
      case 'clienti':    return fetchClienti();
      case 'corrieri':   return fetchCorrieri();
      case 'dipendenti': return fetchDipendenti();
    }
  }, [fetchFornitori, fetchClienti, fetchCorrieri, fetchDipendenti]);

  useEffect(() => { fetchForTab(initialTab); }, [fetchForTab, initialTab]);
  useEffect(() => { fetchForTab(activeTab); }, [activeTab, fetchForTab]);
  useEffect(() => {
    if (activeTab === 'dipendenti') fetchUtenti();
  }, [activeTab, fetchUtenti]);
  useEffect(() => {
    setActiveTab((prev) => (prev === initialTab ? prev : initialTab));
  }, [initialTab]);
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab !== initialTab) navigate(`/anagrafiche?tab=${initialTab}`, { replace: true });
  }, [initialTab, navigate, searchParams]);

  useEffect(() => {
    setFiltersOpen(false);
  }, [activeTab]);

  const tabs = [
    { id: 'fornitori' as TabType,  label: 'Fornitori',  icon: Building2, count: fornitori.length, disabled: !accessibleTabs.includes('fornitori') },
    { id: 'clienti' as TabType,    label: 'Clienti',    icon: User,      count: clienti.length, disabled: !accessibleTabs.includes('clienti') },
    { id: 'corrieri' as TabType,   label: 'Corrieri',   icon: Truck,     count: corrieri.length, disabled: !accessibleTabs.includes('corrieri') },
    { id: 'dipendenti' as TabType, label: 'Dipendenti', icon: Users,     count: dipendenti.length, disabled: !accessibleTabs.includes('dipendenti') },
  ];

  const getTabLabel = () => tabs.find(t => t.id === activeTab)?.label ?? '';

  const getNewButtonLabel = () => {
    switch (activeTab) {
      case 'fornitori':  return 'Nuovo Fornitore';
      case 'clienti':    return 'Nuovo Cliente';
      case 'corrieri':   return 'Nuovo Corriere';
      case 'dipendenti': return 'Nuovo Dipendente';
    }
  };

  const getBadgeAttivo = (attivo: boolean) =>
    attivo ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]';

  const handleNewClick = () => {
    setEditMode('create');
    setSelectedItem(null);
    switch (activeTab) {
      case 'fornitori':  setSupplierModalOpen(true); break;
      case 'clienti':    setClientModalOpen(true); break;
      case 'corrieri':   setCourierModalOpen(true); break;
      case 'dipendenti': setEmployeeModalOpen(true); break;
    }
  };

  const handleEdit = (item: any) => {
    setEditMode('edit');
    setSelectedItem(item);
    switch (activeTab) {
      case 'fornitori':  setSupplierModalOpen(true); break;
      case 'clienti':    setClientModalOpen(true); break;
      case 'corrieri':   setCourierModalOpen(true); break;
      case 'dipendenti': setEmployeeModalOpen(true); break;
    }
  };

  const handleDelete = (item: any) => {
    setItemToDelete({ tab: activeTab, item });
  };

  const getDeleteItemLabel = (tab: TabType, item: any) => {
    switch (tab) {
      case 'fornitori':
      case 'clienti':   return item.ragione_sociale;
      case 'corrieri':  return item.nome;
      case 'dipendenti': return `${item.nome} ${item.cognome}`;
      default: return '';
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const { tab, item } = itemToDelete;
    try {
      switch (tab) {
        case 'fornitori':
          await fornitoriApi.remove(item.id);
          setFornitori(prev => prev.filter(f => f.id !== item.id));
          toast.success('Fornitore eliminato');
          break;
        case 'clienti':
          await clientiApi.remove(item.id);
          setClienti(prev => prev.filter(c => c.id !== item.id));
          toast.success('Cliente eliminato');
          break;
        case 'corrieri':
          await corrieriApi.remove(item.id);
          setCorrieri(prev => prev.filter(c => c.id !== item.id));
          toast.success('Corriere eliminato');
          break;
        case 'dipendenti':
          await dipendentiApi.remove(item.id);
          setDipendenti(prev => prev.filter(d => d.id !== item.id));
          toast.success('Dipendente eliminato');
          break;
      }
    } catch (err: any) {
      toast.error('Eliminazione fallita', { description: err?.message });
    } finally {
      setItemToDelete(null);
    }
  };

  const TAB_TO_ENTITY_TYPE: Record<TabType, 'cliente' | 'fornitore' | 'corriere' | 'dipendente'> = {
    clienti: 'cliente',
    fornitori: 'fornitore',
    corrieri: 'corriere',
    dipendenti: 'dipendente',
  };

  const handleView = (item: any) => {
    const entityType = TAB_TO_ENTITY_TYPE[activeTab];
    if (detailDrawerOpen && detailEntityType === entityType && detailEntityId === item.id) {
      setDetailDrawerOpen(false);
      return;
    }
    setDetailEntityType(entityType);
    setDetailEntityId(item.id);
    setDetailDrawerOpen(true);
  };

  const handleEditFromDrawer = (item: any) => {
    setDetailDrawerOpen(false);
    handleEdit(item);
  };

  const handleSaveSupplier = async (data: FornitoreCreateRequest | FornitoreUpdateRequest, id?: number) => {
    try {
      if (editMode === 'create') {
        const created = await fornitoriApi.create(data as FornitoreCreateRequest);
        setFornitori(prev => [...prev, created]);
        toast.success('Fornitore creato');
      } else if (id !== undefined) {
        const updated = await fornitoriApi.update(id, data as FornitoreUpdateRequest);
        setFornitori(prev => prev.map(f => f.id === id ? updated : f));
        toast.success('Fornitore aggiornato');
      }
    } catch (err: any) {
      const msg = err?.code === 'DUPLICATE_ENTRY' ? 'P.IVA già associata a un altro fornitore'
        : err?.code === 'ACCESS_DENIED' ? "I fornitori dell'ecosistema non possono essere modificati"
        : err?.message;
      toast.error('Salvataggio fallito', { description: msg });
      throw err;
    }
  };

  const handleSaveClient = async (data: ClienteCreateRequest | ClienteUpdateRequest, id?: number) => {
    try {
      if (editMode === 'create') {
        const created = await clientiApi.create(data as ClienteCreateRequest);
        setClienti(prev => [...prev, created]);
        toast.success('Cliente creato');
        return created;
      } else if (id !== undefined) {
        const updated = await clientiApi.update(id, data as ClienteUpdateRequest);
        setClienti(prev => prev.map(c => c.id === id ? updated : c));
        toast.success('Cliente aggiornato');
        return updated;
      }
    } catch (err: any) {
      toast.error('Salvataggio fallito', { description: err?.code === 'DUPLICATE_ENTRY' ? 'P.IVA/CF già in uso' : err?.message });
      throw err;
    }
  };

  const handleSaveCourier = async (data: CorriereCreateRequest | CorriereUpdateRequest, id?: number) => {
    try {
      if (editMode === 'create') {
        const created = await corrieriApi.create(data as CorriereCreateRequest);
        setCorrieri(prev => [...prev, created]);
        toast.success('Corriere creato');
      } else if (id !== undefined) {
        const updated = await corrieriApi.update(id, data as CorriereUpdateRequest);
        setCorrieri(prev => prev.map(c => c.id === id ? updated : c));
        toast.success('Corriere aggiornato');
      }
    } catch (err: any) {
      toast.error('Salvataggio fallito', { description: err?.code === 'DUPLICATE_ENTRY' ? 'Codice corriere già in uso' : err?.message });
      throw err;
    }
  };

  const handleSaveEmployee = async (data: DipendenteCreateRequest | DipendenteUpdateRequest, id?: number) => {
    try {
      if (editMode === 'create') {
        const created = await dipendentiApi.create(data as DipendenteCreateRequest);
        setDipendenti(prev => [...prev, created]);
        await fetchUtenti();
        toast.success('Dipendente creato');
      } else if (id !== undefined) {
        const updated = await dipendentiApi.update(id, data as DipendenteUpdateRequest);
        setDipendenti(prev => prev.map(d => d.id === id ? updated : d));
        await fetchUtenti();
        toast.success('Dipendente aggiornato');
      }
    } catch (err: any) {
      toast.error('Salvataggio fallito', { description: err?.code === 'DUPLICATE_ENTRY' ? 'Codice fiscale già in uso' : err?.message });
      throw err;
    }
  };

  const ruoliOperativi = Array.from(
    new Set(dipendenti.map(d => d.ruolo_operativo).filter((r): r is string => !!r))
  ).sort((a, b) => a.localeCompare(b, 'it'));

  const utentiById = useMemo(
    () => new Map(utenti.map((utente) => [utente.id, utente])),
    [utenti]
  );

  const getFilteredData = () => {
    const q = searchQuery.toLowerCase();
    switch (activeTab) {
      case 'fornitori': {
        let data = fornitori.filter(f =>
          f.ragione_sociale.toLowerCase().includes(q) ||
          (f.piva ?? '').toLowerCase().includes(q) ||
          (f.email ?? '').toLowerCase().includes(q)
        );
        if (fornitoriFilters.stato !== 'tutti') data = data.filter(f => f.attivo === (fornitoriFilters.stato === 'attivo'));
        if (fornitoriFilters.ordinamento === 'alfabetico') {
          data = [...data].sort((a, b) => a.ragione_sociale.localeCompare(b.ragione_sociale, 'it'));
        }
        data = applySort(data, fornitoriSort, compareFornitoriByKey);
        return [...data].sort((a, b) => Number(a.attivo === false) - Number(b.attivo === false));
      }
      case 'clienti': {
        let data = clienti.filter(c =>
          c.ragione_sociale.toLowerCase().includes(q) ||
          (c.piva_cf ?? '').toLowerCase().includes(q) ||
          (c.email ?? '').toLowerCase().includes(q)
        );
        if (clientiFilters.stato !== 'tutti') data = data.filter(c => c.attivo === (clientiFilters.stato === 'attivo'));
        if (clientiFilters.ordinamento === 'alfabetico') {
          data = [...data].sort((a, b) => a.ragione_sociale.localeCompare(b.ragione_sociale, 'it'));
        }
        data = applySort(data, clientiSort, compareClientiByKey);
        return [...data].sort((a, b) => Number(a.attivo === false) - Number(b.attivo === false));
      }
      case 'corrieri': {
        let data = corrieri.filter(c =>
          c.nome.toLowerCase().includes(q) || c.codice.toLowerCase().includes(q)
        );
        if (corrieriFilters.ordinamento === 'alfabetico') {
          data = [...data].sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
        }
        return applySort(data, corrieriSort, compareCorrieriByKey);
      }
      case 'dipendenti': {
        let data = dipendenti.filter(d =>
          d.nome.toLowerCase().includes(q) ||
          d.cognome.toLowerCase().includes(q) ||
          d.codice_fiscale.toLowerCase().includes(q) ||
          (d.ruolo_operativo ?? '').toLowerCase().includes(q)
        );
        if (dipendentiFilters.ruolo !== 'tutti') data = data.filter(d => (d.ruolo_operativo ?? '') === dipendentiFilters.ruolo);
        if (dipendentiFilters.dataAssunzione) data = data.filter(d => (d.data_assunzione ?? '').slice(0, 4) === dipendentiFilters.dataAssunzione);
        if (dipendentiFilters.ordinamento === 'alfabetico') {
          data = [...data].sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`, 'it'));
        }
        return applySort(data, dipendentiSort, (left, right, key) => compareDipendentiByKey(left, right, key, utentiById));
      }
      default: return [];
    }
  };

  const filteredData       = getFilteredData();
  const filteredFornitori  = activeTab === 'fornitori'  ? (filteredData as Fornitore[]) : [];
  const filteredClienti    = activeTab === 'clienti'    ? (filteredData as Cliente[]) : [];
  const filteredCorrieri   = activeTab === 'corrieri'   ? (filteredData as Corriere[]) : [];
  const filteredDipendenti = activeTab === 'dipendenti' ? (filteredData as Dipendente[]) : [];

  const getLinkedUserLabel = (dipendente: Dipendente) => {
    if (!dipendente.utente_id) return null;
    const utente = utentiById.get(dipendente.utente_id);
    return utente?.ruolo_nome ?? utente?.ruolo ?? `Utente #${dipendente.utente_id}`;
  };

  const handleOpenLinkedUser = (dipendente: Dipendente) => {
    if (!dipendente.utente_id) return;
    navigate(`/amministrazione?tab=utenti&highlightUserId=${dipendente.utente_id}`);
  };

  const tabEntity = activeTab; 

  const canWrite  = (entity: string) => hasPermesso(entity === 'corrieri' ? 'magazzino:write' : `${entity}:write`);
  const canDelete = (entity: string) => hasPermesso(`${entity}:delete`);

  const KebabMenu = ({ item, hideEdit }: { item: any; hideEdit?: boolean }) => {
    const showEdit = !hideEdit && canWrite(tabEntity);
    const showDelete = canDelete(tabEntity) && tabEntity !== 'fornitori' && tabEntity !== 'clienti';

    if (!showEdit && !showDelete) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 hover:bg-[#F7F9FC] text-[#6B7280] rounded-lg transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {showEdit && (
            <DropdownMenuItem onClick={() => handleEdit(item)} className="cursor-pointer">
              <Edit className="w-4 h-4 mr-2" />Modifica
            </DropdownMenuItem>
          )}
          {showDelete && (
            <DropdownMenuItem onClick={() => handleDelete(item)} className="cursor-pointer text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              {activeTab === 'dipendenti' ? 'Elimina (definitivo)' : 'Elimina'}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const SkeletonRows = ({ cols }: { cols: number }) => (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-[#E5EAF2]">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="py-3 px-4">
              <div className="h-4 bg-[#E5EAF2] rounded animate-pulse" style={{ width: j === 0 ? '60%' : '45%' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  const EmptyRow = ({ cols, msg }: { cols: number; msg: string }) => (
    <tr><td colSpan={cols} className="py-12 text-center text-[#6B7280] text-sm">{msg}</td></tr>
  );

  const loading = activeTab === 'fornitori' ? loadingFornitori
    : activeTab === 'clienti' ? loadingClienti
    : activeTab === 'corrieri' ? loadingCorrieri
    : loadingDipendenti;

  const activeFiltersCount = activeTab === 'fornitori'
    ? (fornitoriFilters.ordinamento !== 'nessuno' ? 1 : 0) + (fornitoriFilters.stato !== 'tutti' ? 1 : 0)
    : activeTab === 'clienti'
    ? (clientiFilters.ordinamento !== 'nessuno' ? 1 : 0) + (clientiFilters.stato !== 'tutti' ? 1 : 0)
    : activeTab === 'corrieri'
    ? (corrieriFilters.ordinamento !== 'nessuno' ? 1 : 0)
    : activeTab === 'dipendenti'
    ? (dipendentiFilters.ordinamento !== 'nessuno' ? 1 : 0) + (dipendentiFilters.ruolo !== 'tutti' ? 1 : 0) + (dipendentiFilters.dataAssunzione !== '' ? 1 : 0)
    : 0;

  const resetActiveFilters = () => {
    switch (activeTab) {
      case 'fornitori':  setFornitoriFilters(EMPTY_ANAGRAFICA_FILTERS); break;
      case 'clienti':    setClientiFilters(EMPTY_ANAGRAFICA_FILTERS); break;
      case 'corrieri':   setCorrieriFilters(EMPTY_CORRIERI_FILTERS); break;
      case 'dipendenti': setDipendentiFilters(EMPTY_DIPENDENTI_FILTERS); break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">
            Gestione Anagrafiche — {getTabLabel()}
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">Gestisci fornitori, clienti, corrieri e dipendenti</p>
        </div>
        <div className="flex items-center gap-3">
          {/*
          <button className="px-4 py-2 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all flex items-center gap-2">
            <Upload className="w-4 h-4" /> Importa
          </button>
          <button className="px-4 py-2 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Esporta
          </button> */}
          {canWrite(tabEntity) && (
            <button
              onClick={handleNewClick}
              className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              {getNewButtonLabel()}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
        <PageTabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as TabType)} />

        <div className="p-6">
          <div className="mb-6">
            {(
              <FilterPanel
                open={filtersOpen}
                activeFiltersCount={activeFiltersCount}
                onToggleOpen={() => setFiltersOpen(o => !o)}
                onReset={resetActiveFilters}
                filterGroups={
                  activeTab === 'fornitori' ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D] mb-2">Ordinamento</p>
                        <div className="flex flex-wrap gap-2">
                          <FilterButton
                            label="Ragione Sociale (A → Z)"
                            active={fornitoriFilters.ordinamento === 'alfabetico'}
                            onClick={() => setFornitoriFilters(f => ({ ...f, ordinamento: f.ordinamento === 'alfabetico' ? 'nessuno' : 'alfabetico' }))}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D] mb-2">Stato</p>
                        <div className="flex flex-wrap gap-2">
                          <FilterButton label="Tutti" active={fornitoriFilters.stato === 'tutti'} onClick={() => setFornitoriFilters(f => ({ ...f, stato: 'tutti' }))} />
                          <FilterButton label="Attivo" active={fornitoriFilters.stato === 'attivo'} onClick={() => setFornitoriFilters(f => ({ ...f, stato: 'attivo' }))} />
                          <FilterButton label="Disattivo" active={fornitoriFilters.stato === 'disattivo'} onClick={() => setFornitoriFilters(f => ({ ...f, stato: 'disattivo' }))} />
                        </div>
                      </div>
                    </>
                  ) : activeTab === 'clienti' ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D] mb-2">Ordinamento</p>
                        <div className="flex flex-wrap gap-2">
                          <FilterButton
                            label="Denominazione Cliente (A → Z)"
                            active={clientiFilters.ordinamento === 'alfabetico'}
                            onClick={() => setClientiFilters(f => ({ ...f, ordinamento: f.ordinamento === 'alfabetico' ? 'nessuno' : 'alfabetico' }))}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D] mb-2">Stato</p>
                        <div className="flex flex-wrap gap-2">
                          <FilterButton label="Tutti" active={clientiFilters.stato === 'tutti'} onClick={() => setClientiFilters(f => ({ ...f, stato: 'tutti' }))} />
                          <FilterButton label="Attivo" active={clientiFilters.stato === 'attivo'} onClick={() => setClientiFilters(f => ({ ...f, stato: 'attivo' }))} />
                          <FilterButton label="Disattivo" active={clientiFilters.stato === 'disattivo'} onClick={() => setClientiFilters(f => ({ ...f, stato: 'disattivo' }))} />
                        </div>
                      </div>
                    </>
                  ) : activeTab === 'corrieri' ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D] mb-2">Ordinamento</p>
                        <div className="flex flex-wrap gap-2">
                          <FilterButton
                            label="Nome (A → Z)"
                            active={corrieriFilters.ordinamento === 'alfabetico'}
                            onClick={() => setCorrieriFilters(f => ({ ...f, ordinamento: f.ordinamento === 'alfabetico' ? 'nessuno' : 'alfabetico' }))}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D] mb-2">Ordinamento</p>
                        <div className="flex flex-wrap gap-2">
                          <FilterButton
                            label="Nominativo (A → Z)"
                            active={dipendentiFilters.ordinamento === 'alfabetico'}
                            onClick={() => setDipendentiFilters(f => ({ ...f, ordinamento: f.ordinamento === 'alfabetico' ? 'nessuno' : 'alfabetico' }))}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D] mb-2">Ruolo Operativo</p>
                        <select
                          value={dipendentiFilters.ruolo}
                          onChange={(e) => setDipendentiFilters(f => ({ ...f, ruolo: e.target.value }))}
                          className="h-10 px-3 bg-white border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
                        >
                          <option value="tutti">Tutti</option>
                          {ruoliOperativi.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D] mb-2">Anno Assunzione</p>
                        <input
                          type="number"
                          placeholder="Filtra per anno"
                          value={dipendentiFilters.dataAssunzione}
                          onChange={(e) => setDipendentiFilters(f => ({ ...f, dataAssunzione: e.target.value }))}
                          className="h-10 px-3 w-28 bg-white border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
                        />
                      </div>
                    </>
                  )
                }
              >
                <div className="relative">
                  <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Cerca ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all"
                  />
                </div>
              </FilterPanel>
            )}
          </div>

          {/* ── FORNITORI ── */}
          {activeTab === 'fornitori' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5EAF2]">
                    <SortableHeader label="Ragione Sociale" sortKey="ragione_sociale" sort={fornitoriSort} onSort={handleFornitoriSort} />
                    <SortableHeader label="P. IVA" sortKey="piva" sort={fornitoriSort} onSort={handleFornitoriSort} />
                    <SortableHeader label="Contatti" sortKey="email" sort={fornitoriSort} onSort={handleFornitoriSort} />
                    <SortableHeader label="Indirizzo" sortKey="indirizzo" sort={fornitoriSort} onSort={handleFornitoriSort} />
                    <SortableHeader label="Sorgente" sortKey="source" sort={fornitoriSort} onSort={handleFornitoriSort} />
                    <SortableHeader label="Stato" sortKey="attivo" sort={fornitoriSort} onSort={handleFornitoriSort} />
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingFornitori ? <SkeletonRows cols={7} /> : filteredFornitori.length === 0
                    ? <EmptyRow cols={7} msg={searchQuery || activeFiltersCount > 0 ? 'Nessun fornitore corrisponde alla ricerca' : 'Nessun fornitore. Clicca "Nuovo Fornitore" per iniziare.'} />
                    : filteredFornitori.map((f, i) => (
                      <tr key={f.id} onClick={() => handleView(f)} className={`cursor-pointer border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}`}>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#2D2D2D]">{f.ragione_sociale}</div>
                          {f.sito_web && (
                            <a href={f.sito_web} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#17E88F] hover:underline mt-0.5">
                              <ExternalLink className="w-3 h-3" />{f.sito_web.replace(/^https?:\/\//, '')}
                            </a>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{f.piva ?? <span className="italic text-[#9CA3AF]">—</span>}</td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {f.email && <div className="flex items-center gap-2 text-xs text-[#6B7280]"><Mail className="w-3 h-3 shrink-0" />{f.email}</div>}
                            {f.telefono && <div className="flex items-center gap-2 text-xs text-[#6B7280]"><Phone className="w-3 h-3 shrink-0" />{f.telefono}</div>}
                            {!f.email && !f.telefono && <span className="text-xs italic text-[#9CA3AF]">—</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {f.indirizzo
                            ? <div className="flex items-center gap-2 text-sm text-[#6B7280]"><MapPin className="w-3 h-3 shrink-0" /><span className="truncate max-w-[160px]">{f.indirizzo}</span></div>
                            : <span className="text-sm italic text-[#9CA3AF]">—</span>}
                        </td>
                        <td className="py-3 px-4">
                          {f.source === 'ecosystem'
                            ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#6366F1]"><Globe className="w-3 h-3" /> Ecosistema</span>
                            : <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F3F4F6] text-[#6B7280]">Manuale</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getBadgeAttivo(f.attivo)}`}>
                            {f.attivo ? 'Attivo' : 'Disattivo'}
                          </span>
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}><KebabMenu item={f} hideEdit={f.source === 'ecosystem'} /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── CLIENTI ── */}
          {activeTab === 'clienti' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5EAF2]">
                    <SortableHeader label="Denominazione Cliente" sortKey="ragione_sociale" sort={clientiSort} onSort={handleClientiSort} />
                    <SortableHeader label="P. IVA / CF" sortKey="piva_cf" sort={clientiSort} onSort={handleClientiSort} />
                    <SortableHeader label="Contatti" sortKey="email" sort={clientiSort} onSort={handleClientiSort} />
                    <SortableHeader label="Sorgente" sortKey="source" sort={clientiSort} onSort={handleClientiSort} />
                    <SortableHeader label="Stato" sortKey="attivo" sort={clientiSort} onSort={handleClientiSort} />
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingClienti ? <SkeletonRows cols={6} /> : filteredClienti.length === 0
                    ? <EmptyRow cols={6} msg={searchQuery || activeFiltersCount > 0 ? 'Nessun cliente corrisponde alla ricerca' : 'Nessun cliente. Clicca "Nuovo Cliente" per iniziare.'} />
                    : filteredClienti.map((c, i) => (
                      <tr key={c.id} onClick={() => handleView(c)} className={`cursor-pointer border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}`}>
                        <td className="py-3 px-4 font-medium text-[#2D2D2D]">{c.ragione_sociale}</td>
                        <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{c.piva_cf ?? <span className="italic text-[#9CA3AF]">—</span>}</td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {c.email && <div className="flex items-center gap-2 text-xs text-[#6B7280]"><Mail className="w-3 h-3 shrink-0" />{c.email}</div>}
                            {c.telefono && <div className="flex items-center gap-2 text-xs text-[#6B7280]"><Phone className="w-3 h-3 shrink-0" />{c.telefono}</div>}
                            {!c.email && !c.telefono && <span className="text-xs italic text-[#9CA3AF]">—</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {c.source === 'ecosystem'
                            ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#6366F1]"><Globe className="w-3 h-3" /> Ecosistema</span>
                            : <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F3F4F6] text-[#6B7280]">Manuale</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getBadgeAttivo(c.attivo)}`}>
                            {c.attivo ? 'Attivo' : 'Disattivo'}
                          </span>
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}><KebabMenu item={c} /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── CORRIERI ── */}
          {activeTab === 'corrieri' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5EAF2]">
                    <SortableHeader label="Codice" sortKey="codice" sort={corrieriSort} onSort={handleCorrieriSort} />
                    <SortableHeader label="Nome" sortKey="nome" sort={corrieriSort} onSort={handleCorrieriSort} />
                    <SortableHeader label="Email" sortKey="email" sort={corrieriSort} onSort={handleCorrieriSort} />
                    <SortableHeader label="Telefono" sortKey="telefono" sort={corrieriSort} onSort={handleCorrieriSort} />
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingCorrieri ? <SkeletonRows cols={5} /> : filteredCorrieri.length === 0
                    ? <EmptyRow cols={5} msg={searchQuery ? 'Nessun corriere corrisponde alla ricerca' : 'Nessun corriere. Clicca "Nuovo Corriere" per iniziare.'} />
                    : filteredCorrieri.map((c, i) => (
                      <tr key={c.id} onClick={() => handleView(c)} className={`cursor-pointer border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}`}>
                        <td className="py-3 px-4 text-sm font-mono font-semibold text-[#2D2D2D]">{c.codice}</td>
                        <td className="py-3 px-4 font-medium text-[#2D2D2D]">{c.nome}</td>
                        <td className="py-3 px-4">
                          {c.email ? <div className="flex items-center gap-2 text-sm text-[#6B7280]"><Mail className="w-3 h-3 shrink-0" />{c.email}</div>
                            : <span className="text-sm italic text-[#9CA3AF]">—</span>}
                        </td>
                        <td className="py-3 px-4">
                          {c.telefono ? <div className="flex items-center gap-2 text-sm text-[#6B7280]"><Phone className="w-3 h-3 shrink-0" />{c.telefono}</div>
                            : <span className="text-sm italic text-[#9CA3AF]">—</span>}
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}><KebabMenu item={c} /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── DIPENDENTI ── */}
          {activeTab === 'dipendenti' && (
            <div className="overflow-x-auto">
              <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700">
                  L'eliminazione di un dipendente è permanente (hard delete). Le spedizioni associate manterranno lo storico senza autista assegnato.
                </p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5EAF2]">
                    <SortableHeader label="Nominativo" sortKey="nominativo" sort={dipendentiSort} onSort={handleDipendentiSort} />
                    <SortableHeader label="Codice Fiscale" sortKey="codice_fiscale" sort={dipendentiSort} onSort={handleDipendentiSort} />
                    <SortableHeader label="Ruolo Operativo" sortKey="ruolo_operativo" sort={dipendentiSort} onSort={handleDipendentiSort} />
                    <SortableHeader label="Utente Collegato" sortKey="collegamento" sort={dipendentiSort} onSort={handleDipendentiSort} />
                    <SortableHeader label="Data Assunzione" sortKey="data_assunzione" sort={dipendentiSort} onSort={handleDipendentiSort} />
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingDipendenti ? <SkeletonRows cols={6} /> : filteredDipendenti.length === 0
                    ? <EmptyRow cols={6} msg={searchQuery || activeFiltersCount > 0 ? 'Nessun dipendente corrisponde alla ricerca' : 'Nessun dipendente. Clicca "Nuovo Dipendente" per iniziare.'} />
                    : filteredDipendenti.map((d, i) => (
                      <tr key={d.id} onClick={() => handleView(d)} className={`cursor-pointer border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-xs font-semibold text-[#6366F1]">
                              {d.nome[0]}{d.cognome[0]}
                            </div>
                            <span className="font-medium text-[#2D2D2D]">{d.nome} {d.cognome}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{d.codice_fiscale}</td>
                        <td className="py-3 px-4">
                          {d.ruolo_operativo
                            ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F0FDF7] text-[#0FA67A]"><Users className="w-3 h-3" />{d.ruolo_operativo}</span>
                            : <span className="text-sm italic text-[#9CA3AF]">—</span>}
                        </td>
                        <td className="py-3 px-4">
                          {d.utente_id ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenLinkedUser(d);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#E0E7FF] transition-colors"
                            >
                              <Link2 className="w-3 h-3" />
                              {getLinkedUserLabel(d)}
                            </button>
                          ) : (
                            <span className="text-sm italic text-[#9CA3AF]">Non collegato</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {d.data_assunzione
                            ? <div className="flex items-center gap-2 text-sm text-[#6B7280]"><Calendar className="w-3 h-3 shrink-0" />{formatDataBreve(d.data_assunzione)}</div>
                            : <span className="text-sm italic text-[#9CA3AF]">—</span>}
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}><KebabMenu item={d} /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E5EAF2]">
            <div className="text-sm text-[#6B7280]">
              Mostrando <span className="font-medium text-[#2D2D2D]">{loading ? '…' : filteredData.length}</span> risultati
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all text-sm">Precedente</button>
              <button className="px-3 py-1.5 bg-[#17E88F] text-white rounded-lg font-medium text-sm">1</button>
              <button className="px-3 py-1.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all text-sm">Successivo</button>
            </div>
          </div>
        </div>
      </div>

      <SupplierFormModal open={supplierModalOpen} onClose={() => setSupplierModalOpen(false)} onSave={handleSaveSupplier} initialData={selectedItem} mode={editMode} />
      <ClientFormModal  open={clientModalOpen}   onClose={() => setClientModalOpen(false)}   onSave={handleSaveClient}   initialData={selectedItem} mode={editMode} />
      <CourierFormModal open={courierModalOpen}   onClose={() => setCourierModalOpen(false)}   onSave={handleSaveCourier}  initialData={selectedItem} mode={editMode} />
      <EmployeeFormModal open={employeeModalOpen} onClose={() => setEmployeeModalOpen(false)} onSave={handleSaveEmployee} initialData={selectedItem} utenti={utenti} dipendenti={dipendenti} mode={editMode} />

      <AlertDialog open={!!itemToDelete} onOpenChange={(v) => { if (!v) setItemToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {itemToDelete?.tab === 'dipendenti' ? 'Eliminare il dipendente?' : 'Eliminare l\'elemento?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Stai per eliminare <strong>{itemToDelete && getDeleteItemLabel(itemToDelete.tab, itemToDelete.item)}</strong>.{' '}
              {itemToDelete?.tab === 'dipendenti'
                ? "L'eliminazione è PERMANENTE e non può essere annullata. Le spedizioni associate manterranno lo storico senza autista assegnato."
                : "L'operazione è definitiva e non può essere annullata."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {detailEntityType && (
        <AnagraficaDetailDrawer
          entityType={detailEntityType}
          entityId={detailEntityId}
          isOpen={detailDrawerOpen}
          onClose={() => setDetailDrawerOpen(false)}
          onEdit={handleEditFromDrawer}
        />
      )}
    </div>
  );
}
