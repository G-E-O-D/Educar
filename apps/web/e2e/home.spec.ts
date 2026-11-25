import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Página de inicio (Landing)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('tiene el título correcto en la pestaña', async ({ page }) => {
    await expect(page).toHaveTitle(/Plataforma educativa/);
  });

  test('muestra el encabezado principal con "Primaria bonaerense"', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Primaria bonaerense');
  });

  test('muestra sección hero con CTA al panel', async ({ page }) => {
    const ctaLink = page.getByRole('link', { name: /panel docente/i }).first();
    await expect(ctaLink).toBeVisible();
  });

  test('el enlace a /demo es visible', async ({ page }) => {
    const demoLink = page.getByRole('link', { name: /explorar componentes|demostración/i }).first();
    await expect(demoLink).toBeVisible();
  });

  test('navega a /demo', async ({ page }) => {
    // first() avoids strict mode on viewports where both desktop and mobile nav links are in the DOM
    const demoLink = page.getByRole('navigation').getByRole('link', { name: /demostración/i }).first();
    await expect(demoLink).toBeVisible();
    await demoLink.click();
    await expect(page).toHaveURL('/demo');
  });

  test('el logo navega al inicio', async ({ page }) => {
    await page.goto('/demo');
    await page.getByRole('link', { name: /Plataforma educativa|Educar/i }).first().click();
    await expect(page).toHaveURL('/');
  });

  test('no hay overflow horizontal a 320px', async ({ page, browserName }) => {
    if (browserName !== 'chromium') test.skip();
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
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
