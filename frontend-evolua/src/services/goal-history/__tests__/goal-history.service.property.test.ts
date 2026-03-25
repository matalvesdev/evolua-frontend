/**
 * Testes de Propriedade para GoalHistoryService
 *
 * **Property 1: Persistência de Snapshots**
 * **Validates: Requirements 1.1, 1.2**
 *
 * Para qualquer atualização de progresso de meta, quando o Goal_History_Service
 * cria um snapshot, esse snapshot deve ser armazenado no banco de dados e conter
 * todos os campos obrigatórios (id, goalId, progress, createdAt, therapistId).
 */

import { GoalHistoryService } from '../goal-history.service'

// Mock do módulo Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

import { createClient } from '@/lib/supabase/client'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

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

interface SnapshotInput {
  goalId: string
  progress: number
  therapistId: string
}

/** Gera um DTO de snapshot com dados válidos aleatórios */
function generateValidSnapshotInput(): SnapshotInput {
  return {
    goalId: generateUUID(),
    progress: randomInt(0, 100),
    therapistId: generateUUID()
  }
}

/** Constrói o mock do Supabase que simula inserção bem-sucedida */
function buildInsertMock(input: SnapshotInput) {
  const returnedRow = {
    id: generateUUID(),
    goal_id: input.goalId,
    progress: input.progress,
    created_at: new Date().toISOString(),
    therapist_id: input.therapistId,
    notes: null
  }

  const fromMock = jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: returnedRow, error: null })
      })
    })
  })

  return { fromMock, returnedRow }
}

// ============================================================================
// Property 1: Persistência de Snapshots
// Validates: Requirements 1.1, 1.2
// ============================================================================

describe('Property 1: Persistência de Snapshots (Req 1.1, 1.2)', () => {
  const ITERATIONS = 100

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('para qualquer entrada válida, o snapshot retornado contém todos os campos obrigatórios', async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const input = generateValidSnapshotInput()
      const { fromMock } = buildInsertMock(input)

      mockCreateClient.mockReturnValue({ from: fromMock } as any)
      const service = new GoalHistoryService()

      const snapshot = await service.createSnapshot(input)

      // Todos os campos obrigatórios devem estar presentes
      expect(snapshot).toHaveProperty('id')
      expect(snapshot).toHaveProperty('goalId')
      expect(snapshot).toHaveProperty('progress')
      expect(snapshot).toHaveProperty('createdAt')
      expect(snapshot).toHaveProperty('therapistId')

      // Os valores devem corresponder à entrada
      expect(snapshot.goalId).toBe(input.goalId)
      expect(snapshot.progress).toBe(input.progress)
      expect(snapshot.therapistId).toBe(input.therapistId)

      // id deve ser uma string não-vazia
      expect(typeof snapshot.id).toBe('string')
      expect(snapshot.id.length).toBeGreaterThan(0)

      // createdAt deve ser uma instância de Date
      expect(snapshot.createdAt).toBeInstanceOf(Date)
    }
  })

  it('para qualquer progresso no intervalo [0, 100], o campo progress é preservado corretamente', async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const progress = randomInt(0, 100)
      const input: SnapshotInput = {
        goalId: generateUUID(),
        progress,
        therapistId: generateUUID()
      }

      const { fromMock } = buildInsertMock(input)
      mockCreateClient.mockReturnValue({ from: fromMock } as any)
      const service = new GoalHistoryService()

      const snapshot = await service.createSnapshot(input)

      expect(snapshot.progress).toBe(progress)
      expect(snapshot.progress).toBeGreaterThanOrEqual(0)
      expect(snapshot.progress).toBeLessThanOrEqual(100)
    }
  })

  it('para qualquer goalId UUID, o campo goalId é armazenado e retornado sem alteração', async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const goalId = generateUUID()
      const input: SnapshotInput = {
        goalId,
        progress: randomInt(0, 100),
        therapistId: generateUUID()
      }

      const { fromMock } = buildInsertMock(input)
      mockCreateClient.mockReturnValue({ from: fromMock } as any)
      const service = new GoalHistoryService()

      const snapshot = await service.createSnapshot(input)

      expect(snapshot.goalId).toBe(goalId)
    }
  })

  it('para qualquer therapistId UUID, o campo therapistId é armazenado e retornado sem alteração', async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const therapistId = generateUUID()
      const input: SnapshotInput = {
        goalId: generateUUID(),
        progress: randomInt(0, 100),
        therapistId
      }

      const { fromMock } = buildInsertMock(input)
      mockCreateClient.mockReturnValue({ from: fromMock } as any)
      const service = new GoalHistoryService()

      const snapshot = await service.createSnapshot(input)

      expect(snapshot.therapistId).toBe(therapistId)
    }
  })

  it('para qualquer entrada válida, o serviço persiste na tabela goal_progress_history (Req 1.2)', async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const input = generateValidSnapshotInput()

      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: generateUUID(),
              goal_id: input.goalId,
              progress: input.progress,
              created_at: new Date().toISOString(),
              therapist_id: input.therapistId,
              notes: null
            },
            error: null
          })
        })
      })
      const fromMock = jest.fn().mockReturnValue({ insert: insertMock })

      mockCreateClient.mockReturnValue({ from: fromMock } as any)
      const service = new GoalHistoryService()

      await service.createSnapshot(input)

      // Verifica que a tabela correta foi usada (Req 1.2)
      expect(fromMock).toHaveBeenCalledWith('goal_progress_history')

      // Verifica que os campos corretos foram enviados ao banco
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          goal_id: input.goalId,
          progress: input.progress,
          therapist_id: input.therapistId
        })
      )
    }
  })
})
