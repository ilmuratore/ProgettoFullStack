import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Users, Building2, Package, ShoppingCart, Truck, Warehouse, ChevronRight, X, Loader2 } from 'lucide-react';
import { clientiApi } from '../../api/clientiApi';
import { fornitoriApi } from '../../api/fornitoriApi';
import { prodottiApi } from '../../api/prodottiApi';
import { acquistiApi } from '../../api/acquistiApi';
import { ordiniApi } from '../../api/ordiniApi';
import { spedizioniApi } from '../../api/spedizioniApi';
import { magazzinoApi } from '../../api/magazzinoApi';
import { dipendentiApi } from '../../api/corrieriApi';
import { useAuthStore } from '../../store/authStore';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'Clienti' | 'Fornitori' | 'Dipendenti' | 'Prodotti' | 'Ordini' | 'Spedizioni' | 'Magazzini';
  href: string;
  tokens: string;
}

interface GlobalSearchProps {
  onNavigate?: (page: string) => void;
  onClose?: () => void;
}

const categoryIcons = {
  Clienti: Users,
  Fornitori: Building2,
  Dipendenti: Users,
  Prodotti: Package,
  Ordini: ShoppingCart,
  Spedizioni: Truck,
  Magazzini: Warehouse,
};

const formatCurrency = (value: number | null | undefined): string =>
  value == null
    ? '-'
    : new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export function GlobalSearch({ onClose }: GlobalSearchProps) {
  const { hasPermesso } = useAuthStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) return;

    let cancelled = false;

    const loadResults = async () => {
      setLoading(true);
      setLoadError(null);

      const settled = await Promise.allSettled([
        hasPermesso('clienti:read') ? clientiApi.list() : Promise.resolve([]),
        hasPermesso('fornitori:read') ? fornitoriApi.list() : Promise.resolve([]),
        hasPermesso('dipendenti:read') ? dipendentiApi.list() : Promise.resolve([]),
        hasPermesso('prodotti:read') ? prodottiApi.list() : Promise.resolve([]),
        hasPermesso('acquisti:read') ? acquistiApi.list() : Promise.resolve([]),
        hasPermesso('ordini:read') ? ordiniApi.list() : Promise.resolve([]),
        hasPermesso('spedizioni:read') ? spedizioniApi.list() : Promise.resolve([]),
        hasPermesso('magazzino:read') ? magazzinoApi.list() : Promise.resolve([]),
      ]);

      if (cancelled) return;

      const [
        clientiRes,
        fornitoriRes,
        dipendentiRes,
        prodottiRes,
        ordiniAcquistoRes,
        ordiniVenditaRes,
        spedizioniRes,
        magazziniRes,
      ] = settled;

      const nextResults: SearchResult[] = [];

      if (clientiRes.status === 'fulfilled') {
        nextResults.push(
          ...clientiRes.value.map((cliente) => ({
            id: `cliente-${cliente.id}`,
            title: cliente.ragione_sociale,
            subtitle: [cliente.piva_cf, cliente.email, cliente.telefono].filter(Boolean).join(' · ') || 'Cliente',
            category: 'Clienti' as const,
            href: '/anagrafiche?tab=clienti',
            tokens: normalize([cliente.ragione_sociale, cliente.piva_cf, cliente.email, cliente.telefono].filter(Boolean).join(' ')),
          }))
        );
      }

      if (fornitoriRes.status === 'fulfilled') {
        nextResults.push(
          ...fornitoriRes.value.map((fornitore) => ({
            id: `fornitore-${fornitore.id}`,
            title: fornitore.ragione_sociale,
            subtitle: [fornitore.piva, fornitore.indirizzo, fornitore.email].filter(Boolean).join(' · ') || 'Fornitore',
            category: 'Fornitori' as const,
            href: '/anagrafiche?tab=fornitori',
            tokens: normalize([fornitore.ragione_sociale, fornitore.piva, fornitore.indirizzo, fornitore.email, fornitore.telefono].filter(Boolean).join(' ')),
          }))
        );
      }

      if (dipendentiRes.status === 'fulfilled') {
        nextResults.push(
          ...dipendentiRes.value.map((dipendente) => ({
            id: `dipendente-${dipendente.id}`,
            title: [dipendente.nome, dipendente.cognome].filter(Boolean).join(' '),
            subtitle: [dipendente.codice_fiscale, dipendente.ruolo_operativo, dipendente.utente_id ? `Utente #${dipendente.utente_id}` : null].filter(Boolean).join(' · ') || 'Dipendente',
            category: 'Dipendenti' as const,
            href: '/anagrafiche?tab=dipendenti',
            tokens: normalize([dipendente.nome, dipendente.cognome, dipendente.codice_fiscale, dipendente.ruolo_operativo].filter(Boolean).join(' ')),
          }))
        );
      }

      if (prodottiRes.status === 'fulfilled') {
        nextResults.push(
          ...prodottiRes.value.map((prodotto) => ({
            id: `prodotto-${prodotto.id}`,
            title: prodotto.nome,
            subtitle: [prodotto.sku, prodotto.categoria, prodotto.attivo ? 'Attivo' : 'Disattivo'].filter(Boolean).join(' · '),
            category: 'Prodotti' as const,
            href: '/magazzino?tab=prodotti',
            tokens: normalize([prodotto.nome, prodotto.sku, prodotto.categoria].filter(Boolean).join(' ')),
          }))
        );
      }

      if (ordiniAcquistoRes.status === 'fulfilled') {
        nextResults.push(
          ...ordiniAcquistoRes.value.map((ordine) => ({
            id: `ordine-acquisto-${ordine.id}`,
            title: `PO-${String(ordine.id).padStart(4, '0')}`,
            subtitle: [ordine.fornitore, ordine.stato, formatCurrency(ordine.importo_totale)].filter(Boolean).join(' · '),
            category: 'Ordini' as const,
            href: '/acquisti',
            tokens: normalize([ordine.id, ordine.fornitore, ordine.stato].filter(Boolean).join(' ')),
          }))
        );
      }

      if (ordiniVenditaRes.status === 'fulfilled') {
        nextResults.push(
          ...ordiniVenditaRes.value.map((ordine) => ({
            id: `ordine-vendita-${ordine.id}`,
            title: `SO-${String(ordine.id).padStart(4, '0')}`,
            subtitle: [ordine.cliente, ordine.stato, formatCurrency(ordine.importo_totale)].filter(Boolean).join(' · '),
            category: 'Ordini' as const,
            href: '/vendite',
            tokens: normalize([ordine.id, ordine.cliente, ordine.destinazione, ordine.stato, ordine.stato_picking].filter(Boolean).join(' ')),
          }))
        );
      }

      if (spedizioniRes.status === 'fulfilled') {
        nextResults.push(
          ...spedizioniRes.value.map((spedizione) => ({
            id: `spedizione-${spedizione.id}`,
            title: `SH-${String(spedizione.id).padStart(4, '0')}`,
            subtitle: [spedizione.cliente, spedizione.corriere, spedizione.stato, spedizione.tracking_number].filter(Boolean).join(' · '),
            category: 'Spedizioni' as const,
            href: '/logistica',
            tokens: normalize([spedizione.id, spedizione.cliente, spedizione.corriere, spedizione.stato, spedizione.tracking_number].filter(Boolean).join(' ')),
          }))
        );
      }

      if (magazziniRes.status === 'fulfilled') {
        nextResults.push(
          ...magazziniRes.value.map((magazzino) => ({
            id: `magazzino-${magazzino.id}`,
            title: magazzino.nome,
            subtitle: [magazzino.codice, magazzino.citta, magazzino.provincia].filter(Boolean).join(' · ') || 'Magazzino',
            category: 'Magazzini' as const,
            href: '/magazzino?tab=struttura',
            tokens: normalize([magazzino.nome, magazzino.codice, magazzino.indirizzo, magazzino.citta, magazzino.provincia].filter(Boolean).join(' ')),
          }))
        );
      }

      const hasAnySuccess = settled.some((item) => item.status === 'fulfilled');
      const hasAnyError = settled.some((item) => item.status === 'rejected');

      setAllResults(nextResults);
      if (!hasAnySuccess) setLoadError('Impossibile caricare i dati di ricerca');
      else if (hasAnyError) setLoadError('Alcuni risultati potrebbero mancare');
      setLoading(false);
      hasLoadedRef.current = true;
    };

    loadResults();

    return () => {
      cancelled = true;
    };
  }, [hasPermesso]);

  useEffect(() => {
    const trimmed = normalize(query);
    if (!trimmed) {
      setResults([]);
      return;
    }

    const filtered = allResults
      .filter((item) => item.tokens.includes(trimmed))
      .slice(0, 30);

    setResults(filtered);
  }, [allResults, query]);

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
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={handleClose} />
      <div
        ref={modalRef}
        className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5EAF2] z-50 overflow-hidden"
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E5EAF2]">
          <Search className="w-5 h-5 text-[#6B7280]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca clienti, fornitori, dipendenti, prodotti, ordini..."
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
          {loading && !query && (
            <div className="py-12 text-center">
              <Loader2 className="w-10 h-10 text-[#17E88F] mx-auto mb-3 animate-spin" />
              <p className="text-sm text-[#6B7280]">Caricamento dati reali...</p>
            </div>
          )}

          {loadError && !query && !loading && (
            <div className="py-12 text-center">
              <p className="text-sm text-[#6B7280]">{loadError}</p>
            </div>
          )}

          {query && results.length === 0 && !loading && (
            <div className="py-12 text-center">
              <p className="text-[#6B7280]">Nessun risultato trovato per "{query}"</p>
            </div>
          )}

          {query && results.length > 0 && (
            <div className="space-y-3">
              {Object.entries(groupedResults).map(([category, items]) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons];
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#6B7280] uppercase">
                      <Icon className="w-3.5 h-3.5" />
                      {category}
                    </div>
                    <div className="space-y-1">
                      {items.map((result) => (
                        <button
                          key={result.id}
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

          {!query && !loading && !loadError && (
            <div className="py-12 text-center">
              <Search className="w-12 h-12 text-[#E5EAF2] mx-auto mb-3" />
              <p className="text-sm text-[#6B7280]">Inizia a digitare per cercare...</p>
              <p className="text-xs text-[#9CA3AF] mt-1">Clienti · Fornitori · Prodotti · Ordini · Spedizioni · Magazzini</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
