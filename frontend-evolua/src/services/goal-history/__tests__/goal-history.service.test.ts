/**
 * Testes unitários para GoalHistoryService
 * Valida: Requisitos 1.1, 1.2
 */

import { GoalHistoryService } from '../goal-history.service'

// Mock do módulo Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

import { createClient } from '@/lib/supabase/client'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

// Helpers para construir o mock do Supabase com encadeamento fluente
function buildRpcMock(result: { data: unknown; error: unknown }) {
  return { rpc: jest.fn().mockResolvedValue(result) }
}

function buildChainMock(result: { data: unknown; error: unknown }) {
  const chain: Record<string, jest.Mock> = {}
  const terminal = jest.fn().mockResolvedValue(result)

  chain.from = jest.fn().mockReturnValue(chain)
  chain.select = jest.fn().mockReturnValue(chain)
  chain.insert = jest.fn().mockReturnValue(chain)
  chain.eq = jest.fn().mockReturnValue(chain)
  chain.in = jest.fn().mockReturnValue(chain)
  chain.order = jest.fn().mockReturnValue(chain)
  chain.single = terminal

  // Tornar o próprio chain "thenable" para casos sem .single()
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve)

  return chain
}

// ============================================================================
// fetchGoalHistory
// ============================================================================

describe('GoalHistoryService.fetchGoalHistory', () => {
  let service: GoalHistoryService

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retorna snapshots mapeados quando goalId é válido', async () => {
    const rpcData = [
      {
        snapshot_id: 'snap-1',
        progress: 50,
        created_at: '2024-01-15T10:00:00Z',
        therapist_id: 'therapist-1',
        notes: 'Boa evolução',
        variation: 10,
        days_since_last: 7
      }
    ]

    mockCreateClient.mockReturnValue(buildRpcMock({ data: rpcData, error: null }) as any)
    service = new GoalHistoryService()

    const result = await service.fetchGoalHistory('goal-123')

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'snap-1',
      goalId: 'goal-123',
      progress: 50,
      therapistId: 'therapist-1',
      notes: 'Boa evolução',
      variation: 10,
      daysSinceLast: 7
    })
    expect(result[0].createdAt).toBeInstanceOf(Date)
  })

  it('retorna array vazio quando não há dados', async () => {
    mockCreateClient.mockReturnValue(buildRpcMock({ data: null, error: null }) as any)
    service = new GoalHistoryService()

    const result = await service.fetchGoalHistory('goal-empty')

    expect(result).toEqual([])
  })

  it('lança erro com mensagem amigável quando goalId é inválido (erro do Supabase)', async () => {
    mockCreateClient.mockReturnValue(
      buildRpcMock({ data: null, error: { message: 'invalid goal id' } }) as any
    )
    service = new GoalHistoryService()

    await expect(service.fetchGoalHistory('goal-invalido')).rejects.toThrow(
      'Não foi possível carregar o histórico da meta'
    )
  })

  it('passa startDate e endDate como ISO string para o RPC', async () => {
    const rpcMock = buildRpcMock({ data: [], error: null })
    mockCreateClient.mockReturnValue(rpcMock as any)
    service = new GoalHistoryService()

    const start = new Date('2024-01-01T00:00:00Z')
    const end = new Date('2024-01-31T23:59:59Z')

    await service.fetchGoalHistory('goal-123', start, end)

    expect(rpcMock.rpc).toHaveBeenCalledWith('get_goal_history_with_stats', {
      p_goal_id: 'goal-123',
      p_start_date: start.toISOString(),
      p_end_date: end.toISOString()
    })
  })

  it('passa null para datas quando não fornecidas', async () => {
    const rpcMock = buildRpcMock({ data: [], error: null })
    mockCreateClient.mockReturnValue(rpcMock as any)
    service = new GoalHistoryService()

    await service.fetchGoalHistory('goal-123')

    expect(rpcMock.rpc).toHaveBeenCalledWith('get_goal_history_with_stats', {
      p_goal_id: 'goal-123',
      p_start_date: null,
      p_end_date: null
    })
  })
})

// ============================================================================
// fetchPatientHistory
// ============================================================================

