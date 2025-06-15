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
  rarity: string
  set: string
  image_uris?: {
    small?: string
    normal?: string
    large?: string
  }
  card_faces?: ScryfallCard[]
  layout: string
  produced_mana?: string[]
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
  const isLand = scryfallCard.type_line.toLowerCase().includes('land')
  
  return {
    id: scryfallCard.id,
    name: scryfallCard.name,
    manaCost: scryfallCard.mana_cost || undefined,
    cmc: scryfallCard.cmc,
    colors: scryfallCard.colors,
    colorIdentity: scryfallCard.color_identity,
    type: scryfallCard.type_line,
    types: scryfallCard.type_line.split(' — ')[0].split(' '),
    subtypes: scryfallCard.type_line.includes(' — ') 
      ? scryfallCard.type_line.split(' — ')[1].split(' ')
      : undefined,
    rarity: scryfallCard.rarity,
    setCode: scryfallCard.set,
    imageUris: scryfallCard.image_uris,
    faces: scryfallCard.card_faces?.map(convertScryfallCard),
    layout: scryfallCard.layout,
    isLand,
    producedMana: scryfallCard.produced_mana
  }
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
 * Recherche une carte by name
 */
export const searchCardByName = async (name: string): Promise<Card | null> => {
  const cacheKey = name.toLowerCase().trim()
  
  if (cardCache.has(cacheKey)) {
    return cardCache.get(cacheKey)!
  }
  
  try {
    const encodedName = encodeURIComponent(name)
    const response = await scryfallRequest<ScryfallCard>(`/cards/named?fuzzy=${encodedName}`)
    
    const card = convertScryfallCard(response)
    cardCache.set(cacheKey, card)
    
    return card
  } catch (error) {
    console.warn(`Card not found: ${name}`, error)
    return null
  }
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