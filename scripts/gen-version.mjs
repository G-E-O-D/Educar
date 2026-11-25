#!/usr/bin/env node
/**
 * Genera version.json en apps/web/public/ y apps/api/src/version-data.ts
 * con metadatos de build reales (versión, commit, buildId, isDirty).
 *
 * Estrategia:
 *   - Ambos archivos son artefactos generados; están en .gitignore para evitar
 *     ciclos de commits: gen-version escribe → archivos modificados → commit →
 *     HEAD cambia → artefacto desincronizado.
 *   - Ejecutar UNA VEZ por build, DESPUÉS del último commit de la etapa.
 *   - CI ejecuta este script antes de typecheck y tests.
 *   - `commit` = HEAD actual; `isDirty` = ¿hay cambios sin confirmar?
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
let isDirty = false;

try {
  commit = execSync('git rev-parse --short HEAD', {
    cwd: root,
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 3000,
  }).toString().trim();
} catch {
  // Sin repo git o sin commits — se mantiene 'unknown-local'
}

try {
  const status = execSync('git status --porcelain', {
    cwd: root,
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 3000,
  }).toString().trim();
  isDirty = status.length > 0;
} catch {
  // No se puede determinar el estado del árbol
}

const versionData = {
  version: pkg.version,
  buildId: randomUUID(),
  commit: isDirty ? `${commit}-dirty` : commit,
  builtAt: new Date().toISOString(),
  isDirty,
};

// 1. apps/web/public/version.json (servido como static asset, Cache-Control: no-store)
const webOut = path.join(root, 'apps', 'web', 'public', 'version.json');
writeFileSync(webOut, JSON.stringify(versionData, null, 2) + '\n');

// 2. apps/api/src/version-data.ts (compilado en el Worker)
const apiOut = path.join(root, 'apps', 'api', 'src', 'version-data.ts');
const apiContent = `// Generado por scripts/gen-version.mjs — no editar manualmente.
export const VERSION_DATA = ${JSON.stringify(versionData, null, 2)} as const;
`;
writeFileSync(apiOut, apiContent);

const dirtyFlag = isDirty ? ' ⚠ árbol de trabajo con cambios sin confirmar' : '';
console.log(`version generada: v${versionData.version} (${versionData.commit}) buildId=${versionData.buildId}${dirtyFlag}`);
