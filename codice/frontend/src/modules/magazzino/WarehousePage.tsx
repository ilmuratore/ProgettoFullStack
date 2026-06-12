import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, GitMerge, Package, ArrowLeftRight,
  Tag, PackageCheck,
} from 'lucide-react';
import { WarehouseKPIs } from './components/WarehouseKPIs';
import { WarehouseTreeView } from './components/WarehouseTreeView';
import { WarehouseWidgets } from './components/WarehouseWidgets';
import { StockTable } from './components/StockTable';
import { StockMovementsTimeline } from './components/StockMovementsTimeline';
import { NewMovementModal } from './components/NewMovementModal';
import { NewGoodsReceiptModal } from '../acquisti/components/NewGoodsReceiptModal';
import { GoodsReceiptsTimeline } from '../acquisti/components/GoodsReceiptsTimeline';
import { ProductFormModal } from './components/ProductFormModal';
import { ProductDetailDrawer } from './components/ProductDetailDrawer';
import { CategoryFormModal } from './components/CategoryFormModal';
import { ProductsTab } from './components/ProductsTab';
import { CategoriesTab } from './components/CategoriesTab';
import { PageTabBar, type TabConfig } from '../../components/ui/PageTabBar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { magazzinoApi } from '../../api/magazzinoApi';
import { prodottiApi } from '../../api/prodottiApi';
import { categorieApi } from '../../api/categorieApi';
import { ricezioniApi } from '../../api/ricezioniApi';
import { useAuthStore } from '../../store/authStore';
import type {
  MagazzinoConUbicazioni,
  MagazzinoCreateRequest,
  MagazzinoUpdateRequest,
  Ubicazione,
  UbicazioneCreateRequest,
} from '../../types/magazzino';
import type { Prodotto, ProdottoListino, ProdottoCreateRequest, ProdottoUpdateRequest } from '../../types/prodotti';
import type { Categoria, CategoriaCreateRequest, CategoriaUpdateRequest } from '../../types/categorie';
import type { Ricezione, StatoOrdineAcquisto } from '../../types/acquisti';

type WarehouseTab = 'prodotti' | 'categorie' | 'struttura' | 'giacenze' | 'movimenti' | 'ricezioni';

const tabs: TabConfig[] = [
  { id: 'prodotti', label: 'Prodotti', icon: Package },
  { id: 'categorie', label: 'Categorie', icon: Tag },
  { id: 'struttura', label: 'Struttura', icon: GitMerge },
  { id: 'giacenze', label: 'Giacenze', icon: Package },
  { id: 'movimenti', label: 'Movimenti', icon: ArrowLeftRight },
  { id: 'ricezioni', label: 'Ricezioni', icon: PackageCheck },
];

const fmtDataOra = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString('it-IT') : '—';

