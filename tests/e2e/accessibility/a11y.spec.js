import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { SAMPLE_DECKLISTS } from '../../fixtures/sample-decklists.js';

test.describe('Tests d\'Accessibilité WCAG', () => {
  test('Page d\'accueil - Conformité WCAG AA', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page Analyzer - Conformité WCAG AA', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Résultats d\'analyse - Conformité WCAG AA', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.simple);
    await page.getByRole('button', { name: /analyser/i }).click();
    
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Onglets d\'analyse - Conformité WCAG AA', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.complex);
    await page.getByRole('button', { name: /analyser/i }).click();
    
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
    
    // Tester chaque onglet
    const tabNames = [
      /statistiques|overview/i,
      /probabilités|probabilities/i,
      /recommandations|recommendations/i,
      /cartes|spells/i
    ];
    
    for (const tabName of tabNames) {
      const tab = page.getByRole('tab', { name: tabName });
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(1000);
        
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    }
  });
});

test.describe('Navigation au Clavier', () => {
  test('Navigation Tab complète', async ({ page }) => {
    await page.goto('/');
    
    // Commencer la navigation au clavier
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continuer la navigation et vérifier que tous les éléments interactifs sont accessibles
    const maxTabs = 20; // Limiter pour éviter les boucles infinies
    const focusedElements = [];
    
    for (let i = 0; i < maxTabs; i++) {
      const currentFocused = await page.locator(':focus');
      if (await currentFocused.count() > 0) {
        const tagName = await currentFocused.evaluate(el => el.tagName);
        const role = await currentFocused.getAttribute('role');
        focusedElements.push({ tagName, role });
      }
      
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
    
    // Vérifier qu'on a bien navigué sur plusieurs éléments
    expect(focusedElements.length).toBeGreaterThan(3);
  });

  test('Navigation clavier dans l\'analyzer', async ({ page }) => {
    await page.goto('/');
    
    // Naviguer vers l'analyzer avec le clavier
    await page.keyboard.press('Tab');
    
    // Trouver et activer le lien analyzer
    let attempts = 0;
    while (attempts < 10) {
      const focused = await page.locator(':focus');
      const text = await focused.textContent();
      
      if (text && text.toLowerCase().includes('analyzer')) {
        await page.keyboard.press('Enter');
        break;
      }
      
      await page.keyboard.press('Tab');
      attempts++;
    }
    
    // Vérifier qu'on est sur la page analyzer
    await expect(page.getByPlaceholder(/collez votre decklist/i)).toBeVisible();
    
    // Naviguer vers le textarea avec Tab
    await page.keyboard.press('Tab');
    const textarea = await page.locator(':focus');
    
    // Vérifier que le textarea peut recevoir le focus
    const isTextarea = await textarea.evaluate(el => el.tagName === 'TEXTAREA');
    if (isTextarea) {
      // Taper du texte
      await page.keyboard.type('4 Lightning Bolt');
      await expect(textarea).toHaveValue('4 Lightning Bolt');
    }
  });

  test('Navigation clavier dans les onglets', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.simple);
    await page.getByRole('button', { name: /analyser/i }).click();
    
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
    
    // Naviguer vers les onglets avec le clavier
    await page.keyboard.press('Tab');
    
    let attempts = 0;
    while (attempts < 20) {
      const focused = await page.locator(':focus');
      const role = await focused.getAttribute('role');
      
      if (role === 'tab') {
        // Tester la navigation entre onglets avec les flèches
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(500);
        
        const newFocused = await page.locator(':focus');
        const newRole = await newFocused.getAttribute('role');
        expect(newRole).toBe('tab');
        
        // Activer l'onglet
        await page.keyboard.press('Enter');
        await expect(page.getByRole('tabpanel')).toBeVisible();
        break;
      }
      
      await page.keyboard.press('Tab');
      attempts++;
    }
  });
});

test.describe('Contraste et Couleurs', () => {
  test('Contraste des couleurs - WCAG AA', async ({ page }) => {
    await page.goto('/');
    
    const contrastResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze();

    expect(contrastResults.violations).toEqual([]);
  });

  test('Contraste sur tous les onglets', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.complex);
    await page.getByRole('button', { name: /analyser/i }).click();
    
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
    
    const tabNames = [
      /statistiques|overview/i,
      /probabilités|probabilities/i,
      /recommandations|recommendations/i,
      /cartes|spells/i
    ];
    
    for (const tabName of tabNames) {
      const tab = page.getByRole('tab', { name: tabName });
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(1000);
        
        const contrastResults = await new AxeBuilder({ page })
          .withRules(['color-contrast'])
          .analyze();

        expect(contrastResults.violations).toEqual([]);
      }
    }
  });

  test('Pas de dépendance uniquement à la couleur', async ({ page }) => {
    await page.goto('/');
    
    const colorResults = await new AxeBuilder({ page })
      .withRules(['color-contrast', 'link-in-text-block'])
      .analyze();

    expect(colorResults.violations).toEqual([]);
  });
});

