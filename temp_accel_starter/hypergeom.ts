// src/castability/hypergeom.ts
// Fast-enough hypergeometric utilities for N<=100 (MTG decks).
// Uses log-factorials to stay numerically stable.

export type PlayDraw = "PLAY" | "DRAW";

export function cardsSeenByTurn(turn: number, playDraw: PlayDraw): number {
  // Convention: starting hand = 7
  // PLAY: no draw on turn 1 => seen = 7 + (turn-1)
  // DRAW: draw on turn 1      => seen = 7 + turn
  if (turn <= 0) return 0;
  return playDraw === "PLAY" ? 7 + Math.max(0, turn - 1) : 7 + turn;
}

function buildLogFactorials(maxN: number): Float64Array {
  const lf = new Float64Array(maxN + 1);
  lf[0] = 0;
  for (let i = 1; i <= maxN; i++) lf[i] = lf[i - 1] + Math.log(i);
  return lf;
}

export class Hypergeom {
  private lf: Float64Array;
  private maxN: number;

  constructor(maxN: number) {
    this.maxN = maxN;
    this.lf = buildLogFactorials(maxN);
  }

  private logChoose(n: number, k: number): number {
    if (k < 0 || k > n) return -Infinity;
    return this.lf[n] - this.lf[k] - this.lf[n - k];
  }

  pmf(N: number, K: number, n: number, k: number): number {
    // P(X=k) where X~Hypergeom(N,K,n)
    if (N < 0 || K < 0 || n < 0) return 0;
    if (K > N || n > N) return 0;
    const kMin = Math.max(0, n - (N - K));
    const kMax = Math.min(K, n);
    if (k < kMin || k > kMax) return 0;

    const logP =
      this.logChoose(K, k) +
      this.logChoose(N - K, n - k) -
      this.logChoose(N, n);

    return Math.exp(logP);
  }

  atLeast(N: number, K: number, n: number, kMin: number): number {
    // P(X >= kMin)
    const kMax = Math.min(K, n);
    if (kMin <= 0) return 1;
    if (kMin > kMax) return 0;
    let sum = 0;
    for (let k = kMin; k <= kMax; k++) sum += this.pmf(N, K, n, k);
    return Math.min(1, Math.max(0, sum));
  }

  atMost(N: number, K: number, n: number, kMax: number): number {
    const kMin = Math.max(0, n - (N - K));
    if (kMax < kMin) return 0;
    let sum = 0;
    for (let k = kMin; k <= Math.min(kMax, K, n); k++) sum += this.pmf(N, K, n, k);
    return Math.min(1, Math.max(0, sum));
  }

  atLeastOneCopy(deckSize: number, copies: number, cardsSeen: number): number {
    if (copies <= 0) return 0;
    // 1 - P(0 copies)
    const p0 = this.pmf(deckSize, copies, cardsSeen, 0);
    return Math.min(1, Math.max(0, 1 - p0));
  }
}
