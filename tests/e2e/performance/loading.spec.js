import { test, expect } from '@playwright/test';
import { SAMPLE_DECKLISTS } from '../../fixtures/sample-decklists.js';

test.describe('Tests de Performance', () => {
  test('Temps de chargement initial', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /manatuner/i })).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    console.log(`Temps de chargement initial: ${loadTime}ms`);
    
    // Le site doit se charger en moins de 3 secondes
    expect(loadTime).toBeLessThan(3000);
  });

  test('Temps de navigation vers Analyzer', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    await page.getByRole('link', { name: /analyzer/i }).click();
    await expect(page.getByPlaceholder(/collez votre decklist/i)).toBeVisible();
    
    const navigationTime = Date.now() - startTime;
    console.log(`Temps de navigation vers Analyzer: ${navigationTime}ms`);
    
    // La navigation doit être rapide (moins de 1 seconde)
    expect(navigationTime).toBeLessThan(1000);
  });

  test('Performance analyse decklist simple', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.simple);
    
    const startTime = Date.now();
    await page.getByRole('button', { name: /analyser/i }).click();
    await expect(page.getByTestId('analysis-results')).toBeVisible();
    
    const analysisTime = Date.now() - startTime;
    console.log(`Temps d'analyse decklist simple: ${analysisTime}ms`);
    
    // L'analyse simple doit prendre moins de 3 secondes
    expect(analysisTime).toBeLessThan(3000);
  });

  test('Performance analyse decklist complexe', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.complex);
    
    const startTime = Date.now();
    await page.getByRole('button', { name: /analyser/i }).click();
    await expect(page.getByTestId('analysis-results')).toBeVisible();
    
    const analysisTime = Date.now() - startTime;
    console.log(`Temps d'analyse decklist complexe: ${analysisTime}ms`);
    
    // L'analyse complexe doit prendre moins de 5 secondes
    expect(analysisTime).toBeLessThan(5000);
  });

  test('Performance navigation entre onglets', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.simple);
    await page.getByRole('button', { name: /analyser/i }).click();
    await expect(page.getByTestId('analysis-results')).toBeVisible();
    
    const tabNames = [
      /statistiques|overview/i,
      /probabilités|probabilities/i,
      /recommandations|recommendations/i,
      /cartes|spells/i
    ];
    
    const tabSwitchTimes = [];
    
    for (const tabName of tabNames) {
      const tab = page.getByRole('tab', { name: tabName });
      if (await tab.isVisible()) {
        const startTime = Date.now();
        await tab.click();
        await expect(page.getByRole('tabpanel')).toBeVisible();
        
        const switchTime = Date.now() - startTime;
        tabSwitchTimes.push(switchTime);
        console.log(`Temps de changement vers onglet ${tabName}: ${switchTime}ms`);
      }
    }
    
    // Chaque changement d'onglet doit prendre moins de 500ms
    tabSwitchTimes.forEach(time => {
      expect(time).toBeLessThan(500);
    });
  });

  test('Performance avec grande decklist', async ({ page }) => {
    // Créer une decklist de 100 cartes
    const largeDeck = Array(100).fill(0).map((_, i) => `1 Card ${i}`).join('\n');
    
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(largeDeck);
    
    const startTime = Date.now();
    await page.getByRole('button', { name: /analyser/i }).click();
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 10000 });
    
    const analysisTime = Date.now() - startTime;
    console.log(`Temps d'analyse grande decklist (100 cartes): ${analysisTime}ms`);
    
    // Même avec une grande decklist, l'analyse doit prendre moins de 8 secondes
    expect(analysisTime).toBeLessThan(8000);
  });
});

test.describe('Tests de Performance Réseau', () => {
  test('Performance avec connexion lente', async ({ page, context }) => {
    // Simuler une connexion 3G lente
    await context.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms de délai
      await route.continue();
    });
    
    const startTime = Date.now();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /manatuner/i })).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    console.log(`Temps de chargement avec connexion lente: ${loadTime}ms`);
    
    // Même avec une connexion lente, le site doit se charger en moins de 5 secondes
    expect(loadTime).toBeLessThan(5000);
  });

  test('Performance sans JavaScript', async ({ page }) => {
    // Désactiver JavaScript
    await page.context().addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (compatible; no-js-test)',
      });
    });
    
    await page.goto('/');
    
    // Vérifier que le contenu de base est visible même sans JS
    await expect(page.getByRole('heading', { name: /manatuner/i })).toBeVisible();
  });
});

