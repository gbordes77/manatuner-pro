import { describe, it, expect } from 'vitest'
import { 
  calculateHypergeometric, 
  calculateProbabilityByTurn,
  analyzeDeckConsistency,
  calculateOptimalLandCount
} from '../manaCalculator'

describe('ManaCalculator', () => {
  describe('calculateHypergeometric', () => {
    it('should calculate correct probability for turn 1 land drop', () => {
      const result = calculateHypergeometric({
        deckSize: 60,
        successStates: 24, // lands in deck
        sampleSize: 7, // cards in opening hand
        successesWanted: 1 // lands needed
      })
      
      // With 24 lands in 60 cards, probability of getting at least 1 land in 7 cards
      // Real probability is ~0.978 (mathematical precision) not 0.94
      expect(result).toBeCloseTo(0.978, 2)
    })

    it('should calculate correct probability for 2 lands by turn 2', () => {
      const result = calculateHypergeometric({
        deckSize: 60,
        successStates: 24,
        sampleSize: 8, // 7 + 1 draw
        successesWanted: 2
      })
      
      // Real probability is ~0.910 (mathematical precision) 
      expect(result).toBeCloseTo(0.910, 2)
    })

    it('should handle edge cases correctly', () => {
      // No lands in deck
      const noLands = calculateHypergeometric({
        deckSize: 60,
        successStates: 0,
        sampleSize: 7,
        successesWanted: 1
      })
      expect(noLands).toBe(0)

      // All lands
      const allLands = calculateHypergeometric({
        deckSize: 60,
        successStates: 60,
        sampleSize: 7,
        successesWanted: 1
      })
      expect(allLands).toBe(1)
    })
  })

  describe('calculateProbabilityByTurn', () => {
    const mockDeck = {
      cards: [
        { name: 'Lightning Bolt', quantity: 4, manaCost: '{R}' },
        { name: 'Counterspell', quantity: 4, manaCost: '{U}{U}' },
        { name: 'Mountain', quantity: 12 },
        { name: 'Island', quantity: 12 }
      ],
      totalCards: 32
    }

    it('should calculate probabilities for multiple turns', () => {
      const result = calculateProbabilityByTurn(mockDeck, 4)
      
      expect(result).toHaveLength(4)
      expect(result[0].turn).toBe(1)
      expect(result[3].turn).toBe(4)
      
      // Probabilities should increase over turns
      expect(result[1].probability).toBeGreaterThan(result[0].probability)
      expect(result[2].probability).toBeGreaterThan(result[1].probability)
    })

    it('should handle different mana requirements', () => {
      const redDeck = {
        cards: [
          { name: 'Lightning Bolt', quantity: 4, manaCost: '{R}' },
          { name: 'Mountain', quantity: 20 }
        ],
        totalCards: 24
      }

      const result = calculateProbabilityByTurn(redDeck, 2)
      
      expect(result[0].probability).toBeGreaterThan(0.8) // High chance for 1 red
    })
  })

  describe('analyzeDeckConsistency', () => {
    const balanced60CardDeck = {
      cards: [
        { name: 'Lightning Bolt', quantity: 4, manaCost: '{R}' },
        { name: 'Counterspell', quantity: 4, manaCost: '{U}{U}' },
        { name: 'Shock', quantity: 4, manaCost: '{R}' },
        { name: 'Negate', quantity: 4, manaCost: '{1}{U}' },
        { name: 'Steam Vents', quantity: 4 },
        { name: 'Mountain', quantity: 10 },
        { name: 'Island', quantity: 10 },
        { name: 'Scalding Tarn', quantity: 4 },
        { name: 'Spirebluff Canal', quantity: 4 },
        { name: 'Mystic Confluence', quantity: 4, manaCost: '{3}{U}{U}' },
        { name: 'Fireball', quantity: 4, manaCost: '{X}{R}' },
        { name: 'Brainstorm', quantity: 4, manaCost: '{U}' },
        { name: 'Mana Leak', quantity: 4, manaCost: '{1}{U}' },
        { name: 'Pyroblast', quantity: 2, manaCost: '{R}' }
      ],
      totalCards: 60
    }

    it('should analyze deck consistency correctly', () => {
      const result = analyzeDeckConsistency(balanced60CardDeck)
      
      expect(result.overallScore).toBeGreaterThan(0.7) // Should be fairly consistent
      expect(result.landRatio).toBeCloseTo(0.4, 1) // 24/60 = 0.4
      expect(result.colorBalance).toBeDefined()
      expect(result.recommendations).toBeInstanceOf(Array)
    })

    it('should identify mana problems', () => {
      const manaScrewedDeck = {
        cards: [
          { name: 'Lightning Bolt', quantity: 4, manaCost: '{R}' },
          { name: 'Counterspell', quantity: 4, manaCost: '{U}{U}' },
          { name: 'Mountain', quantity: 2 }, // Too few lands
          { name: 'Island', quantity: 2 }
        ],
        totalCards: 12
      }

      const result = analyzeDeckConsistency(manaScrewedDeck)
      
      expect(result.overallScore).toBeLessThan(0.5) // Poor consistency
      expect(result.recommendations).toContain(
        expect.stringMatching(/land/i)
      )
    })

    it('should handle hybrid and X costs', () => {
      const hybridDeck = {
        cards: [
          { name: 'Boros Charm', quantity: 4, manaCost: '{R/W}{R/W}' },
          { name: 'Fireball', quantity: 4, manaCost: '{X}{R}' },
          { name: 'Sacred Foundry', quantity: 4 },
          { name: 'Mountain', quantity: 8 },
          { name: 'Plains', quantity: 8 }
        ],
        totalCards: 28
      }

      const result = analyzeDeckConsistency(hybridDeck)
      
      expect(result.overallScore).toBeDefined()
      expect(result.hybridManaHandling).toBeTruthy()
    })
  })

  describe('calculateOptimalLandCount', () => {
    it('should suggest optimal land count for aggro deck', () => {
      const aggroDeck = {
        cards: [
          { name: 'Lightning Bolt', quantity: 4, manaCost: '{R}' },
          { name: 'Goblin Guide', quantity: 4, manaCost: '{R}' },
          { name: 'Rift Bolt', quantity: 4, manaCost: '{2}{R}' }
        ],
        averageCMC: 1.3,
        deckSize: 60
      }

      const result = calculateOptimalLandCount(aggroDeck)
      
      expect(result.recommended).toBeLessThanOrEqual(22) // Aggro wants fewer lands
      expect(result.range.min).toBeGreaterThanOrEqual(18)
      expect(result.range.max).toBeLessThanOrEqual(24)
    })

    it('should suggest optimal land count for control deck', () => {
      const controlDeck = {
        cards: [
          { name: 'Counterspell', quantity: 4, manaCost: '{U}{U}' },
          { name: 'Sphinx of Foresight', quantity: 2, manaCost: '{4}{U}{U}' },
          { name: 'Wrath of God', quantity: 4, manaCost: '{2}{W}{W}' }
        ],
        averageCMC: 3.8,
        deckSize: 60
      }

      const result = calculateOptimalLandCount(controlDeck)
      
      expect(result.recommended).toBeGreaterThanOrEqual(24) // Control wants more lands
      expect(result.range.max).toBeLessThanOrEqual(28)
    })

    it('should adjust for format requirements', () => {
      const commanderDeck = {
        cards: [{ name: 'Commander', quantity: 1, manaCost: '{3}{B}{G}' }],
        averageCMC: 3.2,
        deckSize: 100,
        format: 'commander'
      }

      const result = calculateOptimalLandCount(commanderDeck)
      
      expect(result.recommended).toBeGreaterThanOrEqual(35) // Commander needs more lands
      expect(result.recommended).toBeLessThanOrEqual(40)
    })
  })

  describe('Frank Karsten methodology compliance', () => {
    it('should follow Karsten research for colored mana requirements', () => {
      // Test based on Frank Karsten's "How Many Colored Mana Sources Do You Need to Consistently Cast Your Spells?"
      const deck = {
        cards: [
          { name: 'Lightning Bolt', quantity: 4, manaCost: '{R}' },
          { name: 'Shock', quantity: 4, manaCost: '{R}' },
        ],
        redSources: 14 // 14 red sources in 60 card deck
      }

      // According to Karsten: 14 red sources gives ~90% chance for R on turn 1
      const turn1RedProbability = calculateHypergeometric({
        deckSize: 60,
        successStates: 14,
        sampleSize: 7,
        successesWanted: 1
      })

      expect(turn1RedProbability).toBeGreaterThan(0.85)
      expect(turn1RedProbability).toBeLessThan(0.95)
    })

    it('should handle double colored requirements correctly', () => {
      // For UU on turn 2, Karsten recommends ~20 blue sources
      const doubleBlueByTurn2 = calculateHypergeometric({
        deckSize: 60,
        successStates: 20,
        sampleSize: 8, // 7 + 1 draw
        successesWanted: 2
      })

      expect(doubleBlueByTurn2).toBeGreaterThan(0.85) // Should be reliable
    })
  })
}) 