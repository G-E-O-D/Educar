import type { VersionResponse } from '@educar/shared';

let cached: VersionResponse | null = null;

export async function fetchVersion(): Promise<VersionResponse | null> {
  if (cached) return cached;
  try {
    const res = await fetch('/version.json', { cache: 'no-store' });
    if (!res.ok) return null;
    cached = (await res.json()) as VersionResponse;
    return cached;
  } catch {
    return null;
  }
}
