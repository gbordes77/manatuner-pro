import type { ManaColor } from '../types'

type KarstenColor = Exclude<ManaColor, 'C'>

/**
 * Counts how many pips of `color` appear in a mana cost string.
 * Handles hybrid ({R/G} = 1 pip of R OR G) and phyrexian ({W/P} = 1 W pip).
 *
 * Exported from utils/ so any consumer (KarstenTargetDelta, future CSV
 * exporter, public API, CLI, notebook) shares a single source of truth
 * for pip counting. Do not inline this logic elsewhere.
 */
export function countPipsInCost(cost: string, color: KarstenColor): number {
  if (!cost) return 0
  const symbols = cost.match(/\{[^}]+\}/g) || []
  let count = 0
  for (const sym of symbols) {
    const body = sym.slice(1, -1) // strip braces
    if (body === color) count++
    else if (body.includes('/')) {
      // Hybrid or Phyrexian — contributes 1 pip of color if color is present
      const parts = body.split('/')
      if (parts.includes(color)) count++
    }
  }
  return count
}

export type { KarstenColor }
