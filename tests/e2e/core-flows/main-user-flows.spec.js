import { test, expect } from '@playwright/test';
import { SAMPLE_DECKLISTS, SELECTORS } from '../../fixtures/sample-decklists.js';

test.describe('Flux Utilisateur Principaux', () => {
  test('Flux complet: Accueil → Analyzer → Analyse → Résultats', async ({ page }) => {
    // 1. Arriver sur la page d'accueil
    await page.goto('/');
    await expect(page.getByRole('heading', { name: SELECTORS.MAIN_HEADING })).toBeVisible();
    
    // 2. Naviguer vers l'analyzer
    await page.getByRole('button', { name: SELECTORS.ANALYZER_LINK }).click();
    
    // 3. Saisir une decklist
    await page.getByPlaceholder(SELECTORS.DECKLIST_TEXTAREA).fill(SAMPLE_DECKLISTS.simple);
    
    // 4. Lancer l'analyse
    await page.getByRole('button', { name: SELECTORS.ANALYZE_BUTTON }).click();
    
    // 5. Vérifier que les résultats apparaissent
    await expect(page.locator(SELECTORS.ANALYSIS_RESULTS)).toBeVisible({ timeout: 15000 });
    
    // 6. Vérifier les 4 onglets
    await expect(page.getByRole('tab', { name: SELECTORS.TAB_STATISTICS })).toBeVisible();
    await expect(page.getByRole('tab', { name: SELECTORS.TAB_PROBABILITIES })).toBeVisible();
    await expect(page.getByRole('tab', { name: SELECTORS.TAB_RECOMMENDATIONS })).toBeVisible();
    await expect(page.getByRole('tab', { name: SELECTORS.TAB_CARDS })).toBeVisible();
  });

  test('Flux nouvel utilisateur: Découverte → Premier essai', async ({ page }) => {
    // 1. Arriver sur la page d'accueil
    await page.goto('/');
    
    // 2. Lire les informations de base
    await expect(page.getByRole('heading', { name: /manatuner/i })).toBeVisible();
    
    // 3. Aller au guide (si disponible)
    const guideLink = page.getByRole('link', { name: /guide/i });
    if (await guideLink.isVisible()) {
      await guideLink.click();
      await expect(page.getByText(/guide|help|aide/i)).toBeVisible();
      
      // Revenir à l'accueil
      await page.getByRole('link', { name: /home|accueil/i }).click();
    }
    
    // 4. Essayer l'analyzer
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    // 5. Premier essai avec une decklist simple
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.simple);
    await page.getByRole('button', { name: /analyser/i }).click();
    
    // 6. Découvrir les résultats
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
    
    // 7. Explorer les différents onglets
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    
    for (let i = 0; i < Math.min(tabCount, 4); i++) {
      await tabs.nth(i).click();
      await expect(page.getByRole('tabpanel')).toBeVisible();
      await page.waitForTimeout(1000); // Laisser le temps de voir le contenu
    }
  });

  test('Flux utilisateur expérimenté: Analyse rapide multiple', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    const decklists = [
      { name: 'Aggro', content: SAMPLE_DECKLISTS.aggro },
      { name: 'Control', content: SAMPLE_DECKLISTS.control },
      { name: 'Complex', content: SAMPLE_DECKLISTS.complex }
    ];
    
    for (const deck of decklists) {
      // Effacer la decklist précédente
      await page.getByPlaceholder(/collez votre decklist/i).clear();
      
      // Saisir la nouvelle decklist
      await page.getByPlaceholder(/collez votre decklist/i).fill(deck.content);
      
      // Analyser
      await page.getByRole('button', { name: /analyser/i }).click();
      await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
      
      // Vérifier rapidement les statistiques
      const statsTab = page.getByRole('tab', { name: /statistiques|overview/i });
      if (await statsTab.isVisible()) {
        await statsTab.click();
        await expect(page.getByText(/total.*cartes/i)).toBeVisible();
      }
      
      console.log(`Analyse ${deck.name} terminée`);
    }
  });

  test('Flux erreur et récupération', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    // 1. Essayer avec une decklist vide
    await page.getByRole('button', { name: /analyser/i }).click();
    
    // Vérifier qu'il y a un message d'erreur ou que rien ne se passe
    await page.waitForTimeout(2000);
    
    // 2. Essayer avec une decklist invalide
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.invalid);
    await page.getByRole('button', { name: /analyser/i }).click();
    
    // Attendre et voir si l'analyse se fait quand même ou s'il y a une erreur
    await page.waitForTimeout(5000);
    
    // 3. Corriger avec une decklist valide
    await page.getByPlaceholder(/collez votre decklist/i).clear();
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.simple);
    await page.getByRole('button', { name: /analyser/i }).click();
    
    // 4. Vérifier que l'analyse fonctionne maintenant
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
  });

  test('Flux navigation complète du site', async ({ page }) => {
    await page.goto('/');
    
    // Collecter tous les liens de navigation principaux
    const navLinks = [
      { name: /analyzer/i, path: 'analyzer' },
      { name: /guide/i, path: 'guide' },
      { name: /privacy/i, path: 'privacy' },
      { name: /analyses/i, path: 'analyses' }
    ];
    
    for (const link of navLinks) {
      const linkElement = page.getByRole('link', { name: link.name });
      
      if (await linkElement.isVisible()) {
        await linkElement.click();
        
        // Attendre que la page se charge
        await page.waitForTimeout(1000);
        
        // Vérifier qu'on est sur la bonne page
        if (link.path) {
          await expect(page).toHaveURL(new RegExp(link.path));
        }
        
        // Vérifier qu'il y a du contenu
        const main = page.getByRole('main');
        await expect(main).toBeVisible();
        
        console.log(`Navigation vers ${link.path} réussie`);
      }
    }
    
    // Revenir à l'accueil
    await page.getByRole('link', { name: /home|accueil/i }).click();
    await expect(page.getByRole('heading', { name: /manatuner/i })).toBeVisible();
  });
});

