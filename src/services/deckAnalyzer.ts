import { MANA_COLORS, ManaColor } from "../types";
import type { LandManaColor, LandMetadata } from "../types/lands";
import { landService } from "./landService";
import { analyzeSpellCastability, compareTempoImpact } from "./manaCalculator";

// Interface pour les données Scryfall
interface ScryfallCard {
  id: string;
  name: string;
  type_line: string;
  mana_cost?: string;
  cmc: number;
  colors: string[];
  produced_mana?: string[];
  layout: string;
}

// Cache pour éviter les appels répétés à Scryfall
const scryfallCache = new Map<string, ScryfallCard>();

export interface DeckCard {
  name: string;
  quantity: number;
  manaCost: string;
  colors: ManaColor[];
  isLand: boolean;
  producedMana?: ManaColor[];
  cmc: number;
  // Enhanced land properties from reference project
  etbTapped?: (lands: DeckCard[], cmc?: number, turn?: number) => boolean;
  fetchland?: string[];
  checkland?: boolean;
  ravland?: boolean;
  fastland?: boolean;
  producesMana?: boolean;
  // New: LandMetadata from LandService
  landMetadata?: LandMetadata;
}

// Enhanced spell analysis with tempo consideration
export interface TempoSpellAnalysis {
  castable: number;
  total: number;
  percentage: number;
  // New tempo-aware data
  tempoAdjustedPercentage: number;
  tempoImpact: number;
  scenarios: {
    aggressive: number;
    conservative: number;
    balanced: number;
  };
  rating: 'excellent' | 'good' | 'average' | 'weak' | 'critical';
}

// Tempo impact summary per color
export interface TempoImpactSummary {
  color: LandManaColor;
  rawSources: number;
  effectiveSources: number;
  rawProbability: number;
  tempoAdjustedProbability: number;
  impact: number;
  impactPercent: string;
}

export interface AnalysisResult {
  totalCards: number;
  totalLands: number;
  totalNonLands: number;
  colorDistribution: Record<ManaColor, number>;
  manaRequirements: Record<ManaColor, number>;
  recommendations: string[];
  probabilities: {
    turn1: { anyColor: number; specificColors: Record<ManaColor, number> };
    turn2: { anyColor: number; specificColors: Record<ManaColor, number> };
    turn3: { anyColor: number; specificColors: Record<ManaColor, number> };
    turn4: { anyColor: number; specificColors: Record<ManaColor, number> };
  };
  consistency: number;
  rating: "excellent" | "good" | "average" | "poor";
  averageCMC: number;
  landRatio: number;
  // Mana curve distribution (CMC 0-6, 7+)
  manaCurve: Record<string, number>;
  // Mulligan analysis - probability distribution of opening hand quality
  mulliganAnalysis: {
    perfectHand: number;  // 2-4 lands + early plays (keep%)
    goodHand: number;     // 2-4 lands (keep%)
    averageHand: number;  // 1 or 5 lands (keep%)
    poorHand: number;     // 0 or 6 lands (mulligan%)
    terribleHand: number; // 0 or 7 lands (mulligan%)
  };
  // Enhanced analysis from reference project
  spellAnalysis: Record<
    string,
    { castable: number; total: number; percentage: number }
  >;
  // NEW: Tempo-aware analysis
  tempoSpellAnalysis?: Record<string, TempoSpellAnalysis>;
  tempoImpactByColor?: Record<string, TempoImpactSummary>;
  landMetadata?: LandMetadata[];
}

export class DeckAnalyzer {
  // Fonction pour interroger l'API Scryfall
  private static async fetchCardFromScryfall(
    cardName: string,
  ): Promise<ScryfallCard | null> {
    // Vérifier le cache d'abord
    if (scryfallCache.has(cardName)) {
      return scryfallCache.get(cardName)!;
    }

    try {
      const encodedName = encodeURIComponent(cardName);
      const response = await fetch(
        `https://api.scryfall.com/cards/named?exact=${encodedName}`,
      );

      if (!response.ok) {
        console.warn(
          `Scryfall API error for "${cardName}": ${response.status}`,
        );
        return null;
      }

      const data: ScryfallCard = await response.json();

      // Mettre en cache le résultat
      scryfallCache.set(cardName, data);
      return data;
    } catch (error) {
      console.error(`Error fetching card "${cardName}" from Scryfall:`, error);
      return null;
    }
  }

  // Fonction améliorée pour détecter les terrains via Scryfall
  private static async isLandCardScryfall(name: string): Promise<boolean> {
    const scryfallData = await this.fetchCardFromScryfall(name);

    if (scryfallData) {
      // Vérification précise via Scryfall
      return scryfallData.type_line.toLowerCase().includes("land");
    }

    // Fallback vers la détection par mots-clés si Scryfall échoue
    return this.isLandCardFallback(name);
  }

