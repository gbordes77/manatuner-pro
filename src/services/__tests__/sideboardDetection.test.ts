import { describe, test, expect } from 'vitest'
import { detectSideboardStartLine } from '../deckAnalyzer'

describe('detectSideboardStartLine', () => {
  // Helper: generate N card lines like "4 Card Name N"
  const makeCardLines = (count: number, startIdx = 1): string[] => {
    const lines: string[] = []
    let remaining = count
    let idx = startIdx
    while (remaining > 0) {
      const qty = Math.min(4, remaining)
      lines.push(`${qty} Test Card ${idx}`)
      remaining -= qty
      idx++
    }
    return lines
  }

  test('detects explicit "Sideboard" marker', () => {
    const lines = [...makeCardLines(60), 'Sideboard', ...makeCardLines(15, 100)]
    const result = detectSideboardStartLine(lines)
    expect(result).toBe(makeCardLines(60).length) // index of "Sideboard" line
  })

  test('detects explicit "Sideboard:" marker (with colon)', () => {
    const lines = [...makeCardLines(60), 'Sideboard:', ...makeCardLines(15, 100)]
    const result = detectSideboardStartLine(lines)
    expect(result).toBe(makeCardLines(60).length)
  })

  test('detects "// Sideboard" marker', () => {
    const lines = [...makeCardLines(60), '// Sideboard', ...makeCardLines(15, 100)]
    const result = detectSideboardStartLine(lines)
    expect(result).toBe(makeCardLines(60).length)
  })

  test('detects "SB:" marker', () => {
    const lines = [...makeCardLines(60), 'SB:', ...makeCardLines(15, 100)]
    const result = detectSideboardStartLine(lines)
    expect(result).toBe(makeCardLines(60).length)
  })

  test('detects "# Sideboard" marker', () => {
    const lines = [...makeCardLines(60), '# Sideboard', ...makeCardLines(15, 100)]
    const result = detectSideboardStartLine(lines)
    expect(result).toBe(makeCardLines(60).length)
  })

  test('detects inline "SB: 2 Card Name" prefix', () => {
    const mainLines = makeCardLines(60)
    const lines = [...mainLines, 'SB: 2 Rest in Peace', 'SB: 3 Tishana Tidebinder']
    const result = detectSideboardStartLine(lines)
    expect(result).toBe(mainLines.length)
  })

  test('detects sideboard via blank-line separation (60 main + 15 side)', () => {
    const mainLines = makeCardLines(60)
    const sideLines = makeCardLines(15, 100)
    const lines = [...mainLines, '', ...sideLines]
    const result = detectSideboardStartLine(lines)
    expect(result).toBe(mainLines.length) // index of blank line
  })

  test('detects sideboard via blank-line with MTGA format (set codes)', () => {
    const lines = [
      '4 Bitter Triumph (LCI) 91',
      '4 Watery Grave (GRN) 259',
      '3 Day of Black Sun (TLA) 94',
      '2 Undercity Sewers (PZA) 0',
      '10 Swamp (ZNR) 382',
      '4 Restless Reef (LCI) 282',
      '2 Insatiable Avarice (OTJ) 91',
      '4 Gloomlake Verge (DSK) 260',
      '3 Duress (XLN) 105',
      '4 Requiting Hex (ECL) 116',
      '4 Doomsday Excruciator (DSK) 94',
      '3 Stock Up (DFT) 67',
      '4 Kavaero, Mind-Bitten (OM1) 140',
      '4 Deceit (ECL) 212',
      '1 Deadly Cover-Up (MKM) 83',
      '2 Cavern of Souls (LCI) 269',
      '2 Winternight Stories (TDM) 67',
      '', // blank line = sideboard separator
      '1 Duress (XLN) 105',
      '1 Deadly Cover-Up (MKM) 83',
      '4 Oildeep Gearhulk (DFT) 215',
      '2 Flashfreeze (FDN) 590',
      '1 Intimidation Tactics (DFT) 92',
      "2 Cruelclaw's Heist (BLB) 88",
      '2 Quantum Riddler (EOE) 72',
      '2 Strategic Betrayal (TDM) 94',
    ]

    const result = detectSideboardStartLine(lines)
    expect(result).toBe(17) // index of the blank line

    // Count cards before and after
    const mainCards = lines.slice(0, 17).reduce((sum, l) => {
      const m = l.match(/^(\d+)\s/)
      return sum + (m ? parseInt(m[1]) : 0)
    }, 0)
    const sideCards = lines.slice(18).reduce((sum, l) => {
      const m = l.match(/^(\d+)\s/)
      return sum + (m ? parseInt(m[1]) : 0)
    }, 0)
    expect(mainCards).toBe(60)
    expect(sideCards).toBe(15)
  })

  test('detects sideboard with Jeskai example (explicit Sideboard marker)', () => {
    const lines = [
      '2 Cori Mountain Monastery',
      '1 Sacred Foundry',
      '4 Sunbillow Verge',
      '1 Wan Shi Tong, Librarian',
      '2 Riverpyre Verge',
      '1 Island',
      '4 No More Lies',
      '3 Three Steps Ahead',
      '4 Lightning Helix',
      '2 Day of Judgment',
      '4 Hallowed Fountain',
      '3 Stock Up',
      '3 Jeskai Revelation',
      '4 Meticulous Archive',
      '4 Get Lost',
      '4 Floodfarm Verge',
      '2 Ultima',
      '1 Plains',
      '4 Consult the Star Charts',
      '2 Seam Rip',
      '1 Spell Snare',
      '4 Steam Vents',
      'Sideboard',
      '2 Wan Shi Tong, Librarian',
      '1 Disdainful Stroke',
      '2 Pyroclasm',
      "3 Tishana's Tidebinder",
      '2 Annul',
      '2 Rest in Peace',
      '1 The Unagi of Kyoshi Island',
      "1 Elspeth's Smite",
      '1 Beza, the Bounding Spring',
    ]

    const result = detectSideboardStartLine(lines)
    expect(result).toBe(22) // index of "Sideboard" line
  })

  test('returns -1 when no sideboard is present', () => {
    const lines = makeCardLines(60)
    const result = detectSideboardStartLine(lines)
    expect(result).toBe(-1)
  })

  test('returns -1 for a deck with only 20 cards (limited pool, not main+side)', () => {
    const lines = [...makeCardLines(20), '', ...makeCardLines(5, 100)]
    const result = detectSideboardStartLine(lines)
    // 20 cards is below the 40-card minimum for main deck heuristic
    expect(result).toBe(-1)
  })

  test('handles multiple blank lines — picks the correct split', () => {
    const mainPart1 = makeCardLines(30)
    const mainPart2 = makeCardLines(30, 50)
    const sideLines = makeCardLines(15, 100)
    // Blank line in the middle of main deck AND between main/side
    const lines = [...mainPart1, '', ...mainPart2, '', ...sideLines]
    const result = detectSideboardStartLine(lines)
    // Should pick the LAST blank line that produces a valid 60/15 split
    const expectedSplitIdx = mainPart1.length + 1 + mainPart2.length
    expect(result).toBe(expectedSplitIdx)
  })

  test('handles case-insensitive sideboard markers', () => {
    const lines = [...makeCardLines(60), 'SIDEBOARD', ...makeCardLines(15, 100)]
    const result = detectSideboardStartLine(lines)
    expect(result).toBe(makeCardLines(60).length)
  })

  test('handles Commander deck (100 cards)', () => {
    const mainLines = makeCardLines(100)
    const sideLines = makeCardLines(10, 200)
    const lines = [...mainLines, '', ...sideLines]
    const result = detectSideboardStartLine(lines)
    expect(result).toBe(mainLines.length) // blank line index
  })
})
