import { useMemo, useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { prodottiApi } from '../../../api/prodottiApi';
import type { ImportProdottiResult } from '../../../types/prodotti';

interface ImportProdottiModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export function ImportProdottiModal({ open, onClose, onImported }: ImportProdottiModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [result, setResult] = useState<ImportProdottiResult | null>(null);

  const totalProcessed = useMemo(() => {
    if (!result) return 0;
    return result.importati + result.saltati + result.errori.length;
  }, [result]);

  const handleClose = () => {
    if (uploading || downloadingTemplate) return;
    setFile(null);
    setResult(null);
    onClose();
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      await prodottiApi.downloadImportTemplate();
    } catch (err: any) {
      toast.error('Download template fallito', { description: err?.message });
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Seleziona un file CSV o XLSX');
      return;
    }

    setUploading(true);
    try {
      const importResult = await prodottiApi.importFile(file);
      setResult(importResult);
      toast.success('Import completato');
      onImported();
    } catch (err: any) {
      toast.error('Import fallito', { description: err?.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2D2D2D]">Importa Prodotti</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[#6B7280]">Carica un file `.csv` o `.xlsx` con i prodotti da importare.</p>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate}
              className="px-3 py-2 bg-white border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              {downloadingTemplate ? 'Scarico...' : 'Scarica Template'}
            </button>
          </div>

          <label className="block border-2 border-dashed border-[#D1D5DB] rounded-2xl p-8 text-center bg-[#FAFBFC] hover:border-[#17E88F] transition-colors cursor-pointer">
            <input
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => {
                setResult(null);
                setFile(e.target.files?.[0] ?? null);
              }}
            />
            <div className="w-14 h-14 rounded-2xl bg-[#F0FDF7] text-[#17E88F] flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[#2D2D2D]">Seleziona file da importare</p>
            <p className="text-xs text-[#6B7280] mt-2">Formati supportati: CSV, XLSX. Max 5MB.</p>
            {file && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E5EAF2] text-sm text-[#374151]">
                <FileSpreadsheet className="w-4 h-4 text-[#17E88F]" />
                {file.name}
              </div>
            )}
          </label>

          {result && (
            <div className="border border-[#E5EAF2] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-[#F7F9FC] border-b border-[#E5EAF2]">
                <div className="text-sm font-semibold text-[#2D2D2D]">Report Import</div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#F0FDF7]">
                    <div className="text-xs text-[#6B7280]">Importati</div>
                    <div className="text-xl font-semibold text-[#16A34A]">{result.importati}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7F9FC]">
                    <div className="text-xs text-[#6B7280]">Saltati</div>
                    <div className="text-xl font-semibold text-[#374151]">{result.saltati}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FEF2F2]">
                    <div className="text-xs text-[#6B7280]">Errori</div>
                    <div className="text-xl font-semibold text-[#DC2626]">{result.errori.length}</div>
                  </div>
                </div>

                <div className="text-xs text-[#6B7280]">
                  Righe elaborate: <span className="font-medium text-[#2D2D2D]">{totalProcessed}</span>
                </div>

                {result.errori.length > 0 && (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {result.errori.map((errore, index) => (
                      <div key={`${errore.riga}-${index}`} className="flex items-start gap-2 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                        <AlertCircle className="w-4 h-4 text-[#DC2626] mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-[#991B1B]">Riga {errore.riga}</div>
                          <div className="text-xs text-[#B91C1C] mt-1">{errore.motivo}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-[#E5EAF2]">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading || downloadingTemplate}
              className="px-4 py-2 border border-[#E5EAF2] text-[#6B7280] rounded-xl hover:bg-[#F7F9FC] transition-all disabled:opacity-60"
            >
              Chiudi
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!file || uploading}
              className="px-4 py-2 bg-gradient-to-r from-[#17E88F] to-[#0FA67A] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Import in corso...' : 'Importa'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