  // Fonction de fallback pour la détection des terrains (ancienne méthode)
  private static isLandCardFallback(name: string): boolean {
    const landKeywords = [
      // Basic lands
      "island",
      "mountain",
      "forest",
      "plains",
      "swamp",
      // Land types
      "land",
      "terrain",
      // Fetchlands
      "strand",
      "tarn",
      "mesa",
      "foothills",
      "delta",
      "mire",
      "catacombs",
      "flats",
      // Other land indicators
      "temple",
      "sanctuary",
      "grove",
      "cavern",
      "spire",
      "foundry",
      "confluence",
      "command tower",
      "city of brass",
      "mana confluence",
      // Additional land types
      "courtyard",
      "vantage",
      "tower",
      "town",
      "shrine",
      "crypt",
      "heath",
      "rainforest",
      "garden",
      "pool",
      "ground",
      "fountain",
      // French translations
      "île",
      "montagne",
      "forêt",
      "plaine",
      "marais",
    ];

    const lowerName = name.toLowerCase();
    return (
      landKeywords.some((keyword) => lowerName.includes(keyword)) ||
      lowerName.includes("terrain") ||
      lowerName.endsWith("land") ||
      lowerName.endsWith("lands")
    );
  }
  private static parseManaCost(manaCost: string): {
    colors: ManaColor[];
    cmc: number;
    cost: Record<string, number>;
  } {
    const colors: ManaColor[] = [];
    const cost: Record<string, number> = {};
    let cmc = 0;

    if (!manaCost) {
      return { colors, cmc, cost };
    }

    // Parse mana cost like {2}{U}{R} or {W/U}{B}
    const matches = manaCost.match(/\{[^}]+\}/g) || [];

    matches.forEach((match) => {
      const symbol = match.slice(1, -1); // Remove { }

      // Generic mana
      if (/^\d+$/.test(symbol)) {
        const num = parseInt(symbol);
        cost.generic = (cost.generic || 0) + num;
        cmc += num;
      }
      // Hybrid mana like W/U
      else if (symbol.includes("/")) {
        const hybridColors = symbol.split("/");
        hybridColors.forEach((color) => {
          if (MANA_COLORS.includes(color as ManaColor)) {
            colors.push(color as ManaColor);
          }
        });
        cost[symbol] = (cost[symbol] || 0) + 1;
        cmc += 1;
      }
      // Regular colored mana
      else if (MANA_COLORS.includes(symbol as ManaColor)) {
        colors.push(symbol as ManaColor);
        cost[symbol] = (cost[symbol] || 0) + 1;
        cmc += 1;
      }
      // X costs
      else if (symbol === "X") {
        cost.X = (cost.X || 0) + 1;
        // X doesn't add to CMC until resolved
      }
    });

