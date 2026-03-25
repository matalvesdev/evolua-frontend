/**
 * Testes de Propriedade para TrendAnalyzer.calculateAverageWeeklyRate()
 *
 * **Property 10: Cálculo de Taxa Semanal de Progresso**
 * **Validates: Requirement 4.6**
 *
 * Para qualquer conjunto de snapshots, verifica que:
 *   - taxa semanal = totalVariação / semanas
 */

import { TrendAnalyzer } from '../trend-analyzer'
import type { GoalProgressSnapshot } from '@/types/evolution-history'

// ============================================================================
// Helpers
// ============================================================================

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeSnapshot(progress: number, date: Date): GoalProgressSnapshot {
  return {
    id: generateUUID(),
    goalId: generateUUID(),
    progress,
    createdAt: date,
    therapistId: generateUUID(),
  }
}

/** Cria data exatamente N semanas após a data base */
function addWeeks(base: Date, weeks: number): Date {
  return new Date(base.getTime() + weeks * 7 * 24 * 60 * 60 * 1000)
}

// ============================================================================
// Property 10: Cálculo de Taxa Semanal de Progresso
// Validates: Requirement 4.6
// ============================================================================

describe('Property 10: Cálculo de Taxa Semanal de Progresso (Req 4.6)', () => {
  const ITERATIONS = 100
  let analyzer: TrendAnalyzer

  beforeEach(() => {
    analyzer = new TrendAnalyzer()
  })

  // --------------------------------------------------------------------------
  // Property 10a: < 2 snapshots → taxa = 0
  // --------------------------------------------------------------------------
  it('10a: deve retornar 0 para menos de 2 snapshots', () => {
    // Caso vazio
    expect(analyzer.calculateAverageWeeklyRate([])).toBe(0)

    // Caso com exatamente 1 snapshot (100 iterações com progresso aleatório)
    for (let i = 0; i < ITERATIONS; i++) {
      const progress = randomInt(0, 100)
      const snapshot = makeSnapshot(progress, new Date())
      expect(analyzer.calculateAverageWeeklyRate([snapshot])).toBe(0)
    }
  })

  // --------------------------------------------------------------------------
  // Property 10b: 2+ snapshots exatamente N semanas apart → taxa = totalVariação / N
  // --------------------------------------------------------------------------
  it('10b: deve calcular taxa = (lastProgress - firstProgress) / N para N semanas exatas', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const firstProgress = randomInt(0, 90)
      const lastProgress = randomInt(0, 100)
      const weeks = randomInt(1, 26) // 1 a 26 semanas

      const firstDate = new Date(2024, 0, 1) // data fixa para evitar flutuações
      const lastDate = addWeeks(firstDate, weeks)

      const snapshots = [
        makeSnapshot(firstProgress, firstDate),
        makeSnapshot(lastProgress, lastDate),
      ]

      const rate = analyzer.calculateAverageWeeklyRate(snapshots)
      const expectedRate = (lastProgress - firstProgress) / weeks

      expect(rate).toBeCloseTo(expectedRate, 10)
    }
  })

  // --------------------------------------------------------------------------
  // Property 10c: snapshots dentro da mesma semana (< 7 dias) → taxa = 0
  // --------------------------------------------------------------------------
  it('10c: deve retornar 0 quando snapshots estão dentro da mesma semana (< 7 dias)', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const firstProgress = randomInt(0, 100)
      const lastProgress = randomInt(0, 100)

      // Diferença de 0 a 6 dias (menos de 1 semana completa)
      const daysApart = randomInt(0, 6)
      const firstDate = new Date(2024, 0, 1)
      const lastDate = new Date(firstDate.getTime() + daysApart * 24 * 60 * 60 * 1000)

      const snapshots = [
        makeSnapshot(firstProgress, firstDate),
        makeSnapshot(lastProgress, lastDate),
      ]

      const rate = analyzer.calculateAverageWeeklyRate(snapshots)
      expect(rate).toBe(0)
    }
  })

  // --------------------------------------------------------------------------
  // Property 10d: sinal da taxa corresponde à direção da mudança de progresso
  // --------------------------------------------------------------------------
  it('10d: sinal da taxa deve corresponder à direção da mudança de progresso', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const firstProgress = randomInt(0, 100)
      const lastProgress = randomInt(0, 100)
      const weeks = randomInt(1, 12)

      const firstDate = new Date(2024, 0, 1)
      const lastDate = addWeeks(firstDate, weeks)

      const snapshots = [
        makeSnapshot(firstProgress, firstDate),
        makeSnapshot(lastProgress, lastDate),
      ]

      const rate = analyzer.calculateAverageWeeklyRate(snapshots)
      const variation = lastProgress - firstProgress

      if (variation > 0) {
        expect(rate).toBeGreaterThan(0)
      } else if (variation < 0) {
        expect(rate).toBeLessThan(0)
      } else {
        expect(rate).toBe(0)
      }
    }
  })
})
