import type { Card } from '@/types'

const SCRYFALL_API_BASE = 'https://api.scryfall.com'
const RATE_LIMIT_DELAY = 100 // 100ms entre les requêtes

interface ScryfallCard {
  id: string
  name: string
  mana_cost?: string
  cmc: number
  colors: string[]
  color_identity: string[]
  type_line: string
  oracle_text?: string  // Added for land detection
  rarity: string
  set: string
  image_uris?: {
    small?: string
    normal?: string
    large?: string
  }
  card_faces?: ScryfallCardFace[]  // Updated type
  layout: string
  produced_mana?: string[]
  keywords?: string[]  // Added for land detection
}

/** Card face for MDFC and split cards */
interface ScryfallCardFace {
  name: string
  mana_cost?: string
  type_line: string
  oracle_text?: string
  colors?: string[]
  image_uris?: {
    small?: string
    normal?: string
    large?: string
  }
}

interface ScryfallResponse<T> {
  object: string
  data?: T[]
  not_found?: any[]
  total_cards?: number
  has_more?: boolean
}

// Cache pour éviter les requêtes répétées
const cardCache = new Map<string, Card>()
const collectionCache = new Map<string, Card[]>()

// Rate limiting
let lastRequestTime = 0

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const ensureRateLimit = async (): Promise<void> => {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await delay(RATE_LIMIT_DELAY - timeSinceLastRequest)
  }

  lastRequestTime = Date.now()
}

/**
 * Convertit une carte Scryfall en format interne
 */
const convertScryfallCard = (scryfallCard: ScryfallCard): Card => {
  return {
    id: scryfallCard.id,
    name: scryfallCard.name,
    mana_cost: scryfallCard.mana_cost || undefined,
    cmc: scryfallCard.cmc,
    colors: scryfallCard.colors,
    color_identity: scryfallCard.color_identity,
    type_line: scryfallCard.type_line,
    rarity: scryfallCard.rarity,
    set: scryfallCard.set,
    set_name: scryfallCard.set || 'Unknown',
    legalities: {},
    imageUris: scryfallCard.image_uris,
    layout: scryfallCard.layout
  } as Card
}

/**
 * Effectue une requête à l'API Scryfall
 */