    return { colors, cmc, cost };
  }

  // Enhanced land detection from reference project (kept for sync compatibility)
  private static isLandCard(name: string): boolean {
    return this.isLandCardFallback(name);
  }

  // Enhanced land logic from reference project
  private static evaluateLandProperties(
    name: string,
    _text?: string,
  ): Partial<DeckCard> {
    const lowerName = name.toLowerCase();
    const properties: Partial<DeckCard> = {
      etbTapped: () => false,
      producesMana: true,
    };

    // Starting Town et lands similaires (condition temporelle)
    if (lowerName.includes("starting town")) {
      properties.etbTapped = (
        lands: DeckCard[],
        cmc?: number,
        turn?: number,
      ) => {
        // Entre non-engagé seulement aux tours 1, 2, ou 3
        return (turn || 4) > 3;
      };
      // Note: Starting Town a des propriétés spéciales :
      // - {T}: Add {C} (gratuit)
      // - {T}, Pay 1 life: Add one mana of any color
      return properties;
    }

    // Fetchlands
    if (
      lowerName.includes("strand") ||
      lowerName.includes("tarn") ||
      lowerName.includes("mesa") ||
      lowerName.includes("foothills") ||
      lowerName.includes("delta") ||
      lowerName.includes("mire") ||
      lowerName.includes("catacombs") ||
      lowerName.includes("flats")
    ) {
      properties.fetchland = this.getFetchlandTargets(name);
      properties.etbTapped = () => false; // Fetchlands don't ETB tapped themselves
    }

    // Checklands (enter tapped unless you control specific basic land types)
    else if (
      lowerName.includes("rootbound") ||
      lowerName.includes("sunpetal") ||
      lowerName.includes("dragonskull") ||
      lowerName.includes("drowned") ||
      lowerName.includes("glacial") ||
      lowerName.includes("hinterland") ||
      lowerName.includes("isolated") ||
      lowerName.includes("sulfur") ||
      lowerName.includes("woodland") ||
      lowerName.includes("clifftop")
    ) {
      properties.checkland = true;
      properties.etbTapped = (lands) =>
        !this.hasRequiredBasicTypes(lands || [], name);
    }

    // Fastlands (enter tapped if you control 3+ other lands)
    else if (
      lowerName.includes("seachrome") ||
      lowerName.includes("darkslick") ||
      lowerName.includes("blackcleave") ||
      lowerName.includes("copperline") ||
      lowerName.includes("razorverge") ||
      lowerName.includes("botanical")
    ) {
      properties.fastland = true;
      properties.etbTapped = (lands, cmc) =>
        (lands?.length || 0) > 2 && (cmc || 0) > 2;
    }

    // Shocklands/Ravlands (can pay 2 life to enter untapped)
    else if (
      lowerName.includes("temple garden") ||
      lowerName.includes("sacred foundry") ||
      lowerName.includes("steam vents") ||
      lowerName.includes("overgrown tomb") ||
      lowerName.includes("watery grave") ||
      lowerName.includes("godless shrine") ||
      lowerName.includes("stomping ground") ||
      lowerName.includes("breeding pool") ||
      lowerName.includes("blood crypt") ||
      lowerName.includes("hallowed fountain")
    ) {
      properties.ravland = true;
      properties.etbTapped = () => false; // Assume we pay life
    }

    // Basic ETB tapped lands
    else if (
      lowerName.includes("temple") ||
      lowerName.includes("guildgate") ||
      lowerName.includes("tap land") ||
      lowerName.includes("enters tapped")
    ) {
      properties.etbTapped = () => true;
    }

    return properties;
  }

  private static getFetchlandTargets(name: string): string[] {
    const fetchlandMap: Record<string, string[]> = {
      "Flooded Strand": ["Plains", "Island"],
      "Polluted Delta": ["Island", "Swamp"],
      "Bloodstained Mire": ["Swamp", "Mountain"],
      "Wooded Foothills": ["Mountain", "Forest"],
      "Windswept Heath": ["Forest", "Plains"],
      "Scalding Tarn": ["Island", "Mountain"],
      "Verdant Catacombs": ["Swamp", "Forest"],
      "Marsh Flats": ["Plains", "Swamp"],
      "Misty Rainforest": ["Forest", "Island"],
      "Arid Mesa": ["Mountain", "Plains"],
    };
    return fetchlandMap[name] || [];
  }

  private static hasRequiredBasicTypes(
    lands: DeckCard[],
    checklandName: string,
  ): boolean {
    const requirements: Record<string, string[]> = {
      "Rootbound Crag": ["Mountain", "Forest"],
      "Sunpetal Grove": ["Forest", "Plains"],
      "Dragonskull Summit": ["Swamp", "Mountain"],
      "Drowned Catacomb": ["Island", "Swamp"],
      "Glacial Fortress": ["Plains", "Island"],
    };

    const required = requirements[checklandName] || [];
    return required.some((type) =>
      lands.some((land) =>
        land.name.toLowerCase().includes(type.toLowerCase()),
      ),
    );
  }

  // Enhanced card parsing with better mana cost handling and LandService integration
  private static async parseDeckList(deckList: string): Promise<DeckCard[]> {
    const lines = deckList.split("\n").filter((line) => line.trim());
    const cards: DeckCard[] = [];

    for (const line of lines) {
      const patterns = [/^(\d+)\s+(.+)$/, /^(\d+)x\s+(.+)$/, /^(.+)\s+x(\d+)$/];

      let match: RegExpMatchArray | null = null;
      let quantity = 0;
      let name = "";

      for (const pattern of patterns) {
        match = line.match(pattern);
        if (match) {
          if (pattern === patterns[2]) {
            quantity = parseInt(match[2]);
            name = match[1].trim();
          } else {
            quantity = parseInt(match[1]);
            name = match[2].trim();
          }
          break;
        }
      }

      if (match && quantity > 0) {
        // Clean card name by removing MTGA set codes like "(TDM) 33" or "(RNA) 245"
        name = this.cleanCardName(name);

        // Use LandService for precise land detection with ETB analysis
        const landMetadata = await landService.detectLand(name);
        const isLand = landMetadata !== null;

        let manaCost = "";
        let colors: ManaColor[] = [];
        let cmc = 0;

        if (isLand) {
          // Lands don't have mana costs
          manaCost = "";
          colors = [];
          cmc = 0;
        } else {
          // For spells, try to get mana cost from Scryfall first
          const scryfallData = await this.fetchCardFromScryfall(name);
          if (scryfallData && scryfallData.mana_cost) {
            manaCost = scryfallData.mana_cost;
            const parsed = this.parseManaCost(manaCost);
            colors = parsed.colors;
            cmc = scryfallData.cmc || parsed.cmc;
          } else {
            // Fallback to simulated mana cost for unknown cards
            manaCost = this.getSimulatedManaCost(name);
            const parsed = this.parseManaCost(manaCost);
            colors = parsed.colors;
            cmc = parsed.cmc;
          }
        }

        // Use LandMetadata for produced mana if available
        const producedMana = isLand && landMetadata
          ? landMetadata.produces as ManaColor[]
          : undefined;

        // Keep legacy land properties for compatibility, but enhance with LandMetadata
        const landProperties = isLand ? this.evaluateLandProperties(name) : {};

        cards.push({
          name,
          quantity,
          manaCost,
          colors,
          isLand,
          producedMana,
          cmc,
          ...landProperties,
          // NEW: Include full LandMetadata for tempo analysis
          landMetadata: landMetadata || undefined,
        });
      }
    }

    return cards;
  }

  private static cleanCardName(name: string): string {
    // Remove MTGA set codes and collector numbers
    // Patterns: "(SET) 123", "(SET) 123a", "A-CardName", etc.
    return name
      .replace(/\s*\([A-Z0-9]{2,4}\)\s*\d+[a-z]?$/i, "") // Remove "(SET) 123" at end
      .replace(/^A-/, "") // Remove "A-" prefix for Arena rebalanced cards
      .trim();
  }

  private static getSimulatedManaCost(name: string): string {
    // Enhanced simulation with more cards
    const costs: Record<string, string> = {
      // Red spells
      "Lightning Bolt": "{R}",
      "Monastery Swiftspear": "{R}",
      "Goblin Guide": "{R}",
      "Lava Spike": "{R}",
      "Young Pyromancer": "{1}{R}",
      Pyroclasm: "{1}{R}",
      "Claim the Firstborn": "{R}",
      "Unlucky Witness": "{R}",
      "Amped Raptor": "{1}{R}",
      "Stadium Headliner": "{1}{R}",
      "Goblin Trapfinder": "{R}",

      // Blue spells
      Counterspell: "{U}{U}",
      Brainstorm: "{U}",
      Ponder: "{U}",
      "Delver of Secrets": "{U}",
      "Force of Will": "{3}{U}{U}",
      "Jace, the Mind Sculptor": "{2}{U}{U}",

      // White spells
      "Swords to Plowshares": "{W}",
      "Path to Exile": "{W}",
      "Wrath of God": "{2}{W}{W}",
      "Guide of Souls": "{W}",
      "Voice of Victory": "{1}{W}",

      // Black spells
      "Dark Ritual": "{B}",
      Thoughtseize: "{B}",
      "Fatal Push": "{B}",
      "Liliana of the Veil": "{1}{B}{B}",
      "Village Rites": "{B}",
      "Corrupted Conviction": "{B}",
      "Marionette Apprentice": "{1}{B}",

      // Green spells
      "Llanowar Elves": "{G}",
      "Birds of Paradise": "{G}",
      Tarmogoyf: "{1}{G}",
      "Noble Hierarch": "{G}",

      // Multicolor
      "Lightning Helix": "{R}{W}",
      Terminate: "{B}{R}",
      "Abrupt Decay": "{B}{G}",
      "Ajani, Nacatl Pariah": "{1}{W}",
      "Sephiroth, Fabled SOLDIER": "{1}{W}{B}",

      // Artifacts and Colorless
      "Sol Ring": "{1}",
      "Mox Ruby": "{0}",
      "Black Lotus": "{0}",
      "Sensei's Divining Top": "{1}",
      "Goblin Bombardment": "{1}{R}",
      "Phyrexian Tower": "{0}",
      // Starting Town n'a pas de coût de mana (c'est un land)
    };

    // If we don't have the exact card, try to guess based on name patterns
    if (costs[name]) {
      return costs[name];
    }

    // Simple heuristics for unknown cards
    const lowerName = name.toLowerCase();
    if (lowerName.includes("bolt") || lowerName.includes("shock")) return "{R}";
    if (lowerName.includes("counter")) return "{U}{U}";
    if (lowerName.includes("swords") || lowerName.includes("path"))
      return "{W}";
    if (lowerName.includes("ritual") || lowerName.includes("dark"))
      return "{B}";
    if (lowerName.includes("elf") || lowerName.includes("birds")) return "{G}";

    // Default to 2 generic mana
    return "{2}";
  }

  // Fonction améliorée pour obtenir le mana produit via Scryfall
  private static async getProducedManaScryfall(
    name: string,
  ): Promise<ManaColor[]> {
    const scryfallData = await this.fetchCardFromScryfall(name);

    if (scryfallData && scryfallData.produced_mana) {
      return scryfallData.produced_mana as ManaColor[];
    }

    // Fallback vers la méthode existante
    return this.getProducedMana(name);
  }

  private static getProducedMana(name: string): ManaColor[] {
    // Enhanced land production mapping
    const landProduction: Record<string, ManaColor[]> = {
      // Basic lands
      Island: ["U"],
      Mountain: ["R"],
      Plains: ["W"],
      Swamp: ["B"],
      Forest: ["G"],

      // Fetchlands
      "Flooded Strand": ["W", "U"],
      "Polluted Delta": ["U", "B"],
      "Bloodstained Mire": ["B", "R"],
      "Wooded Foothills": ["R", "G"],
      "Windswept Heath": ["G", "W"],
      "Scalding Tarn": ["U", "R"],
      "Verdant Catacombs": ["B", "G"],
      "Marsh Flats": ["W", "B"],
      "Misty Rainforest": ["G", "U"],
      "Arid Mesa": ["R", "W"],

      // Dual lands
      "Volcanic Island": ["U", "R"],
      Tundra: ["W", "U"],
      "Underground Sea": ["U", "B"],
      Badlands: ["B", "R"],
      Taiga: ["R", "G"],
      Savannah: ["G", "W"],
      Scrubland: ["W", "B"],
      "Tropical Island": ["G", "U"],
      Bayou: ["B", "G"],
      Plateau: ["R", "W"],

      // Shocklands
      "Steam Vents": ["U", "R"],
      "Hallowed Fountain": ["W", "U"],
      "Watery Grave": ["U", "B"],
      "Blood Crypt": ["B", "R"],
      "Stomping Ground": ["R", "G"],
      "Temple Garden": ["G", "W"],
      "Godless Shrine": ["W", "B"],
      "Breeding Pool": ["G", "U"],
      "Overgrown Tomb": ["B", "G"],
      "Sacred Foundry": ["R", "W"],

      // Utility lands
      "Command Tower": ["W", "U", "B", "R", "G"],
      "City of Brass": ["W", "U", "B", "R", "G"],
      "Mana Confluence": ["W", "U", "B", "R", "G"],

      // Fastlands
      "Concealed Courtyard": ["W", "B"],
      "Inspiring Vantage": ["R", "W"],

      // Special lands
      "Phyrexian Tower": [], // Colorless but sacrifices creatures
      "Starting Town": ["W", "U", "B", "R", "G"], // Peut produire n'importe quelle couleur (+ incolore gratuit)
    };

    if (landProduction[name]) {
      return landProduction[name];
    }

    // Heuristics for unknown lands
    const lowerName = name.toLowerCase();
    if (lowerName.includes("island")) return ["U"];
    if (lowerName.includes("mountain")) return ["R"];
    if (lowerName.includes("plains")) return ["W"];
    if (lowerName.includes("swamp")) return ["B"];
    if (lowerName.includes("forest")) return ["G"];

    // Default: produces colorless
    return [];
  }

  private static calculateHypergeometric(
    populationSize: number,
    successStates: number,
    sampleSize: number,
    observedSuccesses: number,
  ): number {
    // Improved hypergeometric calculation
    if (successStates === 0 || populationSize === 0) return 0;
    if (observedSuccesses === 0) return 1;
    if (observedSuccesses > sampleSize || observedSuccesses > successStates)
      return 0;
    if (sampleSize > populationSize) return 0;

    // Calculate probability of getting AT LEAST observedSuccesses
    let probability = 0;

    for (
      let k = observedSuccesses;
      k <= Math.min(sampleSize, successStates);
      k++
    ) {
      // P(X = k) using hypergeometric formula
      const numerator =
        this.combination(successStates, k) *
        this.combination(populationSize - successStates, sampleSize - k);
      const denominator = this.combination(populationSize, sampleSize);

      if (denominator > 0) {
        probability += numerator / denominator;
      }
    }

    return Math.min(1, Math.max(0, probability));
  }

  private static combination(n: number, k: number): number {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;

    // Use the more efficient formula: C(n,k) = C(n,n-k)
    k = Math.min(k, n - k);

    let result = 1;
    for (let i = 0; i < k; i++) {
      result = (result * (n - i)) / (i + 1);
    }

    return Math.round(result);
  }

  private static calculateColorProbabilities(
    cards: DeckCard[],
    colorRequirements: Record<ManaColor, number>,
    turn: number,
  ): Record<ManaColor, number> {
    const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0);
    const handSize = 7;
    const cardsDrawn = Math.min(handSize + turn - 1, totalCards);

    const probabilities: Record<ManaColor, number> = {} as Record<
      ManaColor,
      number
    >;

    MANA_COLORS.forEach((color) => {
      const sourcesForColor = cards
        .filter((card) => card.isLand && card.producedMana?.includes(color))
        .reduce((sum, card) => sum + card.quantity, 0);

      const requiredSources = colorRequirements[color] || 0;

      if (requiredSources === 0) {
        probabilities[color] = 1;
      } else {
        // Calculate probability of having at least 1 source of this color
        const minSources = Math.min(1, requiredSources);
        probabilities[color] = this.calculateHypergeometric(
          totalCards,
          sourcesForColor,
          cardsDrawn,
          minSources,
        );
      }
    });

    return probabilities;
  }

  private static generateRecommendations(
    cards: DeckCard[],
    analysis: Partial<AnalysisResult>,
  ): string[] {
    const recommendations: string[] = [];
    const _lands = cards.filter((card) => card.isLand);
    const _nonLands = cards.filter((card) => !card.isLand);

    // Analyse des mécaniques complexes
    const complexAnalysis = this.analyzeComplexLandMechanics(cards);

    // Land ratio recommendations
    if (analysis.landRatio && analysis.landRatio < 0.35) {
      recommendations.push(
        `🏔️ Consider adding more lands (current: ${Math.round(analysis.landRatio * 100)}%, recommended: 35-40%)`,
      );
    } else if (analysis.landRatio && analysis.landRatio > 0.45) {
      recommendations.push(
        `🎯 Consider reducing lands (current: ${Math.round(analysis.landRatio * 100)}%, recommended: 35-40%)`,
      );
    }

    // Color distribution recommendations
    if (analysis.colorDistribution) {
      const colors = Object.keys(analysis.colorDistribution) as ManaColor[];
      const activeColors = colors.filter(
        (color) => (analysis.colorDistribution![color] || 0) > 0,
      );

      if (activeColors.length >= 3) {
        recommendations.push(
          `🌈 Multi-color deck detected (${activeColors.length} colors). Consider more dual lands and mana fixing.`,
        );

        // Starting Town specific recommendation for multicolor decks
        if (complexAnalysis.flexibleManaLands < activeColors.length * 2) {
          recommendations.push(
            `✨ Starting Town would be excellent here - provides any color early game and remains useful late game.`,
          );
        }
      }
    }

    // Mana curve recommendations
    if (analysis.averageCMC && analysis.averageCMC > 3.5) {
      recommendations.push(
        `⚡ High mana curve (${analysis.averageCMC.toFixed(1)}). Consider more ramp or lower-cost spells.`,
      );
    } else if (analysis.averageCMC && analysis.averageCMC < 2.0) {
      recommendations.push(
        `🏃 Very aggressive curve (${analysis.averageCMC.toFixed(1)}). Ensure sufficient early mana sources.`,
      );
    }

    // Complex land mechanics recommendations
    if (complexAnalysis.timingDependentLands.length > 0) {
      recommendations.push(
        `⏰ Timing-dependent lands detected: ${complexAnalysis.timingDependentLands.join(", ")}`,
      );
    }

    if (complexAnalysis.lifeCostLands > 8) {
      recommendations.push(
        `❤️ High life cost from lands (${complexAnalysis.lifeCostLands} sources). Consider life gain or aggressive strategy.`,
      );
    }

    if (complexAnalysis.flexibleManaLands >= 8) {
      recommendations.push(
        `🎨 Excellent mana flexibility (${complexAnalysis.flexibleManaLands} flexible sources). Great for multicolor strategies.`,
      );
    }

    // Specific Starting Town analysis
    const startingTowns = cards.find((card) =>
      card.name.toLowerCase().includes("starting town"),
    );
    if (startingTowns && startingTowns.quantity >= 4) {
      recommendations.push(
        `🏘️ Starting Town (${startingTowns.quantity}x): Excellent early game mana base. Optimal in aggressive multicolor decks.`,
      );
      recommendations.push(
        `💡 Starting Town tip: Prioritize playing it turns 1-3 for maximum value (enters untapped).`,
      );
    }

    // Consistency recommendations
    if (analysis.consistency && analysis.consistency < 0.7) {
      recommendations.push(
        `🎲 Low mana consistency (${Math.round(analysis.consistency * 100)}%). Add more dual lands or mana fixing.`,
      );
    }

    return recommendations;
  }

  private static calculateIdealLandRatio(averageCMC: number): number {
    // Dynamic land ratio based on average CMC
    // Based on Frank Karsten's research and common deck building principles
    if (averageCMC <= 1.5) return 0.33; // Very aggressive (20/60)
    if (averageCMC <= 2.0) return 0.35; // Aggressive (21/60)
    if (averageCMC <= 2.5) return 0.37; // Midrange-low (22/60)
    if (averageCMC <= 3.0) return 0.4; // Midrange (24/60)
    if (averageCMC <= 3.5) return 0.42; // Midrange-high (25/60)
    if (averageCMC <= 4.0) return 0.43; // Control-low (26/60)
    return 0.45; // Control/Ramp (27/60)
  }

  public static async analyzeDeck(deckList: string): Promise<AnalysisResult> {
    const cards = await this.parseDeckList(deckList);

    const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0);
    const lands = cards.filter((card) => card.isLand);
    const nonLands = cards.filter((card) => !card.isLand);

    const totalLands = lands.reduce((sum, card) => sum + card.quantity, 0);
    const totalNonLands = nonLands.reduce(
      (sum, card) => sum + card.quantity,
      0,
    );

    // Calcul de la distribution des couleurs dans les terrains
    const colorDistribution: Record<ManaColor, number> = {} as Record<
      ManaColor,
      number
    >;
    MANA_COLORS.forEach((color) => {
      colorDistribution[color] = lands
        .filter((card) => card.producedMana?.includes(color))
        .reduce((sum, card) => sum + card.quantity, 0);
    });

    // Calcul des besoins en mana basé sur les sorts
    const manaRequirements: Record<ManaColor, number> = {} as Record<
      ManaColor,
      number
    >;
    MANA_COLORS.forEach((color) => {
      const requirement = nonLands
        .filter((card) => card.colors.includes(color))
        .reduce((sum, card) => sum + card.quantity, 0);
      manaRequirements[color] = Math.ceil(requirement * 0.6); // Approximation Frank Karsten
    });

    // Calcul des probabilités par tour
    const probabilities = {
      turn1: this.calculateColorProbabilities(cards, manaRequirements, 1),
      turn2: this.calculateColorProbabilities(cards, manaRequirements, 2),
      turn3: this.calculateColorProbabilities(cards, manaRequirements, 3),
      turn4: this.calculateColorProbabilities(cards, manaRequirements, 4),
    };

    // Calcul de la consistance globale
    const avgProbability =
      MANA_COLORS.reduce((sum, color) => {
        return sum + (probabilities.turn2[color] || 0);
      }, 0) / MANA_COLORS.length;

    const consistency = avgProbability;

    // Détermination du rating
    let rating: "excellent" | "good" | "average" | "poor";
    if (consistency >= 0.9) rating = "excellent";
    else if (consistency >= 0.8) rating = "good";
    else if (consistency >= 0.7) rating = "average";
    else rating = "poor";

    const partialAnalysis = {
      totalCards,
      totalLands,
      totalNonLands,
      colorDistribution,
      manaRequirements,
      consistency,
      rating,
    };

    const recommendations = this.generateRecommendations(
      cards,
      partialAnalysis,
    );

    const averageCMC =
      totalNonLands > 0
        ? nonLands.reduce((sum, card) => sum + card.cmc * card.quantity, 0) /
          totalNonLands
        : 0;
    const landRatio = totalLands / totalCards;

    // Calculate mana curve distribution
    const manaCurve: Record<string, number> = {
      "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7+": 0
    };
    nonLands.forEach((card) => {
      const cmc = Math.floor(card.cmc);
      if (cmc >= 7) {
        manaCurve["7+"] += card.quantity;
      } else {
        manaCurve[cmc.toString()] += card.quantity;
      }
    });

    // Calculate mulligan analysis using hypergeometric distribution
    // P(X = k) = C(K,k) * C(N-K, n-k) / C(N,n)
    // where N = deck size, K = lands, n = hand size (7), k = lands in hand
    const mulliganAnalysis = this.calculateMulliganAnalysis(totalCards, totalLands, manaCurve);

    // Calculate spell analysis (simplified version inspired by reference project)
    const spellAnalysis: Record<
      string,
      { castable: number; total: number; percentage: number }
    > = {};
    nonLands.forEach((spell) => {
      const total = spell.quantity;
      const castable = Math.round(total * (consistency + 0.1)); // Simplified calculation
      spellAnalysis[spell.name] = {
        castable,
        total,
        percentage: Math.round((castable / total) * 100),
      };
    });

    // NEW: Extract LandMetadata from cards for tempo analysis
    const landMetadataList: LandMetadata[] = [];
    lands.forEach((land) => {
      if (land.landMetadata) {
        // Add one entry per quantity
        for (let i = 0; i < land.quantity; i++) {
          landMetadataList.push(land.landMetadata);
        }
      }
    });

    // NEW: Calculate tempo-aware spell analysis
    const tempoSpellAnalysis: Record<string, TempoSpellAnalysis> = {};

    if (landMetadataList.length > 0) {
      for (const spell of nonLands) {
        try {
          const tempoResult = await analyzeSpellCastability(
            {
              name: spell.name,
              manaCost: spell.manaCost,
              cmc: spell.cmc
            },
            landMetadataList,
            totalCards
          );

          tempoSpellAnalysis[spell.name] = {
            castable: spellAnalysis[spell.name]?.castable || spell.quantity,
            total: spell.quantity,
            percentage: spellAnalysis[spell.name]?.percentage || 100,
            tempoAdjustedPercentage: Math.round(tempoResult.overallCastability * 100),
            tempoImpact: tempoResult.colorRequirements.length > 0
              ? Math.round(tempoResult.colorRequirements.reduce((sum, cr) => sum + cr.tempoImpact, 0) / tempoResult.colorRequirements.length * 100)
              : 0,
            scenarios: {
              aggressive: tempoResult.colorRequirements.length > 0
                ? Math.round(Math.min(...tempoResult.colorRequirements.map(cr => cr.scenarios.aggressive)) * 100)
                : 100,
              conservative: tempoResult.colorRequirements.length > 0
                ? Math.round(Math.min(...tempoResult.colorRequirements.map(cr => cr.scenarios.conservative)) * 100)
                : 100,
              balanced: tempoResult.colorRequirements.length > 0
                ? Math.round(Math.min(...tempoResult.colorRequirements.map(cr => cr.scenarios.balanced)) * 100)
                : 100
            },
            rating: tempoResult.rating
          };
        } catch (error) {
          console.warn(`[DeckAnalyzer] Error analyzing tempo for ${spell.name}:`, error);
          // Fallback to basic analysis
          tempoSpellAnalysis[spell.name] = {
            castable: spellAnalysis[spell.name]?.castable || spell.quantity,
            total: spell.quantity,
            percentage: spellAnalysis[spell.name]?.percentage || 100,
            tempoAdjustedPercentage: spellAnalysis[spell.name]?.percentage || 100,
            tempoImpact: 0,
            scenarios: { aggressive: 100, conservative: 100, balanced: 100 },
            rating: 'good'
          };
        }
      }
    }

    // NEW: Calculate tempo impact by color
    let tempoImpactByColor: Record<string, TempoImpactSummary> | undefined;

    if (landMetadataList.length > 0) {
      try {
        const tempoImpact = compareTempoImpact(landMetadataList, totalCards, 3);
        tempoImpactByColor = {};

        for (const [color, impact] of Object.entries(tempoImpact)) {
          tempoImpactByColor[color] = {
            color: color as LandManaColor,
            ...impact
          };
        }
      } catch (error) {
        console.warn('[DeckAnalyzer] Error calculating tempo impact by color:', error);
      }
    }

    return {
      ...partialAnalysis,
      recommendations,
      probabilities: {
        turn1: { anyColor: 0.95, specificColors: probabilities.turn1 },
        turn2: { anyColor: 0.98, specificColors: probabilities.turn2 },
        turn3: { anyColor: 0.99, specificColors: probabilities.turn3 },
        turn4: { anyColor: 0.995, specificColors: probabilities.turn4 },
      },
      averageCMC,
      landRatio,
      manaCurve,
      mulliganAnalysis,
      spellAnalysis,
      // NEW: Include tempo-aware analysis
      tempoSpellAnalysis: Object.keys(tempoSpellAnalysis).length > 0 ? tempoSpellAnalysis : undefined,
      tempoImpactByColor,
      landMetadata: landMetadataList.length > 0 ? landMetadataList : undefined,
    };
  }

  private static getBasicLandColors(name: string): ManaColor[] {
    const lowerName = name.toLowerCase();

    // Basic lands
    if (lowerName.includes("island")) return ["U"];
    if (lowerName.includes("mountain")) return ["R"];
    if (lowerName.includes("plains")) return ["W"];
    if (lowerName.includes("swamp")) return ["B"];
    if (lowerName.includes("forest")) return ["G"];

    // Default: produces colorless
    return [];
  }

  /**
   * Calculate mulligan analysis using hypergeometric distribution
   * Determines probability distribution of opening hand quality
   */
  private static calculateMulliganAnalysis(
    deckSize: number,
    landCount: number,
    manaCurve: Record<string, number>
  ): {
    perfectHand: number;
    goodHand: number;
    averageHand: number;
    poorHand: number;
    terribleHand: number;
  } {
    const handSize = 7;

    // Helper: Calculate hypergeometric probability P(X = k)
    // P(X = k) = C(K,k) * C(N-K, n-k) / C(N,n)
    const hypergeometricProbability = (N: number, K: number, n: number, k: number): number => {
      if (k > K || k > n || (n - k) > (N - K) || k < 0) return 0;

      const binomial = (a: number, b: number): number => {
        if (b > a || b < 0) return 0;
        if (b === 0 || b === a) return 1;
        let result = 1;
        for (let i = 0; i < b; i++) {
          result = result * (a - i) / (i + 1);
        }
        return result;
      };

      return (binomial(K, k) * binomial(N - K, n - k)) / binomial(N, n);
    };

    // Calculate probability of getting exactly k lands in opening hand
    const landProbs: number[] = [];
    for (let k = 0; k <= handSize; k++) {
      landProbs[k] = hypergeometricProbability(deckSize, landCount, handSize, k);
    }

    // Count early game spells (CMC 0-2) for "perfect hand" calculation
    const earlySpells = (manaCurve["0"] || 0) + (manaCurve["1"] || 0) + (manaCurve["2"] || 0);
    const totalSpells = deckSize - landCount;

    // Probability of having at least 1 early spell given we drew (7-k) spells
    const probEarlySpell = (spellsDrawn: number): number => {
      if (earlySpells === 0 || totalSpells === 0) return 0;
      if (spellsDrawn <= 0) return 0;
      // P(at least 1 early spell) = 1 - P(0 early spells)
      const probNoEarly = hypergeometricProbability(totalSpells, earlySpells, spellsDrawn, 0);
      return 1 - probNoEarly;
    };

    // Perfect Hand: 2-4 lands AND at least one early game spell (CMC 0-2)
    let perfectHand = 0;
    for (let k = 2; k <= 4; k++) {
      const spellsDrawn = handSize - k;
      perfectHand += landProbs[k] * probEarlySpell(spellsDrawn);
    }

    // Good Hand: 2-4 lands (includes perfect, so we show total keepable)
    const goodHand = landProbs[2] + landProbs[3] + landProbs[4];

    // Average Hand: 1 or 5 lands (borderline keep/mulligan)
    const averageHand = landProbs[1] + landProbs[5];

    // Poor Hand: 0 or 6 lands (usually mulligan)
    const poorHand = landProbs[0] + landProbs[6];

    // Terrible Hand: 7 lands or 0 lands with no early plays
    const terribleHand = landProbs[7] + (landProbs[0] * (1 - probEarlySpell(7)));

    // Convert to percentages and ensure they make sense
    return {
      perfectHand: Math.round(perfectHand * 100),
      goodHand: Math.round(goodHand * 100),
      averageHand: Math.round(averageHand * 100),
      poorHand: Math.round(poorHand * 100),
      terribleHand: Math.round(Math.min(terribleHand, poorHand) * 100), // Can't be worse than poor
    };
  }

  // Analyse des implications stratégiques des lands complexes
  private static analyzeComplexLandMechanics(cards: DeckCard[]): {
    earlyGameLands: number;
    lateGameLands: number;
    lifeCostLands: number;
    flexibleManaLands: number;
    timingDependentLands: string[];
  } {
    let earlyGameLands = 0;
    let lateGameLands = 0;
    let lifeCostLands = 0;
    let flexibleManaLands = 0;
    const timingDependentLands: string[] = [];

    cards
      .filter((card) => card.isLand)
      .forEach((land) => {
        const lowerName = land.name.toLowerCase();

        // Starting Town analysis
        if (lowerName.includes("starting town")) {
          earlyGameLands += land.quantity; // Excellent early game
          lateGameLands += land.quantity; // Still useful late game
          lifeCostLands += land.quantity; // Coût en vie pour mana coloré
          flexibleManaLands += land.quantity; // Peut produire toutes les couleurs
          timingDependentLands.push(
            `${land.quantity}x ${land.name} (optimal turns 1-3)`,
          );
        }

        // Shocklands analysis
        else if (
          [
            "temple garden",
            "sacred foundry",
            "steam vents",
            "overgrown tomb",
            "watery grave",
            "godless shrine",
            "stomping ground",
            "breeding pool",
            "blood crypt",
            "hallowed fountain",
          ].some((shock) => lowerName.includes(shock))
        ) {
          earlyGameLands += land.quantity;
          lifeCostLands += land.quantity; // 2 life pour entrer non-engagé
          flexibleManaLands += land.quantity;
        }

        // Fastlands analysis
        else if (
          [
            "seachrome coast",
            "darkslick shores",
            "blackcleave cliffs",
            "copperline gorge",
            "razorverge thicket",
            "inspiring vantage",
            "concealed courtyard",
            "spirebluff canal",
            "blooming marsh",
            "botanical sanctum",
          ].some((fast) => lowerName.includes(fast))
        ) {
          earlyGameLands += land.quantity; // Excellent early game
          timingDependentLands.push(
            `${land.quantity}x ${land.name} (optimal with ≤2 other lands)`,
          );
        }

        // Mana Confluence analysis
        else if (lowerName.includes("mana confluence")) {
          flexibleManaLands += land.quantity;
          lifeCostLands += land.quantity; // 1 life par activation
        }
      });

    return {
      earlyGameLands,
      lateGameLands,
      lifeCostLands,
      flexibleManaLands,
      timingDependentLands,
    };
  }
}
