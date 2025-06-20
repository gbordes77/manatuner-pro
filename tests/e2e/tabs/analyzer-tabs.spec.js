import { test, expect } from '@playwright/test';
import { SAMPLE_DECKLISTS } from '../../fixtures/sample-decklists.js';

test.describe('Tests des 4 Onglets d\'Analyse ManaTuner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Naviguer vers l'analyzer
    await page.getByRole('link', { name: 'Analyzer' }).click();
    await expect(page).toHaveURL(/.*analyzer/);
    
    // Coller une decklist de test
    const decklistTextarea = page.getByPlaceholder(/collez votre decklist/i);
    await expect(decklistTextarea).toBeVisible();
    await decklistTextarea.fill(SAMPLE_DECKLISTS.complex);
    
    // Lancer l'analyse
    await page.getByRole('button', { name: /analyser/i }).click();
    
    // Attendre que l'analyse soit terminée
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
  });

  test('Onglet 1: Statistiques Générales', async ({ page }) => {
    // Cliquer sur l'onglet Statistiques (normalement le premier)
    await page.getByRole('tab', { name: /statistiques|overview/i }).click();
    
    // Vérifier la présence des éléments clés
    await expect(page.getByText(/total.*cartes/i)).toBeVisible();
    await expect(page.getByText(/terrains|lands/i)).toBeVisible();
    await expect(page.getByText(/cmc.*moyen|average.*cmc/i)).toBeVisible();
    await expect(page.getByText(/distribution.*couleurs|color.*distribution/i)).toBeVisible();
    
    // Vérifier les graphiques et visualisations
    const colorDistributionChart = page.locator('[data-testid="color-distribution-chart"], .color-distribution, [class*="chart"]').first();
    await expect(colorDistributionChart).toBeVisible();
    
    // Vérifier que les statistiques sont numériques et cohérentes
    const totalCardsText = await page.getByText(/total.*cartes/i).textContent();
    expect(totalCardsText).toMatch(/\d+/);
  });

  test('Onglet 2: Probabilités de Mana', async ({ page }) => {
    // Cliquer sur l'onglet Probabilités
    await page.getByRole('tab', { name: /probabilités|probabilities/i }).click();
    
    // Vérifier les calculs tour par tour
    for (let turn = 1; turn <= 4; turn++) {
      const turnElement = page.getByText(new RegExp(`tour.*${turn}|turn.*${turn}`, 'i'));
      await expect(turnElement).toBeVisible();
    }
    
    // Vérifier les barres de progression des couleurs
    const probabilityBars = page.locator('[data-testid*="probability"], .probability-bar, [class*="progress"]');
    await expect(probabilityBars.first()).toBeVisible();
    
    // Vérifier que les pourcentages sont affichés
    const percentageText = page.locator('text=/%/');
    await expect(percentageText.first()).toBeVisible();
  });

  test('Onglet 3: Recommandations', async ({ page }) => {
    // Cliquer sur l'onglet Recommandations
    await page.getByRole('tab', { name: /recommandations|recommendations/i }).click();
    
    // Vérifier les suggestions
    await expect(page.getByText(/suggestions|recommandations/i)).toBeVisible();
    await expect(page.getByText(/ratio.*terrains|land.*ratio/i)).toBeVisible();
    
    // Vérifier la note de consistance
    const consistencyRating = page.locator('[data-testid="consistency-rating"], .consistency-score, [class*="rating"]');
    await expect(consistencyRating.first()).toBeVisible();
    
    // Vérifier les recommandations spécifiques
    const recommendations = page.locator('[data-testid*="recommendation"], .recommendation, [class*="suggestion"]');
    await expect(recommendations.first()).toBeVisible();
  });

  test('Onglet 4: Évaluation des Cartes', async ({ page }) => {
    // Cliquer sur l'onglet Cartes/Spell Analysis
    await page.getByRole('tab', { name: /cartes|spells|évaluation/i }).click();
    
    // Vérifier la liste des cartes
    await expect(page.getByText(/lightning bolt/i)).toBeVisible();
    await expect(page.getByText(/counterspell/i)).toBeVisible();
    
    // Vérifier les indicateurs de couleur pour chaque carte
    const cardCastability = page.locator('[data-testid*="castability"], [class*="castability"], [class*="playable"]');
    await expect(cardCastability.first()).toBeVisible();
    
    // Vérifier les copies jouables
    await expect(page.getByText(/copies.*jouables|playable.*copies/i)).toBeVisible();
    
    // Vérifier que chaque carte a une évaluation
    const cardRows = page.locator('[data-testid*="card-row"], .card-row, tr').filter({ hasText: /lightning bolt|counterspell/i });
    await expect(cardRows.first()).toBeVisible();
  });

  test('Navigation entre tous les onglets', async ({ page }) => {
    const tabs = [
      /statistiques|overview/i,
      /probabilités|probabilities/i,
      /recommandations|recommendations/i,
      /cartes|spells|évaluation/i
    ];

    // Tester la navigation dans les deux sens
    for (const tabName of tabs) {
      await page.getByRole('tab', { name: tabName }).click();
      await expect(page.getByRole('tabpanel')).toBeVisible();
      
      // Attendre un court délai pour s'assurer que le contenu se charge
      await page.waitForTimeout(500);
    }

    // Revenir au premier onglet
    await page.getByRole('tab', { name: tabs[0] }).click();
    await expect(page.getByRole('tabpanel')).toBeVisible();
  });

  test('Persistance des données entre les onglets', async ({ page }) => {
    // Aller sur l'onglet Statistiques et noter une valeur
    await page.getByRole('tab', { name: /statistiques|overview/i }).click();
    const totalCardsText = await page.getByText(/total.*cartes/i).textContent();
    
    // Changer d'onglet
    await page.getByRole('tab', { name: /probabilités|probabilities/i }).click();
    await page.waitForTimeout(500);
    
    // Revenir aux statistiques et vérifier que les données sont toujours là
    await page.getByRole('tab', { name: /statistiques|overview/i }).click();
    await expect(page.getByText(totalCardsText)).toBeVisible();
  });
});

test.describe('Tests avec différentes decklists', () => {
  test('Analyse decklist aggro', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Analyzer' }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.aggro);
    await page.getByRole('button', { name: /analyser/i }).click();
    
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
    
    // Vérifier que l'analyse fonctionne pour un deck mono-couleur
    await page.getByRole('tab', { name: /statistiques|overview/i }).click();
    await expect(page.getByText(/total.*cartes/i)).toBeVisible();
  });

  test('Analyse decklist avec terrains spéciaux', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Analyzer' }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.specialLands);
    await page.getByRole('button', { name: /analyser/i }).click();
    
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
    
    // Vérifier que les terrains spéciaux sont correctement analysés
    await page.getByRole('tab', { name: /statistiques|overview/i }).click();
    await expect(page.getByText(/scalding tarn|steam vents/i)).toBeVisible();
  });
}); 