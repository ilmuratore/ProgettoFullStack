import { useEffect, useState } from 'react';
import { X, Package, Tag, Scale, Ruler, Euro, Calendar, FileText } from 'lucide-react';
import { prodottiApi } from '../../../api/prodottiApi';
import type { Prodotto } from '../../../types/prodotti';

interface ProductDetailDrawerProps {
  productId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatPrezzo = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const getBadge = (attivo: boolean) =>
  attivo
    ? { bg: 'bg-[#DCFCE7]', text: 'text-[#22C55E]', label: 'Attivo' }
    : { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Disattivo' };

const getValue = (value: string | number | null | undefined, fallback = '—') =>
  value === null || value === undefined || value === '' ? fallback : String(value);

export function ProductDetailDrawer({ productId, isOpen, onClose }: ProductDetailDrawerProps) {
  const [product, setProduct] = useState<Prodotto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || productId === null) return;

    let ignore = false;

    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      setProduct(null);

      try {
        const data = await prodottiApi.getById(productId);
        if (!ignore) setProduct(data);
      } catch (err: any) {
        if (!ignore) {
          setProduct(null);
          setError(err?.message ?? 'Errore caricamento dettaglio prodotto');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void loadProduct();

    return () => {
      ignore = true;
    };
  }, [isOpen, productId]);

  if (!isOpen || productId === null) return null;

  const badge = product ? getBadge(product.attivo) : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-white border-b border-[#E5EAF2] p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-[#2D2D2D] font-mono">
                  {product ? product.sku : 'Dettaglio prodotto'}
                </h2>
                {badge && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                )}
              </div>
              <p className="text-sm text-[#6B7280]">
                {product ? product.nome : 'Caricamento dettaglio prodotto'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-[#F7F9FC] rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="space-y-4">
              <div className="bg-[#F7F9FC] rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-[#E5EAF2] rounded w-1/3 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 bg-white rounded-xl border border-[#E5EAF2]" />
                  ))}
                </div>
              </div>
              <div className="bg-[#F7F9FC] rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-[#E5EAF2] rounded w-1/4 mb-4" />
                <div className="h-24 bg-white rounded-xl border border-[#E5EAF2]" />
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-2xl p-6">
              <p className="text-sm font-medium text-[#B91C1C]">Errore caricamento prodotto</p>
              <p className="text-sm text-[#7F1D1D] mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && product && (
            <>
              <div className="bg-[#F7F9FC] rounded-2xl p-6">
                <h3 className="font-semibold text-[#2D2D2D] mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#17E88F]" />
                  Informazioni Generali
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                      <Package className="w-3 h-3" />
                      Nome prodotto
                    </div>
                    <div className="text-sm font-medium text-[#2D2D2D]">{product.nome}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                      <Tag className="w-3 h-3" />
                      Categoria
                    </div>
                    <div className="text-sm font-medium text-[#2D2D2D]">{getValue(product.categoria_nome)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                      <Ruler className="w-3 h-3" />
                      Unita di misura
                    </div>
                    <div className="text-sm font-medium text-[#2D2D2D]">{getValue(product.unita_misura)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                      <Scale className="w-3 h-3" />
                      Peso
                    </div>
                    <div className="text-sm font-medium text-[#2D2D2D]">
                      {product.peso_kg !== null ? `${product.peso_kg} kg` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                      <Tag className="w-3 h-3" />
                      Scorta minima
                    </div>
                    <div className="text-sm font-medium text-[#2D2D2D]">{product.scorta_minima}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                      <Euro className="w-3 h-3" />
                      Prezzo
                    </div>
                    <div className="text-sm font-medium text-[#2D2D2D]">{formatPrezzo(product.prezzo)}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E5EAF2] rounded-2xl p-6">
                <h3 className="font-semibold text-[#2D2D2D] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#17E88F]" />
                  Descrizione
                </h3>
                <p className="text-sm text-[#2D2D2D] leading-6">
                  {getValue(product.descrizione, 'Nessuna descrizione disponibile')}
                </p>
              </div>

              <div className="bg-white border border-[#E5EAF2] rounded-2xl p-6">
                <h3 className="font-semibold text-[#2D2D2D] mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#17E88F]" />
                  Tracciabilita
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#F7F9FC] rounded-xl p-4">
                    <p className="text-xs text-[#6B7280] mb-1">Data creazione</p>
                    <p className="text-sm font-medium text-[#2D2D2D]">{formatDateTime(product.created_at)}</p>
                  </div>
                  <div className="bg-[#F7F9FC] rounded-xl p-4">
                    <p className="text-xs text-[#6B7280] mb-1">Ultimo aggiornamento</p>
                    <p className="text-sm font-medium text-[#2D2D2D]">{formatDateTime(product.updated_at)}</p>
                  </div>
                  <div className="bg-[#F7F9FC] rounded-xl p-4">
                    <p className="text-xs text-[#6B7280] mb-1">Aggiornamento prezzo</p>
                    <p className="text-sm font-medium text-[#2D2D2D]">{formatDateTime(product.data_agg_prezzo)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