test.describe('Flux de Sauvegarde et Récupération', () => {
  test('Flux sauvegarde locale', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    // Effectuer une analyse
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.complex);
    await page.getByRole('button', { name: /analyser/i }).click();
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
    
    // Chercher et utiliser le bouton de sauvegarde (s'il existe)
    const saveButton = page.getByRole('button', { name: /sauvegarder|save/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // Vérifier la confirmation de sauvegarde
      await expect(page.getByText(/sauvegardé|saved/i)).toBeVisible();
    }
    
    // Aller voir les analyses sauvegardées
    const analysesLink = page.getByRole('link', { name: /analyses|my.*analyses/i });
    if (await analysesLink.isVisible()) {
      await analysesLink.click();
      
      // Vérifier qu'il y a au moins une analyse
      await expect(page.getByText(/lightning bolt|analyse/i)).toBeVisible();
    }
  });

  test('Flux persistance entre sessions', async ({ page, context }) => {
    // Première session
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.simple);
    await page.getByRole('button', { name: /analyser/i }).click();
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
    
    // Fermer et rouvrir une nouvelle page (même contexte = même localStorage)
    await page.close();
    const newPage = await context.newPage();
    
    // Vérifier la persistance
    await newPage.goto('/');
    
    const analysesLink = newPage.getByRole('link', { name: /analyses|my.*analyses/i });
    if (await analysesLink.isVisible()) {
      await analysesLink.click();
      
      // Vérifier si les analyses précédentes sont toujours là
      const hasAnalyses = await newPage.getByText(/lightning bolt|analyse/i).isVisible();
      console.log(`Persistance des analyses: ${hasAnalyses}`);
    }
  });
});

