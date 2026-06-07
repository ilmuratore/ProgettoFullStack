import { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { PageTabBar } from '../../components/ui/PageTabBar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { ProductFormModal, ProductFormData } from '../anagrafiche/components/ProductFormModal';
import { CategoryFormModal, CategoryFormData } from '../anagrafiche/components/CategoryFormModal';
import { SupplierFormModal, SupplierFormData } from '../anagrafiche/components/SupplierFormModal';
import { ClientFormModal, ClientFormData } from '../anagrafiche/components/ClientFormModal';
import { CourierFormModal, CourierFormData} from '../anagrafiche/components/CourierFormModal';
import { toast } from 'sonner';

type TabType = 'prodotti' | 'categorie' | 'fornitori' | 'clienti' | 'corrieri';

interface Cliente {
  id: number;
  ragioneSociale: string;
  codice: string;
  pIva: string;
  citta: string;
  email: string;
  telefono: string;
  fatturato: string;
  stato: 'Attivo' | 'Sospeso' | 'Inattivo';
}

interface Fornitore {
  id: number;
  ragioneSociale: string;
  codice: string;
  pIva: string;
  citta: string;
  email: string;
  telefono: string;
  categoria: string;
  stato: 'Attivo' | 'Sospeso' | 'Inattivo';
}

interface Prodotto {
  id: number;
  nome: string;
  sku: string;
  categoria: string;
  prezzo: string;
}

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

const clienti: Cliente[] = [];

const fornitori: Fornitore[] = [];

const prodotti: Prodotto[] = [];

const categorie: Categoria[] = [];

const corrieri: Corriere[] = [];

export function AnagrafichePage() {
  const [activeTab, setActiveTab] = useState<TabType>('prodotti');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [courierModalOpen, setCourierModalOpen] = useState(false);

  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit' | 'subcategory'>('create');
  const [parentCategoryForSub, setParentCategoryForSub] = useState<string>('');

  // Data states
  const [prodottiState, setProdottiState] = useState(prodotti);
  const [categorieState, setCategorieState] = useState(categorie);
  const [fornitoriState, setFornitoriState] = useState(fornitori);
  const [clientiState, setClientiState] = useState(clienti);
  const [corrieriState, setCorrieriState] = useState(corrieri);

  const tabs = [
    { id: 'prodotti' as TabType, label: 'Prodotti', icon: Package, count: prodottiState.length },
    { id: 'categorie' as TabType, label: 'Categorie', icon: Building2, count: categorieState.filter(c => !c.padre).length },
    { id: 'fornitori' as TabType, label: 'Fornitori', icon: Building2, count: fornitoriState.length },
    { id: 'clienti' as TabType, label: 'Clienti', icon: User, count: clientiState.length },
    { id: 'corrieri' as TabType, label: 'Corrieri', icon: Truck, count: corrieriState.length },
  ];

  const getStatoBadgeColor = (stato: string) => {
    switch (stato) {
      case 'Attivo':
      case 'Disponibile':
        return 'bg-[#DCFCE7] text-[#16A34A]';
      case 'Sospeso':
      case 'In Arrivo':
        return 'bg-[#FEF3C7] text-[#D97706]';
      case 'Inattivo':
      case 'Esaurito':
        return 'bg-[#FEE2E2] text-[#DC2626]';
      default:
        return 'bg-[#F3F4F6] text-[#6B7280]';
    }
  };

  const getTabLabel = () => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab ? tab.label : '';
  };

  const getNewButtonLabel = () => {
    switch (activeTab) {
      case 'prodotti': return 'Nuovo Prodotto';
      case 'categorie': return 'Nuova Categoria';
      case 'fornitori': return 'Nuovo Fornitore';
      case 'clienti': return 'Nuovo Cliente';
      case 'corrieri': return 'Nuovo Corriere';
    }
  };

  const handleNewClick = () => {
    setEditMode('create');
    setSelectedItem(null);
    switch (activeTab) {
      case 'prodotti':
        setProductModalOpen(true);
        break;
      case 'categorie':
        setCategoryModalMode('create');
        setCategoryModalOpen(true);
        break;
      case 'fornitori':
        setSupplierModalOpen(true);
        break;
      case 'clienti':
        setClientModalOpen(true);
        break;
      case 'corrieri':
        setCourierModalOpen(true);
        break;
    }
  };

  const handleEdit = (item: any) => {
    setEditMode('edit');
    setSelectedItem(item);
    switch (activeTab) {
      case 'prodotti':
        setProductModalOpen(true);
        break;
      case 'categorie':
        setCategoryModalMode('edit');
        setCategoryModalOpen(true);
        break;
      case 'fornitori':
        setSupplierModalOpen(true);
        break;
      case 'clienti':
        setClientModalOpen(true);
        break;
      case 'corrieri':
        setCourierModalOpen(true);
        break;
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo elemento?')) return;

    switch (activeTab) {
      case 'prodotti':
        setProdottiState(prev => prev.filter(p => p.id !== id));
        toast.success('Prodotto eliminato con successo');
        break;
      case 'categorie':
        setCategorieState(prev => prev.filter(c => c.id !== id));
        toast.success('Categoria eliminata con successo');
        break;
      case 'fornitori':
        setFornitoriState(prev => prev.filter(f => f.id !== id));
        toast.success('Fornitore eliminato con successo');
        break;
      case 'clienti':
        setClientiState(prev => prev.filter(c => c.id !== id));
        toast.success('Cliente eliminato con successo');
        break;
      case 'corrieri':
        setCorrieriState(prev => prev.filter(c => c.id !== id));
        toast.success('Corriere eliminato con successo');
        break;
    }
  };

  const handleView = (item: any) => {
    toast.info('Funzionalità di visualizzazione dettagliata in arrivo');
  };

  const handleAddSubcategory = (parentName: string) => {
    setParentCategoryForSub(parentName);
    setCategoryModalMode('subcategory');
    setCategoryModalOpen(true);
  };

  // Save handlers
  const handleSaveProduct = (data: ProductFormData) => {
    if (editMode === 'create') {
      const newId = Math.max(...prodottiState.map(p => p.id)) + 1;
      setProdottiState(prev => [...prev, { id: newId, ...data }]);
      toast.success('Prodotto creato con successo');
    } else {
      setProdottiState(prev => prev.map(p => p.id === selectedItem?.id ? { ...p, ...data } : p));
      toast.success('Prodotto aggiornato con successo');
    }
  };

  const handleSaveCategory = (data: CategoryFormData) => {
    if (categoryModalMode === 'create' || categoryModalMode === 'subcategory') {
      const newId = Math.max(...categorieState.map(c => c.id)) + 1;
      setCategorieState(prev => [...prev, { id: newId, nome: data.nome, padre: data.padre || null, prodottiCount: 0 }]);
      toast.success('Categoria creata con successo');
    } else {
      setCategorieState(prev => prev.map(c => c.id === selectedItem?.id ? { ...c, nome: data.nome } : c));
      toast.success('Categoria aggiornata con successo');
    }
  };

  const handleSaveSupplier = (data: SupplierFormData) => {
    if (editMode === 'create') {
      const newId = Math.max(...fornitoriState.map(f => f.id)) + 1;
      setFornitoriState(prev => [...prev, { id: newId, ...data }]);
      toast.success('Fornitore creato con successo');
    } else {
      setFornitoriState(prev => prev.map(f => f.id === selectedItem?.id ? { ...f, ...data } : f));
      toast.success('Fornitore aggiornato con successo');
    }
  };

  const handleSaveClient = (data: ClientFormData) => {
    if (editMode === 'create') {
      const newId = Math.max(...clientiState.map(c => c.id)) + 1;
      setClientiState(prev => [...prev, { id: newId, ...data }]);
      toast.success('Cliente creato con successo');
    } else {
      setClientiState(prev => prev.map(c => c.id === selectedItem?.id ? { ...c, ...data } : c));
      toast.success('Cliente aggiornato con successo');
    }
  };

  const handleSaveCourier = (data: CourierFormData) => {
    if (editMode === 'create') {
      const newId = Math.max(...corrieriState.map(c => c.id)) + 1;
      setCorrieriState(prev => [...prev, { id: newId, ...data }]);
      toast.success('Corriere creato con successo');
    } else {
      setCorrieriState(prev => prev.map(c => c.id === selectedItem?.id ? { ...c, ...data } : c));
      toast.success('Corriere aggiornato con successo');
    }
  };

  // Filtering
  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    switch (activeTab) {
      case 'prodotti':
        return prodottiState.filter(p =>
          p.nome.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.categoria.toLowerCase().includes(query)
        );
      case 'categorie':
        return categorieState.filter(c => c.nome.toLowerCase().includes(query));
      case 'fornitori':
        return fornitoriState.filter(f =>
          f.ragioneSociale.toLowerCase().includes(query) ||
          f.codice.toLowerCase().includes(query) ||
          f.pIva.toLowerCase().includes(query)
        );
      case 'clienti':
        return clientiState.filter(c =>
          c.ragioneSociale.toLowerCase().includes(query) ||
          c.codice.toLowerCase().includes(query) ||
          c.pIva.toLowerCase().includes(query)
        );
      case 'corrieri':
        return corrieriState.filter(c =>
          c.nome.toLowerCase().includes(query) ||
          c.codice.toLowerCase().includes(query)
        );
      default:
        return [];
    }
  };

  const filteredData = getFilteredData();
  const filteredProdotti = activeTab === 'prodotti' ? filteredData as Prodotto[] : [];
  const filteredCategorie = activeTab === 'categorie' ? filteredData as Categoria[] : [];
  const filteredFornitori = activeTab === 'fornitori' ? filteredData as Fornitore[] : [];
  const filteredClienti = activeTab === 'clienti' ? filteredData as Cliente[] : [];
  const filteredCorrieri = activeTab === 'corrieri' ? filteredData as Corriere[] : [];

  // Kebab Menu Component
  const KebabMenu = ({ item }: { item: any }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 hover:bg-[#F7F9FC] text-[#6B7280] rounded-lg transition-all">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => handleView(item)} className="cursor-pointer">
          <Eye className="w-4 h-4 mr-2" />
          Visualizza
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEdit(item)} className="cursor-pointer">
          <Edit className="w-4 h-4 mr-2" />
          Modifica
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(item.id)} className="cursor-pointer text-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          Elimina
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">
            Gestione Anagrafiche - {getTabLabel()}
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">Gestisci clienti, fornitori, prodotti e categorie</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Importa
          </button>
          <button className="px-4 py-2 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Esporta
          </button>
          <button
            onClick={handleNewClick}
            className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            {getNewButtonLabel()}
          </button>
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
              <Filter className="w-4 h-4" />
              Filtri
            </button>
          </div>

          {/* TAB PRODOTTI - Listino Prezzi */}
          {activeTab === 'prodotti' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5EAF2]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Nome Prodotto</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">SKU</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Categoria</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Prezzo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProdotti.map((prodotto, index) => (
                    <tr
                      key={prodotto.id}
                      className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#2D2D2D]">{prodotto.nome}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{prodotto.sku}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#6366F1]">
                          {prodotto.categoria}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{prodotto.prezzo}</td>
                      <td className="py-3 px-4">
                        <KebabMenu item={prodotto} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB CATEGORIE */}
          {activeTab === 'categorie' && (
            <div className="space-y-4">
              {filteredCategorie.filter(c => !c.padre).map((categoria) => {
                const subcategories = categorieState.filter(c => c.padre === categoria.nome);
                const totalCount = categoria.prodottiCount + subcategories.reduce((sum, sub) => sum + sub.prodottiCount, 0);

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
                        <button
                          onClick={() => handleAddSubcategory(categoria.nome)}
                          className="px-3 py-1.5 text-xs bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all"
                        >
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

          {/* TAB FORNITORI */}
          {activeTab === 'fornitori' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5EAF2]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Ragione Sociale</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Codice</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">P. IVA</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Città</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Contatti</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Categoria</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Stato</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFornitori.map((fornitore, index) => (
                    <tr
                      key={fornitore.id}
                      className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#2D2D2D]">{fornitore.ragioneSociale}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{fornitore.codice}</td>
                      <td className="py-3 px-4 text-sm text-[#6B7280]">{fornitore.pIva}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                          <MapPin className="w-3 h-3" />
                          {fornitore.citta}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                            <Mail className="w-3 h-3" />
                            {fornitore.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                            <Phone className="w-3 h-3" />
                            {fornitore.telefono}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#6366F1]">
                          {fornitore.categoria}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getStatoBadgeColor(fornitore.stato)}`}>
                          {fornitore.stato}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <KebabMenu item={fornitore} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB CLIENTI */}
          {activeTab === 'clienti' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5EAF2]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Ragione Sociale</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Codice</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">P. IVA</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Città</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Contatti</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Fatturato</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Stato</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClienti.map((cliente, index) => (
                    <tr
                      key={cliente.id}
                      className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#2D2D2D]">{cliente.ragioneSociale}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{cliente.codice}</td>
                      <td className="py-3 px-4 text-sm text-[#6B7280]">{cliente.pIva}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                          <MapPin className="w-3 h-3" />
                          {cliente.citta}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                            <Mail className="w-3 h-3" />
                            {cliente.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                            <Phone className="w-3 h-3" />
                            {cliente.telefono}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-[#2D2D2D]">{cliente.fatturato}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getStatoBadgeColor(cliente.stato)}`}>
                          {cliente.stato}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <KebabMenu item={cliente} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB CORRIERI */}
          {activeTab === 'corrieri' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5EAF2]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Codice</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Telefono</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Spedizioni Attive</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Stato</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCorrieri.map((corriere, index) => (
                    <tr
                      key={corriere.id}
                      className={`border-b border-[#E5EAF2] hover:bg-[#F7F9FC] transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#2D2D2D]">{corriere.nome}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#6B7280] font-mono">{corriere.codice}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                          <Mail className="w-3 h-3" />
                          {corriere.email}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                          <Phone className="w-3 h-3" />
                          {corriere.telefono}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#DBEAFE] text-[#3B82F6]">
                          {corriere.spedizioniAttive} attive
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getStatoBadgeColor(corriere.stato)}`}>
                          {corriere.stato}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <KebabMenu item={corriere} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E5EAF2]">
            <div className="text-sm text-[#6B7280]">
              Mostrando <span className="font-medium text-[#2D2D2D]">{filteredData.length}</span> risultati
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all text-sm">
                Precedente
              </button>
              <button className="px-3 py-1.5 bg-[#17E88F] text-white rounded-lg font-medium text-sm">
                1
              </button>
              <button className="px-3 py-1.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all text-sm">
                2
              </button>
              <button className="px-3 py-1.5 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-lg hover:bg-[#F7F9FC] transition-all text-sm">
                Successivo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
        nextId={fornitoriState.length + 1}
      />
      <ClientFormModal
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSave={handleSaveClient}
        initialData={selectedItem}
        mode={editMode}
        nextId={clientiState.length + 1}
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