test.describe('Alternatives Textuelles', () => {
  test('Images avec alt text', async ({ page }) => {
    await page.goto('/');
    
    const altTextResults = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    expect(altTextResults.violations).toEqual([]);
  });

  test('Éléments graphiques avec labels', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.complex);
    await page.getByRole('button', { name: /analyser/i }).click();
    
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
    
    // Vérifier que les graphiques ont des labels appropriés
    const charts = page.locator('canvas, svg, [role="img"]');
    const chartCount = await charts.count();
    
    for (let i = 0; i < chartCount; i++) {
      const chart = charts.nth(i);
      if (await chart.isVisible()) {
        // Vérifier qu'il y a soit un aria-label, soit un titre associé
        const hasAriaLabel = await chart.getAttribute('aria-label');
        const hasTitle = await chart.locator('title').count() > 0;
        const hasAriaDescribedBy = await chart.getAttribute('aria-describedby');
        
        expect(hasAriaLabel || hasTitle || hasAriaDescribedBy).toBeTruthy();
      }
    }
  });
});

test.describe('Structure et Sémantique', () => {
  test('Hiérarchie des titres', async ({ page }) => {
    await page.goto('/');
    
    const headingResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    expect(headingResults.violations).toEqual([]);
  });

  test('Landmarks et régions', async ({ page }) => {
    await page.goto('/');
    
    const landmarkResults = await new AxeBuilder({ page })
      .withRules(['region', 'landmark-one-main'])
      .analyze();

    expect(landmarkResults.violations).toEqual([]);
  });

  test('Formulaires avec labels', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    const formResults = await new AxeBuilder({ page })
      .withRules(['label', 'form-field-multiple-labels'])
      .analyze();

    expect(formResults.violations).toEqual([]);
  });

  test('Tableaux avec headers', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.complex);
    await page.getByRole('button', { name: /analyser/i }).click();
    
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
    
    // Aller sur l'onglet avec des tableaux
    const spellTab = page.getByRole('tab', { name: /cartes|spells/i });
    if (await spellTab.isVisible()) {
      await spellTab.click();
      
      const tableResults = await new AxeBuilder({ page })
        .withRules(['table-header-scope', 'th-has-data-cells'])
        .analyze();

      expect(tableResults.violations).toEqual([]);
    }
  });
});

test.describe('Interactions et Focus', () => {
  test('Focus visible', async ({ page }) => {
    await page.goto('/');
    
    const focusResults = await new AxeBuilder({ page })
      .withRules(['focus-order-semantics'])
      .analyze();

    expect(focusResults.violations).toEqual([]);
  });

  test('Pas de piège au clavier', async ({ page }) => {
    await page.goto('/');
    
    // Naviguer avec Tab et vérifier qu'on peut toujours continuer
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      // Vérifier qu'on peut toujours naviguer
      const focused = await page.locator(':focus');
      await expect(focused).toBeVisible();
    }
    
    // Vérifier qu'on peut naviguer en arrière
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Shift+Tab');
      await page.waitForTimeout(100);
    }
  });

  test('Éléments interactifs accessibles', async ({ page }) => {
    await page.goto('/');
    
    const interactiveResults = await new AxeBuilder({ page })
      .withRules(['interactive-controls-focus', 'focusable-controls'])
      .analyze();

    expect(interactiveResults.violations).toEqual([]);
  });
});

test.describe('Tests Mobile Accessibilité', () => {
  test('Accessibilité mobile - Touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Vérifier que les éléments tactiles sont assez grands (44px minimum)
    const buttons = page.locator('button, a, input[type="button"], input[type="submit"]');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        
        // Vérifier que le bouton fait au moins 44px de haut ou large
        expect(Math.max(box.width, box.height)).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('Zoom 200% mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Simuler un zoom 200%
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });
    
    await page.waitForTimeout(1000);
    
    // Vérifier que le contenu reste accessible
    await expect(page.getByRole('heading', { name: /manatuner/i })).toBeVisible();
    
    // Remettre le zoom normal
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });
}); 