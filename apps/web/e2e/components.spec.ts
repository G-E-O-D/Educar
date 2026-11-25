import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Catálogo de componentes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
    // Wait for main content to render
    await page.waitForSelector('h1');
  });

  test('tiene encabezado "Catálogo de componentes"', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: /Catálogo de componentes/ })).toBeVisible();
  });

  test('contiene secciones principales', async ({ page }) => {
    for (const section of ['Tipografía', 'Colores', 'Botones', 'Tarjetas', 'Insignias', 'Alertas', 'Formularios', 'Estados']) {
      await expect(page.getByRole('heading', { name: section })).toBeVisible();
    }
  });

  test('el botón destructivo es interactivo con teclado', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Destructivo' });
    await btn.focus();
    await expect(btn).toBeFocused();
  });

  test('el input con error muestra mensaje de error', async ({ page }) => {
    // The Input with error renders a role=alert paragraph
    const errorMsg = page.getByText('Este campo no es válido. Revisá el formato.');
    await expect(errorMsg).toBeVisible();
  });

  test('no hay overflow horizontal a 320px', async ({ page, browserName }) => {
    if (browserName !== 'chromium') test.skip();
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/demo');
    await page.waitForSelector('h1');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });

  test('sin violaciones de accesibilidad (axe A/AA)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });
});
