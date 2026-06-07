import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Building2,
  Package,
  User,
  Truck,
  ChevronRight,
  Tag,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { PageTabBar } from '../../components/ui/PageTabBar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { ProductFormModal } from '../anagrafiche/components/ProductFormModal';
import { CategoryFormModal, type CategoryFormData } from '../anagrafiche/components/CategoryFormModal';
import { SupplierFormModal } from '../anagrafiche/components/SupplierFormModal';
import { ClientFormModal } from '../anagrafiche/components/ClientFormModal';
import { CourierFormModal, type CourierFormData } from '../anagrafiche/components/CourierFormModal';
import { toast } from 'sonner';
import { prodottiApi } from '../../api/prodottiApi';
import { fornitoriApi } from '../../api/fornitoriApi';
import { clientiApi } from '../../api/clientiApi';
import { useAuthStore } from '../../store/authStore';
import type { ProdottoListino, ProdottoCreateRequest, ProdottoUpdateRequest } from '../../types/prodotti';
import type { Fornitore, FornitoreCreateRequest, FornitoreUpdateRequest } from '../../types/fornitori';
import type { Cliente, ClienteCreateRequest, ClienteUpdateRequest } from '../../types/clienti';

type TabType = 'prodotti' | 'categorie' | 'fornitori' | 'clienti' | 'corrieri';

interface Categoria {
  id: number;
  nome: string;
  padre: string | null;
  prodottiCount: number;
}

interface Corriere {
  id: number;
  nome: string;
  codice: string;
  email: string;
  telefono: string;
  spedizioniAttive: number;
  stato: 'Attivo' | 'Sospeso';
}

const formatPrezzo = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