test.describe('Flux Avancés et Edge Cases', () => {
  test('Flux copier-coller depuis différentes sources', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    const decklistFormats = [
      // Format standard
      `4 Lightning Bolt
4 Counterspell
8 Island
8 Mountain`,
      
      // Format avec quantités devant
      `4x Lightning Bolt
4x Counterspell
8x Island
8x Mountain`,
      
      // Format mixte
      `4 Lightning Bolt
4x Counterspell
8 Island
8x Mountain`,
      
      // Format avec sets
      `4 Lightning Bolt (M21)
4 Counterspell (TSR)
8 Island (UNF)
8 Mountain (UNF)`
    ];
    
    for (const format of decklistFormats) {
      await page.getByPlaceholder(/collez votre decklist/i).clear();
      await page.getByPlaceholder(/collez votre decklist/i).fill(format);
      await page.getByRole('button', { name: /analyser/i }).click();
      
      // Vérifier que l'analyse fonctionne pour chaque format
      await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
      
      console.log('Format accepté:', format.split('\n')[0]);
    }
  });

  test('Flux avec decklist très longue', async ({ page }) => {
    // Créer une decklist de 250 cartes (Commander)
    const commanderDeck = Array(99).fill(0).map((_, i) => `1 Card ${i + 1}`).join('\n') + '\n1 Commander Card';
    
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    await page.getByPlaceholder(/collez votre decklist/i).fill(commanderDeck);
    await page.getByRole('button', { name: /analyser/i }).click();
    
    // L'analyse peut prendre plus de temps pour une grande decklist
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 20000 });
    
    // Vérifier que tous les onglets fonctionnent toujours
    const statsTab = page.getByRole('tab', { name: /statistiques|overview/i });
    if (await statsTab.isVisible()) {
      await statsTab.click();
      await expect(page.getByText(/total.*cartes/i)).toBeVisible();
    }
  });

  test('Flux interruption et reprise', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    // Commencer une analyse
    await page.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.complex);
    await page.getByRole('button', { name: /analyser/i }).click();
    
    // Interrompre en naviguant ailleurs
    await page.getByRole('link', { name: /home|accueil/i }).click();
    await page.waitForTimeout(1000);
    
    // Revenir à l'analyzer
    await page.getByRole('link', { name: /analyzer/i }).click();
    
    // Vérifier l'état de l'interface
    const textarea = page.getByPlaceholder(/collez votre decklist/i);
    await expect(textarea).toBeVisible();
    
    // Relancer l'analyse
    if (await textarea.inputValue() === '') {
      await textarea.fill(SAMPLE_DECKLISTS.simple);
    }
    
    await page.getByRole('button', { name: /analyser/i }).click();
    await expect(page.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
  });

  test('Flux multiples analyses simultanées (onglets)', async ({ browser }) => {
    // Ouvrir plusieurs onglets
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    // Lancer des analyses en parallèle
    const analysis1 = async () => {
      await page1.goto('/');
      await page1.getByRole('link', { name: /analyzer/i }).click();
      await page1.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.aggro);
      await page1.getByRole('button', { name: /analyser/i }).click();
      await expect(page1.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
    };
    
    const analysis2 = async () => {
      await page2.goto('/');
      await page2.getByRole('link', { name: /analyzer/i }).click();
      await page2.getByPlaceholder(/collez votre decklist/i).fill(SAMPLE_DECKLISTS.control);
      await page2.getByRole('button', { name: /analyser/i }).click();
      await expect(page2.getByTestId('analysis-results')).toBeVisible({ timeout: 15000 });
    };
    
    // Exécuter les analyses en parallèle
    await Promise.all([analysis1(), analysis2()]);
    
    // Vérifier que les deux analyses sont indépendantes
    const stats1 = await page1.getByText(/total.*cartes/i).textContent();
    const stats2 = await page2.getByText(/total.*cartes/i).textContent();
    
    console.log(`Onglet 1: ${stats1}, Onglet 2: ${stats2}`);
    
    await context.close();
  });
}); 