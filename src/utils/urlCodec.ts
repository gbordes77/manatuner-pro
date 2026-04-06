/**
 * URL codec for sharing deck analyses.
 *
 * Encodes a decklist into a compact URL-safe string using base64.
 * Decodes it back on load. Keeps URLs under ~2000 chars for compatibility.
 */

/** Encode a decklist string into a URL-safe base64 param */
export function encodeDeck(deckList: string): string {
  try {
    // TextEncoder → Uint8Array → base64 → URL-safe base64
    const bytes = new TextEncoder().encode(deckList)
    const binary = String.fromCharCode(...bytes)
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch {
    return ''
  }
}

/** Decode a URL-safe base64 param back to a decklist string */
export function decodeDeck(encoded: string): string {
  try {
    // Restore standard base64
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return ''
  }
}

/** Build a shareable URL from current deck state */
export function buildShareUrl(params: {
  deckList: string
  deckName?: string
  tab?: number
}): string {
  const url = new URL(window.location.origin + '/analyzer')
  const encoded = encodeDeck(params.deckList)
  if (!encoded) return ''

  url.searchParams.set('d', encoded)
  if (params.deckName) url.searchParams.set('name', params.deckName)
  if (params.tab !== undefined && params.tab > 0) url.searchParams.set('tab', String(params.tab))

  return url.toString()
}

/** Parse share params from current URL */
export function parseShareParams(): {
  deckList: string
  deckName: string
  tab: number
} | null {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get('d')
  if (!encoded) return null

  const deckList = decodeDeck(encoded)
  if (!deckList) return null

  return {
    deckList,
    deckName: params.get('name') || '',
    tab: parseInt(params.get('tab') || '0', 10) || 0,
  }
}
