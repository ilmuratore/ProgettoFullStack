import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, GitMerge, Package, ArrowLeftRight, ClipboardEdit,
  Tag, Search, Filter, MoreVertical, Edit, Trash2, Eye, ChevronRight,
} from 'lucide-react';
import { WarehouseKPIs } from './components/WarehouseKPIs';
import { WarehouseTreeView } from './components/WarehouseTreeView';
import { WarehouseWidgets } from './components/WarehouseWidgets';
import { StockTable } from './components/StockTable';
import { StockMovementsTimeline } from './components/StockMovementsTimeline';
import { NewMovementModal } from './components/NewMovementModal';
import { ProductFormModal } from './components/ProductFormModal';
import { CategoryFormModal } from './components/CategoryFormModal';
import { PageTabBar, type TabConfig } from '../../components/ui/PageTabBar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { magazzinoApi } from '../../api/magazzinoApi';
import { prodottiApi } from '../../api/prodottiApi';
import { categorieApi } from '../../api/categorieApi';
import { useAuthStore } from '../../store/authStore';
import type {
  MagazzinoConUbicazioni,
  MagazzinoCreateRequest,
  MagazzinoUpdateRequest,
  Ubicazione,
  UbicazioneCreateRequest,
} from '../../types/magazzino';
import type { ProdottoListino, ProdottoCreateRequest, ProdottoUpdateRequest } from '../../types/prodotti';
import type { Categoria, CategoriaCreateRequest, CategoriaUpdateRequest } from '../../types/categorie';

type WarehouseTab = 'struttura' | 'prodotti' | 'categorie' | 'giacenze' | 'movimenti' | 'rettifiche';

const tabs: TabConfig[] = [
  { id: 'struttura',  label: 'Struttura',  icon: GitMerge     },
  { id: 'prodotti',   label: 'Prodotti',   icon: Package      },
  { id: 'categorie',  label: 'Categorie',  icon: Tag          },
  { id: 'giacenze',   label: 'Giacenze',   icon: Package      },
  { id: 'movimenti',  label: 'Movimenti',  icon: ArrowLeftRight },
  { id: 'rettifiche', label: 'Rettifiche', icon: ClipboardEdit },
];

const rettificheData: {
  id: number; prodotto: string; sku: string; ubicazione: string;
  quantitaPrecedente: number; quantitaNuova: number; nota: string; utente: string; data: string;
}[] = [];

interface MagazzinoFormState {
  codice: string; nome: string; indirizzo: string;
  cap: string; citta: string; provincia: string; paese: string;
}
const EMPTY_MAG: MagazzinoFormState = { codice: '', nome: '', indirizzo: '', cap: '', citta: '', provincia: '', paese: 'Italia' };

interface UbicazioneFormState { corsia: string; scaffale: string; temperatura_controllata: boolean; }
const EMPTY_UBIC: UbicazioneFormState = { corsia: '', scaffale: '', temperatura_controllata: false };

const formatPrezzo = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

