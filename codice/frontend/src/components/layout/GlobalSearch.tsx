import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  Users,
  Building2,
  Package,
  ChevronRight,
  X,
  Tag,
  ClipboardList,
  ShoppingBag,
  UserRound,
  LoaderCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { fornitoriApi } from '../../api/fornitoriApi';
import { categorieApi } from '../../api/categorieApi';
import { prodottiApi } from '../../api/prodottiApi';
import { clientiApi } from '../../api/clientiApi';
import { acquistiApi } from '../../api/acquistiApi';
import { ordiniApi } from '../../api/ordiniApi';
import { dipendentiApi } from '../../api/corrieriApi';
import type { Fornitore } from '../../types/fornitori';
import type { Categoria } from '../../types/categorie';
import type { ProdottoListino } from '../../types/prodotti';
import type { Cliente } from '../../types/clienti';
import type { OrdineAcquistoLista } from '../../types/acquisti';
import type { OrdineVendita } from '../../types/ordini';
import type { Dipendente } from '../../types/corrieri';

type SearchCategory =
  | 'Fornitori'
  | 'Categorie'
  | 'Prodotti'
  | 'Clienti'
  | 'Ordini di Acquisto'
  | 'Ordini di Vendita'
  | 'Dipendenti';

type SearchResult = {
  key: string;
  id: number;
  title: string;
  subtitle: string;
  category: SearchCategory;
  href: string;
  score: number;
};

type SearchDatasets = {
  fornitori: Fornitore[];
  categorie: Categoria[];
  prodotti: ProdottoListino[];
  clienti: Cliente[];
  ordiniAcquisto: OrdineAcquistoLista[];
  ordiniVendita: OrdineVendita[];
  dipendenti: Dipendente[];
};

interface GlobalSearchProps {
  onNavigate?: (page: string) => void;
  onClose?: () => void;
}

const EMPTY_DATASETS: SearchDatasets = {
  fornitori: [],
  categorie: [],
  prodotti: [],
  clienti: [],
  ordiniAcquisto: [],
  ordiniVendita: [],
  dipendenti: [],
};

const categoryIcons = {
  Fornitori: Building2,
  Categorie: Tag,
  Prodotti: Package,
  Clienti: Users,
  'Ordini di Acquisto': ClipboardList,
  'Ordini di Vendita': ShoppingBag,
  Dipendenti: UserRound,
} satisfies Record<SearchCategory, typeof Building2>;

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const scoreMatch = (term: string, fields: string[]) => {
  const normalizedTerm = normalize(term);

  for (const rawField of fields) {
    const field = normalize(rawField);
    if (!field) continue;
    if (field === normalizedTerm) return 300;
    if (field.startsWith(normalizedTerm)) return 200;
    if (field.includes(normalizedTerm)) return 100;
  }

  return -1;
};

const truncateResults = (items: SearchResult[]) => {
  const maxPerCategory = 5;
  const counts = new Map<SearchCategory, number>();
  const truncated: SearchResult[] = [];

  for (const item of items) {
    const current = counts.get(item.category) ?? 0;
    if (current >= maxPerCategory) continue;
    counts.set(item.category, current + 1);
    truncated.push(item);
  }

  return truncated;
};

const buildPurchaseOrderLabel = (id: number) => `OA-${String(id).padStart(4, '0')}`;
const buildSalesOrderLabel = (id: number) => `SO-${String(id).padStart(4, '0')}`;

