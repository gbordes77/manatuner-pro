import { getComprehensiveLandAnalysis } from './intelligentLandAnalysis'
import { detectLand } from './landDetection'

// Interface pour les données Scryfall (copiée du deckAnalyzer)
interface ScryfallCard {
  id: string
  name: string
  type_line: string
  mana_cost?: string
  cmc: number
  colors: string[]
  produced_mana?: string[]
  layout: string
}

// Cache pour éviter les appels répétés à Scryfall
const scryfallCache = new Map<string, ScryfallCard>()

// Fonction pour interroger l'API Scryfall
async function fetchCardFromScryfall(cardName: string): Promise<ScryfallCard | null> {
  // Vérifier le cache d'abord
  if (scryfallCache.has(cardName)) {
    return scryfallCache.get(cardName)!
  }

  try {
    const encodedName = encodeURIComponent(cardName)
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodedName}`)

    if (!response.ok) {
      console.warn(`Scryfall API error for "${cardName}": ${response.status}`)
      return null
    }

    const data: ScryfallCard = await response.json()

    // Mettre en cache le résultat
    scryfallCache.set(cardName, data)
    return data
  } catch (error) {
    console.error(`Error fetching card "${cardName}" from Scryfall:`, error)
    return null
  }
}

export interface HybridLandInfo {
  isLand: boolean
  category: string
  behavior: string
  manaProduction: string[]
  entersUntapped: boolean
  specialRules?: string
}

// Interface unifiée pour les comportements de terrain
interface LandBehavior {
  behavior: string
  mana?: string[]
  targets?: string[]
  entersUntapped: boolean | 'conditional'
}

// Logique spécifique pour chaque type de terrain
const LAND_BEHAVIORS: Record<string, LandBehavior> = {
  // Fetchlands
  'Polluted Delta': { behavior: 'Fetchland', targets: ['Island', 'Swamp'], entersUntapped: false },
  'Flooded Strand': { behavior: 'Fetchland', targets: ['Plains', 'Island'], entersUntapped: false },
  'Bloodstained Mire': { behavior: 'Fetchland', targets: ['Swamp', 'Mountain'], entersUntapped: false },
  'Wooded Foothills': { behavior: 'Fetchland', targets: ['Mountain', 'Forest'], entersUntapped: false },
  'Windswept Heath': { behavior: 'Fetchland', targets: ['Forest', 'Plains'], entersUntapped: false },
  'Scalding Tarn': { behavior: 'Fetchland', targets: ['Island', 'Mountain'], entersUntapped: false },
  'Verdant Catacombs': { behavior: 'Fetchland', targets: ['Swamp', 'Forest'], entersUntapped: false },
  'Arid Mesa': { behavior: 'Fetchland', targets: ['Plains', 'Mountain'], entersUntapped: false },
  'Misty Rainforest': { behavior: 'Fetchland', targets: ['Forest', 'Island'], entersUntapped: false },
  'Marsh Flats': { behavior: 'Fetchland', targets: ['Plains', 'Swamp'], entersUntapped: false },

  // Shocklands
  'Hallowed Fountain': { behavior: 'Shockland', mana: ['W', 'U'], entersUntapped: 'conditional' },
  'Watery Grave': { behavior: 'Shockland', mana: ['U', 'B'], entersUntapped: 'conditional' },
  'Blood Crypt': { behavior: 'Shockland', mana: ['B', 'R'], entersUntapped: 'conditional' },
  'Stomping Ground': { behavior: 'Shockland', mana: ['R', 'G'], entersUntapped: 'conditional' },
  'Temple Garden': { behavior: 'Shockland', mana: ['G', 'W'], entersUntapped: 'conditional' },
  'Sacred Foundry': { behavior: 'Shockland', mana: ['R', 'W'], entersUntapped: 'conditional' },
  'Godless Shrine': { behavior: 'Shockland', mana: ['W', 'B'], entersUntapped: 'conditional' },
  'Steam Vents': { behavior: 'Shockland', mana: ['U', 'R'], entersUntapped: 'conditional' },
  'Overgrown Tomb': { behavior: 'Shockland', mana: ['B', 'G'], entersUntapped: 'conditional' },
  'Breeding Pool': { behavior: 'Shockland', mana: ['G', 'U'], entersUntapped: 'conditional' },

  // Fastlands
  'Seachrome Coast': { behavior: 'Fastland', mana: ['W', 'U'], entersUntapped: 'conditional' },
  'Darkslick Shores': { behavior: 'Fastland', mana: ['U', 'B'], entersUntapped: 'conditional' },
  'Blackcleave Cliffs': { behavior: 'Fastland', mana: ['B', 'R'], entersUntapped: 'conditional' },
  'Copperline Gorge': { behavior: 'Fastland', mana: ['R', 'G'], entersUntapped: 'conditional' },
  'Razorverge Thicket': { behavior: 'Fastland', mana: ['G', 'W'], entersUntapped: 'conditional' },
  'Inspiring Vantage': { behavior: 'Fastland', mana: ['R', 'W'], entersUntapped: 'conditional' },
  'Concealed Courtyard': { behavior: 'Fastland', mana: ['W', 'B'], entersUntapped: 'conditional' },
  'Spirebluff Canal': { behavior: 'Fastland', mana: ['U', 'R'], entersUntapped: 'conditional' },
  'Blooming Marsh': { behavior: 'Fastland', mana: ['B', 'G'], entersUntapped: 'conditional' },
  'Botanical Sanctum': { behavior: 'Fastland', mana: ['G', 'U'], entersUntapped: 'conditional' },

  // Horizon Lands
  'Sunbaked Canyon': { behavior: 'Horizon Land', mana: ['R', 'W'], entersUntapped: true },
  'Waterlogged Grove': { behavior: 'Horizon Land', mana: ['G', 'U'], entersUntapped: true },
  'Nurturing Peatland': { behavior: 'Horizon Land', mana: ['B', 'G'], entersUntapped: true },
  'Silent Clearing': { behavior: 'Horizon Land', mana: ['W', 'B'], entersUntapped: true },
  'Fiery Islet': { behavior: 'Horizon Land', mana: ['U', 'R'], entersUntapped: true },
  'Prismatic Vista': { behavior: 'Horizon Land', mana: ['Any'], entersUntapped: true },

  // Utility Lands
  'Mana Confluence': { behavior: 'Utility Land', mana: ['Any'], entersUntapped: true },
  'City of Brass': { behavior: 'Utility Land', mana: ['Any'], entersUntapped: true },
  'Gemstone Mine': { behavior: 'Utility Land', mana: ['Any'], entersUntapped: true },
  'Ancient Ziggurat': { behavior: 'Utility Land', mana: ['Any'], entersUntapped: true },
  'Cavern of Souls': { behavior: 'Utility Land', mana: ['Any'], entersUntapped: true },

  // Basics
  'Plains': { behavior: 'Basic Land', mana: ['W'], entersUntapped: true },
  'Island': { behavior: 'Basic Land', mana: ['U'], entersUntapped: true },
  'Swamp': { behavior: 'Basic Land', mana: ['B'], entersUntapped: true },
  'Mountain': { behavior: 'Basic Land', mana: ['R'], entersUntapped: true },
  'Forest': { behavior: 'Basic Land', mana: ['G'], entersUntapped: true },
}

/**
 * Détection hybride des terrains : Scryfall + logique statique
 */
export const detectLandHybrid = async (cardName: string): Promise<HybridLandInfo> => {
  const defaultResult: HybridLandInfo = {
    isLand: false,
    category: 'Non-Land',
    behavior: 'None',
    manaProduction: [],
    entersUntapped: false
  }

  try {
    // 1. Vérifier d'abord avec Scryfall
    const scryfallCard = await fetchCardFromScryfall(cardName)

    if (scryfallCard && scryfallCard.type_line.toLowerCase().includes('land')) {
      // C'est un terrain selon Scryfall
      const landBehavior = LAND_BEHAVIORS[cardName as keyof typeof LAND_BEHAVIORS]

      if (landBehavior) {
        // On connaît ce terrain spécifiquement
        return {
          isLand: true,
          category: landBehavior.behavior,
          behavior: landBehavior.behavior,
          manaProduction: landBehavior.mana || [],
          entersUntapped: landBehavior.entersUntapped === true,
          specialRules: getSpecialRules(landBehavior.behavior, cardName)
        }
      } else {
        // Terrain inconnu, utiliser l'analyse intelligente
        const intelligentAnalysis = getComprehensiveLandAnalysis(cardName, scryfallCard)

        if (intelligentAnalysis.confidence >= 70) {
          // Analyse intelligente réussie
          return {
            isLand: true,
            category: intelligentAnalysis.behavior,
            behavior: intelligentAnalysis.behavior,
            manaProduction: intelligentAnalysis.manaProduction,
            entersUntapped: intelligentAnalysis.entersUntapped === true,
            specialRules: `AI Analysis (${intelligentAnalysis.confidence}%): ${intelligentAnalysis.specialRules.join(', ')}`
          }
        } else {
          // Fallback vers catégorisation basique
          const category = categorizeLandFromScryfall(scryfallCard.type_line)
          return {
            isLand: true,
            category,
            behavior: category,
            manaProduction: extractManaFromScryfall(scryfallCard),
            entersUntapped: true, // Par défaut
            specialRules: `Detected via Scryfall: ${scryfallCard.type_line}`
          }
        }
      }
    }
  } catch (error) {
    // Fallback vers la détection locale
    console.warn(`Scryfall failed for ${cardName}, using local detection:`, error)
  }

  // 2. Fallback vers la détection locale
  const localResult = detectLand(cardName)
  if (localResult.isLand) {
    const landBehavior = LAND_BEHAVIORS[cardName]

    return {
      isLand: true,
      category: localResult.type,
      behavior: landBehavior?.behavior || localResult.type,
      manaProduction: landBehavior?.mana || [],
      entersUntapped: landBehavior?.entersUntapped === true,
      specialRules: getSpecialRules(landBehavior?.behavior || localResult.type, cardName)
    }
  }

  return defaultResult
}

/**
 * Catégorise un terrain basé sur son type_line Scryfall
 */
function categorizeLandFromScryfall(typeLine: string): string {
  const lower = typeLine.toLowerCase()

  if (lower.includes('basic land')) return 'Basic Land'
  if (lower.includes('legendary land')) return 'Legendary Land'
  if (lower.includes('artifact land')) return 'Artifact Land'
  return 'Nonbasic Land'
}

/**
 * Extrait la production de mana depuis les données Scryfall
 */
function extractManaFromScryfall(card: any): string[] {
  if (card.produced_mana) {
    return card.produced_mana
  }

  // Fallback : analyser le type_line
  const typeLine = card.type_line.toLowerCase()
  const mana: string[] = []

  if (typeLine.includes('plains')) mana.push('W')
  if (typeLine.includes('island')) mana.push('U')
  if (typeLine.includes('swamp')) mana.push('B')
  if (typeLine.includes('mountain')) mana.push('R')
  if (typeLine.includes('forest')) mana.push('G')

  return mana
}

/**
 * Retourne les règles spéciales pour un type de terrain
 */
function getSpecialRules(behavior: string, cardName: string): string {
  switch (behavior) {
    case 'Fetchland':
      return 'Sacrifice to search for specific basic land types'
    case 'Shockland':
      return 'Pay 2 life to enter untapped, or enters tapped'
    case 'Fastland':
      return 'Enters untapped if you control 2 or fewer other lands'
    case 'Horizon Land':
      return 'Can be sacrificed to draw a card'
    case 'Utility Land':
      return 'Special utility effects beyond mana production'
    case 'Basic Land':
      return 'Always enters untapped, no restrictions'
    default:
      return `Unknown behavior for ${cardName}`
  }
}
