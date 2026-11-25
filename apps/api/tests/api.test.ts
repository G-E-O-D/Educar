import { describe, it, expect } from 'vitest';
import worker from '../src/index';

const env = { ENVIRONMENT: 'test' };
const req = (path: string, method = 'GET') =>
  new Request(`http://localhost${path}`, { method });

describe('GET /api/health', () => {
  it('devuelve 200 con status ok', async () => {
    const res = await worker.fetch(req('/api/health'), env);
    expect(res.status).toBe(200);
    const json = await res.json() as { status: string; timestamp: string; version: string; environment: string };
    expect(json.status).toBe('ok');
    expect(json.version).toBe('0.1.0');
    expect(json.environment).toBe('test');
    expect(new Date(json.timestamp).getTime()).not.toBeNaN();
  });

  it('devuelve 405 para POST', async () => {
    const res = await worker.fetch(req('/api/health', 'POST'), env);
    expect(res.status).toBe(405);
    const json = await res.json() as { error: string };
    expect(json.error).toBe('METHOD_NOT_ALLOWED');
  });

  it('devuelve 405 para DELETE', async () => {
    const res = await worker.fetch(req('/api/health', 'DELETE'), env);
    expect(res.status).toBe(405);
  });
});

describe('GET /api/version', () => {
  it('devuelve 200 con datos de versión', async () => {
    const res = await worker.fetch(req('/api/version'), env);
    expect(res.status).toBe(200);
    const json = await res.json() as { version: string; buildId: string; commit: string; builtAt: string };
    expect(json.version).toBe('0.1.0');
    expect(json.buildId).toBeTruthy();
    expect(json.commit).toBeTruthy();
    expect(json.builtAt).toBeTruthy();
  });

  it('devuelve 405 para PUT', async () => {
    const res = await worker.fetch(req('/api/version', 'PUT'), env);
    expect(res.status).toBe(405);
  });
});

describe('Rutas desconocidas', () => {
  it('devuelve 404 para ruta inexistente', async () => {
    const res = await worker.fetch(req('/api/inexistente'), env);
    expect(res.status).toBe(404);
    const json = await res.json() as { error: string; statusCode: number };
    expect(json.error).toBe('NOT_FOUND');
    expect(json.statusCode).toBe(404);
  });

  it('no expone stack traces en errores', async () => {
    const res = await worker.fetch(req('/api/inexistente'), env);
    const text = await res.text();
    expect(text).not.toMatch(/\bat\b.*\(.*\.ts/);
    expect(text).not.toContain('Error:');
  });
});

describe('Headers de respuesta', () => {
  it('devuelve Content-Type application/json', async () => {
    const res = await worker.fetch(req('/api/health'), env);
    expect(res.headers.get('Content-Type')).toContain('application/json');
  });

  it('devuelve Cache-Control: no-store', async () => {
    const res = await worker.fetch(req('/api/health'), env);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('devuelve X-Content-Type-Options: nosniff', async () => {
    const res = await worker.fetch(req('/api/health'), env);
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});
