import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, GitMerge, Package, ArrowLeftRight,
  Tag,
} from 'lucide-react';
import { WarehouseKPIs } from './components/WarehouseKPIs';
import { WarehouseTreeView } from './components/WarehouseTreeView';
import { WarehouseWidgets } from './components/WarehouseWidgets';
import { StockTable } from './components/StockTable';
import { StockMovementsTimeline } from './components/StockMovementsTimeline';
import { NewMovementModal } from './components/NewMovementModal';
import { ProductFormModal } from './components/ProductFormModal';
// da lasciare per il merge, componente dettaglio prodotto
import { ProductDetailDrawer } from './components/ProductDetailDrawer';
import { CategoryFormModal } from './components/CategoryFormModal';
import { ProductsTab } from './components/ProductsTab';
import { CategoriesTab } from './components/CategoriesTab';
import { PageTabBar, type TabConfig } from '../../components/ui/PageTabBar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
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
// aggiunto Prodotto nei type importati
import type { Prodotto, ProdottoListino, ProdottoCreateRequest, ProdottoUpdateRequest } from '../../types/prodotti';
import type { Categoria, CategoriaCreateRequest, CategoriaUpdateRequest } from '../../types/categorie';

type WarehouseTab = 'prodotti' | 'categorie' | 'struttura' | 'giacenze' | 'movimenti';

const tabs: TabConfig[] = [
  { id: 'prodotti', label: 'Prodotti', icon: Package },
  { id: 'categorie', label: 'Categorie', icon: Tag },
  { id: 'struttura', label: 'Struttura', icon: GitMerge },
  { id: 'giacenze', label: 'Giacenze', icon: Package },
  { id: 'movimenti', label: 'Movimenti', icon: ArrowLeftRight },
];


interface MagazzinoFormState {
  codice: string; nome: string; indirizzo: string;
  cap: string; citta: string; provincia: string; paese: string;
}
const EMPTY_MAG: MagazzinoFormState = { codice: '', nome: '', indirizzo: '', cap: '', citta: '', provincia: '', paese: 'Italia' };

interface UbicazioneFormState { corsia: string; scaffale: string; temperatura_controllata: boolean; }
const EMPTY_UBIC: UbicazioneFormState = { corsia: '', scaffale: '', temperatura_controllata: false };

