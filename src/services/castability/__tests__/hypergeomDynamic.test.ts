/**
 * Hypergeom dynamic capacity tests.
 *
 * Regression guard for the 2026-04-12 fix: the singleton used to be
 * constructed with maxN=200, which meant any deck size > 200 produced NaN
 * (out-of-bounds Float64Array read). Cube, Commander casual, and Highlander
 * formats were silently broken.
 */

import { describe, it, expect } from 'vitest'
import { Hypergeom, hypergeom, clampProbability } from '../hypergeom'

describe('Hypergeom dynamic capacity', () => {
  it('grows the log-factorial table on demand for N > initial capacity', () => {
    const h = new Hypergeom(50) // start small
    // Request a deck far above initial capacity
    const p = h.atLeast(540, 100, 7, 2)
    expect(Number.isFinite(p)).toBe(true)
    expect(p).toBeGreaterThan(0)
    expect(p).toBeLessThanOrEqual(1)
  })

  it('Cube (540 cards) returns a finite probability', () => {
    const p = hypergeom.atLeast(540, 180, 10, 3)
    expect(Number.isFinite(p)).toBe(true)
    expect(p).toBeGreaterThan(0)
    expect(p).toBeLessThanOrEqual(1)
  })

  it('Commander deck (100 cards) still works after dynamic growth', () => {
    const p = hypergeom.pmf(100, 38, 7, 3)
    expect(Number.isFinite(p)).toBe(true)
    expect(p).toBeGreaterThan(0)
  })

  it('standard 60-card hot path unaffected', () => {
    const p = hypergeom.atLeast(60, 14, 7, 1)
    expect(Number.isFinite(p)).toBe(true)
    // Karsten 14 sources for 1 pip turn 1 ≈ 86% on the play
    expect(p).toBeGreaterThan(0.8)
  })

  it('re-growth keeps prior calls correct (no off-by-one after resize)', () => {
    const h = new Hypergeom(40)
    const pSmall = h.atLeast(40, 10, 7, 1)
    expect(Number.isFinite(pSmall)).toBe(true)
    // Now grow to 300
    const pBig = h.atLeast(300, 50, 7, 1)
    expect(Number.isFinite(pBig)).toBe(true)
    // Re-query the small case — must still be stable
    const pSmallAgain = h.atLeast(40, 10, 7, 1)
    expect(pSmallAgain).toBeCloseTo(pSmall, 10)
  })
})

describe('clampProbability (NaN-safe)', () => {
  it('collapses NaN to 0', () => {
    expect(clampProbability(NaN)).toBe(0)
  })
  it('collapses Infinity to 0', () => {
    expect(clampProbability(Infinity)).toBe(0)
    expect(clampProbability(-Infinity)).toBe(0)
  })
  it('clamps negatives to 0', () => {
    expect(clampProbability(-0.5)).toBe(0)
  })
  it('clamps > 1 to 1', () => {
    expect(clampProbability(1.2)).toBe(1)
  })
  it('preserves valid probabilities', () => {
    expect(clampProbability(0.73)).toBe(0.73)
  })
})

describe('Hypergeom NaN-safety (invalid inputs return 0)', () => {
  it('pmf returns 0 for NaN N', () => {
    expect(hypergeom.pmf(NaN, 10, 7, 1)).toBe(0)
  })
  it('pmf returns 0 for negative N', () => {
    expect(hypergeom.pmf(-60, 10, 7, 1)).toBe(0)
  })
  it('atLeast returns 0 for NaN kMin', () => {
    expect(hypergeom.atLeast(60, 14, 7, NaN)).toBe(0)
  })
  it('atLeastOneCopy returns 0 for empty deck', () => {
    expect(hypergeom.atLeastOneCopy(0, 4, 7)).toBe(0)
  })
  it('atLeastOneCopy returns 0 when no copies', () => {
    expect(hypergeom.atLeastOneCopy(60, 0, 7)).toBe(0)
  })
})
