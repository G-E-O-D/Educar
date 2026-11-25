import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ── Panel docente ──────────────────────────────────────────────────────────
test.describe('Panel docente (/panel)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/panel');
  });

  test('renderiza el título de página "Panel docente"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /panel docente/i })).toBeVisible();
  });

  test('muestra el aviso de datos ficticios', async ({ page }) => {
    await expect(page.getByRole('note')).toBeVisible();
    await expect(page.getByRole('note')).toContainText('ficticios');
  });

  test('muestra sidebar con navegación', async ({ page }) => {
    // On mobile/tablet the sidebar is closed by default; open it via hamburger
    const hamburger = page.getByRole('button', { name: /abrir menú/i });
    if (await hamburger.isVisible()) await hamburger.click();
    await expect(page.getByRole('navigation', { name: /menú principal/i })).toBeVisible();
  });

  test('navega a /biblioteca desde el sidebar', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: /abrir menú/i });
    if (await hamburger.isVisible()) await hamburger.click();
    await page.getByRole('link', { name: /biblioteca/i }).first().click();
    await expect(page).toHaveURL('/biblioteca');
  });

  test('navega a /actividades desde el sidebar', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: /abrir menú/i });
    if (await hamburger.isVisible()) await hamburger.click();
    await page.getByRole('link', { name: /actividades/i }).first().click();
    await expect(page).toHaveURL('/actividades');
  });

  test('sin violaciones axe A/AA', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });
});

// ── Biblioteca ─────────────────────────────────────────────────────────────
test.describe('Biblioteca inteligente (/biblioteca)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/biblioteca');
  });

  test('renderiza campo de búsqueda', async ({ page }) => {
    await expect(page.getByRole('searchbox')).toBeVisible();
  });

  test('muestra tarjetas de recursos', async ({ page }) => {
    await expect(page.getByRole('listitem').first()).toBeVisible();
  });

  test('filtro por tipo filtra los resultados', async ({ page }) => {
    // Click "Ficha" filter button (exact to avoid matching Download buttons whose aria-label contains "Ficha")
    await page.getByRole('button', { name: 'Ficha', exact: true }).click();
    const items = page.getByRole('listitem');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test('sin violaciones axe A/AA', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });
});

// ── Generador de actividades ───────────────────────────────────────────────
test.describe('Generador de actividades (/actividades)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/actividades');
  });

  test('renderiza el selector de área curricular', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Matemática', exact: true })).toBeVisible();
    // exact: true avoids matching format buttons whose description text contains "Lengua"
    await expect(page.getByRole('button', { name: 'Lengua', exact: true })).toBeVisible();
  });

  test('renderiza el selector de grado', async ({ page }) => {
    await expect(page.getByRole('button', { name: '3.° grado' })).toBeVisible();
  });

  test('renderiza el selector de formato', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Ficha de trabajo' })).toBeVisible();
  });

  test('botón Generar material está presente', async ({ page }) => {
    await expect(page.getByRole('button', { name: /generar material/i })).toBeVisible();
  });

  test('al generar muestra vista previa', async ({ page }) => {
    await page.getByRole('button', { name: /generar material/i }).click();
    // Loading state
    await expect(page.getByRole('status')).toBeVisible();
    // Wait for preview (1.2s simulated delay); longer timeout for slow mobile viewports
    await expect(page.locator('pre').filter({ hasText: /FICHA DE TRABAJO/i })).toBeVisible({ timeout: 10000 });
  });

  test('sin violaciones axe A/AA', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });
});

// ── Portal del alumno ──────────────────────────────────────────────────────
test.describe('Portal del alumno (/alumno)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/alumno');
  });

  test('muestra pantalla de bienvenida con nombre del área', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /hola/i })).toBeVisible();
  });

  test('botón Empezar lleva al ejercicio', async ({ page }) => {
    await page.getByRole('button', { name: /empezar/i }).click();
    await expect(page.getByRole('heading', { level: 2 })).toContainText('equivalente');
  });

  test('sin violaciones axe A/AA en pantalla de bienvenida', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });
});

// ── Seguimiento pedagógico ─────────────────────────────────────────────────
test.describe('Seguimiento pedagógico (/seguimiento)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/seguimiento');
  });

  test('muestra estadísticas de resumen', async ({ page }) => {
    await expect(page.getByLabel('Resumen del seguimiento')).toBeVisible();
  });

  test('tab "Alumnos" muestra lista de alumnos', async ({ page }) => {
    await page.getByRole('tab', { name: /alumnos/i }).click();
    await expect(page.getByRole('button', { name: /agustina/i })).toBeVisible();
  });

  test('tab "Contenidos" muestra cobertura curricular', async ({ page }) => {
    await page.getByRole('tab', { name: /contenidos/i }).click();
    await expect(page.getByRole('button', { name: /matemática/i })).toBeVisible();
  });

  test('sin violaciones axe A/AA', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });
});

// ── Navegación entre prototipo ─────────────────────────────────────────────
test.describe('Navegación del prototipo', () => {
  test('desde la landing se puede llegar a /panel', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /ver el panel docente/i }).click();
    await expect(page).toHaveURL('/panel');
  });

  test('desde /panel se vuelve a / por el logo', async ({ page }) => {
    await page.goto('/panel');
    // Mobile/tablet: use the top-bar "Inicio" link; desktop: use the sidebar "Plataforma" link
    const vw = page.viewportSize()!.width;
    if (vw < 1024) {
      await page.getByRole('link', { name: 'Inicio', exact: true }).click();
    } else {
      await page.getByRole('link', { name: /plataforma/i }).first().click();
    }
    await expect(page).toHaveURL('/');
  });

  test('todas las rutas del prototipo responden sin error 404', async ({ page }) => {
    for (const route of ['/panel', '/biblioteca', '/actividades', '/alumno', '/seguimiento']) {
      await page.goto(route);
      // Should not show NotFound content
      await expect(page.getByText(/página no encontrada/i)).not.toBeVisible();
    }
  });
});
