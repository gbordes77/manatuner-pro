/**
 * cleanCardName tests — covers the 2026-04-12 parser fixes:
 * 1. MTGA double-face split (// → front face only)
 * 2. Arena markers (*CMDR*, *F*, *E*, *CMP*)
 * 3. Unicode whitespace
 * 4. Collector number + set code
 * 5. A- rebalanced prefix
 *
 * The function is private on DeckAnalyzer, so we access it via a dedicated
 * public helper. If the implementation becomes a free function later, update
 * the import — the tests themselves stay valid.
 */

import { describe, it, expect } from 'vitest'
import { DeckAnalyzer } from '../deckAnalyzer'

// TypeScript `private` is a compile-time annotation — at runtime the method
// is a normal static on DeckAnalyzer. Bracket access bypasses the visibility
// check and lets us test the private surface without changing the class.
const clean = (name: string): string =>
  (DeckAnalyzer as unknown as Record<string, (n: string) => string>)['cleanCardName'](name)

describe('cleanCardName', () => {
  describe('MTGA set codes + collector numbers', () => {
    it('strips "(SET) 123"', () => {
      expect(clean('Lightning Bolt (M21) 199')).toBe('Lightning Bolt')
    })
    it('strips "(SET) 123a"', () => {
      expect(clean('Wrenn and Six (MH1) 207a')).toBe('Wrenn and Six')
    })
    it('strips "(SET) 123" with trailing whitespace', () => {
      expect(clean('Llanowar Elves (FDN) 227  ')).toBe('Llanowar Elves')
    })
    it('handles lowercase set code', () => {
      expect(clean('Lightning Bolt (m21) 199')).toBe('Lightning Bolt')
    })
  })

  describe('Double-faced / adventure / split cards (// separator)', () => {
    it('takes front face of DFC', () => {
      // Scryfall `exact=` rejects the full "// Back" form for DFCs.
      // This was the single biggest parser bug (pre-2026-04-12).
      expect(clean('Fable of the Mirror-Breaker // Reflection of Kiki-Jiki')).toBe(
        'Fable of the Mirror-Breaker'
      )
    })
    it('takes front face of adventure card', () => {
      expect(clean('Bonecrusher Giant // Stomp')).toBe('Bonecrusher Giant')
    })
    it('takes front face of split card', () => {
      expect(clean('Wear // Tear')).toBe('Wear')
    })
    it('handles DFC with set code', () => {
      expect(clean('Fable of the Mirror-Breaker // Reflection of Kiki-Jiki (NEO) 141')).toBe(
        'Fable of the Mirror-Breaker'
      )
    })
    it('handles no spaces around //', () => {
      expect(clean('Wear//Tear')).toBe('Wear')
    })
  })

  describe('Arena markers', () => {
    it('strips *CMDR* marker', () => {
      expect(clean('Atraxa, Grand Unifier *CMDR*')).toBe('Atraxa, Grand Unifier')
    })
    it('strips *F* foil marker', () => {
      expect(clean('Lightning Bolt *F*')).toBe('Lightning Bolt')
    })
    it('strips *E* etched marker', () => {
      expect(clean('Snapcaster Mage *E*')).toBe('Snapcaster Mage')
    })
    it('strips *CMP* companion marker', () => {
      expect(clean('Lurrus of the Dream-Den *CMP*')).toBe('Lurrus of the Dream-Den')
    })
    it('strips combined markers', () => {
      expect(clean("Yuriko, the Tiger's Shadow *CMDR* (NEO) 299")).toBe(
        "Yuriko, the Tiger's Shadow"
      )
    })
  })

  describe('Arena rebalanced A- prefix', () => {
    it('strips A- prefix', () => {
      expect(clean('A-Teferi, Master of Time')).toBe('Teferi, Master of Time')
    })
  })

  describe('Unicode whitespace', () => {
    it('normalizes non-breaking space', () => {
      // nbsp = U+00A0
      expect(clean('Lightning\u00A0Bolt')).toBe('Lightning Bolt')
    })
    it('normalizes ideographic space', () => {
      expect(clean('Lightning\u3000Bolt')).toBe('Lightning Bolt')
    })
    it('collapses multiple internal spaces', () => {
      expect(clean('Lightning    Bolt')).toBe('Lightning Bolt')
    })
  })

  describe('Regression: edge cases', () => {
    it('handles plain name', () => {
      expect(clean('Lightning Bolt')).toBe('Lightning Bolt')
    })
    it('handles name with comma', () => {
      expect(clean('Jace, the Mind Sculptor')).toBe('Jace, the Mind Sculptor')
    })
    it('handles name with apostrophe', () => {
      expect(clean("Urza's Saga")).toBe("Urza's Saga")
    })
  })
})
