import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Plus, Download, Upload, Filter, MoreVertical,
  Edit, Trash2, Mail, Phone, MapPin, Building2,
  User, Truck, Globe, ExternalLink, Users, Calendar, AlertTriangle, ArrowUpDown,
} from 'lucide-react';
import { PageTabBar } from '../../components/ui/PageTabBar';
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
import { useAuthStore } from '../../store/authStore';
import type { Fornitore, FornitoreCreateRequest, FornitoreUpdateRequest } from '../../types/fornitori';
import type { Cliente, ClienteCreateRequest, ClienteUpdateRequest } from '../../types/clienti';
import type {
  Corriere, CorriereCreateRequest, CorriereUpdateRequest,
  Dipendente, DipendenteCreateRequest, DipendenteUpdateRequest,
} from '../../types/corrieri';

type TabType = 'fornitori' | 'clienti' | 'corrieri' | 'dipendenti';

const formatDataBreve = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export function AnagrafichePage() {
  const { hasPermesso } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabType>('fornitori');
  const [searchQuery, setSearchQuery] = useState('');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statoFilter, setStatoFilter] = useState<'tutti' | 'attivo' | 'disattivo'>('tutti');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [ruoloFilter, setRuoloFilter] = useState<string>('tutti');
  const [dipendentiSortField, setDipendentiSortField] = useState<'nominativo' | 'data_assunzione'>('nominativo');

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

  useEffect(() => { fetchForTab('fornitori'); }, []);
  useEffect(() => { fetchForTab(activeTab); }, [activeTab, fetchForTab]);

  useEffect(() => {
    setFiltersOpen(false);
    setStatoFilter('tutti');
    setSortOrder('asc');
    setRuoloFilter('tutti');
    setDipendentiSortField('nominativo');
  }, [activeTab]);

  const tabs = [
    { id: 'fornitori' as TabType,  label: 'Fornitori',  icon: Building2, count: fornitori.length },
    { id: 'clienti' as TabType,    label: 'Clienti',    icon: User,      count: clienti.length },
    { id: 'corrieri' as TabType,   label: 'Corrieri',   icon: Truck,     count: corrieri.length },
    { id: 'dipendenti' as TabType, label: 'Dipendenti', icon: Users,     count: dipendenti.length },
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
      } else if (id !== undefined) {
        const updated = await clientiApi.update(id, data as ClienteUpdateRequest);
        setClienti(prev => prev.map(c => c.id === id ? updated : c));
        toast.success('Cliente aggiornato');
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
        toast.success('Dipendente creato');
      } else if (id !== undefined) {
        const updated = await dipendentiApi.update(id, data as DipendenteUpdateRequest);
        setDipendenti(prev => prev.map(d => d.id === id ? updated : d));
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

  const getFilteredData = () => {
    const q = searchQuery.toLowerCase();
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    switch (activeTab) {
      case 'fornitori': {
        let data = fornitori.filter(f =>
          f.ragione_sociale.toLowerCase().includes(q) ||
          (f.piva ?? '').toLowerCase().includes(q) ||
          (f.email ?? '').toLowerCase().includes(q)
        );
        if (statoFilter !== 'tutti') data = data.filter(f => f.attivo === (statoFilter === 'attivo'));
        return [...data].sort((a, b) => sortDir * a.ragione_sociale.localeCompare(b.ragione_sociale, 'it'));
      }
      case 'clienti': {
        let data = clienti.filter(c =>
          c.ragione_sociale.toLowerCase().includes(q) ||
          (c.piva_cf ?? '').toLowerCase().includes(q) ||
          (c.email ?? '').toLowerCase().includes(q)
        );
        if (statoFilter !== 'tutti') data = data.filter(c => c.attivo === (statoFilter === 'attivo'));
        return [...data].sort((a, b) => sortDir * a.ragione_sociale.localeCompare(b.ragione_sociale, 'it'));
      }
      case 'corrieri':
        return corrieri.filter(c =>
          c.nome.toLowerCase().includes(q) || c.codice.toLowerCase().includes(q)
        );
      case 'dipendenti': {
        let data = dipendenti.filter(d =>
          d.nome.toLowerCase().includes(q) ||
          d.cognome.toLowerCase().includes(q) ||
          d.codice_fiscale.toLowerCase().includes(q) ||
          (d.ruolo_operativo ?? '').toLowerCase().includes(q)
        );
        if (ruoloFilter !== 'tutti') data = data.filter(d => (d.ruolo_operativo ?? '') === ruoloFilter);
        return [...data].sort((a, b) => {
          if (dipendentiSortField === 'nominativo') {
            return sortDir * `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`, 'it');
          }
          const da = a.data_assunzione ? new Date(a.data_assunzione).getTime() : 0;
          const db = b.data_assunzione ? new Date(b.data_assunzione).getTime() : 0;
          return sortDir * (da - db);
        });
      }
      default: return [];
    }
  };

  const filteredData       = getFilteredData();
  const filteredFornitori  = activeTab === 'fornitori'  ? (filteredData as Fornitore[]) : [];
  const filteredClienti    = activeTab === 'clienti'    ? (filteredData as Cliente[]) : [];
  const filteredCorrieri   = activeTab === 'corrieri'   ? (filteredData as Corriere[]) : [];
  const filteredDipendenti = activeTab === 'dipendenti' ? (filteredData as Dipendente[]) : [];

  const tabEntity = activeTab; 

  const canWrite  = (entity: string) => hasPermesso(`${entity}:write`);
  const canDelete = (entity: string) => hasPermesso(`${entity}:delete`);

  const KebabMenu = ({ item, hideEdit }: { item: any; hideEdit?: boolean }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 hover:bg-[#F7F9FC] text-[#6B7280] rounded-lg transition-all">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {!hideEdit && canWrite(tabEntity) && (
          <DropdownMenuItem onClick={() => handleEdit(item)} className="cursor-pointer">
            <Edit className="w-4 h-4 mr-2" />Modifica
          </DropdownMenuItem>
        )}
        {canDelete(tabEntity) && (
          <DropdownMenuItem onClick={() => handleDelete(item)} className="cursor-pointer text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            {activeTab === 'dipendenti' ? 'Elimina (definitivo)' : 'Elimina'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Cerca ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all"
              />
            </div>
            {activeTab !== 'corrieri' && (
              <button
                onClick={() => setFiltersOpen(o => !o)}
                className={`px-4 py-2 border rounded-xl transition-all flex items-center gap-2 ${
                  filtersOpen ? 'bg-[#F0FDF7] border-[#17E88F] text-[#0FA67A]' : 'bg-[#F7F9FC] border-[#E5EAF2] text-[#6B7280] hover:bg-white'
                }`}
              >
                <Filter className="w-4 h-4" /> Filtri
              </button>
            )}
          </div>

          {filtersOpen && (activeTab === 'fornitori' || activeTab === 'clienti') && (
            <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">
                  Ordina per {activeTab === 'fornitori' ? 'Ragione Sociale' : 'Denominazione Cliente'}
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="h-10 px-3 bg-white border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
                >
                  <option value="asc">A → Z</option>
                  <option value="desc">Z → A</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Stato</label>
                <select
                  value={statoFilter}
                  onChange={(e) => setStatoFilter(e.target.value as 'tutti' | 'attivo' | 'disattivo')}
                  className="h-10 px-3 bg-white border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
                >
                  <option value="tutti">Tutti</option>
                  <option value="attivo">Attivo</option>
                  <option value="disattivo">Disattivo</option>
                </select>
              </div>
            </div>
          )}

          {filtersOpen && activeTab === 'dipendenti' && (
            <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Ordina per</label>
                <select
                  value={dipendentiSortField}
                  onChange={(e) => setDipendentiSortField(e.target.value as 'nominativo' | 'data_assunzione')}
                  className="h-10 px-3 bg-white border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
                >
                  <option value="nominativo">Nominativo</option>
                  <option value="data_assunzione">Data Assunzione</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Ordine</label>
                <button
                  onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
                  className="h-10 px-3 bg-white border border-[#E5EAF2] rounded-xl hover:bg-[#F7F9FC] transition-all text-sm flex items-center gap-2 text-[#6B7280]"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {dipendentiSortField === 'nominativo'
                    ? (sortOrder === 'asc' ? 'A → Z' : 'Z → A')
                    : (sortOrder === 'asc' ? 'Meno recente' : 'Più recente')}
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Ruolo Operativo</label>
                <select
                  value={ruoloFilter}
                  onChange={(e) => setRuoloFilter(e.target.value)}
                  className="h-10 px-3 bg-white border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all text-sm"
                >
                  <option value="tutti">Tutti</option>
                  {ruoliOperativi.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ── FORNITORI ── */}
          {activeTab === 'fornitori' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5EAF2]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Ragione Sociale</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">P. IVA</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Contatti</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Indirizzo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Sorgente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Stato</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingFornitori ? <SkeletonRows cols={7} /> : filteredFornitori.length === 0
                    ? <EmptyRow cols={7} msg={searchQuery ? 'Nessun fornitore corrisponde alla ricerca' : 'Nessun fornitore. Clicca "Nuovo Fornitore" per iniziare.'} />
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Denominazione Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">P. IVA / CF</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Contatti</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Sorgente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Stato</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingClienti ? <SkeletonRows cols={6} /> : filteredClienti.length === 0
                    ? <EmptyRow cols={6} msg={searchQuery ? 'Nessun cliente corrisponde alla ricerca' : 'Nessun cliente. Clicca "Nuovo Cliente" per iniziare.'} />
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Codice</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Telefono</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Stato</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingCorrieri ? <SkeletonRows cols={6} /> : filteredCorrieri.length === 0
                    ? <EmptyRow cols={6} msg={searchQuery ? 'Nessun corriere corrisponde alla ricerca' : 'Nessun corriere. Clicca "Nuovo Corriere" per iniziare.'} />
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Nominativo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Codice Fiscale</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Ruolo Operativo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Data Assunzione</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingDipendenti ? <SkeletonRows cols={5} /> : filteredDipendenti.length === 0
                    ? <EmptyRow cols={5} msg={searchQuery ? 'Nessun dipendente corrisponde alla ricerca' : 'Nessun dipendente. Clicca "Nuovo Dipendente" per iniziare.'} />
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
      <EmployeeFormModal open={employeeModalOpen} onClose={() => setEmployeeModalOpen(false)} onSave={handleSaveEmployee} initialData={selectedItem} mode={editMode} />

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
