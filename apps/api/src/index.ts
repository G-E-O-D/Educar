import { VERSION_DATA } from './version-data';
import type { HealthResponse, VersionResponse, ApiError } from '@educar/shared';

type Env = {
  ENVIRONMENT?: string;
};

const SECURE_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function json(data: HealthResponse | VersionResponse | ApiError, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: SECURE_HEADERS });
}

function notFound(pathname: string): Response {
  const body: ApiError = { error: 'NOT_FOUND', message: `Ruta no encontrada: ${pathname}`, statusCode: 404 };
  return json(body, 404);
}

function methodNotAllowed(): Response {
  const body: ApiError = { error: 'METHOD_NOT_ALLOWED', message: 'Método no permitido', statusCode: 405 };
  return json(body, 405);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const environment = env.ENVIRONMENT ?? 'development';

    if (pathname === '/api/health') {
      if (request.method !== 'GET') return methodNotAllowed();
      const body: HealthResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: VERSION_DATA.version,
        environment,
      };
      return json(body);
    }

    if (pathname === '/api/version') {
      if (request.method !== 'GET') return methodNotAllowed();
      const body: VersionResponse = { ...VERSION_DATA, environment };
      return json(body);
    }

    return notFound(pathname);
  },
};