describe('GoalHistoryService.fetchPatientHistory', () => {
  let service: GoalHistoryService

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retorna snapshots de múltiplas metas do paciente', async () => {
    const goalsData = [{ id: 'goal-1' }, { id: 'goal-2' }]
    const snapshotsData = [
      {
        id: 'snap-1',
        goal_id: 'goal-1',
        progress: 40,
        created_at: '2024-01-10T08:00:00Z',
        therapist_id: 'therapist-1',
        notes: null
      },
      {
        id: 'snap-2',
        goal_id: 'goal-2',
        progress: 70,
        created_at: '2024-01-12T09:00:00Z',
        therapist_id: 'therapist-1',
        notes: 'Progresso excelente'
      }
    ]

    // Primeira chamada: buscar metas; segunda: buscar snapshots
    const fromMock = jest.fn()
    fromMock
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: goalsData, error: null })
        })
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: snapshotsData, error: null })
          })
        })
      })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    const result = await service.fetchPatientHistory('patient-123')

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ id: 'snap-1', goalId: 'goal-1', progress: 40 })
    expect(result[1]).toMatchObject({ id: 'snap-2', goalId: 'goal-2', progress: 70, notes: 'Progresso excelente' })
    expect(result[0].createdAt).toBeInstanceOf(Date)
  })

  it('retorna array vazio quando paciente não tem metas', async () => {
    const fromMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    const result = await service.fetchPatientHistory('patient-sem-metas')

    expect(result).toEqual([])
  })

  it('retorna array vazio quando metas retornam null', async () => {
    const fromMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: null })
      })
    })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    const result = await service.fetchPatientHistory('patient-null')

    expect(result).toEqual([])
  })

  it('lança erro amigável quando busca de metas falha', async () => {
    const fromMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'db error' } })
      })
    })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    await expect(service.fetchPatientHistory('patient-erro')).rejects.toThrow(
      'Não foi possível carregar o histórico do paciente'
    )
  })

  it('lança erro amigável quando busca de snapshots falha', async () => {
    const goalsData = [{ id: 'goal-1' }]

    const fromMock = jest.fn()
    fromMock
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: goalsData, error: null })
        })
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: null, error: { message: 'snapshot error' } })
          })
        })
      })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    await expect(service.fetchPatientHistory('patient-123')).rejects.toThrow(
      'Não foi possível carregar o histórico do paciente'
    )
  })
})

// ============================================================================
// createSnapshot — Requisitos 1.1 e 1.2
// ============================================================================

describe('GoalHistoryService.createSnapshot', () => {
  let service: GoalHistoryService

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('cria snapshot com dados válidos e retorna objeto mapeado (Req 1.1, 1.2)', async () => {
    const insertedRow = {
      id: 'snap-new',
      goal_id: 'goal-123',
      progress: 75,
      created_at: '2024-02-01T12:00:00Z',
      therapist_id: 'therapist-1',
      notes: 'Sessão produtiva'
    }

    const singleMock = jest.fn().mockResolvedValue({ data: insertedRow, error: null })
    const fromMock = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ single: singleMock })
      })
    })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    const dto = {
      goalId: 'goal-123',
      progress: 75,
      therapistId: 'therapist-1',
      notes: 'Sessão produtiva'
    }

    const result = await service.createSnapshot(dto)

    expect(result).toMatchObject({
      id: 'snap-new',
      goalId: 'goal-123',
      progress: 75,
      therapistId: 'therapist-1',
      notes: 'Sessão produtiva'
    })
    expect(result.createdAt).toBeInstanceOf(Date)
  })

  it('insere na tabela goal_progress_history (Req 1.2)', async () => {
    const insertedRow = {
      id: 'snap-new',
      goal_id: 'goal-abc',
      progress: 30,
      created_at: '2024-02-01T12:00:00Z',
      therapist_id: 'therapist-2',
      notes: null
    }

    const insertMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: insertedRow, error: null })
      })
    })
    const fromMock = jest.fn().mockReturnValue({ insert: insertMock })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    await service.createSnapshot({ goalId: 'goal-abc', progress: 30, therapistId: 'therapist-2' })

    // Verifica que a tabela correta foi usada
    expect(fromMock).toHaveBeenCalledWith('goal_progress_history')
    // Verifica que os campos corretos foram inseridos
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        goal_id: 'goal-abc',
        progress: 30,
        therapist_id: 'therapist-2'
      })
    )
  })

  it('lança erro amigável quando dados são inválidos (erro do Supabase)', async () => {
    const singleMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'invalid data' } })
    const fromMock = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ single: singleMock })
      })
    })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    await expect(
      service.createSnapshot({ goalId: '', progress: -1, therapistId: '' })
    ).rejects.toThrow('Não foi possível criar o snapshot de progresso')
  })

  it('cria snapshot sem notes (campo opcional)', async () => {
    const insertedRow = {
      id: 'snap-no-notes',
      goal_id: 'goal-123',
      progress: 20,
      created_at: '2024-02-05T08:00:00Z',
      therapist_id: 'therapist-1',
      notes: null
    }

    const fromMock = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: insertedRow, error: null })
        })
      })
    })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    const result = await service.createSnapshot({
      goalId: 'goal-123',
      progress: 20,
      therapistId: 'therapist-1'
    })

    expect(result.notes).toBeFalsy()
  })
})