const statoLabel: Record<StatoOrdineAcquisto, { bg: string; text: string; label: string }> = {
  BOZZA: { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Bozza' },
  INVIATO: { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]', label: 'Inviato' },
  CONFERMATO: { bg: 'bg-[#EDE9FE]', text: 'text-[#8B5CF6]', label: 'Confermato' },
  IN_RICEZIONE: { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]', label: 'In Ricezione' },
  COMPLETATO: { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', label: 'Completato' },
  ANNULLATO: { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Annullato' },
};


interface MagazzinoFormState {
  codice: string; nome: string; indirizzo: string;
  cap: string; citta: string; provincia: string; paese: string;
  attivo: boolean;
}
const EMPTY_MAG: MagazzinoFormState = { codice: '', nome: '', indirizzo: '', cap: '', citta: '', provincia: '', paese: 'Italia', attivo: true };

interface UbicazioneFormState { corsia: string; scaffale: string; temperatura_controllata: boolean; }
const EMPTY_UBIC: UbicazioneFormState = { corsia: '', scaffale: '', temperatura_controllata: false };

export function WarehousePage() {
  const { hasPermesso } = useAuthStore();
  const [activeTab, setActiveTab] = useState<WarehouseTab>('prodotti');
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isRicezioneModalOpen, setIsRicezioneModalOpen] = useState(false);

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

  const [prodotti, setProdotti] = useState<ProdottoListino[]>([]);
  const [loadingProdotti, setLoadingProdotti] = useState(false);
  const [searchProdotti, setSearchProdotti] = useState('');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Prodotto | null>(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [loadingCategorie, setLoadingCategorie] = useState(false);
  const [searchCategorie, setSearchCategorie] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);
  const [initialParentCategoryId, setInitialParentCategoryId] = useState<number | undefined>(undefined);
  const [categoryToDelete, setCategoryToDelete] = useState<Categoria | null>(null);
  const [ricezioni, setRicezioni] = useState<Ricezione[]>([]);
  const [loadingRic, setLoadingRic] = useState(false);
  const [ricezioniReloadKey, setRicezioniReloadKey] = useState(0);

  const fetchMagazzini = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await magazzinoApi.list();
      const dettagli = await Promise.all(lista.map((m) => magazzinoApi.getById(m.id)));
      setMagazzini(dettagli.map((mag) => ({ ...mag, ubicazioni: Array.isArray(mag.ubicazioni) ? mag.ubicazioni : [] })));
    }
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

  const fetchedTabs = useRef(new Set<WarehouseTab>());
  const fetchForTab = useCallback((tab: WarehouseTab) => {
    if (fetchedTabs.current.has(tab)) return;
    fetchedTabs.current.add(tab);
    if (tab === 'struttura') fetchMagazzini();
    if (tab === 'prodotti') { fetchProdotti(); fetchCategorie(); } 
    if (tab === 'categorie') fetchCategorie();
  }, [fetchMagazzini, fetchProdotti, fetchCategorie]);

  useEffect(() => { fetchForTab('struttura'); }, []);
  useEffect(() => { fetchForTab(activeTab); }, [activeTab, fetchForTab]);
  useEffect(() => {
    if (activeTab !== 'ricezioni') return;
    let alive = true;
    setLoadingRic(true);
    ricezioniApi
      .list()
      .then((d) => { if (alive) setRicezioni(d); })
      .catch((err: any) => toast.error('Errore caricamento ricezioni', { description: err?.message }))
      .finally(() => { if (alive) setLoadingRic(false); });
    return () => { alive = false; };
  }, [activeTab, ricezioniReloadKey]);

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
        return { label: 'Aggiorna Giacenze', show: false, action: () => {} };
      case 'movimenti':
        return { label: 'Nuovo Movimento', show: true, action: () => setIsMovementModalOpen(true) };
      case 'ricezioni':
        return { label: 'Registra Ricezione', show: true, action: () => setIsRicezioneModalOpen(true) };
    }
  };

  const action = getActionButton();

  const handleEditMagazzino = (mag: MagazzinoConUbicazioni) => {
    setMagModalMode('edit');
    setSelectedMag(mag);
    setMagForm({
      codice: mag.codice, nome: mag.nome, indirizzo: mag.indirizzo ?? '',
      cap: mag.cap ?? '', citta: mag.citta ?? '', provincia: mag.provincia ?? '', paese: mag.paese ?? 'Italia',
      attivo: mag.attivo,
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
        ? {
    ...m,
    ubicazioni: (Array.isArray(m.ubicazioni) ? m.ubicazioni : []).map(u =>
      u.id === ubicId ? { ...u, ...updated } : u
    )
  }
: m
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
        // Se attivo è cambiato rispetto allo stato attuale, chiama il toggle
        let finalAttivo = updated.attivo;
        if (magForm.attivo !== selectedMag.attivo) {
          const toggled = await magazzinoApi.toggle(selectedMag.id);
          finalAttivo = toggled.attivo;
        }
        setMagazzini(prev => prev.map(m => {
          if (m.id !== selectedMag.id) return m;
          return {
            ...m,
            ...updated,
            attivo: finalAttivo,
            ubicazioni: Array.isArray((updated as any).ubicazioni)
              ? (updated as any).ubicazioni
              : Array.isArray(m.ubicazioni)
                ? m.ubicazioni
                : [],
          };
        }));
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
          ? {
    ...m,
    ubicazioni: [...(Array.isArray(m.ubicazioni) ? m.ubicazioni : []), created]
  }
: m
        ));
        toast.success('Ubicazione creata');
      } else if (ubicModalMode === 'edit' && selectedUbic) {
        const updated = await magazzinoApi.updateTemperatura(selectedUbic.id, { temperatura_controllata: ubicForm.temperatura_controllata });
        setMagazzini(prev => prev.map(m => m.id === selectedUbic.magazzino_id
          ? {
    ...m,
    ubicazioni: (Array.isArray(m.ubicazioni) ? m.ubicazioni : []).map(u =>
      u.id === selectedUbic.id ? { ...u, ...updated } : u
    )
  }
: m
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

  const handleSaveProduct = async (data: ProdottoCreateRequest | ProdottoUpdateRequest, id?: number) => {
    const toListinoItem = (prodotto: Prodotto): ProdottoListino => ({
      id: prodotto.id,
      sku: prodotto.sku,
      nome: prodotto.nome,
      prezzo: prodotto.prezzo,
      data_agg_prezzo: prodotto.data_agg_prezzo,
      attivo: prodotto.attivo,
      created_at: prodotto.created_at,
    });

    try {
      if (productModalMode === 'create') {
        const created = await prodottiApi.create(data as ProdottoCreateRequest);
        setProdotti(prev => [...prev, toListinoItem(created)]);
        await fetchCategorie();
        toast.success('Prodotto creato');
      } else if (id !== undefined) {
        const updated = await prodottiApi.update(id, data as ProdottoUpdateRequest);
        setProdotti(prev => prev.map(p => p.id === id ? toListinoItem(updated) : p));
        await fetchCategorie();
        toast.success('Prodotto aggiornato');
      }
    } catch (err: any) {
      toast.error('Salvataggio fallito', { description: err?.code === 'DUPLICATE_ENTRY' ? 'SKU già in uso' : err?.message });
      throw err;
    }
  };

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

  const handleDeleteCategory = (id: number) => {
    setCategoryToDelete(categorie.find(c => c.id === id) ?? null);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await categorieApi.remove(categoryToDelete.id);
      setCategorie(prev => prev.filter(c => c.id !== categoryToDelete.id));
      toast.success('Categoria eliminata');
    } catch (err: any) {
      toast.error('Eliminazione bloccata', { description: err?.message });
    } finally {
      setCategoryToDelete(null);
    }
  };

  const handleAddSubcategory = (parentId: number) => {
    setCategoryModalMode('create');
    setSelectedCategory(null);
    setInitialParentCategoryId(parentId);
    setCategoryModalOpen(true);
  };

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
              onSearchChange={setSearchProdotti}
              onView={(item) => { setSelectedProductId(item.id); setProductDetailOpen(true); }}
              onEdit={(item) => { void handleEditProduct(item.id); }}
            />
          )}


          {/* ── CATEGORIE ── */}
          {activeTab === 'categorie' && (
            <CategoriesTab
              categorie={categorie}
              loading={loadingCategorie}
              search={searchCategorie}
              canWriteProdotti={canWriteProdotti}
              canDeleteProdotti={hasPermesso('prodotti:delete')}
              onSearchChange={setSearchCategorie}
              onAddSubcategory={handleAddSubcategory}
              onEdit={(item) => { setCategoryModalMode('edit'); setSelectedCategory(item); setInitialParentCategoryId(undefined); setCategoryModalOpen(true); }}
              onDelete={handleDeleteCategory}
            />
          )}


          {activeTab === 'giacenze' && <StockTable />}

          {activeTab === 'movimenti' && <StockMovementsTimeline />}

          {activeTab === 'ricezioni' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F7F9FC] border-b border-[#E5EAF2]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ricezione</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Ordine</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Fornitore</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Data Ricezione</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Stato Ordine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAF2]">
                    {loadingRic ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#6B7280]">Caricamento ricezioni...</td></tr>
                    ) : ricezioni.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#6B7280]">Nessuna ricezione registrata.</td></tr>
                    ) : ricezioni.map((r) => {
                      const badge = statoLabel[r.stato_ordine] ?? statoLabel.BOZZA;
                      return (
                        <tr key={r.id} className="hover:bg-[#F7F9FC] transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-[#17E88F]">RIC-{String(r.id).padStart(4, '0')}</td>
                          <td className="px-4 py-3 text-sm text-[#374151]">OA-{String(r.ordine_acquisto_id).padStart(4, '0')}</td>
                          <td className="px-4 py-3 text-sm text-[#374151] max-w-[220px] truncate">{r.fornitore}</td>
                          <td className="px-4 py-3 text-sm text-[#6B7280]">{fmtDataOra(r.data_ricezione)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <GoodsReceiptsTimeline ricezioni={ricezioni} loading={loadingRic} />
            </div>
          )}


        </div>
      </div>

      {/* ── Modali ── */}
      <NewMovementModal isOpen={isMovementModalOpen} onClose={() => setIsMovementModalOpen(false)} />
      <NewGoodsReceiptModal
        isOpen={isRicezioneModalOpen}
        onClose={() => setIsRicezioneModalOpen(false)}
        onCreated={() => setRicezioniReloadKey((k) => k + 1)}
      />

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


      <AlertDialog open={!!categoryToDelete} onOpenChange={(v) => { if (!v) setCategoryToDelete(null); }}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Eliminare la categoria?</AlertDialogTitle>
      <AlertDialogDescription>
        La categoria <strong>{categoryToDelete?.nome}</strong> verrà rimossa dall'elenco delle categorie attive.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Annulla</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirmDeleteCategory} className="bg-red-600 hover:bg-red-700 text-white">
        Elimina
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>


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
            {magModalMode === 'edit' && (
              <div className="flex items-center justify-between p-4 bg-[#F7F9FC] rounded-xl border border-[#E5EAF2]">
                <div>
                  <div className="text-sm font-medium text-[#2D2D2D]">Stato magazzino</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    {magForm.attivo ? 'Il magazzino è attivo e operativo' : 'Il magazzino è disattivato'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMagForm(prev => ({ ...prev, attivo: !prev.attivo }))}
                  className="flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  {magForm.attivo
                    ? <><span className="text-[#17E88F]">Attivo</span><span className="w-11 h-6 bg-[#17E88F] rounded-full flex items-center px-1 ml-2"><span className="w-4 h-4 bg-white rounded-full shadow translate-x-5 transition-transform inline-block" /></span></>
                    : <><span className="text-[#6B7280]">Disattivo</span><span className="w-11 h-6 bg-[#D1D5DB] rounded-full flex items-center px-1 ml-2"><span className="w-4 h-4 bg-white rounded-full shadow transition-transform inline-block" /></span></>
                  }
                </button>
              </div>
            )}
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
