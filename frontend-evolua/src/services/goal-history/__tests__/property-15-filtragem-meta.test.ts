/**
 * Testes de Propriedade para GoalHistoryService.fetchGoalHistory()
 *
 * **Property 15: Filtragem por Meta Específica**
 * **Validates: Requirement 6.4**
 *
 * Para qualquer goalId, verifica que:
 *   - Todos os snapshots retornados têm goalId === goalId solicitado
 *   - O número de snapshots retornados é igual ao número de linhas do Supabase
 *   - Resposta vazia do Supabase resulta em array vazio
 */

import { GoalHistoryService } from '../goal-history.service'

// Mock do módulo Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

import { createClient } from '@/lib/supabase/client'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

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

/** Gera uma linha raw como retornada pelo Supabase RPC */
function makeRawRow(overrides: Partial<{
  snapshot_id: string
  progress: number
  created_at: string
  therapist_id: string
  notes: string | null
  variation: number | null
  days_since_last: number | null
}> = {}) {
  return {
    snapshot_id: overrides.snapshot_id ?? generateUUID(),
    progress: overrides.progress ?? randomInt(0, 100),
    created_at: overrides.created_at ?? new Date(Date.now() - randomInt(0, 365) * 86400000).toISOString(),
    therapist_id: overrides.therapist_id ?? generateUUID(),
    notes: overrides.notes !== undefined ? overrides.notes : null,
    variation: overrides.variation !== undefined ? overrides.variation : null,
    days_since_last: overrides.days_since_last !== undefined ? overrides.days_since_last : null,
  }
}

/** Gera um array de N linhas raw aleatórias */
function makeRawRows(count: number) {
  return Array.from({ length: count }, () => makeRawRow())
}

/** Configura o mock do Supabase para retornar os dados fornecidos */
function setupRpcMock(data: unknown[] | null, error: unknown = null) {
  const mockRpc = jest.fn().mockResolvedValue({ data, error })
  mockCreateClient.mockReturnValue({ rpc: mockRpc, from: jest.fn() } as any)
  return mockRpc
}

// ============================================================================
// Property 15: Filtragem por Meta Específica
// Validates: Requirement 6.4
// ============================================================================

describe('Property 15: Filtragem por Meta Específica (Req 6.4)', () => {
  const ITERATIONS = 50

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // --------------------------------------------------------------------------
  // Property 15a: Todos os snapshots retornados têm goalId === goalId solicitado
  // --------------------------------------------------------------------------
  it('15a: todos os snapshots retornados devem ter goalId igual ao goalId solicitado', async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const goalId = generateUUID()
      const rowCount = randomInt(0, 20)
      const rows = makeRawRows(rowCount)

      setupRpcMock(rows)
      const service = new GoalHistoryService()

      const snapshots = await service.fetchGoalHistory(goalId)

      for (const snapshot of snapshots) {
        expect(snapshot.goalId).toBe(goalId)
      }
    }
  })

  // --------------------------------------------------------------------------
  // Property 15b: Número de snapshots retornados = número de linhas do Supabase
  // --------------------------------------------------------------------------
  it('15b: número de snapshots retornados deve ser igual ao número de linhas retornadas pelo Supabase', async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const goalId = generateUUID()
      const rowCount = randomInt(0, 30)
      const rows = makeRawRows(rowCount)

      setupRpcMock(rows)
      const service = new GoalHistoryService()

      const snapshots = await service.fetchGoalHistory(goalId)

      expect(snapshots).toHaveLength(rowCount)
    }
  })

  // --------------------------------------------------------------------------
  // Property 15c: Resposta vazia do Supabase resulta em array vazio
  // --------------------------------------------------------------------------
  it('15c: deve retornar array vazio quando Supabase retorna null ou array vazio', async () => {
    // Caso null
    for (let i = 0; i < ITERATIONS; i++) {
      const goalId = generateUUID()

      setupRpcMock(null)
      const serviceNull = new GoalHistoryService()
      const resultNull = await serviceNull.fetchGoalHistory(goalId)
      expect(resultNull).toEqual([])

      jest.clearAllMocks()

      // Caso array vazio
      setupRpcMock([])
      const serviceEmpty = new GoalHistoryService()
      const resultEmpty = await serviceEmpty.fetchGoalHistory(goalId)
      expect(resultEmpty).toEqual([])

      jest.clearAllMocks()
    }
  })
})
