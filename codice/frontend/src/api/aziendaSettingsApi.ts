import { api } from './client';
import type { AziendaSettings, AziendaSettingsUpdateRequest } from '../types/aziendaSettings';

export const aziendaSettingsApi = {
  get: (): Promise<AziendaSettings> =>
    api.get<AziendaSettings>('/azienda-settings'),

  update: (body: AziendaSettingsUpdateRequest): Promise<AziendaSettings> =>
    api.patch<AziendaSettings>('/azienda-settings', body),
};
