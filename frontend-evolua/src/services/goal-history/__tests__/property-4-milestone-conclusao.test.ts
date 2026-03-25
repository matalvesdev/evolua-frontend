/**
 * Teste de Propriedade 4: Milestone de Conclusão Automático
 *
 * **Property 4: Milestone de Conclusão Automático**
 * **Validates: Requirement 1.5**
 *
 * Para qualquer meta que atinge progress=100%, verificar que um milestone
 * 'completed' é criado. E que quando nenhum snapshot atinge 100%, nenhum
 * milestone 'completed' é criado.
 */

import * as fc from 'fast-check'
import { TrendAnalyzer } from '@/services/goal-history/trend-analyzer'
import type { GoalProgressSnapshot } from '@/types/evolution-history'

// ============================================================================
// Arbitrários (geradores fast-check)
// ============================================================================

/** Gera um snapshot base com campos comuns */
const baseSnapshotArb = fc.record({
  id: fc.uuid(),
  goalId: fc.uuid(),
  therapistId: fc.uuid(),
  notes: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
})

/**
 * Gera uma sequência de snapshots onde o penúltimo tem progress < 100
 * e o último tem progress = 100 (transição para conclusão).
 * Todos os snapshots compartilham o mesmo goalId.
 */
const snapshotsWithCompletionArb = fc
  .tuple(
    baseSnapshotArb, // usado para goalId e therapistId compartilhados
    fc.array(
      fc.record({
        id: fc.uuid(),
        progress: fc.integer({ min: 0, max: 99 }),
        createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-06-30') }),
      }),
      { minLength: 0, maxLength: 8 }
    ),
    // penúltimo snapshot: progress < 100
    fc.record({
      id: fc.uuid(),
      progress: fc.integer({ min: 0, max: 99 }),
      createdAt: fc.date({ min: new Date('2024-07-01'), max: new Date('2024-11-30') }),
    }),
    // último snapshot: progress = 100
    fc.record({
      id: fc.uuid(),
      createdAt: fc.date({ min: new Date('2024-12-01'), max: new Date('2024-12-31') }),
    })
  )
  .map(([base, middle, penultimate, last]) => {
    const goalId = base.goalId
    const therapistId = base.therapistId

    const middleSnapshots: GoalProgressSnapshot[] = middle.map((s) => ({
      id: s.id,
      goalId,
      therapistId,
      progress: s.progress,
      createdAt: s.createdAt,
    }))

    const penultimateSnapshot: GoalProgressSnapshot = {
      id: penultimate.id,
      goalId,
      therapistId,
      progress: penultimate.progress,
      createdAt: penultimate.createdAt,
    }

    const lastSnapshot: GoalProgressSnapshot = {
      id: last.id,
      goalId,
      therapistId,
      progress: 100,
      createdAt: last.createdAt,
    }

    return {
      snapshots: [...middleSnapshots, penultimateSnapshot, lastSnapshot] as GoalProgressSnapshot[],
      completingSnapshot: lastSnapshot,
    }
  })

/**
 * Gera uma sequência de snapshots onde NENHUM snapshot tem progress=100.
 * Garante pelo menos 1 snapshot.
 */
const snapshotsWithoutCompletionArb = fc
  .tuple(
    baseSnapshotArb,
    fc.array(
      fc.record({
        id: fc.uuid(),
        progress: fc.integer({ min: 0, max: 99 }),
        createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
      }),
      { minLength: 1, maxLength: 10 }
    )
  )
  .map(([base, snapshots]) => {
    return snapshots.map((s) => ({
      id: s.id,
      goalId: base.goalId,
      therapistId: base.therapistId,
      progress: s.progress,
      createdAt: s.createdAt,
    })) as GoalProgressSnapshot[]
  })

// ============================================================================
// Property 4: Milestone de Conclusão Automático
// Validates: Requirement 1.5
// ============================================================================

describe('Property 4: Milestone de Conclusão Automático (Req 1.5)', () => {
  let analyzer: TrendAnalyzer

  beforeEach(() => {
    analyzer = new TrendAnalyzer()
  })

  it('Property 4a: deve criar exatamente um milestone "completed" quando o último snapshot atinge progress=100', () => {
    fc.assert(
      fc.property(snapshotsWithCompletionArb, ({ snapshots }) => {
        const milestones = analyzer.detectMilestones(snapshots)
        const completedMilestones = milestones.filter((m) => m.type === 'completed')

        // Deve existir exatamente um milestone 'completed'
        expect(completedMilestones).toHaveLength(1)
      }),
      { numRuns: 100 }
    )
  })

  it('Property 4b: NÃO deve criar milestone "completed" quando nenhum snapshot atinge progress=100', () => {
    fc.assert(
      fc.property(snapshotsWithoutCompletionArb, (snapshots) => {
        const milestones = analyzer.detectMilestones(snapshots)
        const completedMilestones = milestones.filter((m) => m.type === 'completed')

        // Não deve existir nenhum milestone 'completed'
        expect(completedMilestones).toHaveLength(0)
      }),
      { numRuns: 100 }
    )
  })

  it('Property 4c: o milestone "completed" deve ter goalId, progress=100 e date corretos', () => {
    fc.assert(
      fc.property(snapshotsWithCompletionArb, ({ snapshots, completingSnapshot }) => {
        const milestones = analyzer.detectMilestones(snapshots)
        const completedMilestone = milestones.find((m) => m.type === 'completed')

        expect(completedMilestone).toBeDefined()
        expect(completedMilestone!.goalId).toBe(completingSnapshot.goalId)
        expect(completedMilestone!.progress).toBe(100)
        expect(completedMilestone!.date).toEqual(completingSnapshot.createdAt)
      }),
      { numRuns: 100 }
    )
  })
})
