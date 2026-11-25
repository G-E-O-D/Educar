#!/usr/bin/env node
/**
 * Genera version.json en apps/web/public/ y actualiza apps/api/src/version-data.ts
 * con metadatos de build reales (versión, commit, timestamp, buildId).
 * Ejecutar una vez por build: npm run build llama a este script.
 */
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf-8'));

let commit = 'unknown-local';
try {
  commit = execSync('git rev-parse --short HEAD', {
    cwd: root,
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 3000,
  }).toString().trim();
} catch {
  // No git repo o sin commits: mantener placeholder
}

const versionData = {
  version: pkg.version,
  buildId: randomUUID(),
  commit,
  builtAt: new Date().toISOString(),
};

// 1. Escribir a apps/web/public/version.json (servido como static asset)
const webOut = path.join(root, 'apps', 'web', 'public', 'version.json');
writeFileSync(webOut, JSON.stringify(versionData, null, 2) + '\n');

// 2. Actualizar apps/api/src/version-data.ts (compilado en el Worker)
const apiOut = path.join(root, 'apps', 'api', 'src', 'version-data.ts');
const apiContent = `// Generado por scripts/gen-version.mjs — no editar manualmente.
export const VERSION_DATA = ${JSON.stringify(versionData, null, 2)} as const;
`;
writeFileSync(apiOut, apiContent);

console.log(`version.json generado: v${versionData.version} (${versionData.commit}) buildId=${versionData.buildId}`);
