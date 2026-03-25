/**
 * Teste de Propriedade 3: Snapshot Inicial em Criação de Meta
 *
 * **Property 3: Snapshot Inicial**
 * **Validates: Requirement 1.4**
 *
 * Para qualquer nova meta criada, verificar que um snapshot inicial com
 * progress=0% gera um milestone 'started'. E que quando o primeiro snapshot
 * tem progress > 0, nenhum milestone 'started' é criado.
 */

import * as fc from 'fast-check'
import { TrendAnalyzer } from '@/services/goal-history/trend-analyzer'
import type { GoalProgressSnapshot } from '@/types/evolution-history'

// ============================================================================
// Arbitrários (geradores fast-check)
// ============================================================================

/** Gera um snapshot com progress=0 (snapshot inicial de criação de meta) */
const initialSnapshotArb = fc.record<GoalProgressSnapshot>({
  id: fc.uuid(),
  goalId: fc.uuid(),
  progress: fc.constant(0),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
  therapistId: fc.uuid(),
  notes: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
})

/** Gera um snapshot com progress > 0 */
const nonZeroSnapshotArb = fc.record<GoalProgressSnapshot>({
  id: fc.uuid(),
  goalId: fc.uuid(),
  progress: fc.integer({ min: 1, max: 100 }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
  therapistId: fc.uuid(),
  notes: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
})

/**
 * Gera um array de snapshots onde o primeiro tem progress=0.
 * Os snapshots subsequentes têm datas posteriores ao primeiro.
 */
const snapshotsWithZeroFirstArb = fc
  .tuple(
    initialSnapshotArb,
    fc.array(
      fc.record<GoalProgressSnapshot>({
        id: fc.uuid(),
        goalId: fc.uuid(),
        progress: fc.integer({ min: 0, max: 100 }),
        createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        therapistId: fc.uuid(),
        notes: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
      }),
      { minLength: 0, maxLength: 10 }
    )
  )
  .map(([first, rest]) => {
    // Garante que os snapshots subsequentes têm datas posteriores ao primeiro
    const subsequentSnapshots = rest.map((s) => ({
      ...s,
      goalId: first.goalId,
      therapistId: first.therapistId,
      createdAt: new Date(first.createdAt.getTime() + Math.abs(s.createdAt.getTime() - first.createdAt.getTime()) + 1000),
    }))
    return [first, ...subsequentSnapshots] as GoalProgressSnapshot[]
  })

/**
 * Gera um array de snapshots onde o primeiro tem progress > 0.
 */
const snapshotsWithNonZeroFirstArb = fc
  .tuple(
    nonZeroSnapshotArb,
    fc.array(
      fc.record<GoalProgressSnapshot>({
        id: fc.uuid(),
        goalId: fc.uuid(),
        progress: fc.integer({ min: 0, max: 100 }),
        createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        therapistId: fc.uuid(),
        notes: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
      }),
      { minLength: 0, maxLength: 10 }
    )
  )
  .map(([first, rest]) => {
    const subsequentSnapshots = rest.map((s) => ({
      ...s,
      goalId: first.goalId,
      therapistId: first.therapistId,
      createdAt: new Date(first.createdAt.getTime() + Math.abs(s.createdAt.getTime() - first.createdAt.getTime()) + 1000),
    }))
    return [first, ...subsequentSnapshots] as GoalProgressSnapshot[]
  })

// ============================================================================
// Property 3: Snapshot Inicial
// Validates: Requirement 1.4
// ============================================================================

describe('Property 3: Snapshot Inicial em Criação de Meta (Req 1.4)', () => {
  let analyzer: TrendAnalyzer

  beforeEach(() => {
    analyzer = new TrendAnalyzer()
  })

  it('deve criar milestone "started" quando o primeiro snapshot tem progress=0', () => {
    fc.assert(
      fc.property(snapshotsWithZeroFirstArb, (snapshots) => {
        const milestones = analyzer.detectMilestones(snapshots)
        const startedMilestones = milestones.filter((m) => m.type === 'started')

        // Deve existir exatamente um milestone 'started'
        expect(startedMilestones).toHaveLength(1)

        // O milestone 'started' deve ter progress=0
        expect(startedMilestones[0].progress).toBe(0)
      }),
      { numRuns: 100 }
    )
  })

  it('NÃO deve criar milestone "started" quando o primeiro snapshot tem progress > 0', () => {
    fc.assert(
      fc.property(snapshotsWithNonZeroFirstArb, (snapshots) => {
        const milestones = analyzer.detectMilestones(snapshots)
        const startedMilestones = milestones.filter((m) => m.type === 'started')

        // Não deve existir nenhum milestone 'started'
        expect(startedMilestones).toHaveLength(0)
      }),
      { numRuns: 100 }
    )
  })

  it('deve criar milestone "started" com os dados corretos do snapshot inicial', () => {
    fc.assert(
      fc.property(initialSnapshotArb, (firstSnapshot) => {
        const milestones = analyzer.detectMilestones([firstSnapshot])
        const startedMilestone = milestones.find((m) => m.type === 'started')

        expect(startedMilestone).toBeDefined()
        expect(startedMilestone!.goalId).toBe(firstSnapshot.goalId)
        expect(startedMilestone!.progress).toBe(0)
        expect(startedMilestone!.date).toEqual(firstSnapshot.createdAt)
      }),
      { numRuns: 100 }
    )
  })
})
