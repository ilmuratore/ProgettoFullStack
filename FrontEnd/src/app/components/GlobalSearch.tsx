import { useState, useEffect, useRef } from 'react';
import { Search, Users, Building2, Package, ShoppingCart, Truck, Warehouse, ChevronRight, X } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'Clienti' | 'Fornitori' | 'Prodotti' | 'Ordini' | 'Spedizioni' | 'Magazzini';
  page: string;
}

interface GlobalSearchProps {
  onNavigate?: (page: string) => void;
  onClose?: () => void;
}

const mockData: SearchResult[] = [
  { id: '1', title: 'Logistica Express S.r.l.', subtitle: 'CLI-001 · Milano', category: 'Clienti', page: 'clienti' },
  { id: '2', title: 'Transport Solutions S.p.A.', subtitle: 'CLI-002 · Roma', category: 'Clienti', page: 'clienti' },
  { id: '3', title: 'Packaging Solutions Italia S.p.A.', subtitle: 'FOR-001 · Milano', category: 'Fornitori', page: 'fornitori' },
  { id: '4', title: 'Materiali Logistica Pro S.r.l.', subtitle: 'FOR-002 · Bergamo', category: 'Fornitori', page: 'fornitori' },
  { id: '5', title: 'Pallet Standard EUR 1200x800', subtitle: 'PLT-EUR-001 · Disponibile', category: 'Prodotti', page: 'prodotti' },
  { id: '6', title: 'Scatola Cartone Ondulato 40x30x30', subtitle: 'SCT-OND-045 · Disponibile', category: 'Prodotti', page: 'prodotti' },
  { id: '7', title: 'PO-2024-001', subtitle: 'In Lavorazione · € 45.000', category: 'Ordini', page: 'acquisti' },
  { id: '8', title: 'SO-2024-123', subtitle: 'Confermato · € 78.500', category: 'Ordini', page: 'vendite' },
  { id: '9', title: 'SHIP-2024-456', subtitle: 'In Transito · BRT Express', category: 'Spedizioni', page: 'logistica' },
  { id: '10', title: 'Magazzino Centrale Milano', subtitle: 'WH-001 · 85% occupato', category: 'Magazzini', page: 'magazzino' },
];

const categoryIcons = {
  Clienti: Users,
  Fornitori: Building2,
  Prodotti: Package,
  Ordini: ShoppingCart,
  Spedizioni: Truck,
  Magazzini: Warehouse,
};

export function GlobalSearch({ onNavigate, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const filtered = mockData.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    if (onNavigate) onNavigate(result.page);
    if (onClose) onClose();
    setQuery('');
    setResults([]);
  };

  const handleClose = () => {
    if (onClose) onClose();
    setQuery('');
    setResults([]);
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
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
            placeholder="Cerca clienti, fornitori, prodotti, ordini..."
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
          {query && results.length === 0 && (
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

          {!query && (
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
