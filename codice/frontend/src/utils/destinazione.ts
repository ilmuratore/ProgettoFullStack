import type { DestinazioneCliente } from '../types/destinazioni';

export const formatDestinazioneLines = (dest: DestinazioneCliente | null): string[] => {
  if (!dest) return [];
  const lines: string[] = [];
  if (dest.etichetta) lines.push(dest.etichetta);
  if (dest.indirizzo) lines.push(dest.indirizzo);
  const cittaLine = [dest.cap, dest.citta].filter(Boolean).join(' ');
  const cittaLineConProvincia = dest.provincia
    ? `${cittaLine}${cittaLine ? ' ' : ''}(${dest.provincia})`
    : cittaLine;
  if (cittaLineConProvincia) lines.push(cittaLineConProvincia);
  if (dest.paese) lines.push(dest.paese);
  return lines;
};

export const formatDestinazioneSnapshot = (dest: DestinazioneCliente | null): string =>
  formatDestinazioneLines(dest).join('\n');
