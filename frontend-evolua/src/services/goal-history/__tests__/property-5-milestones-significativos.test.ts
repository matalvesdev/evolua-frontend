/**
 * Teste de Propriedade 5: Detecção Automática de Milestones Significativos
 *
 * **Property 5: Detecção Automática de Milestones Significativos**
 * **Validates: Requirement 3.2**
 *
 * Para qualquer variação de progresso >= 20% (valor absoluto) entre snapshots
 * consecutivos, verificar que um milestone 'significant_increase' ou
 * 'significant_decrease' é criado com os dados corretos.
 */

import * as fc from 'fast-check'
import { TrendAnalyzer } from '@/services/goal-history/trend-analyzer'
import type { GoalProgressSnapshot } from '@/types/evolution-history'

// ============================================================================
// Arbitrários (geradores fast-check)
// ============================================================================

/** Gera campos base compartilhados entre snapshots */
const sharedBaseArb = fc.record({
  goalId: fc.uuid(),
  therapistId: fc.uuid(),
})

/**
 * Gera um par de snapshots onde a variação é >= 20 (aumento significativo).
 * Datas distintas garantem ordenação correta.
 */
const significantIncreaseArb = sharedBaseArb.chain((base) =>
  fc
    .tuple(
      // prev: progress tal que current pode ser prev + variation, com variation >= 20
      fc.integer({ min: 0, max: 80 }),
      fc.integer({ min: 20, max: 100 }),
      fc.uuid(), // id prev
      fc.uuid(), // id current
      fc.date({ min: new Date('2020-01-01'), max: new Date('2023-12-31') }), // data prev
      fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }), // data current (posterior)
    )
    .filter(([prevProgress, variation]) => prevProgress + variation <= 100)
    .map(([prevProgress, variation, prevId, currentId, prevDate, currentDate]) => {
      const currentProgress = prevProgress + variation
      const prev: GoalProgressSnapshot = {
        id: prevId,
        goalId: base.goalId,
        therapistId: base.therapistId,
        progress: prevProgress,
        createdAt: prevDate,
      }
      const current: GoalProgressSnapshot = {
        id: currentId,
        goalId: base.goalId,
        therapistId: base.therapistId,
        progress: currentProgress,
        createdAt: currentDate,
      }
      return { snapshots: [prev, current], prev, current, variation }
    })
)

/**
 * Gera um par de snapshots onde a variação é <= -20 (diminuição significativa).
 */
const significantDecreaseArb = sharedBaseArb.chain((base) =>
  fc
    .tuple(
      fc.integer({ min: 20, max: 100 }), // prevProgress >= 20 para permitir queda
      fc.integer({ min: 20, max: 100 }), // magnitude da queda
      fc.uuid(),
      fc.uuid(),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2023-12-31') }),
      fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
    )
    .filter(([prevProgress, magnitude]) => prevProgress - magnitude >= 0)
    .map(([prevProgress, magnitude, prevId, currentId, prevDate, currentDate]) => {
      const currentProgress = prevProgress - magnitude
      const prev: GoalProgressSnapshot = {
        id: prevId,
        goalId: base.goalId,
        therapistId: base.therapistId,
        progress: prevProgress,
        createdAt: prevDate,
      }
      const current: GoalProgressSnapshot = {
        id: currentId,
        goalId: base.goalId,
        therapistId: base.therapistId,
        progress: currentProgress,
        createdAt: currentDate,
      }
      return { snapshots: [prev, current], prev, current, variation: -magnitude }
    })
)

/**
 * Gera um par de snapshots onde |variação| < 20 (sem milestone significativo).
 */
const insignificantVariationArb = sharedBaseArb.chain((base) =>
  fc
    .tuple(
      fc.integer({ min: 0, max: 100 }),
      fc.integer({ min: -19, max: 19 }), // variação pequena
      fc.uuid(),
      fc.uuid(),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2023-12-31') }),
      fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
    )
    .filter(([prevProgress, variation]) => {
      const currentProgress = prevProgress + variation
      return currentProgress >= 0 && currentProgress <= 100
    })
    .map(([prevProgress, variation, prevId, currentId, prevDate, currentDate]) => {
      const currentProgress = prevProgress + variation
      const prev: GoalProgressSnapshot = {
        id: prevId,
        goalId: base.goalId,
        therapistId: base.therapistId,
        progress: prevProgress,
        createdAt: prevDate,
      }
      const current: GoalProgressSnapshot = {
        id: currentId,
        goalId: base.goalId,
        therapistId: base.therapistId,
        progress: currentProgress,
        createdAt: currentDate,
      }
      return { snapshots: [prev, current], prev, current, variation }
    })
)

// ============================================================================
// Property 5: Detecção Automática de Milestones Significativos
// Validates: Requirement 3.2
// ============================================================================

describe('Property 5: Detecção Automática de Milestones Significativos (Req 3.2)', () => {
  let analyzer: TrendAnalyzer

  beforeEach(() => {
    analyzer = new TrendAnalyzer()
  })

  it('Property 5a: deve criar milestone "significant_increase" quando variação >= 20', () => {
    fc.assert(
      fc.property(significantIncreaseArb, ({ snapshots }) => {
        const milestones = analyzer.detectMilestones(snapshots)
        const significantIncrease = milestones.filter((m) => m.type === 'significant_increase')

        expect(significantIncrease.length).toBeGreaterThanOrEqual(1)
      }),
      { numRuns: 100 }
    )
  })

  it('Property 5b: deve criar milestone "significant_decrease" quando variação <= -20', () => {
    fc.assert(
      fc.property(significantDecreaseArb, ({ snapshots }) => {
        const milestones = analyzer.detectMilestones(snapshots)
        const significantDecrease = milestones.filter((m) => m.type === 'significant_decrease')

        expect(significantDecrease.length).toBeGreaterThanOrEqual(1)
      }),
      { numRuns: 100 }
    )
  })

  it('Property 5c: NÃO deve criar milestone significativo quando |variação| < 20', () => {
    fc.assert(
      fc.property(insignificantVariationArb, ({ snapshots }) => {
        const milestones = analyzer.detectMilestones(snapshots)
        const significantMilestones = milestones.filter(
          (m) => m.type === 'significant_increase' || m.type === 'significant_decrease'
        )

        expect(significantMilestones).toHaveLength(0)
      }),
      { numRuns: 100 }
    )
  })

  it('Property 5d: o milestone significativo deve ter goalId, progress e date corretos', () => {
    fc.assert(
      fc.property(
        fc.oneof(significantIncreaseArb, significantDecreaseArb),
        ({ snapshots, current, variation }) => {
          const milestones = analyzer.detectMilestones(snapshots)
          const expectedType =
            variation > 0 ? 'significant_increase' : 'significant_decrease'
          const significantMilestone = milestones.find((m) => m.type === expectedType)

          expect(significantMilestone).toBeDefined()
          expect(significantMilestone!.goalId).toBe(current.goalId)
          expect(significantMilestone!.progress).toBe(current.progress)
          expect(significantMilestone!.date).toEqual(current.createdAt)
        }
      ),
      { numRuns: 100 }
    )
  })
})