export function WarehousePage() {
  const { hasPermesso } = useAuthStore();
  const [activeTab, setActiveTab] = useState<WarehouseTab>('prodotti');
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

  const canWrite = hasPermesso('magazzino:write');
  const canWriteProdotti = hasPermesso('prodotti:write');
  const canDeleteProdotti = hasPermesso('prodotti:delete');

  // ── Prodotti ───────────────────────────────────────────────────────────────
  const [prodotti, setProdotti] = useState<ProdottoListino[]>([]);
  const [loadingProdotti, setLoadingProdotti] = useState(false);
  const [searchProdotti, setSearchProdotti] = useState('');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<'create' | 'edit'>('create');
  // aggiunto prodotto selezionato
  const [selectedProduct, setSelectedProduct] = useState<Prodotto | null>(null);
  // da lasciare per il merge useState per apertura dettaglio prodotto
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

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
    if (tab === 'struttura') fetchMagazzini();
    if (tab === 'prodotti') { fetchProdotti(); fetchCategorie(); } // categorie servono anche per il modal prodotti
    if (tab === 'categorie') fetchCategorie();
  }, [fetchMagazzini, fetchProdotti, fetchCategorie]);

  useEffect(() => { fetchForTab('struttura'); }, []);
  useEffect(() => { fetchForTab(activeTab); }, [activeTab, fetchForTab]);

  // ── Action button ──────────────────────────────────────────────────────────
  const getActionButton = (): { label: string; action: () => void; show: boolean } => {
    switch (activeTab) {
      case 'struttura':
        return {
          label: 'Nuovo Magazzino', show: canWrite,
          action: () => { setMagModalMode('create'); setMagForm(EMPTY_MAG); setMagErrors({}); setMagModalOpen(true); }
        };
      case 'prodotti':
        return {
          label: 'Nuovo Prodotto', show: canWriteProdotti,
          action: () => { setProductModalMode('create'); setSelectedProduct(null); setProductModalOpen(true); }
        };
      case 'categorie':
        return {
          label: 'Nuova Categoria', show: canWriteProdotti,
          action: () => { setCategoryModalMode('create'); setSelectedCategory(null); setInitialParentCategoryId(undefined); setCategoryModalOpen(true); }
        };
      case 'giacenze':
        return { label: 'Aggiorna Giacenze', show: true, action: () => toast.info('Disponibile con M07') };
      case 'movimenti':
        return { label: 'Nuovo Movimento', show: true, action: () => setIsMovementModalOpen(true) };
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
    setMagForm({
      codice: mag.codice, nome: mag.nome, indirizzo: mag.indirizzo ?? '',
      cap: mag.cap ?? '', citta: mag.citta ?? '', provincia: mag.provincia ?? '', paese: mag.paese ?? 'Italia'
    });
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
      toast.error('Salvataggio fallito', {
        description: err?.code === 'DUPLICATE_ENTRY'
          ? 'Slot già occupato (stessa corsia e scaffale in questo magazzino)' : err?.message
      });
    } finally { setUbicLoading(false); }
  };

  // ── Prodotti handlers ──────────────────────────────────────────────────────
  const handleSaveProduct = async (data: ProdottoCreateRequest | ProdottoUpdateRequest, id?: number) => {
    // serve a dire quali dati del prodotto mostrare
    const toListinoItem = (prodotto: Prodotto): ProdottoListino => ({
      id: prodotto.id,
      sku: prodotto.sku,
      nome: prodotto.nome,
      prezzo: prodotto.prezzo,
      data_agg_prezzo: prodotto.data_agg_prezzo,
    });

    try {
      if (productModalMode === 'create') {
        const created = await prodottiApi.create(data as ProdottoCreateRequest);
        setProdotti(prev => [...prev, toListinoItem(created)]);
        toast.success('Prodotto creato');
      } else if (id !== undefined) {
        const updated = await prodottiApi.update(id, data as ProdottoUpdateRequest);
        setProdotti(prev => prev.map(p => p.id === id ? toListinoItem(updated) : p));
        toast.success('Prodotto aggiornato');
      }
    } catch (err: any) {
      toast.error('Salvataggio fallito', { description: err?.code === 'DUPLICATE_ENTRY' ? 'SKU già in uso' : err?.message });
      throw err;
    }
  };

  // aggiunta di 1 nuovo handle per la modifica
  const handleEditProduct = async (productId: number) => {
    try {
      const product = await prodottiApi.getById(productId);
      setProductModalMode('edit');
      setSelectedProduct(product);
      setProductModalOpen(true);
    } catch (err: any) {
      toast.error('Errore caricamento prodotto', { description: err?.message });
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
            <ProductsTab
              prodotti={prodotti}
              loading={loadingProdotti}
              search={searchProdotti}
              canWriteProdotti={canWriteProdotti}
              canDeleteProdotti={canDeleteProdotti}
              onSearchChange={setSearchProdotti}
              // richiamo il componente dettaglio prodotto
              onView={(item) => { setSelectedProductId(item.id); setProductDetailOpen(true); }}
              //aggiunta del nuovo handle per la modifica
              onEdit={(item) => { void handleEditProduct(item.id); }}
              onDelete={handleDeleteProduct}
            />
          )}


          {/* ── CATEGORIE ── */}
          {activeTab === 'categorie' && (
            <CategoriesTab
              categorie={categorie}
              loading={loadingCategorie}
              search={searchCategorie}
              canWriteProdotti={canWriteProdotti}
              canDeleteProdotti={canDeleteProdotti}
              onSearchChange={setSearchCategorie}
              onAddSubcategory={handleAddSubcategory}
              onEdit={(item) => { setCategoryModalMode('edit'); setSelectedCategory(item); setInitialParentCategoryId(undefined); setCategoryModalOpen(true); }}
              onDelete={handleDeleteCategory}
            />
          )}


          {activeTab === 'giacenze' && <StockTable />}

          {activeTab === 'movimenti' && <StockMovementsTimeline />}


        </div>
      </div>

      {/* ── Modali ── */}
      <NewMovementModal isOpen={isMovementModalOpen} onClose={() => setIsMovementModalOpen(false)} />

      {/* componente dettaglio prodotto */}
      <ProductDetailDrawer
        productId={selectedProductId}
        isOpen={productDetailOpen}
        onClose={() => setProductDetailOpen(false)}
      />

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