export function GlobalSearch({ onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const datasetsRef = useRef<SearchDatasets | null>(null);

  const hasPermesso = useAuthStore((state) => state.hasPermesso);
  const canAccessPage = useAuthStore((state) => state.canAccessPage);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const canSearchAnagrafiche = canAccessPage('anagrafiche');
  const canSearchMagazzino = canAccessPage('magazzino');
  const canSearchAcquisti = canAccessPage('acquisti');
  const canSearchVendite = canAccessPage('vendite');

  const canSearchFornitori = canSearchAnagrafiche && hasPermesso('fornitori:read');
  const canSearchClienti = canSearchAnagrafiche && hasPermesso('clienti:read');
  const canSearchDipendenti = canSearchAnagrafiche && hasPermesso('dipendenti:read');
  const canSearchCategorie = canSearchMagazzino && hasPermesso('prodotti:read');
  const canSearchProdotti = canSearchMagazzino && hasPermesso('prodotti:read');
  const canSearchOrdiniAcquisto = canSearchAcquisti && hasPermesso('acquisti:read');
  const canSearchOrdiniVendita = canSearchVendite && hasPermesso('ordini:read');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const loadDatasets = async (): Promise<SearchDatasets> => {
    if (datasetsRef.current) return datasetsRef.current;

    const requests: Promise<Partial<SearchDatasets>>[] = [];

    if (canSearchFornitori) {
      requests.push(fornitoriApi.list().then((fornitori) => ({ fornitori })));
    }
    if (canSearchCategorie) {
      requests.push(categorieApi.list().then((categorie) => ({ categorie })));
    }
    if (canSearchProdotti) {
      requests.push(prodottiApi.list().then((prodotti) => ({ prodotti })));
    }
    if (canSearchClienti) {
      requests.push(clientiApi.list().then((clienti) => ({ clienti })));
    }
    if (canSearchOrdiniAcquisto) {
      requests.push(acquistiApi.list().then((ordiniAcquisto) => ({ ordiniAcquisto })));
    }
    if (canSearchOrdiniVendita) {
      requests.push(ordiniApi.list().then((ordiniVendita) => ({ ordiniVendita })));
    }
    if (canSearchDipendenti) {
      requests.push(dipendentiApi.list().then((dipendenti) => ({ dipendenti })));
    }

    const settled = await Promise.allSettled(requests);
    const nextDatasets: SearchDatasets = { ...EMPTY_DATASETS };
    let hasFailures = false;

    settled.forEach((result) => {
      if (result.status === 'fulfilled') {
        Object.assign(nextDatasets, result.value);
        return;
      }

      hasFailures = true;
    });

    if (hasFailures) {
      toast.error('Ricerca globale parziale', {
        description: 'Alcuni dati non sono stati caricati correttamente.',
      });
    }

    datasetsRef.current = nextDatasets;
    return nextDatasets;
  };

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const executeSearch = async () => {
      setLoading(true);

      try {
        const datasets = await loadDatasets();
        if (cancelled) return;

        const nextResults: SearchResult[] = [];

        datasets.fornitori.forEach((item) => {
          const score = scoreMatch(trimmedQuery, [
            item.ragione_sociale,
            item.piva ?? '',
            item.email ?? '',
            item.indirizzo ?? '',
          ]);
          if (score < 0) return;

          nextResults.push({
            key: `fornitore-${item.id}`,
            id: item.id,
            title: item.ragione_sociale,
            subtitle: [item.piva, item.email ?? item.indirizzo].filter(Boolean).join(' · ') || 'Fornitore',
            category: 'Fornitori',
            href: `/anagrafiche?tab=fornitori&detailType=fornitore&detailId=${item.id}`,
            score,
          });
        });

        datasets.categorie.forEach((item) => {
          const score = scoreMatch(trimmedQuery, [
            item.nome,
            item.categoria_padre_nome ?? '',
          ]);
          if (score < 0) return;

          nextResults.push({
            key: `categoria-${item.id}`,
            id: item.id,
            title: item.nome,
            subtitle: item.categoria_padre_nome
              ? `Sottocategoria di ${item.categoria_padre_nome}`
              : 'Categoria radice',
            category: 'Categorie',
            href: `/magazzino?tab=categorie&categorySearch=${encodeURIComponent(item.nome)}`,
            score,
          });
        });

        datasets.prodotti.forEach((item) => {
          const score = scoreMatch(trimmedQuery, [
            item.nome,
            item.sku,
            item.categoria ?? '',
          ]);
          if (score < 0) return;

          nextResults.push({
            key: `prodotto-${item.id}`,
            id: item.id,
            title: item.nome,
            subtitle: [item.sku, item.categoria].filter(Boolean).join(' · ') || 'Prodotto',
            category: 'Prodotti',
            href: `/magazzino?tab=prodotti&productId=${item.id}`,
            score,
          });
        });

        datasets.clienti.forEach((item) => {
          const score = scoreMatch(trimmedQuery, [
            item.ragione_sociale,
            item.piva_cf ?? '',
            item.email ?? '',
          ]);
          if (score < 0) return;

          nextResults.push({
            key: `cliente-${item.id}`,
            id: item.id,
            title: item.ragione_sociale,
            subtitle: [item.piva_cf, item.email].filter(Boolean).join(' · ') || 'Cliente',
            category: 'Clienti',
            href: `/anagrafiche?tab=clienti&detailType=cliente&detailId=${item.id}`,
            score,
          });
        });

        datasets.ordiniAcquisto.forEach((item) => {
          const orderLabel = buildPurchaseOrderLabel(item.id);
          const score = scoreMatch(trimmedQuery, [
            orderLabel,
            item.fornitore,
            item.stato,
          ]);
          if (score < 0) return;

          nextResults.push({
            key: `ordine-acquisto-${item.id}`,
            id: item.id,
            title: orderLabel,
            subtitle: [item.fornitore, item.stato].filter(Boolean).join(' · '),
            category: 'Ordini di Acquisto',
            href: `/acquisti?tab=ordini&orderId=${item.id}`,
            score,
          });
        });

        datasets.ordiniVendita.forEach((item) => {
          const orderLabel = buildSalesOrderLabel(item.id);
          const score = scoreMatch(trimmedQuery, [
            orderLabel,
            item.cliente ?? '',
            item.stato,
            item.stato_picking,
          ]);
          if (score < 0) return;

          nextResults.push({
            key: `ordine-vendita-${item.id}`,
            id: item.id,
            title: orderLabel,
            subtitle: [item.cliente, item.stato].filter(Boolean).join(' · ') || 'Ordine di vendita',
            category: 'Ordini di Vendita',
            href: `/vendite?tab=ordini&orderId=${item.id}`,
            score,
          });
        });

        datasets.dipendenti.forEach((item) => {
          const fullName = `${item.nome} ${item.cognome}`;
          const score = scoreMatch(trimmedQuery, [
            fullName,
            item.codice_fiscale,
            item.ruolo_operativo ?? '',
          ]);
          if (score < 0) return;

          nextResults.push({
            key: `dipendente-${item.id}`,
            id: item.id,
            title: fullName,
            subtitle: [item.codice_fiscale, item.ruolo_operativo].filter(Boolean).join(' · ') || 'Dipendente',
            category: 'Dipendenti',
            href: `/anagrafiche?tab=dipendenti&detailType=dipendente&detailId=${item.id}`,
            score,
          });
        });

        const orderedResults = nextResults
          .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title, 'it', { sensitivity: 'base' }));

        setResults(truncateResults(orderedResults));
      } catch (error: any) {
        if (!cancelled) {
          setResults([]);
          toast.error('Errore ricerca globale', {
            description: error?.message ?? 'Impossibile caricare i dati della ricerca.',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void executeSearch();

    return () => {
      cancelled = true;
    };
  }, [
    query,
    canSearchCategorie,
    canSearchClienti,
    canSearchDipendenti,
    canSearchFornitori,
    canSearchOrdiniAcquisto,
    canSearchOrdiniVendita,
    canSearchProdotti,
  ]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.href);
    onClose?.();
    setQuery('');
    setResults([]);
  };

  const handleClose = () => {
    onClose?.();
    setQuery('');
    setResults([]);
  };

  const groupedResults = results.reduce((acc, result) => {
    const bucket = acc[result.category] ?? [];
    bucket.push(result);
    acc[result.category] = bucket;
    return acc;
  }, {} as Partial<Record<SearchCategory, SearchResult[]>>);

  const hasSearchableSections =
    canSearchFornitori ||
    canSearchCategorie ||
    canSearchProdotti ||
    canSearchClienti ||
    canSearchOrdiniAcquisto ||
    canSearchOrdiniVendita ||
    canSearchDipendenti;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={handleClose} />
      <div className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5EAF2] z-50 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E5EAF2]">
          <Search className="w-5 h-5 text-[#6B7280]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca fornitori, categorie, prodotti, clienti, ordini, dipendenti..."
            className="flex-1 text-base outline-none placeholder:text-[#9CA3AF]"
          />
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 text-xs font-mono bg-[#F7F9FC] text-[#6B7280] rounded border border-[#E5EAF2]">
              Ctrl+K
            </kbd>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-[#F7F9FC] rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!hasSearchableSections && (
            <div className="py-12 text-center">
              <p className="text-[#6B7280]">Non ci sono dati ricercabili per il tuo profilo.</p>
            </div>
          )}

          {hasSearchableSections && !query && (
            <div className="py-12 text-center">
              <Search className="w-12 h-12 text-[#E5EAF2] mx-auto mb-3" />
              <p className="text-sm text-[#6B7280]">Inizia a digitare per cercare...</p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Fornitori · Categorie · Prodotti · Clienti · Ordini di Acquisto · Ordini di Vendita · Dipendenti
              </p>
            </div>
          )}

          {hasSearchableSections && query.trim().length > 0 && query.trim().length < 2 && (
            <div className="py-12 text-center">
              <p className="text-[#6B7280]">Digita almeno 2 caratteri per avviare la ricerca.</p>
            </div>
          )}

          {hasSearchableSections && loading && query.trim().length >= 2 && (
            <div className="py-12 text-center">
              <LoaderCircle className="w-8 h-8 text-[#17E88F] animate-spin mx-auto mb-3" />
              <p className="text-sm text-[#6B7280]">Ricerca in corso sui dati reali...</p>
            </div>
          )}

          {hasSearchableSections && !loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[#6B7280]">Nessun risultato trovato per "{query}"</p>
            </div>
          )}

          {hasSearchableSections && !loading && results.length > 0 && (
            <div className="space-y-3">
              {Object.entries(groupedResults).map(([category, items]) => {
                if (!items?.length) return null;
                const Icon = categoryIcons[category as SearchCategory];

                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#6B7280] uppercase">
                      <Icon className="w-3.5 h-3.5" />
                      {category}
                    </div>
                    <div className="space-y-1">
                      {items.map((result) => (
                        <button
                          key={result.key}
                          onClick={() => handleSelect(result)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#F7F9FC] transition-all group"
                        >
                          <div className="flex-1 text-left">
                            <p className="font-medium text-[#2D2D2D]">{result.title}</p>
                            <p className="text-sm text-[#6B7280] mt-0.5">{result.subtitle}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
