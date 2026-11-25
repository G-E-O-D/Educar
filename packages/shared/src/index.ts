// Contracts shared between apps/web and apps/api

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  environment: string;
}

export interface VersionResponse {
  version: string;
  buildId: string;
  commit: string;
  builtAt: string;
  environment: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export const APP_VERSION = '0.2.0' as const;
export const APP_NAME = 'Plataforma educativa' as const;
export const APP_SCOPE = 'Educación Primaria PBA' as const;
export const GRADE_RANGE = '1.° a 6.° año' as const;
