import { InjectionToken } from '@angular/core';
import { environment } from '../environments/environment';

export interface AppRuntimeConfig {
  version: string;
  remote: string;
  isBackend: boolean;
  hostApi: string;
  portApi: string;
  baseURLApi: string;
  companyId: number;
  apiKey: string;
  auth: {
    email: string;
    password: string;
  };
}

const buildRuntimeConfig = (): AppRuntimeConfig => {
  const baseURLApi = (environment as any).apiUrl ?? '';
  const hostApi = baseURLApi;
  const portApi = '';

  return {
    version: '1.2.0',
    remote: 'https://sing-generator-node.flatlogic.com',
    isBackend: environment.backend,
    hostApi,
    portApi,
    baseURLApi,
    companyId: environment.companyId,
    apiKey: environment.appApiKey || '',
    auth: {
      email: 'admin@flatlogic.com',
      password: 'password',
    },
  };
};

export const APP_RUNTIME_CONFIG = new InjectionToken<AppRuntimeConfig>(
  'APP_RUNTIME_CONFIG',
  {
    providedIn: 'root',
    factory: buildRuntimeConfig,
  },
);