// ============================================================================
// fetchMilestones
// ============================================================================

describe('GoalHistoryService.fetchMilestones', () => {
  let service: GoalHistoryService

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retorna milestones mapeados para goalId válido', async () => {
    const milestonesData = [
      {
        id: 'ms-1',
        goal_id: 'goal-123',
        type: 'started',
        date: '2024-01-01T00:00:00Z',
        progress: 0,
        description: 'Meta iniciada',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'ms-2',
        goal_id: 'goal-123',
        type: 'completed',
        date: '2024-03-01T00:00:00Z',
        progress: 100,
        description: 'Meta concluída',
        created_at: '2024-03-01T00:00:00Z'
      }
    ]

    const fromMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: milestonesData, error: null })
        })
      })
    })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    const result = await service.fetchMilestones('goal-123')

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      id: 'ms-1',
      goalId: 'goal-123',
      type: 'started',
      progress: 0,
      description: 'Meta iniciada'
    })
    expect(result[0].date).toBeInstanceOf(Date)
    expect(result[0].createdAt).toBeInstanceOf(Date)
  })

  it('retorna array vazio quando não há milestones', async () => {
    const fromMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    const result = await service.fetchMilestones('goal-empty')
    expect(result).toEqual([])
  })

  it('lança erro amigável quando Supabase retorna erro', async () => {
    const fromMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: null, error: { message: 'db error' } })
        })
      })
    })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    await expect(service.fetchMilestones('goal-erro')).rejects.toThrow(
      'Não foi possível carregar os marcos da meta'
    )
  })
})

// ============================================================================
// createMilestone
// ============================================================================

describe('GoalHistoryService.createMilestone', () => {
  let service: GoalHistoryService

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('cria milestone com dados válidos e retorna objeto mapeado', async () => {
    const insertedRow = {
      id: 'ms-new',
      goal_id: 'goal-123',
      type: 'significant_increase',
      date: '2024-02-15T10:00:00Z',
      progress: 50,
      description: 'Mudança significativa: +25%',
      created_at: '2024-02-15T10:00:00Z'
    }

    const singleMock = jest.fn().mockResolvedValue({ data: insertedRow, error: null })
    const fromMock = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ single: singleMock })
      })
    })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    const dto = {
      goalId: 'goal-123',
      type: 'significant_increase' as const,
      date: new Date('2024-02-15T10:00:00Z'),
      progress: 50,
      description: 'Mudança significativa: +25%'
    }

    const result = await service.createMilestone(dto)

    expect(result).toMatchObject({
      id: 'ms-new',
      goalId: 'goal-123',
      type: 'significant_increase',
      progress: 50,
      description: 'Mudança significativa: +25%'
    })
    expect(result.date).toBeInstanceOf(Date)
    expect(result.createdAt).toBeInstanceOf(Date)
  })

  it('insere na tabela goal_milestones', async () => {
    const insertedRow = {
      id: 'ms-new',
      goal_id: 'goal-abc',
      type: 'completed',
      date: '2024-03-01T00:00:00Z',
      progress: 100,
      description: 'Meta concluída',
      created_at: '2024-03-01T00:00:00Z'
    }

    const insertMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: insertedRow, error: null })
      })
    })
    const fromMock = jest.fn().mockReturnValue({ insert: insertMock })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    await service.createMilestone({
      goalId: 'goal-abc',
      type: 'completed',
      date: new Date('2024-03-01T00:00:00Z'),
      progress: 100,
      description: 'Meta concluída'
    })

    expect(fromMock).toHaveBeenCalledWith('goal_milestones')
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        goal_id: 'goal-abc',
        type: 'completed',
        progress: 100
      })
    )
  })

  it('lança erro amigável quando Supabase retorna erro', async () => {
    const singleMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'constraint violation' } })
    const fromMock = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ single: singleMock })
      })
    })

    mockCreateClient.mockReturnValue({ from: fromMock } as any)
    service = new GoalHistoryService()

    await expect(
      service.createMilestone({
        goalId: 'goal-123',
        type: 'started',
        date: new Date(),
        progress: 0,
        description: 'Meta iniciada'
      })
    ).rejects.toThrow('Não foi possível criar o marco')
  })
})
