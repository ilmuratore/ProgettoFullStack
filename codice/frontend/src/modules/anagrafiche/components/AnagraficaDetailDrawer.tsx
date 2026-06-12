import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { X, Mail, Phone, MapPin, Globe, ExternalLink, Calendar, Building2, User, Edit, FileText, Clock, Truck, Briefcase, IdCard, History, Star } from 'lucide-react';
import { toast } from 'sonner';
import { clientiApi } from '../../../api/clientiApi';
import { fornitoriApi } from '../../../api/fornitoriApi';
import { corrieriApi, dipendentiApi } from '../../../api/corrieriApi';
import { useAuthStore } from '../../../store/authStore';
import type { Cliente, DestinazioneCliente } from '../../../types/clienti';
import type { Fornitore } from '../../../types/fornitori';
import type { Corriere, Dipendente } from '../../../types/corrieri';

type EntityType = 'cliente' | 'fornitore' | 'corriere' | 'dipendente';
type EntityItem = Cliente | Fornitore | Corriere | Dipendente;

interface AnagraficaDetailDrawerProps {
  entityType: EntityType;
  entityId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: EntityItem) => void;
}

const PERM_ENTITY: Record<EntityType, string> = {
  cliente: 'clienti',
  fornitore: 'fornitori',
  corriere: 'corrieri',
  dipendente: 'dipendenti',
};

const TITOLI: Record<EntityType, string> = {
  cliente: 'Dettaglio Cliente',
  fornitore: 'Dettaglio Fornitore',
  corriere: 'Dettaglio Corriere',
  dipendente: 'Dettaglio Dipendente',
};

const formatData = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const formatDataBreve = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const getBadgeAttivo = (attivo: boolean) =>
  attivo ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]';

const formatDestinazione = (dest: DestinazioneCliente): string =>
  [dest.indirizzo, dest.cap, dest.citta, dest.provincia, dest.paese].filter(Boolean).join(', ') || '—';

const getNomeVisualizzato = (entityType: EntityType, item: EntityItem): string => {
  switch (entityType) {
    case 'cliente':
    case 'fornitore':
      return (item as Cliente | Fornitore).ragione_sociale;
    case 'corriere':
      return (item as Corriere).nome;
    case 'dipendente': {
      const d = item as Dipendente;
      return `${d.nome} ${d.cognome}`;
    }
  }
};