const scryfallRequest = async <T>(endpoint: string): Promise<T> => {
  await ensureRateLimit()

  try {
    const response = await fetch(`${SCRYFALL_API_BASE}${endpoint}`)

    if (!response.ok) {
      throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Scryfall request failed:', error)
    throw error
  }
}

/**
 * Recherche une carte by name avec fallbacks intelligents
 */
export const searchCardByName = async (name: string): Promise<Card | null> => {
  const cacheKey = name.toLowerCase().trim()

  if (cardCache.has(cacheKey)) {
    return cardCache.get(cacheKey)!
  }

  // Liste des variantes à essayer
  const nameVariants = [
    name.trim(),
    name.replace(/'/g, "'"), // Apostrophe droite → courbe
    name.replace(/'/g, "'"), // Apostrophe courbe → droite
    name.replace(/['']/g, ""), // Supprimer apostrophes
    name.replace(/,/g, ""), // Supprimer virgules
    name.replace(/\s+/g, " ").trim() // Normaliser espaces
  ]

  for (const variant of nameVariants) {
    try {
      console.log(`🔍 Tentative Scryfall: "${variant}"`)
      const encodedName = encodeURIComponent(variant)
      const response = await scryfallRequest<ScryfallCard>(`/cards/named?fuzzy=${encodedName}`)

      const card = convertScryfallCard(response)
      cardCache.set(cacheKey, card)

      console.log(`✅ Trouvé: "${variant}" → ${card.name}`)
      return card
    } catch {
      console.log(`❌ Échec: "${variant}"`)
      continue
    }
  }

  console.warn(`🚫 Aucune variante trouvée pour: "${name}"`)
  return null
}

/**
 * Recherche multiple cartes by collection
 */
export const searchCardsByCollection = async (cardNames: string[]): Promise<Card[]> => {
  const cacheKey = cardNames.sort().join('|')

  if (collectionCache.has(cacheKey)) {
    return collectionCache.get(cacheKey)!
  }

  try {
    const identifiers = cardNames.map(name => ({ name: name.trim() }))

    const response = await fetch(`${SCRYFALL_API_BASE}/cards/collection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifiers })
    })

    if (!response.ok) {
      throw new Error(`Scryfall collection API error: ${response.status}`)
    }

    const data: ScryfallResponse<ScryfallCard> = await response.json()
    const cards = data.data?.map(convertScryfallCard) || []

    collectionCache.set(cacheKey, cards)
    return cards

  } catch (error) {
    console.error('Collection search failed:', error)

    // Fallback: recherche une par une
    const results: Card[] = []
    for (const name of cardNames) {
      const card = await searchCardByName(name)
      if (card) {
        results.push(card)
      }
    }

    return results
  }
}

/**
 * Parse une decklist au format standard
 */
export const parseDecklistText = (text: string): { name: string, quantity: number }[] => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const cards: { name: string, quantity: number }[] = []

  for (const line of lines) {
    // Skip les commentaires et sections
    if (line.startsWith('//') || line.startsWith('#') ||
        line.toLowerCase().includes('sideboard') ||
        line.toLowerCase().includes('maybeboard')) {
      continue
    }

    // Format: "4 Lightning Bolt" ou "4x Lightning Bolt"
    const match = line.match(/^(\d+)x?\s+(.+)$/i)

    if (match) {
      const quantity = parseInt(match[1], 10)
      const name = match[2].trim()

      if (quantity > 0 && name.length > 0) {
        cards.push({ name, quantity })
      }
    } else {
      // Assume quantité 1 si pas de nombre
      const name = line.trim()
      if (name.length > 0) {
        cards.push({ name, quantity: 1 })
      }
    }
  }

  return cards
}

/**
 * Analyse une decklist complète avec l'API Scryfall
 */
export const analyzeDecklistText = async (text: string): Promise<{
  cards: Card[]
  notFound: string[]
  totalCards: number
}> => {
  const parsedCards = parseDecklistText(text)
  const uniqueNames = [...new Set(parsedCards.map(c => c.name))]

  console.log(`Analyzing decklist with ${parsedCards.length} entries, ${uniqueNames.length} unique cards`)

  const foundCards = await searchCardsByCollection(uniqueNames)
  const foundNames = new Set(foundCards.map(c => c.name.toLowerCase()))

  const notFound = uniqueNames.filter(name =>
    !foundNames.has(name.toLowerCase())
  )

  const totalCards = parsedCards.reduce((sum, card) => sum + card.quantity, 0)

  return {
    cards: foundCards,
    notFound,
    totalCards
  }
}

/**
 * Obtient les suggestions de terrains pour une combinaison de couleurs
 */
export const getLandSuggestions = async (colors: string[]): Promise<Card[]> => {
  const colorString = colors.sort().join('')
  const cacheKey = `lands_${colorString}`

  if (collectionCache.has(cacheKey)) {
    return collectionCache.get(cacheKey)!
  }

  try {
    // Recherche de terrains basiques et non-basiques
    const queries = [
      `t:land (${colors.map(c => `c:${c}`).join(' OR ')})`,
      `t:land produces:${colors.join('')}`,
      `t:land ${colors.map(c => `produces:${c}`).join(' ')} -t:basic`
    ]

    const allLands: Card[] = []

    for (const query of queries) {
      try {
        const response = await scryfallRequest<ScryfallResponse<ScryfallCard>>(
          `/cards/search?q=${encodeURIComponent(query)}&order=edhrec&dir=desc`
        )

        if (response.data) {
          const lands = response.data
            .slice(0, 20) // Limite à 20 résultats par query
            .map(convertScryfallCard)

          allLands.push(...lands)
        }
      } catch (error) {
        console.warn(`Land search failed for query: ${query}`, error)
      }
    }

    // Déduplique et trie par popularité
    const uniqueLands = Array.from(
      new Map(allLands.map(land => [land.id, land])).values()
    )

    collectionCache.set(cacheKey, uniqueLands)
    return uniqueLands

  } catch (error) {
    console.error('Land suggestions failed:', error)
    return []
  }
}

/**
 * Vide le cache (utile pour les tests ou le refresh)
 */
export const clearCache = (): void => {
  cardCache.clear()
  collectionCache.clear()
}

/**
 * Stats du cache
 */
export const getCacheStats = () => {
  return {
    cardCacheSize: cardCache.size,
    collectionCacheSize: collectionCache.size,
    totalCachedItems: cardCache.size + collectionCache.size
  }
}

// =============================================================================
// LAND-SPECIFIC FUNCTIONS
// =============================================================================

/** Extended land data for land detection system */
export interface ScryfallLandData {
  id: string
  name: string
  type_line: string
  oracle_text?: string
  produced_mana?: string[]
  layout: string
  keywords?: string[]
  card_faces?: Array<{
    name: string
    type_line: string
    oracle_text?: string
    mana_cost?: string
    colors?: string[]
  }>
}

/** Cache for land-specific data */
const landDataCache = new Map<string, ScryfallLandData | null>()

/**
 * Fetch land-specific data from Scryfall with oracle_text and card_faces.
 * This is optimized for the land detection system.
 *
 * @param cardName - The exact card name to look up
 * @returns Land data or null if not found or not a land
 */
export const fetchLandData = async (cardName: string): Promise<ScryfallLandData | null> => {
  const cacheKey = cardName.toLowerCase().trim()

  // Check cache first
  if (landDataCache.has(cacheKey)) {
    return landDataCache.get(cacheKey) ?? null
  }

  try {
    await ensureRateLimit()

    const encodedName = encodeURIComponent(cardName.trim())
    const response = await fetch(`${SCRYFALL_API_BASE}/cards/named?exact=${encodedName}`)

    if (!response.ok) {
      // Try fuzzy search as fallback
      const fuzzyResponse = await fetch(`${SCRYFALL_API_BASE}/cards/named?fuzzy=${encodedName}`)

      if (!fuzzyResponse.ok) {
        landDataCache.set(cacheKey, null)
        return null
      }

      const data = await fuzzyResponse.json()
      return processLandData(data, cacheKey)
    }

    const data = await response.json()
    return processLandData(data, cacheKey)

  } catch (error) {
    console.warn(`[Scryfall] Failed to fetch land data for "${cardName}":`, error)
    landDataCache.set(cacheKey, null)
    return null
  }
}

/**
 * Process and cache Scryfall response for land data
 */
const processLandData = (data: ScryfallCard, cacheKey: string): ScryfallLandData | null => {
  // Check if it's a land
  const isLand = data.type_line?.toLowerCase().includes('land') ||
    data.card_faces?.some(face => face.type_line?.toLowerCase().includes('land'))

  if (!isLand) {
    landDataCache.set(cacheKey, null)
    return null
  }

  const landData: ScryfallLandData = {
    id: data.id,
    name: data.name,
    type_line: data.type_line,
    oracle_text: data.oracle_text,
    produced_mana: data.produced_mana,
    layout: data.layout,
    keywords: data.keywords,
    card_faces: data.card_faces?.map(face => ({
      name: face.name,
      type_line: face.type_line,
      oracle_text: face.oracle_text,
      mana_cost: face.mana_cost,
      colors: face.colors
    }))
  }

  landDataCache.set(cacheKey, landData)
  return landData
}

/**
 * Batch fetch land data for multiple cards.
 * Uses the collection endpoint for efficiency.
 *
 * @param cardNames - Array of card names to look up
 * @returns Map of card names to their land data (or null if not a land)
 */
export const fetchLandDataBatch = async (
  cardNames: string[]
): Promise<Map<string, ScryfallLandData | null>> => {
  const results = new Map<string, ScryfallLandData | null>()
  const toFetch: string[] = []

  // Check cache first
  for (const name of cardNames) {
    const cacheKey = name.toLowerCase().trim()
    if (landDataCache.has(cacheKey)) {
      results.set(name, landDataCache.get(cacheKey) ?? null)
    } else {
      toFetch.push(name)
    }
  }

  if (toFetch.length === 0) {
    return results
  }

  try {
    await ensureRateLimit()

    const identifiers = toFetch.map(name => ({ name: name.trim() }))

    const response = await fetch(`${SCRYFALL_API_BASE}/cards/collection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifiers })
    })

    if (!response.ok) {
      throw new Error(`Scryfall collection API error: ${response.status}`)
    }

    const data: ScryfallResponse<ScryfallCard> = await response.json()

    // Process found cards
    for (const card of data.data || []) {
      const landData = processLandData(card, card.name.toLowerCase().trim())
      results.set(card.name, landData)
    }

    // Mark not found cards
    const foundNames = new Set((data.data || []).map(c => c.name.toLowerCase()))
    for (const name of toFetch) {
      if (!foundNames.has(name.toLowerCase())) {
        landDataCache.set(name.toLowerCase().trim(), null)
        results.set(name, null)
      }
    }

  } catch (error) {
    console.error('[Scryfall] Batch land data fetch failed:', error)

    // Fallback: fetch individually
    for (const name of toFetch) {
      if (!results.has(name)) {
        const landData = await fetchLandData(name)
        results.set(name, landData)
      }
    }
  }

  return results
}

/**
 * Clear the land data cache
 */
export const clearLandDataCache = (): void => {
  landDataCache.clear()
}

/**
 * Get land data cache stats
 */
export const getLandDataCacheStats = () => {
  let lands = 0
  let nonLands = 0

  for (const value of landDataCache.values()) {
    if (value === null) {
      nonLands++
    } else {
      lands++
    }
  }

  return { total: landDataCache.size, lands, nonLands }
}
