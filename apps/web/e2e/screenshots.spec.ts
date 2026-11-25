/**
 * Captura de pantalla de todas las rutas del prototipo.
 * Siempre activo (no solo en fallo). Guarda en docs/evidence/visual/.
 */
import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTES = [
  { path: '/',            slug: 'landing' },
  { path: '/panel',       slug: 'panel' },
  { path: '/biblioteca',  slug: 'biblioteca' },
  { path: '/actividades', slug: 'actividades' },
  { path: '/alumno',      slug: 'alumno' },
  { path: '/seguimiento', slug: 'seguimiento' },
];

const OUTPUT_DIR = path.resolve(__dirname, '../../../docs/evidence/visual');

for (const route of ROUTES) {
  test(`screenshot ${route.slug}`, async ({ page, browserName }, testInfo) => {
    const viewport = testInfo.project.name;
    await page.goto(route.path);
    // Allow fonts and images to settle
    await page.waitForLoadState('networkidle');
    const filename = `${route.slug}-${viewport}.png`;
    await page.screenshot({
      path: path.join(OUTPUT_DIR, filename),
      fullPage: true,
    });
  });
}