const formatData = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function AnagrafichePage() {
  const { hasPermesso } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabType>('prodotti');
  const [searchQuery, setSearchQuery] = useState('');

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [courierModalOpen, setCourierModalOpen] = useState(false);

  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit' | 'subcategory'>('create');
  const [parentCategoryForSub, setParentCategoryForSub] = useState<string>('');

  const [prodotti, setProdotti] = useState<ProdottoListino[]>([]);
  const [loadingProdotti, setLoadingProdotti] = useState(false);

  const [fornitori, setFornitori] = useState<Fornitore[]>([]);
  const [loadingFornitori, setLoadingFornitori] = useState(false);

  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [loadingClienti, setLoadingClienti] = useState(false);

  const [categorieState, setCategorieState] = useState<Categoria[]>([]);
  const [corrieriState, setCorrieriState] = useState<Corriere[]>([]);

  const fetchProdotti = useCallback(async () => {
    setLoadingProdotti(true);
    try { setProdotti(await prodottiApi.list()); }
    catch (err: any) { toast.error('Errore caricamento prodotti', { description: err?.message }); }
    finally { setLoadingProdotti(false); }
  }, []);

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

  useEffect(() => { fetchProdotti(); }, [fetchProdotti]);
  useEffect(() => { fetchFornitori(); }, [fetchFornitori]);
  useEffect(() => { fetchClienti(); }, [fetchClienti]);

  const tabs = [
    { id: 'prodotti' as TabType, label: 'Prodotti', icon: Package, count: prodotti.length },
    { id: 'categorie' as TabType, label: 'Categorie', icon: Tag, count: categorieState.filter(c => !c.padre).length },
    { id: 'fornitori' as TabType, label: 'Fornitori', icon: Building2, count: fornitori.length },
    { id: 'clienti' as TabType, label: 'Clienti', icon: User, count: clienti.length },
    { id: 'corrieri' as TabType, label: 'Corrieri', icon: Truck, count: corrieriState.length },
  ];

  const getTabLabel = () => tabs.find(t => t.id === activeTab)?.label ?? '';

  const getNewButtonLabel = () => {
    switch (activeTab) {
      case 'prodotti':  return 'Nuovo Prodotto';
      case 'categorie': return 'Nuova Categoria';
      case 'fornitori': return 'Nuovo Fornitore';
      case 'clienti':   return 'Nuovo Cliente';
      case 'corrieri':  return 'Nuovo Corriere';
    }
  };

  const getBadgeAttivo = (attivo: boolean) =>
    attivo ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]';

  const handleNewClick = () => {
    setEditMode('create');
    setSelectedItem(null);
    switch (activeTab) {
      case 'prodotti':  setProductModalOpen(true); break;
      case 'categorie': setCategoryModalMode('create'); setCategoryModalOpen(true); break;
      case 'fornitori': setSupplierModalOpen(true); break;
      case 'clienti':   setClientModalOpen(true); break;
      case 'corrieri':  setCourierModalOpen(true); break;
    }
  };

  const handleEdit = (item: any) => {
    setEditMode('edit');
    setSelectedItem(item);
    switch (activeTab) {
      case 'prodotti':  setProductModalOpen(true); break;
      case 'categorie': setCategoryModalMode('edit'); setCategoryModalOpen(true); break;
      case 'fornitori': setSupplierModalOpen(true); break;
      case 'clienti':   setClientModalOpen(true); break;
      case 'corrieri':  setCourierModalOpen(true); break;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo elemento?')) return;

    if (activeTab === 'prodotti') {
      try {
        await prodottiApi.remove(id);
        setProdotti(prev => prev.filter(p => p.id !== id));
        toast.success('Prodotto eliminato');
      } catch (err: any) { toast.error('Eliminazione fallita', { description: err?.message }); }
      return;
    }

    if (activeTab === 'fornitori') {
      try {
        await fornitoriApi.remove(id);
        setFornitori(prev => prev.filter(f => f.id !== id));
        toast.success('Fornitore eliminato');
      } catch (err: any) { toast.error('Eliminazione fallita', { description: err?.message }); }
      return;
    }

    if (activeTab === 'clienti') {
      try {
        await clientiApi.remove(id);
        setClienti(prev => prev.filter(c => c.id !== id));
        toast.success('Cliente eliminato');
      } catch (err: any) { toast.error('Eliminazione fallita', { description: err?.message }); }
      return;
    }

    switch (activeTab) {
      case 'categorie':
        setCategorieState(prev => prev.filter(c => c.id !== id));
        toast.success('Categoria eliminata'); break;
      case 'corrieri':
        setCorrieriState(prev => prev.filter(c => c.id !== id));
        toast.success('Corriere eliminato'); break;
    }
  };

  const handleView = (_item: any) => { toast.info('Funzionalità di dettaglio in arrivo'); };

  const handleAddSubcategory = (parentName: string) => {
    setParentCategoryForSub(parentName);
    setCategoryModalMode('subcategory');
    setCategoryModalOpen(true);
  };

  const handleSaveProduct = async (data: ProdottoCreateRequest | ProdottoUpdateRequest, id?: number) => {
    try {
      if (editMode === 'create') {
        const created = await prodottiApi.create(data as ProdottoCreateRequest);
        setProdotti(prev => [...prev, created]);
        toast.success('Prodotto creato');
      } else if (id !== undefined) {
        const updated = await prodottiApi.update(id, data as ProdottoUpdateRequest);
        setProdotti(prev => prev.map(p => (p.id === id ? updated : p)));
        toast.success('Prodotto aggiornato');
      }
    } catch (err: any) {
      const msg = err?.code === 'DUPLICATE_ENTRY' ? 'SKU già in uso' : err?.message ?? 'Errore nel salvataggio';
      toast.error('Salvataggio fallito', { description: msg });
      throw err;
    }
  };

  const handleSaveSupplier = async (data: FornitoreCreateRequest | FornitoreUpdateRequest, id?: number) => {
    try {
      if (editMode === 'create') {
        const created = await fornitoriApi.create(data as FornitoreCreateRequest);
        setFornitori(prev => [...prev, created]);
        toast.success('Fornitore creato');
      } else if (id !== undefined) {
        const updated = await fornitoriApi.update(id, data as FornitoreUpdateRequest);
        setFornitori(prev => prev.map(f => (f.id === id ? updated : f)));
        toast.success('Fornitore aggiornato');
      }
    } catch (err: any) {
      const msg = err?.code === 'DUPLICATE_ENTRY' ? 'P.IVA già associata a un altro fornitore'
        : err?.code === 'ACCESS_DENIED' ? 'I fornitori dell\'ecosistema non possono essere modificati'
        : err?.message ?? 'Errore nel salvataggio';
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
        setClienti(prev => prev.map(c => (c.id === id ? updated : c)));
        toast.success('Cliente aggiornato');
      }
    } catch (err: any) {
      const msg = err?.code === 'DUPLICATE_ENTRY' ? 'P.IVA/CF già associato a un altro cliente'
        : err?.message ?? 'Errore nel salvataggio';
      toast.error('Salvataggio fallito', { description: msg });
      throw err;
    }
  };

  const handleSaveCategory = (data: CategoryFormData) => {
    if (categoryModalMode === 'create' || categoryModalMode === 'subcategory') {
      const newId = Math.max(0, ...categorieState.map(c => c.id)) + 1;
      setCategorieState(prev => [...prev, { id: newId, nome: data.nome, padre: data.padre || null, prodottiCount: 0 }]);
      toast.success('Categoria creata');
    } else {
      setCategorieState(prev => prev.map(c => (c.id === selectedItem?.id ? { ...c, nome: data.nome } : c)));
      toast.success('Categoria aggiornata');
    }
  };

  const handleSaveCourier = (data: CourierFormData) => {
    if (editMode === 'create') {
      const newId = Math.max(0, ...corrieriState.map(c => c.id)) + 1;
      setCorrieriState(prev => [...prev, { id: newId, ...data }]);
      toast.success('Corriere creato');
    } else {
      setCorrieriState(prev => prev.map(c => (c.id === selectedItem?.id ? { ...c, ...data } : c)));
      toast.success('Corriere aggiornato');
    }
  };

  const getFilteredData = () => {
    const q = searchQuery.toLowerCase();
    switch (activeTab) {
      case 'prodotti':
        return prodotti.filter(p => p.nome.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
      case 'categorie':
        return categorieState.filter(c => c.nome.toLowerCase().includes(q));
      case 'fornitori':
        return fornitori.filter(f =>
          f.ragione_sociale.toLowerCase().includes(q) ||
          (f.piva ?? '').toLowerCase().includes(q) ||
          (f.email ?? '').toLowerCase().includes(q)
        );
      case 'clienti':
        return clienti.filter(c =>
          c.ragione_sociale.toLowerCase().includes(q) ||
          (c.piva_cf ?? '').toLowerCase().includes(q) ||
          (c.email ?? '').toLowerCase().includes(q)
        );
      case 'corrieri':
        return corrieriState.filter(c =>
          c.nome.toLowerCase().includes(q) || c.codice.toLowerCase().includes(q)
        );
      default:
        return [];
    }
  };

  const filteredData      = getFilteredData();
  const filteredProdotti  = activeTab === 'prodotti'  ? (filteredData as ProdottoListino[]) : [];
  const filteredCategorie = activeTab === 'categorie' ? (filteredData as Categoria[]) : [];
  const filteredFornitori = activeTab === 'fornitori' ? (filteredData as Fornitore[]) : [];
  const filteredClienti   = activeTab === 'clienti'   ? (filteredData as Cliente[]) : [];
  const filteredCorrieri  = activeTab === 'corrieri'  ? (filteredData as Corriere[]) : [];

  const canWrite  = (entity: string) => hasPermesso(`${entity}:write`);
  const canDelete = (entity: string) => hasPermesso(`${entity}:delete`);

  const tabEntity =
    activeTab === 'prodotti'  ? 'prodotti'  :
    activeTab === 'fornitori' ? 'fornitori' :
    activeTab === 'clienti'   ? 'clienti'   :
    activeTab === 'corrieri'  ? 'corrieri'  : 'prodotti';

  const KebabMenu = ({ item, hideEdit }: { item: any; hideEdit?: boolean }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 hover:bg-[#F7F9FC] text-[#6B7280] rounded-lg transition-all">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => handleView(item)} className="cursor-pointer">
          <Eye className="w-4 h-4 mr-2" />Visualizza
        </DropdownMenuItem>
        {!hideEdit && canWrite(tabEntity) && (
          <DropdownMenuItem onClick={() => handleEdit(item)} className="cursor-pointer">
            <Edit className="w-4 h-4 mr-2" />Modifica
          </DropdownMenuItem>
        )}
        {canDelete(tabEntity) && (
          <DropdownMenuItem onClick={() => handleDelete(item.id)} className="cursor-pointer text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />Elimina
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">
            Gestione Anagrafiche — {getTabLabel()}
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">Gestisci clienti, fornitori, prodotti e categorie</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all flex items-center gap-2">
            <Upload className="w-4 h-4" /> Importa
          </button>
          <button className="px-4 py-2 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Esporta
          </button>
          {(activeTab === 'categorie' || canWrite(tabEntity)) && (
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
            <button className="px-4 py-2 bg-[#F7F9FC] border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-white transition-all flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filtri
            </button>
          </div>

          {activeTab === 'prodotti' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5EAF2]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Nome Prodotto</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">SKU</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#6B7280]">Prezzo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Agg. Prezzo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProdotti ? <SkeletonRows cols={5} /> : filteredProdotti.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-[#6B7280] text-sm">
                      {searchQuery ? 'Nessun prodotto corrisponde alla ricerca' : 'Nessun prodotto. Clicca "Nuovo Prodotto" per iniziare.'}
                    </td></tr>
                  ) : filteredProdotti.map((p, i) => (
                    <tr key={p.id} className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}`}>
                      <td className="py-3 px-4 font-medium text-[#2D2D2D]">{p.nome}</td>
                      <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{p.sku}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-[#2D2D2D] text-right">{formatPrezzo(p.prezzo)}</td>
                      <td className="py-3 px-4 text-sm text-[#6B7280]">{formatData(p.data_agg_prezzo)}</td>
                      <td className="py-3 px-4"><KebabMenu item={p} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'categorie' && (
            <div className="space-y-4">
              {filteredCategorie.filter(c => !c.padre).length === 0 && (
                <p className="py-12 text-center text-[#6B7280] text-sm">Nessuna categoria. Integrazione con milestone dedicata.</p>
              )}
              {filteredCategorie.filter(c => !c.padre).map((categoria) => {
                const subcategories = categorieState.filter(c => c.padre === categoria.nome);
                const totalCount = categoria.prodottiCount + subcategories.reduce((s, sub) => s + sub.prodottiCount, 0);
                return (
                  <div key={categoria.id} className="border border-[#E5EAF2] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-[#F7F9FC]">
                      <div className="flex items-center gap-3">
                        <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                        <div>
                          <h3 className="font-semibold text-[#2D2D2D]">{categoria.nome}</h3>
                          <p className="text-xs text-[#6B7280] mt-0.5">{totalCount} prodotti totali</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleAddSubcategory(categoria.nome)} className="px-3 py-1.5 text-xs bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all">
                          Aggiungi Sottocategoria
                        </button>
                        <KebabMenu item={categoria} />
                      </div>
                    </div>
                    {subcategories.map((subcat) => (
                      <div key={subcat.id} className="flex items-center justify-between p-3 px-6 border-t border-[#E5EAF2] hover:bg-[#F7F9FC] transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-8 bg-[#E5EAF2] rounded" />
                          <div>
                            <p className="text-sm font-medium text-[#2D2D2D]">{subcat.nome}</p>
                            <p className="text-xs text-[#6B7280]">{subcat.prodottiCount} prodotti</p>
                          </div>
                        </div>
                        <KebabMenu item={subcat} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

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
                  {loadingFornitori ? <SkeletonRows cols={7} /> : filteredFornitori.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-[#6B7280] text-sm">
                      {searchQuery ? 'Nessun fornitore corrisponde alla ricerca' : 'Nessun fornitore. Clicca "Nuovo Fornitore" per iniziare.'}
                    </td></tr>
                  ) : filteredFornitori.map((f, i) => (
                    <tr key={f.id} className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}`}>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#2D2D2D]">{f.ragione_sociale}</div>
                        {f.sito_web && (
                          <a href={f.sito_web} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#17E88F] hover:underline mt-0.5">
                            <ExternalLink className="w-3 h-3" />{f.sito_web.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{f.piva ?? <span className="text-[#9CA3AF] italic">—</span>}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {f.email && <div className="flex items-center gap-2 text-xs text-[#6B7280]"><Mail className="w-3 h-3 shrink-0" />{f.email}</div>}
                          {f.telefono && <div className="flex items-center gap-2 text-xs text-[#6B7280]"><Phone className="w-3 h-3 shrink-0" />{f.telefono}</div>}
                          {!f.email && !f.telefono && <span className="text-xs text-[#9CA3AF] italic">—</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {f.indirizzo
                          ? <div className="flex items-center gap-2 text-sm text-[#6B7280]"><MapPin className="w-3 h-3 shrink-0" /><span className="truncate max-w-[160px]">{f.indirizzo}</span></div>
                          : <span className="text-sm text-[#9CA3AF] italic">—</span>}
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
                      <td className="py-3 px-4"><KebabMenu item={f} hideEdit={f.source === 'ecosystem'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'clienti' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5EAF2]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Ragione Sociale</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">P. IVA / CF</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Contatti</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Sorgente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Stato</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingClienti ? <SkeletonRows cols={6} /> : filteredClienti.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-[#6B7280] text-sm">
                      {searchQuery ? 'Nessun cliente corrisponde alla ricerca' : 'Nessun cliente. Clicca "Nuovo Cliente" per iniziare.'}
                    </td></tr>
                  ) : filteredClienti.map((c, i) => (
                    <tr key={c.id} className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}`}>
                      <td className="py-3 px-4 font-medium text-[#2D2D2D]">{c.ragione_sociale}</td>
                      <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">
                        {c.piva_cf ?? <span className="text-[#9CA3AF] italic">—</span>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {c.email && <div className="flex items-center gap-2 text-xs text-[#6B7280]"><Mail className="w-3 h-3 shrink-0" />{c.email}</div>}
                          {c.telefono && <div className="flex items-center gap-2 text-xs text-[#6B7280]"><Phone className="w-3 h-3 shrink-0" />{c.telefono}</div>}
                          {!c.email && !c.telefono && <span className="text-xs text-[#9CA3AF] italic">—</span>}
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
                      <td className="py-3 px-4"><KebabMenu item={c} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'corrieri' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5EAF2]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Codice</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Telefono</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Stato</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan={6} className="py-12 text-center text-[#6B7280] text-sm">
                    Integrazione corrieri disponibile con milestone M05.
                  </td></tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E5EAF2]">
            <div className="text-sm text-[#6B7280]">
              Mostrando <span className="font-medium text-[#2D2D2D]">{filteredData.length}</span> risultati
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all text-sm">Precedente</button>
              <button className="px-3 py-1.5 bg-[#17E88F] text-white rounded-lg font-medium text-sm">1</button>
              <button className="px-3 py-1.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all text-sm">Successivo</button>
            </div>
          </div>
        </div>
      </div>

      <ProductFormModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={selectedItem}
        mode={editMode}
      />
      <CategoryFormModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        initialData={selectedItem}
        mode={categoryModalMode}
        parentCategory={parentCategoryForSub}
      />
      <SupplierFormModal
        open={supplierModalOpen}
        onClose={() => setSupplierModalOpen(false)}
        onSave={handleSaveSupplier}
        initialData={selectedItem}
        mode={editMode}
      />
      <ClientFormModal
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSave={handleSaveClient}
        initialData={selectedItem}
        mode={editMode}
      />
      <CourierFormModal
        open={courierModalOpen}
        onClose={() => setCourierModalOpen(false)}
        onSave={handleSaveCourier}
        initialData={selectedItem}
        mode={editMode}
      />
    </div>
  );
}