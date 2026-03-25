/**
 * Testes de Propriedade para TrendAnalyzer
 *
 * **Property 9: Classificação de Tendências**
 * **Validates: Requirements 4.2, 4.3, 4.4**
 *
 * Para qualquer par de valores de progresso inicial/final dentro de um período de 30 dias:
 *   - Se (finalProgress - initialProgress) >= 10  → deve classificar como "improvement"
 *   - Se (finalProgress - initialProgress) <= -10 → deve classificar como "regression"
 *   - Se -10 < (finalProgress - initialProgress) < 10 → deve classificar como "stagnation"
 */

import { TrendAnalyzer } from '../trend-analyzer'
import type { GoalProgressSnapshot } from '@/types/evolution-history'

// ============================================================================
// Geradores de dados aleatórios
// ============================================================================

/** Gera um UUID v4 simples para testes */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** Gera um inteiro aleatório no intervalo [min, max] (inclusive) */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Cria um par de snapshots dentro de um período de `periodDays` dias.
 * O snapshot inicial é criado `daysAgo` dias atrás e o final é criado
 * `1` dia atrás, ambos dentro do período.
 */
function makeSnapshotPair(
  initialProgress: number,
  finalProgress: number,
  periodDays: number
): GoalProgressSnapshot[] {
  const goalId = generateUUID()
  const therapistId = generateUUID()

  // Snapshot inicial: entre (periodDays - 1) e 2 dias atrás
  const initialDaysAgo = randomInt(2, periodDays - 1)
  const initialDate = new Date()
  initialDate.setDate(initialDate.getDate() - initialDaysAgo)

  // Snapshot final: 1 dia atrás (mais recente que o inicial)
  const finalDate = new Date()
  finalDate.setDate(finalDate.getDate() - 1)

  return [
    {
      id: generateUUID(),
      goalId,
      progress: initialProgress,
      createdAt: initialDate,
      therapistId,
    },
    {
      id: generateUUID(),
      goalId,
      progress: finalProgress,
      createdAt: finalDate,
      therapistId,
    },
  ]
}

// ============================================================================
// Property 9: Classificação de Tendências
// Validates: Requirements 4.2, 4.3, 4.4
// ============================================================================

describe('Property 9: Classificação de Tendências (Req 4.2, 4.3, 4.4)', () => {
  const ITERATIONS = 100
  const PERIOD_DAYS = 30
  let analyzer: TrendAnalyzer

  beforeEach(() => {
    analyzer = new TrendAnalyzer()
  })

  it('deve classificar como "improvement" quando variação >= 10 (Req 4.2)', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      // Garante variação >= 10: initial em [0, 90], final = initial + delta onde delta in [10, 100-initial]
      const initialProgress = randomInt(0, 90)
      const maxDelta = 100 - initialProgress
      const delta = randomInt(10, maxDelta)
      const finalProgress = initialProgress + delta

      const snapshots = makeSnapshotPair(initialProgress, finalProgress, PERIOD_DAYS)
      const result = analyzer.analyzeTrend(snapshots, PERIOD_DAYS)

      expect(result).toBe('improvement')
    }
  })

  it('deve classificar como "regression" quando variação <= -10 (Req 4.4)', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      // Garante variação <= -10: initial em [10, 100], final = initial - delta onde delta in [10, initial]
      const initialProgress = randomInt(10, 100)
      const delta = randomInt(10, initialProgress)
      const finalProgress = initialProgress - delta

      const snapshots = makeSnapshotPair(initialProgress, finalProgress, PERIOD_DAYS)
      const result = analyzer.analyzeTrend(snapshots, PERIOD_DAYS)

      expect(result).toBe('regression')
    }
  })

  it('deve classificar como "stagnation" quando -10 < variação < 10 (Req 4.3)', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      // Garante variação em (-10, 10): initial em [10, 90], delta in [-9, 9]
      const initialProgress = randomInt(10, 90)
      const delta = randomInt(-9, 9)
      const finalProgress = initialProgress + delta

      const snapshots = makeSnapshotPair(initialProgress, finalProgress, PERIOD_DAYS)
      const result = analyzer.analyzeTrend(snapshots, PERIOD_DAYS)

      expect(result).toBe('stagnation')
    }
  })

  it('deve classificar corretamente para qualquer par aleatório de progresso (0-100)', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const initialProgress = randomInt(0, 100)
      const finalProgress = randomInt(0, 100)
      const variation = finalProgress - initialProgress

      const snapshots = makeSnapshotPair(initialProgress, finalProgress, PERIOD_DAYS)
      const result = analyzer.analyzeTrend(snapshots, PERIOD_DAYS)

      if (variation >= 10) {
        expect(result).toBe('improvement')
      } else if (variation <= -10) {
        expect(result).toBe('regression')
      } else {
        expect(result).toBe('stagnation')
      }
    }
  })

  it('deve classificar como "improvement" no limite exato de +10 (boundary)', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const initialProgress = randomInt(0, 90)
      const finalProgress = initialProgress + 10 // variação exatamente 10

      const snapshots = makeSnapshotPair(initialProgress, finalProgress, PERIOD_DAYS)
      const result = analyzer.analyzeTrend(snapshots, PERIOD_DAYS)

      expect(result).toBe('improvement')
    }
  })

  it('deve classificar como "regression" no limite exato de -10 (boundary)', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const initialProgress = randomInt(10, 100)
      const finalProgress = initialProgress - 10 // variação exatamente -10

      const snapshots = makeSnapshotPair(initialProgress, finalProgress, PERIOD_DAYS)
      const result = analyzer.analyzeTrend(snapshots, PERIOD_DAYS)

      expect(result).toBe('regression')
    }
  })

  it('deve classificar como "stagnation" nos limites internos (+9 e -9)', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const initialProgress = randomInt(9, 91)
      // Alterna entre +9 e -9
      const delta = i % 2 === 0 ? 9 : -9
      const finalProgress = initialProgress + delta

      const snapshots = makeSnapshotPair(initialProgress, finalProgress, PERIOD_DAYS)
      const result = analyzer.analyzeTrend(snapshots, PERIOD_DAYS)

      expect(result).toBe('stagnation')
    }
  })
})
