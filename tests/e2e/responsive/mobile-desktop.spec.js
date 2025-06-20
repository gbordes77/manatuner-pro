import { test, expect } from '@playwright/test';
import { SAMPLE_DECKLISTS } from '../../fixtures/sample-decklists.js';

const viewports = [
  { name: 'Mobile Portrait', width: 375, height: 667 },
  { name: 'Mobile Landscape', width: 667, height: 375 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Small Desktop', width: 1366, height: 768 },
];

viewports.forEach(viewport => {
  test.describe(`Tests Responsivité ${viewport.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
    });

    test(`Navigation responsive sur ${viewport.name}`, async ({ page }) => {
      // Vérifier que le header est visible
      await expect(page.getByRole('banner')).toBeVisible();
      
      // Sur mobile, vérifier le menu hamburger ou navigation adaptée
      if (viewport.width < 768) {
        // Chercher soit un menu hamburger, soit une navigation mobile
        const mobileMenu = page.locator('[data-testid="mobile-menu-button"], .mobile-menu, [aria-label*="menu"]').first();
        if (await mobileMenu.isVisible()) {
          await mobileMenu.click();
          const mobileNavigation = page.locator('[data-testid="mobile-navigation"], .mobile-nav, .drawer').first();
          await expect(mobileNavigation).toBeVisible();
        }
      } else {
        // Sur desktop/tablet, vérifier la navigation normale
        await expect(page.getByRole('navigation')).toBeVisible();
      }
    });

    test(`Page d'accueil responsive sur ${viewport.name}`, async ({ page }) => {
      // Vérifier que le titre principal est visible
      await expect(page.getByRole('heading', { name: /manatuner/i })).toBeVisible();
      
      // Vérifier que les liens de navigation sont accessibles
      const analyzerLink = page.getByRole('link', { name: /analyzer/i });
      await expect(analyzerLink).toBeVisible();
      
      // Vérifier que le contenu s'adapte à la taille d'écran
      const mainContent = page.getByRole('main');
      await expect(mainContent).toBeVisible();
      
      const box = await mainContent.boundingBox();
      expect(box.width).toBeGreaterThan(0);
      expect(box.width).toBeLessThanOrEqual(viewport.width);
    });

    test(`Formulaire de decklist responsive sur ${viewport.name}`, async ({ page }) => {
      await page.getByRole('link', { name: /analyzer/i }).click();
      
      const textarea = page.getByPlaceholder(/collez votre decklist/i);
      await expect(textarea).toBeVisible();
      
      // Vérifier que le textarea est bien dimensionné
      const box = await textarea.boundingBox();
      expect(box.width).toBeGreaterThan(200);
      expect(box.width).toBeLessThanOrEqual(viewport.width - 40); // Marge de 20px de chaque côté
      
      // Tester la saisie
      await textarea.fill(SAMPLE_DECKLISTS.simple);
      await expect(textarea).toHaveValue(SAMPLE_DECKLISTS.simple);
      
      // Vérifier que le bouton d'analyse est accessible
      const analyzeButton = page.getByRole('button', { name: /analyser/i });
      await expect(analyzeButton).toBeVisible();
      
      // Sur mobile, vérifier que le bouton est bien positionné
      if (viewport.width < 768) {
        const buttonBox = await analyzeButton.boundingBox();
        expect(buttonBox.width).toBeGreaterThan(100); // Bouton assez large pour être cliquable
      }
    });

    test(`Onglets d'analyse responsive sur ${viewport.name}`, async ({ page }) => {
      // Aller à l'analyzer et lancer une analyse
      await page.getByRole('link', { name: /analyzer/i }).click();
      await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.simple);
      await page.getByRole('button', { name: /analyser/i }).click();
      
      // Attendre les résultats
      await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
      
      // Vérifier que les onglets sont accessibles
      const tabs = page.getByRole('tablist');
      await expect(tabs).toBeVisible();
      
      // Sur mobile, les onglets peuvent être en scroll horizontal
      if (viewport.width < 768) {
        // Vérifier que les onglets sont visibles même s'ils défilent
        const firstTab = page.getByRole('tab').first();
        await expect(firstTab).toBeVisible();
      }
      
      // Tester la navigation entre onglets
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
          await expect(page.getByRole('tabpanel')).toBeVisible();
          
          // Vérifier que le contenu du panel s'adapte
          const panel = page.getByRole('tabpanel');
          const panelBox = await panel.boundingBox();
          expect(panelBox.width).toBeLessThanOrEqual(viewport.width);
        }
      }
    });

    test(`Tableaux et graphiques responsive sur ${viewport.name}`, async ({ page }) => {
      // Aller à l'analyzer et lancer une analyse
      await page.getByRole('link', { name: /analyzer/i }).click();
      await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.complex);
      await page.getByRole('button', { name: /analyser/i }).click();
      
      await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
      
      // Aller sur l'onglet avec des tableaux (cartes)
      const spellTab = page.getByRole('tab', { name: /cartes|spells/i });
      if (await spellTab.isVisible()) {
        await spellTab.click();
        
        // Vérifier que les tableaux sont responsifs
        const tables = page.locator('table');
        if (await tables.count() > 0) {
          const table = tables.first();
          const tableBox = await table.boundingBox();
          
          // Sur mobile, les tableaux peuvent avoir un scroll horizontal
          if (viewport.width < 768) {
            // Vérifier qu'il y a soit un container avec scroll, soit que le tableau s'adapte
            const tableContainer = page.locator('table').locator('..').first();
            const containerBox = await tableContainer.boundingBox();
            expect(containerBox.width).toBeLessThanOrEqual(viewport.width + 50); // Petite marge pour le scroll
          }
        }
      }
      
      // Vérifier les graphiques sur l'onglet statistiques
      const statsTab = page.getByRole('tab', { name: /statistiques|overview/i });
      if (await statsTab.isVisible()) {
        await statsTab.click();
        
        const charts = page.locator('[class*="chart"], [data-testid*="chart"], canvas, svg');
        if (await charts.count() > 0) {
          const chart = charts.first();
          const chartBox = await chart.boundingBox();
          expect(chartBox.width).toBeLessThanOrEqual(viewport.width - 20); // Marge pour le padding
        }
      }
    });

    test(`Scroll et navigation tactile sur ${viewport.name}`, async ({ page }) => {
      if (viewport.width < 768) { // Tests spécifiques mobile
        await page.getByRole('link', { name: /analyzer/i }).click();
        
        // Tester le scroll vertical
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        
        // Revenir en haut
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        
        // Vérifier que les éléments restent accessibles après scroll
        const textarea = page.getByPlaceholder(/collez votre decklist/i);
        await expect(textarea).toBeVisible();
      }
    });

    test(`Performance responsive sur ${viewport.name}`, async ({ page }) => {
      const startTime = Date.now();
      
      // Mesurer le temps de chargement
      await page.goto('/');
      await expect(page.getByRole('heading', { name: /manatuner/i })).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Le temps de chargement ne devrait pas être significativement différent selon la taille d'écran
      expect(loadTime).toBeLessThan(5000);
      
      // Vérifier que les images se chargent correctement
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          await expect(img).toHaveAttribute('src', /.+/);
        }
      }
    });
  });
});

// Tests spécifiques pour les transitions entre tailles d'écran
test.describe('Tests de Transitions Responsive', () => {
  test('Transition Desktop vers Mobile', async ({ page }) => {
    // Commencer en desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await page.getByRole('link', { name: /analyzer/i }).click();
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.simple);
    await page.getByRole('button', { name: /analyser/i }).click();
    
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
    
    // Passer en mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Vérifier que l'interface s'adapte
    await expect(page.getByTestId('analysis-results')).toBeVisible();
    
    // Vérifier que les onglets restent fonctionnels
    const tabs = page.getByRole('tab');
    if (await tabs.count() > 0) {
      await tabs.first().click();
      await expect(page.getByRole('tabpanel')).toBeVisible();
    }
  });

  test('Transition Mobile vers Desktop', async ({ page }) => {
    // Commencer en mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Passer en desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    // Vérifier que l'interface s'adapte
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('heading', { name: /manatuner/i })).toBeVisible();
  });
}); 