const formatData = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function WarehousePage() {
  const { hasPermesso } = useAuthStore();
  const [activeTab, setActiveTab] = useState<WarehouseTab>('struttura');
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  // ── Magazzini ──────────────────────────────────────────────────────────────
  const [magazzini, setMagazzini] = useState<MagazzinoConUbicazioni[]>([]);
  const [loading, setLoading] = useState(false);
  const [magModalOpen, setMagModalOpen] = useState(false);
  const [magModalMode, setMagModalMode] = useState<'create' | 'edit'>('create');
  const [selectedMag, setSelectedMag] = useState<MagazzinoConUbicazioni | null>(null);
  const [magForm, setMagForm] = useState<MagazzinoFormState>(EMPTY_MAG);
  const [magErrors, setMagErrors] = useState<Partial<Record<keyof MagazzinoFormState, string>>>({});
  const [magLoading, setMagLoading] = useState(false);

  const [ubicModalOpen, setUbicModalOpen] = useState(false);
  const [ubicModalMode, setUbicModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUbic, setSelectedUbic] = useState<Ubicazione | null>(null);
  const [selectedMagId, setSelectedMagId] = useState<number | null>(null);
  const [ubicForm, setUbicForm] = useState<UbicazioneFormState>(EMPTY_UBIC);
  const [ubicErrors, setUbicErrors] = useState<Partial<Record<keyof UbicazioneFormState, string>>>({});
  const [ubicLoading, setUbicLoading] = useState(false);

  const [selectedMagDetail, setSelectedMagDetail] = useState<MagazzinoConUbicazioni | null>(null);

  const canWrite = hasPermesso('magazzino:write');
  const canWriteProdotti  = hasPermesso('prodotti:write');
  const canDeleteProdotti = hasPermesso('prodotti:delete');

  // ── Prodotti ───────────────────────────────────────────────────────────────
  const [prodotti, setProdotti] = useState<ProdottoListino[]>([]);
  const [loadingProdotti, setLoadingProdotti] = useState(false);
  const [searchProdotti, setSearchProdotti] = useState('');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<ProdottoListino | null>(null);

  // ── Categorie ──────────────────────────────────────────────────────────────
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [loadingCategorie, setLoadingCategorie] = useState(false);
  const [searchCategorie, setSearchCategorie] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);
  const [initialParentCategoryId, setInitialParentCategoryId] = useState<number | undefined>(undefined);

  // ── Fetch functions ────────────────────────────────────────────────────────
  const fetchMagazzini = useCallback(async () => {
    setLoading(true);
    try { setMagazzini(await magazzinoApi.list()); }
    catch (err: any) { toast.error('Errore caricamento magazzini', { description: err?.message }); }
    finally { setLoading(false); }
  }, []);

  const fetchProdotti = useCallback(async () => {
    setLoadingProdotti(true);
    try { setProdotti(await prodottiApi.list()); }
    catch (err: any) { toast.error('Errore caricamento prodotti', { description: err?.message }); }
    finally { setLoadingProdotti(false); }
  }, []);

  const fetchCategorie = useCallback(async () => {
    setLoadingCategorie(true);
    try { setCategorie(await categorieApi.list()); }
    catch (err: any) { toast.error('Errore caricamento categorie', { description: err?.message }); }
    finally { setLoadingCategorie(false); }
  }, []);

  // Lazy loading: fetch solo al primo accesso del tab
  const fetchedTabs = useRef(new Set<WarehouseTab>());
  const fetchForTab = useCallback((tab: WarehouseTab) => {
    if (fetchedTabs.current.has(tab)) return;
    fetchedTabs.current.add(tab);
    if (tab === 'struttura')  fetchMagazzini();
    if (tab === 'prodotti')   { fetchProdotti(); fetchCategorie(); } // categorie servono anche per il modal prodotti
    if (tab === 'categorie')  fetchCategorie();
  }, [fetchMagazzini, fetchProdotti, fetchCategorie]);

  useEffect(() => { fetchForTab('struttura'); }, []);
  useEffect(() => { fetchForTab(activeTab); }, [activeTab, fetchForTab]);

  // ── Action button ──────────────────────────────────────────────────────────
  const getActionButton = (): { label: string; action: () => void; show: boolean } => {
    switch (activeTab) {
      case 'struttura':
        return { label: 'Nuovo Magazzino', show: canWrite,
          action: () => { setMagModalMode('create'); setMagForm(EMPTY_MAG); setMagErrors({}); setMagModalOpen(true); } };
      case 'prodotti':
        return { label: 'Nuovo Prodotto', show: canWriteProdotti,
          action: () => { setProductModalMode('create'); setSelectedProduct(null); setProductModalOpen(true); } };
      case 'categorie':
        return { label: 'Nuova Categoria', show: canWriteProdotti,
          action: () => { setCategoryModalMode('create'); setSelectedCategory(null); setInitialParentCategoryId(undefined); setCategoryModalOpen(true); } };
      case 'giacenze':
        return { label: 'Aggiorna Giacenze', show: true, action: () => toast.info('Disponibile con M07') };
      case 'movimenti':
        return { label: 'Nuovo Movimento', show: true, action: () => setIsMovementModalOpen(true) };
      case 'rettifiche':
        return { label: 'Nuova Rettifica', show: true, action: () => toast.info('Disponibile con M07') };
    }
  };

  const action = getActionButton();

  // ── Magazzini handlers ─────────────────────────────────────────────────────
  const handleToggleMagazzino = async (id: number) => {
    try {
      const updated = await magazzinoApi.toggle(id);
      setMagazzini(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
      toast.success(`Magazzino ${updated.attivo ? 'attivato' : 'disattivato'}`);
    } catch (err: any) { toast.error('Operazione fallita', { description: err?.message }); }
  };

  const handleEditMagazzino = (mag: MagazzinoConUbicazioni) => {
    setMagModalMode('edit');
    setSelectedMag(mag);
    setMagForm({ codice: mag.codice, nome: mag.nome, indirizzo: mag.indirizzo ?? '',
      cap: mag.cap ?? '', citta: mag.citta ?? '', provincia: mag.provincia ?? '', paese: mag.paese ?? 'Italia' });
    setMagErrors({});
    setMagModalOpen(true);
  };

  const handleAddUbicazione = (magId: number) => {
    setUbicModalMode('create'); setSelectedMagId(magId);
    setSelectedUbic(null); setUbicForm(EMPTY_UBIC); setUbicErrors({});
    setUbicModalOpen(true);
  };

  const handleToggleUbicazione = async (ubicId: number, magId: number) => {
    try {
      const updated = await magazzinoApi.toggleUbicazione(ubicId);
      setMagazzini(prev => prev.map(m => m.id === magId
        ? { ...m, ubicazioni: m.ubicazioni.map(u => u.id === ubicId ? { ...u, ...updated } : u) } : m
      ));
      toast.success(`Ubicazione ${updated.attivo ? 'attivata' : 'disattivata'}`);
    } catch (err: any) { toast.error('Operazione fallita', { description: err?.message }); }
  };

  const handleEditUbicazione = (ubic: Ubicazione) => {
    setUbicModalMode('edit'); setSelectedUbic(ubic); setSelectedMagId(ubic.magazzino_id);
    setUbicForm({ corsia: String(ubic.corsia), scaffale: String(ubic.scaffale), temperatura_controllata: ubic.temperatura_controllata });
    setUbicErrors({});
    setUbicModalOpen(true);
  };

  const validateMagForm = (): boolean => {
    const errs: Partial<Record<keyof MagazzinoFormState, string>> = {};
    if (magModalMode === 'create' && !magForm.codice.trim()) errs.codice = 'Il codice è obbligatorio';
    if (!magForm.nome.trim()) errs.nome = 'Il nome è obbligatorio';
    setMagErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveMagazzino = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMagForm()) return;
    setMagLoading(true);
    try {
      if (magModalMode === 'create') {
        const payload: MagazzinoCreateRequest = {
          codice: magForm.codice.trim(), nome: magForm.nome.trim(),
          ...(magForm.indirizzo.trim() && { indirizzo: magForm.indirizzo.trim() }),
          ...(magForm.cap.trim() && { cap: magForm.cap.trim() }),
          ...(magForm.citta.trim() && { citta: magForm.citta.trim() }),
          ...(magForm.provincia.trim() && { provincia: magForm.provincia.trim() }),
          ...(magForm.paese.trim() && { paese: magForm.paese.trim() }),
        };
        const created = await magazzinoApi.create(payload);
        setMagazzini(prev => [...prev, { ...created, ubicazioni: [] }]);
        toast.success('Magazzino creato');
      } else if (selectedMag) {
        const payload: MagazzinoUpdateRequest = {
          nome: magForm.nome.trim(),
          ...(magForm.indirizzo.trim() && { indirizzo: magForm.indirizzo.trim() }),
          ...(magForm.cap.trim() && { cap: magForm.cap.trim() }),
          ...(magForm.citta.trim() && { citta: magForm.citta.trim() }),
          ...(magForm.provincia.trim() && { provincia: magForm.provincia.trim() }),
          ...(magForm.paese.trim() && { paese: magForm.paese.trim() }),
        };
        const updated = await magazzinoApi.update(selectedMag.id, payload);
        setMagazzini(prev => prev.map(m => m.id === selectedMag.id ? { ...m, ...updated } : m));
        toast.success('Magazzino aggiornato');
      }
      setMagModalOpen(false);
    } catch (err: any) {
      toast.error('Salvataggio fallito', { description: err?.code === 'DUPLICATE_ENTRY' ? 'Codice magazzino già in uso' : err?.message });
    } finally { setMagLoading(false); }
  };

  const validateUbicForm = (): boolean => {
    const errs: Partial<Record<keyof UbicazioneFormState, string>> = {};
    if (ubicModalMode === 'create') {
      const c = parseInt(ubicForm.corsia), s = parseInt(ubicForm.scaffale);
      if (!ubicForm.corsia.trim() || isNaN(c) || c < 1) errs.corsia = 'Corsia obbligatoria (minimo 1)';
      if (!ubicForm.scaffale.trim() || isNaN(s) || s < 1) errs.scaffale = 'Scaffale obbligatorio (minimo 1)';
    }
    setUbicErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveUbicazione = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUbicForm()) return;
    setUbicLoading(true);
    try {
      if (ubicModalMode === 'create' && selectedMagId !== null) {
        const payload: UbicazioneCreateRequest = {
          corsia: parseInt(ubicForm.corsia), scaffale: parseInt(ubicForm.scaffale),
          temperatura_controllata: ubicForm.temperatura_controllata,
        };
        const created = await magazzinoApi.createUbicazione(selectedMagId, payload);
        setMagazzini(prev => prev.map(m => m.id === selectedMagId
          ? { ...m, ubicazioni: [...m.ubicazioni, created] } : m
        ));
        toast.success('Ubicazione creata');
      } else if (ubicModalMode === 'edit' && selectedUbic) {
        const updated = await magazzinoApi.updateTemperatura(selectedUbic.id, { temperatura_controllata: ubicForm.temperatura_controllata });
        setMagazzini(prev => prev.map(m => m.id === selectedUbic.magazzino_id
          ? { ...m, ubicazioni: m.ubicazioni.map(u => u.id === selectedUbic.id ? { ...u, ...updated } : u) } : m
        ));
        toast.success('Ubicazione aggiornata');
      }
      setUbicModalOpen(false);
    } catch (err: any) {
      toast.error('Salvataggio fallito', { description: err?.code === 'DUPLICATE_ENTRY'
        ? 'Slot già occupato (stessa corsia e scaffale in questo magazzino)' : err?.message });
    } finally { setUbicLoading(false); }
  };

  // ── Prodotti handlers ──────────────────────────────────────────────────────
  const handleSaveProduct = async (data: ProdottoCreateRequest | ProdottoUpdateRequest, id?: number) => {
    try {
      if (productModalMode === 'create') {
        const created = await prodottiApi.create(data as ProdottoCreateRequest);
        setProdotti(prev => [...prev, created]);
        toast.success('Prodotto creato');
      } else if (id !== undefined) {
        const updated = await prodottiApi.update(id, data as ProdottoUpdateRequest);
        setProdotti(prev => prev.map(p => p.id === id ? updated : p));
        toast.success('Prodotto aggiornato');
      }
    } catch (err: any) {
      toast.error('Salvataggio fallito', { description: err?.code === 'DUPLICATE_ENTRY' ? 'SKU già in uso' : err?.message });
      throw err;
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Eliminare questo prodotto? L\'operazione è reversibile (soft delete).')) return;
    try {
      await prodottiApi.remove(id);
      setProdotti(prev => prev.filter(p => p.id !== id));
      toast.success('Prodotto eliminato');
    } catch (err: any) { toast.error('Eliminazione fallita', { description: err?.message }); }
  };

  // ── Categorie handlers ─────────────────────────────────────────────────────
  const handleSaveCategory = async (data: CategoriaCreateRequest | CategoriaUpdateRequest, id?: number) => {
    try {
      if (categoryModalMode === 'create') {
        const created = await categorieApi.create(data as CategoriaCreateRequest);
        setCategorie(prev => [...prev, created]);
        toast.success('Categoria creata');
      } else if (id !== undefined) {
        const updated = await categorieApi.update(id, data as CategoriaUpdateRequest);
        setCategorie(prev => prev.map(c => c.id === id ? updated : c));
        toast.success('Categoria aggiornata');
      }
    } catch (err: any) {
      const isBlocked = ['CATEGORIA_CON_PRODOTTI', 'CATEGORIA_CON_SOTTOCATEGORIE'].includes(err?.code);
      toast.error('Salvataggio fallito', { description: isBlocked || err?.code === 'DUPLICATE_ENTRY' ? err.message : err?.message });
      throw err;
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Eliminare questa categoria? L\'operazione è definitiva.')) return;
    try {
      await categorieApi.remove(id);
      setCategorie(prev => prev.filter(c => c.id !== id));
      toast.success('Categoria eliminata');
    } catch (err: any) {
      toast.error('Eliminazione bloccata', { description: err?.message });
    }
  };

  const handleAddSubcategory = (parentId: number) => {
    setCategoryModalMode('create');
    setSelectedCategory(null);
    setInitialParentCategoryId(parentId);
    setCategoryModalOpen(true);
  };

  // ── Helpers UI ─────────────────────────────────────────────────────────────
  const setMag = (field: keyof MagazzinoFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setMagForm(prev => ({ ...prev, [field]: e.target.value }));
    if (magErrors[field]) setMagErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const inputClass = (err?: string) =>
    `w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all ${err ? 'border-red-400 bg-red-50' : 'border-[#E5EAF2]'}`;

  const ProdottiKebab = ({ item }: { item: ProdottoListino }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 hover:bg-[#F7F9FC] text-[#6B7280] rounded-lg transition-all">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => toast.info('Dettaglio prodotto disponibile con M07')} className="cursor-pointer">
          <Eye className="w-4 h-4 mr-2" />Visualizza
        </DropdownMenuItem>
        {canWriteProdotti && (
          <DropdownMenuItem onClick={() => { setProductModalMode('edit'); setSelectedProduct(item); setProductModalOpen(true); }} className="cursor-pointer">
            <Edit className="w-4 h-4 mr-2" />Modifica
          </DropdownMenuItem>
        )}
        {canDeleteProdotti && (
          <DropdownMenuItem onClick={() => handleDeleteProduct(item.id)} className="cursor-pointer text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />Elimina
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const CategorieKebab = ({ item }: { item: Categoria }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 hover:bg-[#F7F9FC] text-[#6B7280] rounded-lg transition-all">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {canWriteProdotti && (
          <DropdownMenuItem onClick={() => { setCategoryModalMode('edit'); setSelectedCategory(item); setInitialParentCategoryId(undefined); setCategoryModalOpen(true); }} className="cursor-pointer">
            <Edit className="w-4 h-4 mr-2" />Modifica
          </DropdownMenuItem>
        )}
        {canDeleteProdotti && (
          <DropdownMenuItem onClick={() => handleDeleteCategory(item.id)} className="cursor-pointer text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />Elimina
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const SkeletonTree = () => (
    <div className="space-y-4">
      {[1, 2].map(i => (
        <div key={i} className="border border-[#E5EAF2] rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#E5EAF2] rounded-xl animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-[#E5EAF2] rounded animate-pulse w-1/3 mb-2" />
              <div className="h-3 bg-[#E5EAF2] rounded animate-pulse w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
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

  // Prodotti filtrati
  const filteredProdotti = prodotti.filter(p => {
    const q = searchProdotti.toLowerCase();
    return p.nome.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  // Categorie filtrate (per la ricerca)
  const filteredCategorie = categorie.filter(c =>
    c.nome.toLowerCase().includes(searchCategorie.toLowerCase())
  );
  const categorieRadice = filteredCategorie.filter(c => c.categoria_padre_id === null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">Magazzino</h1>
          <p className="text-sm text-[#6B7280] mt-1">Struttura, prodotti, categorie, giacenze e movimenti</p>
        </div>
        {action.show && (
          <button
            onClick={action.action}
            className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
        <PageTabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as WarehouseTab)} />

        <div className="p-6 space-y-6">

          {/* ── STRUTTURA ── */}
          {activeTab === 'struttura' && (
            <>
              <WarehouseKPIs />
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                <div className="lg:col-span-7">
                  {loading ? (
                    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
                      <div className="h-5 bg-[#E5EAF2] rounded animate-pulse w-1/4 mb-6" />
                      <SkeletonTree />
                    </div>
                  ) : (
                    <WarehouseTreeView
                      magazzini={magazzini}
                      onToggleMagazzino={handleToggleMagazzino}
                      onEditMagazzino={handleEditMagazzino}
                      onAddUbicazione={handleAddUbicazione}
                      onToggleUbicazione={handleToggleUbicazione}
                      onEditUbicazione={handleEditUbicazione}
                    />
                  )}
                </div>
                <div className="lg:col-span-3">
                  <WarehouseWidgets />
                </div>
              </div>
            </>
          )}

          {/* ── PRODOTTI ── */}
          {activeTab === 'prodotti' && (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cerca prodotti per nome o SKU..."
                    value={searchProdotti}
                    onChange={e => setSearchProdotti(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all"
                  />
                </div>
                <button className="px-4 py-2 bg-[#F7F9FC] border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-white transition-all flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filtri
                </button>
              </div>
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
                    {loadingProdotti ? <SkeletonRows cols={5} /> : filteredProdotti.length === 0
                      ? <tr><td colSpan={5} className="py-12 text-center text-[#6B7280] text-sm">
                          {searchProdotti ? 'Nessun prodotto corrisponde alla ricerca' : 'Nessun prodotto. Clicca "Nuovo Prodotto" per iniziare.'}
                        </td></tr>
                      : filteredProdotti.map((p, i) => (
                        <tr key={p.id} className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}`}>
                          <td className="py-3 px-4 font-medium text-[#2D2D2D]">{p.nome}</td>
                          <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{p.sku}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-[#2D2D2D] text-right">{formatPrezzo(p.prezzo)}</td>
                          <td className="py-3 px-4 text-sm text-[#6B7280]">{formatData(p.data_agg_prezzo)}</td>
                          <td className="py-3 px-4"><ProdottiKebab item={p} /></td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[#E5EAF2]">
                <p className="text-sm text-[#6B7280]">
                  Mostrando <span className="font-medium text-[#2D2D2D]">{loadingProdotti ? '…' : filteredProdotti.length}</span> prodotti
                </p>
              </div>
            </>
          )}

          {/* ── CATEGORIE ── */}
          {activeTab === 'categorie' && (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cerca categorie..."
                    value={searchCategorie}
                    onChange={e => setSearchCategorie(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17E88F]/20 focus:border-[#17E88F] transition-all"
                  />
                </div>
              </div>

              {loadingCategorie ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-[#F7F9FC] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : categorieRadice.length === 0 ? (
                <p className="py-12 text-center text-[#6B7280] text-sm">
                  {searchCategorie ? 'Nessuna categoria corrisponde alla ricerca' : 'Nessuna categoria. Clicca "Nuova Categoria" per iniziare.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {categorieRadice.map((cat) => {
                    const subcategories = categorie.filter(c => c.categoria_padre_id === cat.id);
                    const totalProdotti = cat.prodotti_count + subcategories.reduce((s, sub) => s + sub.prodotti_count, 0);
                    return (
                      <div key={cat.id} className="border border-[#E5EAF2] rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-[#F7F9FC]">
                          <div className="flex items-center gap-3">
                            <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                            <div>
                              <h3 className="font-semibold text-[#2D2D2D]">{cat.nome}</h3>
                              <p className="text-xs text-[#6B7280] mt-0.5">
                                {totalProdotti} prodotto{totalProdotti !== 1 ? 'i' : ''} totali
                                {subcategories.length > 0 && ` · ${subcategories.length} sottocategor${subcategories.length !== 1 ? 'ie' : 'ia'}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {canWriteProdotti && (
                              <button
                                onClick={() => handleAddSubcategory(cat.id)}
                                className="px-3 py-1.5 text-xs bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all"
                              >
                                + Sottocategoria
                              </button>
                            )}
                            <CategorieKebab item={cat} />
                          </div>
                        </div>
                        {subcategories.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between p-3 px-6 border-t border-[#E5EAF2] hover:bg-[#F7F9FC] transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-1 h-8 bg-[#E5EAF2] rounded" />
                              <div>
                                <p className="text-sm font-medium text-[#2D2D2D]">{sub.nome}</p>
                                <p className="text-xs text-[#6B7280]">{sub.prodotti_count} prodotto{sub.prodotti_count !== 1 ? 'i' : ''}</p>
                              </div>
                            </div>
                            <CategorieKebab item={sub} />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center pt-4 border-t border-[#E5EAF2]">
                <p className="text-sm text-[#6B7280]">
                  <span className="font-medium text-[#2D2D2D]">{categorie.filter(c => c.categoria_padre_id === null).length}</span> categorie radice ·{' '}
                  <span className="font-medium text-[#2D2D2D]">{categorie.filter(c => c.categoria_padre_id !== null).length}</span> sottocategorie
                </p>
              </div>
            </>
          )}

          {activeTab === 'giacenze' && <StockTable />}

          {activeTab === 'movimenti' && <StockMovementsTimeline />}

          {activeTab === 'rettifiche' && (
            <div className="space-y-6">
              <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4 flex items-start gap-3">
                <ClipboardEdit className="w-5 h-5 text-[#D97706] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#92400E]">Rettifiche manuali giacenza</p>
                  <p className="text-xs text-[#B45309] mt-0.5">Le rettifiche manuali generano un movimento di tipo RETTIFICA e richiedono una nota obbligatoria. Solo Admin e Responsabile Magazzino possono eseguire rettifiche.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F7F9FC] border-b border-[#E5EAF2]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Prodotto / SKU</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ubicazione</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Qtà Precedente</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Qtà Nuova</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Delta</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Nota</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Utente / Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAF2]">
                    {rettificheData.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-sm text-[#9CA3AF]">
                          Integrazione rettifiche disponibile con milestone M07.
                        </td>
                      </tr>
                    )}
                    {rettificheData.map((r) => {
                      const delta = r.quantitaNuova - r.quantitaPrecedente;
                      return (
                        <tr key={r.id} className="hover:bg-[#F7F9FC] transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-[#2D2D2D] truncate max-w-[180px]">{r.prodotto}</p>
                            <p className="text-xs text-[#6B7280]">{r.sku}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#374151]">{r.ubicazione}</td>
                          <td className="px-4 py-3 text-sm text-right text-[#374151]">{r.quantitaPrecedente}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-[#2D2D2D]">{r.quantitaNuova}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm font-semibold ${delta < 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                              {delta > 0 ? '+' : ''}{delta}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#6B7280] max-w-[200px] truncate">{r.nota}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-[#374151]">{r.utente}</p>
                            <p className="text-xs text-[#9CA3AF]">{r.data}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modali ── */}
      <NewMovementModal isOpen={isMovementModalOpen} onClose={() => setIsMovementModalOpen(false)} />

      <ProductFormModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={selectedProduct}
        mode={productModalMode}
        categorie={categorie}
      />

      <CategoryFormModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        initialData={selectedCategory}
        mode={categoryModalMode}
        initialParentId={initialParentCategoryId}
        categorie={categorie}
      />

      {/* Modal Magazzino */}
      <Dialog open={magModalOpen} onOpenChange={(v) => { if (!v && !magLoading) setMagModalOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#2D2D2D]">
              {magModalMode === 'create' ? 'Nuovo Magazzino' : 'Modifica Magazzino'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveMagazzino} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Codice <span className="text-red-500">*</span></label>
                <input type="text" value={magForm.codice} onChange={setMag('codice')} disabled={magModalMode === 'edit'}
                  placeholder="MAG-A" className={`${inputClass(magErrors.codice)} font-mono ${magModalMode === 'edit' ? 'bg-[#F7F9FC] opacity-60' : ''}`} />
                {magErrors.codice && <p className="mt-1 text-xs text-red-500">{magErrors.codice}</p>}
                {magModalMode === 'edit' && <p className="mt-1 text-xs text-[#9CA3AF]">Il codice non è modificabile</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Nome <span className="text-red-500">*</span></label>
                <input type="text" value={magForm.nome} onChange={setMag('nome')} placeholder="Magazzino Principale" className={inputClass(magErrors.nome)} />
                {magErrors.nome && <p className="mt-1 text-xs text-red-500">{magErrors.nome}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Indirizzo</label>
                <input type="text" value={magForm.indirizzo} onChange={setMag('indirizzo')} placeholder="Via dell'Artigianato 14" className={inputClass()} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">CAP</label>
                <input type="text" value={magForm.cap} onChange={setMag('cap')} placeholder="20099" className={inputClass()} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Città</label>
                <input type="text" value={magForm.citta} onChange={setMag('citta')} placeholder="Sesto San Giovanni" className={inputClass()} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Provincia</label>
                <input type="text" value={magForm.provincia} onChange={setMag('provincia')} placeholder="MI" maxLength={2} className={`${inputClass()} uppercase`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Paese</label>
                <input type="text" value={magForm.paese} onChange={setMag('paese')} placeholder="Italia" className={inputClass()} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#E5EAF2]">
              <button type="button" onClick={() => setMagModalOpen(false)} disabled={magLoading} className="px-4 py-2 border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all disabled:opacity-50">Annulla</button>
              <button type="submit" disabled={magLoading} className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2">
                {magLoading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
                {magModalMode === 'create' ? 'Crea Magazzino' : 'Salva Modifiche'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Ubicazione */}
      <Dialog open={ubicModalOpen} onOpenChange={(v) => { if (!v && !ubicLoading) setUbicModalOpen(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#2D2D2D]">
              {ubicModalMode === 'create' ? 'Nuova Ubicazione' : 'Modifica Ubicazione'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveUbicazione} className="space-y-4 mt-4">
            {ubicModalMode === 'create' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Corsia <span className="text-red-500">*</span></label>
                  <input type="number" min={1} value={ubicForm.corsia}
                    onChange={e => { setUbicForm(p => ({ ...p, corsia: e.target.value })); if (ubicErrors.corsia) setUbicErrors(p => ({ ...p, corsia: undefined })); }}
                    placeholder="1" className={inputClass(ubicErrors.corsia)} />
                  {ubicErrors.corsia && <p className="mt-1 text-xs text-red-500">{ubicErrors.corsia}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Scaffale <span className="text-red-500">*</span></label>
                  <input type="number" min={1} value={ubicForm.scaffale}
                    onChange={e => { setUbicForm(p => ({ ...p, scaffale: e.target.value })); if (ubicErrors.scaffale) setUbicErrors(p => ({ ...p, scaffale: undefined })); }}
                    placeholder="1" className={inputClass(ubicErrors.scaffale)} />
                  {ubicErrors.scaffale && <p className="mt-1 text-xs text-red-500">{ubicErrors.scaffale}</p>}
                </div>
              </div>
            ) : selectedUbic && (
              <div className="p-3 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl">
                <p className="text-sm font-mono font-medium text-[#2D2D2D]">{selectedUbic.codice_composto}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Corsia {selectedUbic.corsia} · Scaffale {selectedUbic.scaffale}</p>
              </div>
            )}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setUbicForm(p => ({ ...p, temperatura_controllata: !p.temperatura_controllata }))}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center ${ubicForm.temperatura_controllata ? 'bg-[#17E88F]' : 'bg-[#E5EAF2]'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${ubicForm.temperatura_controllata ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm font-medium text-[#2D2D2D]">Temperatura controllata (cella frigorifera)</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#E5EAF2]">
              <button type="button" onClick={() => setUbicModalOpen(false)} disabled={ubicLoading} className="px-4 py-2 border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all disabled:opacity-50">Annulla</button>
              <button type="submit" disabled={ubicLoading} className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2">
                {ubicLoading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
                {ubicModalMode === 'create' ? 'Crea Ubicazione' : 'Salva Modifiche'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
