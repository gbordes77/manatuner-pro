import { useState, useCallback, useRef } from 'react'

interface CardImageData {
  imageUrl: string | null
  loading: boolean
  error: boolean
}

// Cache global pour éviter les requêtes répétées
const imageCache = new Map<string, string>()

export const useCardImage = (cardName: string) => {
  const [data, setData] = useState<CardImageData>({
    imageUrl: imageCache.get(cardName) || null,
    loading: false,
    error: false
  })
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()

  const fetchImage = useCallback(async () => {
    // Si déjà en cache, pas besoin de refetch
    if (imageCache.has(cardName)) {
      setData(prev => ({ ...prev, imageUrl: imageCache.get(cardName)! }))
      return
    }

    // Si déjà en cours de chargement, ne pas relancer
    if (data.loading) return

    setData(prev => ({ ...prev, loading: true, error: false }))

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(
        `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`,
        { signal: abortControllerRef.current.signal }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const card = await response.json()
      
      // Priorité : image normale > image des faces de carte > image petite
      const imageUrl = card.image_uris?.normal || 
                      card.card_faces?.[0]?.image_uris?.normal ||
                      card.image_uris?.small ||
                      card.card_faces?.[0]?.image_uris?.small

      if (imageUrl) {
        // Mettre en cache
        imageCache.set(cardName, imageUrl)
        setData({ imageUrl, loading: false, error: false })
      } else {
        throw new Error('No image found')
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error(`Erreur lors du chargement de l'image pour ${cardName}:`, error)
        setData({ imageUrl: null, loading: false, error: true })
      }
    }
  }, [cardName, data.loading])

  const startFetch = useCallback(() => {
    // Délai de 300ms pour éviter le flickering
    timeoutRef.current = setTimeout(() => {
      fetchImage()
    }, 300)
  }, [fetchImage])

  const cancelFetch = useCallback(() => {
    // Annuler le timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Annuler la requête en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    ...data,
    startFetch,
    cancelFetch
  }
} 