export function AnagraficaDetailDrawer({ entityType, entityId, isOpen, onClose, onEdit }: AnagraficaDetailDrawerProps) {
  const { hasPermesso } = useAuthStore();
  const navigate = useNavigate();
  const [item, setItem] = useState<EntityItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [destinazioni, setDestinazioni] = useState<DestinazioneCliente[]>([]);

  useEffect(() => {
    if (!isOpen || entityId === null) {
      return;
    }
    setLoading(true);
    setDestinazioni([]);
    const request =
      entityType === 'cliente' ? clientiApi.getById(entityId)
      : entityType === 'fornitore' ? fornitoriApi.getById(entityId)
      : entityType === 'corriere' ? corrieriApi.getById(entityId)
      : dipendentiApi.getById(entityId);
    request
      .then(setItem)
      .catch((err: any) => toast.error('Errore caricamento dettaglio', { description: err?.message }))
      .finally(() => setLoading(false));

    if (entityType === 'cliente') {
      clientiApi.listDestinazioni(entityId)
        .then(setDestinazioni)
        .catch((err: any) => toast.error('Errore caricamento destinazioni', { description: err?.message }));
    }
  }, [isOpen, entityId, entityType]);

  if (entityId === null) return null;

  const canWrite = hasPermesso(`${PERM_ENTITY[entityType]}:write`);
  const titolo = TITOLI[entityType];
  const fornitore = entityType === 'fornitore' ? (item as Fornitore | null) : null;
  const cliente = entityType === 'cliente' ? (item as Cliente | null) : null;
  const corriere = entityType === 'corriere' ? (item as Corriere | null) : null;
  const dipendente = entityType === 'dipendente' ? (item as Dipendente | null) : null;
  const isEcosystem = (cliente ?? fornitore)?.source === 'ecosystem';

  const handleViewHistory = () => {
    if (fornitore) navigate(`/acquisti?fornitore=${encodeURIComponent(fornitore.ragione_sociale)}`);
    else if (cliente) navigate(`/vendite?cliente=${encodeURIComponent(cliente.ragione_sociale)}`);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5EAF2] p-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#2D2D2D]">{titolo}</h2>
            <p className="text-sm text-[#6B7280] mt-1">{item ? getNomeVisualizzato(entityType, item) : '...'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F7F9FC] rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        {loading || !item ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-[#F7F9FC] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Informazioni Generali */}
            <div className="bg-[#F7F9FC] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#2D2D2D]">Informazioni Generali</h3>
                {(cliente || fornitore || corriere) && (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getBadgeAttivo((cliente ?? fornitore ?? corriere)!.attivo)}`}>
                    {(cliente ?? fornitore ?? corriere)!.attivo ? 'Attivo' : 'Disattivo'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-xs text-[#9CA3AF] mb-1">{dipendente ? 'Nominativo' : 'Ragione Sociale'}</p>
                  <div className="flex items-center gap-2">
                    {entityType === 'cliente' && <User className="w-4 h-4 text-[#6B7280]" />}
                    {entityType === 'fornitore' && <Building2 className="w-4 h-4 text-[#6B7280]" />}
                    {entityType === 'corriere' && <Truck className="w-4 h-4 text-[#6B7280]" />}
                    {entityType === 'dipendente' && <User className="w-4 h-4 text-[#6B7280]" />}
                    <p className="text-sm font-medium text-[#2D2D2D]">{getNomeVisualizzato(entityType, item)}</p>
                  </div>
                </div>

                {(cliente || fornitore) && (
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">P. IVA / CF</p>
                    <p className="text-sm font-mono text-[#2D2D2D]">
                      {(cliente?.piva_cf ?? fornitore?.piva) ?? '—'}
                    </p>
                  </div>
                )}

                {(cliente || fornitore) && (
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Sorgente</p>
                    {isEcosystem
                      ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#6366F1]"><Globe className="w-3 h-3" /> Ecosistema</span>
                      : <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F3F4F6] text-[#6B7280]">Manuale</span>}
                  </div>
                )}

                {corriere && (
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Codice</p>
                    <p className="text-sm font-mono font-semibold text-[#2D2D2D]">{corriere.codice}</p>
                  </div>
                )}

                {dipendente && (
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Codice Fiscale</p>
                    <p className="text-sm font-mono text-[#2D2D2D]">{dipendente.codice_fiscale}</p>
                  </div>
                )}

                {dipendente && (
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Ruolo Operativo</p>
                    {dipendente.ruolo_operativo
                      ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F0FDF7] text-[#0FA67A]"><Briefcase className="w-3 h-3" />{dipendente.ruolo_operativo}</span>
                      : <span className="text-sm italic text-[#9CA3AF]">—</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Contatti */}
            {(cliente || fornitore || corriere) && (
              <div className="bg-white border border-[#E5EAF2] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-[#2D2D2D] mb-4">Contatti</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span className="text-sm text-[#2D2D2D]">{(cliente ?? fornitore ?? corriere)!.email ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span className="text-sm text-[#2D2D2D]">{(cliente ?? fornitore ?? corriere)!.telefono ?? '—'}</span>
                  </div>
                  {fornitore && (
                    <>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#6B7280]" />
                        <span className="text-sm text-[#2D2D2D]">{fornitore.indirizzo ?? '—'}</span>
                      </div>
                      {fornitore.sito_web && (
                        <a href={fornitore.sito_web} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#17E88F] hover:underline">
                          <ExternalLink className="w-3.5 h-3.5" />
                          {fornitore.sito_web.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Destinazioni di consegna */}
            {cliente && destinazioni.length > 0 && (
              <div className="bg-white border border-[#E5EAF2] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-[#2D2D2D] mb-4">Indirizzi di Consegna</h3>
                <div className="space-y-2">
                  {destinazioni.map((dest) => (
                    <div key={dest.id} className="flex items-start justify-between gap-3 px-4 py-3 bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl">
                      <div className="flex items-start gap-2 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#6B7280] flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          {dest.etichetta && <p className="text-sm font-medium text-[#2D2D2D]">{dest.etichetta}</p>}
                          <p className="text-sm text-[#6B7280]">{formatDestinazione(dest)}</p>
                        </div>
                      </div>
                      {dest.predefinita && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F0FDF7] text-[#0FA67A] flex-shrink-0">
                          <Star className="w-3 h-3 fill-current" /> Predefinito
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dettagli Fornitore */}
            {fornitore && (fornitore.lead_time_giorni !== null || fornitore.descrizione_aziendale) && (
              <div className="bg-white border border-[#E5EAF2] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-sm font-semibold text-[#2D2D2D]">Dettagli Fornitura</h3>
                </div>
                <div className="space-y-3">
                  {fornitore.lead_time_giorni !== null && (
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-1">Lead Time</p>
                      <p className="text-sm text-[#2D2D2D]">{fornitore.lead_time_giorni} giorni</p>
                    </div>
                  )}
                  {fornitore.descrizione_aziendale && (
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-1">Descrizione</p>
                      <p className="text-sm text-[#2D2D2D]">{fornitore.descrizione_aziendale}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dati Impiego (dipendente) */}
            {dipendente && (
              <div className="bg-white border border-[#E5EAF2] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <IdCard className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-sm font-semibold text-[#2D2D2D]">Dati Impiego</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Data Assunzione</p>
                    <div className="flex items-center gap-2 text-sm text-[#2D2D2D]">
                      <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                      {formatDataBreve(dipendente.data_assunzione)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Account Utente</p>
                    <p className="text-sm text-[#2D2D2D]">{dipendente.utente_id ? `Collegato (#${dipendente.utente_id})` : 'Non collegato'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Date */}
            <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] border border-[#BFDBFE] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-[#3B82F6]" />
                <h3 className="text-sm font-semibold text-[#2D2D2D]">Cronologia</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Creato il</p>
                  <p className="text-sm font-medium text-[#2D2D2D]">{formatData(item.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Ultima modifica</p>
                  <p className="text-sm font-medium text-[#2D2D2D]">{formatData(item.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Azioni */}
            {((cliente || fornitore) || (canWrite && onEdit && !isEcosystem)) && (
              <div className="flex justify-end gap-3 pt-2">
                {(cliente || fornitore) && (
                  <button
                    onClick={handleViewHistory}
                    className="px-4 py-2 bg-white border border-[#E5EAF2] text-[#2D2D2D] rounded-xl hover:bg-[#F7F9FC] transition-all flex items-center gap-2 font-medium"
                  >
                    <History className="w-4 h-4" /> Visualizza Storico
                  </button>
                )}
                {canWrite && onEdit && !isEcosystem && (
                  <button
                    onClick={() => onEdit(item)}
                    className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                  >
                    <Edit className="w-4 h-4" /> Modifica
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