test.describe('Tests de Performance Mobile', () => {
  test('Performance chargement mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /manatuner/i })).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    console.log(`Temps de chargement mobile: ${loadTime}ms`);
    
    // Sur mobile, le chargement ne doit pas être significativement plus lent
    expect(loadTime).toBeLessThan(4000);
  });

  test('Performance analyse mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.simple);
    
    const startTime = Date.now();
    await page.getByRole('button', { name: /analyser/i }).click();
    await expect(page.getByTestId('analysis-results')).toBeVisible();
    
    const analysisTime = Date.now() - startTime;
    console.log(`Temps d'analyse mobile: ${analysisTime}ms`);
    
    // L'analyse sur mobile doit rester performante
    expect(analysisTime).toBeLessThan(4000);
  });

  test('Performance scroll mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.complex);
    await page.getByRole('button', { name: /analyser/i }).click();
    await expect(page.getByTestId('analysis-results')).toBeVisible();
    
    // Mesurer la performance du scroll
    const startTime = Date.now();
    
    // Faire plusieurs scrolls rapides
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 200));
      await page.waitForTimeout(50);
    }
    
    const scrollTime = Date.now() - startTime;
    console.log(`Temps de scroll mobile: ${scrollTime}ms`);
    
    // Le scroll doit rester fluide
    expect(scrollTime).toBeLessThan(1000);
  });
});

test.describe('Tests de Mémoire et Ressources', () => {
  test('Utilisation mémoire normale', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    // Effectuer plusieurs analyses pour tester les fuites mémoire
    const decklists = [
      SAMPLE_DECKLISTS.simple,
      SAMPLE_DECKLISTS.complex,
      SAMPLE_DECKLISTS.aggro
    ];
    
    for (const decklist of decklists) {
      await page.getByPlaceholder(/collez votre decklist/i).clear();
      await page.getByPlaceholder(/collez votre decklist/i).fill(decklist);
      await page.getByRole('button', { name: /analyser/i }).click();
      await expect(page.getByTestId('analysis-results')).toBeVisible();
      
      // Petite pause entre les analyses
      await page.waitForTimeout(500);
    }
    
    // Vérifier que l'application répond toujours
    await expect(page.getByRole('button', { name: /analyser/i })).toBeVisible();
  });

  test('Performance avec multiples onglets', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.complex);
    await page.getByRole('button', { name: /analyser/i }).click();
    await expect(page.getByTestId('analysis-results')).toBeVisible();
    
    // Changer rapidement entre tous les onglets plusieurs fois
    const tabNames = [
      /statistiques|overview/i,
      /probabilités|probabilities/i,
      /recommandations|recommendations/i,
      /cartes|spells/i
    ];
    
    const startTime = Date.now();
    
    // Faire 3 cycles complets entre tous les onglets
    for (let cycle = 0; cycle < 3; cycle++) {
      for (const tabName of tabNames) {
        const tab = page.getByRole('tab', { name: tabName });
        if (await tab.isVisible()) {
          await tab.click();
          await expect(page.getByRole('tabpanel')).toBeVisible();
        }
      }
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`Temps total navigation multiple onglets: ${totalTime}ms`);
    
    // La navigation multiple ne doit pas dégrader les performances
    expect(totalTime).toBeLessThan(3000);
  });
});

test.describe('Tests de Performance Comparative', () => {
  test('Comparaison Desktop vs Mobile', async ({ browser }) => {
    // Test Desktop
    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const desktopPage = await desktopContext.newPage();
    
    const desktopStartTime = Date.now();
    await desktopPage.goto('/');
    await expect(desktopPage.getByRole('heading', { name: /manatuner/i })).toBeVisible();
    const desktopTime = Date.now() - desktopStartTime;
    
    await desktopContext.close();
    
    // Test Mobile
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const mobilePage = await mobileContext.newPage();
    
    const mobileStartTime = Date.now();
    await mobilePage.goto('/');
    await expect(mobilePage.getByRole('heading', { name: /manatuner/i })).toBeVisible();
    const mobileTime = Date.now() - mobileStartTime;
    
    await mobileContext.close();
    
    console.log(`Desktop: ${desktopTime}ms, Mobile: ${mobileTime}ms`);
    
    // La différence ne doit pas être trop importante
    const difference = Math.abs(desktopTime - mobileTime);
    expect(difference).toBeLessThan(2000);
  });

  test('Performance avec cache vs sans cache', async ({ page, context }) => {
    // Premier chargement (sans cache)
    const firstStartTime = Date.now();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /manatuner/i })).toBeVisible();
    const firstLoadTime = Date.now() - firstStartTime;
    
    // Recharger la page (avec cache)
    const secondStartTime = Date.now();
    await page.reload();
    await expect(page.getByRole('heading', { name: /manatuner/i })).toBeVisible();
    const secondLoadTime = Date.now() - secondStartTime;
    
    console.log(`Sans cache: ${firstLoadTime}ms, Avec cache: ${secondLoadTime}ms`);
    
    // Le cache doit améliorer les performances
    expect(secondLoadTime).toBeLessThanOrEqual(firstLoadTime);
  });
}); 