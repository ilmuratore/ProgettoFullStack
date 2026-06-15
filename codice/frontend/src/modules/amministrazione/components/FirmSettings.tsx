import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { aziendaSettingsApi } from '../../../api/aziendaSettingsApi';
import {
  AZIENDA_SETTINGS_FIELDS,
  EMPTY_AZIENDA_SETTINGS,
  type AziendaSettingsFieldKey,
  type AziendaSettingsUpdateRequest,
} from '../../../types/aziendaSettings';

export function FirmSettings() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [aziendaSettings, setAziendaSettings] = useState<AziendaSettingsUpdateRequest>(EMPTY_AZIENDA_SETTINGS);
  const [loadingAziendaSettings, setLoadingAziendaSettings] = useState(false);
  const [savingAziendaSettings, setSavingAziendaSettings] = useState(false);

  useEffect(() => {
    const loadAziendaSettings = async () => {
      setLoadingAziendaSettings(true);
      try {
        const data = await aziendaSettingsApi.get();
        setAziendaSettings({
          ragione_sociale: data.ragione_sociale ?? '',
          piva: data.piva ?? '',
          codice_fiscale: data.codice_fiscale ?? '',
          indirizzo: data.indirizzo ?? '',
          citta: data.citta ?? '',
          provincia: data.provincia ?? '',
          cap: data.cap ?? '',
          nazione: data.nazione ?? '',
          email: data.email ?? '',
          pec: data.pec ?? '',
          telefono: data.telefono ?? '',
          sito_web: data.sito_web ?? '',
          iban: data.iban ?? '',
          sdi: data.sdi ?? '',
          logo_url: data.logo_url ?? '',
        });
      } catch (err: any) {
        toast.error('Errore caricamento impostazioni azienda', { description: err?.message });
      } finally {
        setLoadingAziendaSettings(false);
      }
    };

    loadAziendaSettings();
  }, []);

  const handleAziendaSettingsChange = (field: AziendaSettingsFieldKey, value: string) => {
    setAziendaSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAziendaSettings = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current?.reportValidity()) return;
    setSavingAziendaSettings(true);
    try {
      const updated = await aziendaSettingsApi.update(aziendaSettings);
      setAziendaSettings({
        ragione_sociale: updated.ragione_sociale ?? '',
        piva: updated.piva ?? '',
        codice_fiscale: updated.codice_fiscale ?? '',
        indirizzo: updated.indirizzo ?? '',
        citta: updated.citta ?? '',
        provincia: updated.provincia ?? '',
        cap: updated.cap ?? '',
        nazione: updated.nazione ?? '',
        email: updated.email ?? '',
        pec: updated.pec ?? '',
        telefono: updated.telefono ?? '',
        sito_web: updated.sito_web ?? '',
        iban: updated.iban ?? '',
        sdi: updated.sdi ?? '',
        logo_url: updated.logo_url ?? '',
      });
      toast.success('Impostazioni azienda salvate');
    } catch (err: any) {
      toast.error('Errore salvataggio impostazioni azienda', { description: err?.message });
    } finally {
      setSavingAziendaSettings(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSaveAziendaSettings} className="space-y-8 max-w-2xl" noValidate={false}>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-[#17E88F]" />
          <h3 className="text-base font-semibold text-[#2D2D2D]">Dati Aziendali</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AZIENDA_SETTINGS_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">{field.label}</label>
              <input
                type={field.type}
                value={aziendaSettings[field.key] ?? ''}
                onChange={(e) => handleAziendaSettingsChange(field.key, e.target.value)}
                disabled={loadingAziendaSettings || savingAziendaSettings}
                minLength={field.minLength}
                maxLength={field.maxLength}
                pattern={field.pattern}
                inputMode={field.inputMode}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                title={field.title}
                className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl text-sm text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#17E88F] focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loadingAziendaSettings || savingAziendaSettings}
          className="px-5 py-2.5 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {savingAziendaSettings ? 'Salvataggio...' : 'Salva Impostazioni'}
        </button>
      </div>
    </form>
  );
}
