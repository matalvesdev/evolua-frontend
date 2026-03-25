/**
 * @jest-environment jsdom
 *
 * Testes unitários para EvolutionHistoryPanel
 * Validates: Requirements 6.1, 6.4, 9.4
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import type {
  GoalProgressSnapshot,
  Milestone,
  TrendAnalysis,
} from '@/types/evolution-history'

// ============================================================================
// Mocks
// ============================================================================

// Mock do hook principal
const mockUseEvolutionHistory = jest.fn()

jest.mock('@/hooks/use-evolution-history', () => ({
  useEvolutionHistory: (...args: unknown[]) => mockUseEvolutionHistory(...args),
}))

// Mock dos subcomponentes para manter os testes focados
jest.mock('../skeleton-loader', () => ({
  SkeletonLoader: () => <div data-testid="skeleton-loader">Carregando...</div>,
}))

jest.mock('../error-state', () => ({
  ErrorState: ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div data-testid="error-state">
      <span>{message}</span>
      <button onClick={onRetry}>Tentar novamente</button>
    </div>
  ),
}))

jest.mock('../empty-state', () => ({
  EmptyState: ({ title }: { title: string }) => (
    <div data-testid="empty-state">{title}</div>
  ),
}))

jest.mock('../summary-cards', () => ({
  SummaryCards: () => <div data-testid="summary-cards" />,
}))

jest.mock('../progress-chart', () => ({
  ProgressChart: () => <div data-testid="progress-chart" />,
}))

jest.mock('../trend-badge', () => ({
  TrendBadge: ({ trend }: { trend: string }) => (
    <div data-testid="trend-badge" data-trend={trend} />
  ),
}))

jest.mock('../timeline-component', () => ({
  TimelineComponent: () => <div data-testid="timeline-component" />,
}))

jest.mock('../period-comparator', () => ({
  PeriodComparator: () => <div data-testid="period-comparator" />,
}))

jest.mock('../export-menu', () => ({
  ExportMenu: () => <div data-testid="export-menu" />,
}))

// Import after mocks
import { EvolutionHistoryPanel } from '../evolution-history-panel'

// ============================================================================
// Fixtures
// ============================================================================

const makeSnapshot = (overrides: Partial<GoalProgressSnapshot> = {}): GoalProgressSnapshot => ({
  id: 'snap-1',
  goalId: 'goal-1',
  progress: 50,
  createdAt: new Date('2024-01-15T10:00:00.000Z'),
  therapistId: 'therapist-1',
  ...overrides,
})

const makeMilestone = (overrides: Partial<Milestone> = {}): Milestone => ({
  id: 'milestone-1',
  goalId: 'goal-1',
  type: 'started',
  date: new Date('2024-01-01T10:00:00.000Z'),
  progress: 0,
  description: 'Meta iniciada',
  createdAt: new Date('2024-01-01T10:00:00.000Z'),
  ...overrides,
})

const SNAPSHOTS: GoalProgressSnapshot[] = [
  makeSnapshot({ id: 'snap-1', progress: 30 }),
  makeSnapshot({ id: 'snap-2', progress: 60 }),
]

const MILESTONES: Milestone[] = [makeMilestone()]

const TREND_ANALYSIS: TrendAnalysis = {
  trend: 'improvement',
  averageWeeklyRate: 5,
  periodDays: 30,
  startProgress: 30,
  endProgress: 60,
  totalVariation: 30,
}

const DEFAULT_HOOK_RETURN = {
  snapshots: SNAPSHOTS,
  milestones: MILESTONES,
  trendAnalysis: TREND_ANALYSIS,
  loading: false,
  error: null,
  refetch: jest.fn(),
}

const DEFAULT_PROPS = {
  patientId: 'patient-1',
  isOpen: true,
  onClose: jest.fn(),
}

// ============================================================================
// Tests
// ============================================================================

describe('EvolutionHistoryPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEvolutionHistory.mockReturnValue(DEFAULT_HOOK_RETURN)
  })

  // --------------------------------------------------------------------------
  // 1. Não renderiza quando isOpen=false (Req 6.1)
  // --------------------------------------------------------------------------

  describe('visibilidade do painel', () => {
    it('não renderiza nada quando isOpen é false', () => {
      const { container } = render(
        <EvolutionHistoryPanel {...DEFAULT_PROPS} isOpen={false} />
      )
      expect(container).toBeEmptyDOMElement()
    })

    it('renderiza o painel quando isOpen é true (Req 6.1)', () => {
      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)
      expect(screen.getByText('Histórico de Evolução')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 2. Estado de loading
  // --------------------------------------------------------------------------

  describe('estado de loading', () => {
    it('exibe SkeletonLoader quando loading é true', () => {
      mockUseEvolutionHistory.mockReturnValue({
        ...DEFAULT_HOOK_RETURN,
        loading: true,
        snapshots: [],
      })

      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)

      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument()
    })

    it('não exibe conteúdo principal durante loading', () => {
      mockUseEvolutionHistory.mockReturnValue({
        ...DEFAULT_HOOK_RETURN,
        loading: true,
        snapshots: [],
      })

      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)

      expect(screen.queryByTestId('progress-chart')).not.toBeInTheDocument()
      expect(screen.queryByTestId('summary-cards')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 3. Estado de erro
  // --------------------------------------------------------------------------

  describe('estado de erro', () => {
    it('exibe ErrorState quando error está definido', () => {
      mockUseEvolutionHistory.mockReturnValue({
        ...DEFAULT_HOOK_RETURN,
        loading: false,
        error: 'Erro ao carregar histórico',
        snapshots: [],
      })

      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)

      expect(screen.getByTestId('error-state')).toBeInTheDocument()
      expect(screen.getByText('Erro ao carregar histórico')).toBeInTheDocument()
    })

    it('não exibe conteúdo principal quando há erro', () => {
      mockUseEvolutionHistory.mockReturnValue({
        ...DEFAULT_HOOK_RETURN,
        loading: false,
        error: 'Erro',
        snapshots: [],
      })

      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)

      expect(screen.queryByTestId('progress-chart')).not.toBeInTheDocument()
    })

    it('chama refetch ao clicar em "Tentar novamente"', () => {
      const mockRefetch = jest.fn()
      mockUseEvolutionHistory.mockReturnValue({
        ...DEFAULT_HOOK_RETURN,
        loading: false,
        error: 'Erro',
        snapshots: [],
        refetch: mockRefetch,
      })

      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)

      fireEvent.click(screen.getByText('Tentar novamente'))
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
  })

  // --------------------------------------------------------------------------
  // 4. Estado vazio
  // --------------------------------------------------------------------------

  describe('estado vazio', () => {
    it('exibe EmptyState quando não há snapshots', () => {
      mockUseEvolutionHistory.mockReturnValue({
        ...DEFAULT_HOOK_RETURN,
        loading: false,
        error: null,
        snapshots: [],
      })

      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('não exibe ProgressChart quando não há snapshots', () => {
      mockUseEvolutionHistory.mockReturnValue({
        ...DEFAULT_HOOK_RETURN,
        loading: false,
        error: null,
        snapshots: [],
      })

      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)

      expect(screen.queryByTestId('progress-chart')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 5. Renderização do conteúdo principal com dados
  // --------------------------------------------------------------------------

  describe('renderização com dados disponíveis', () => {
    it('renderiza SummaryCards quando há snapshots', () => {
      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)
      expect(screen.getByTestId('summary-cards')).toBeInTheDocument()
    })

    it('renderiza ProgressChart quando há snapshots', () => {
      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)
      expect(screen.getByTestId('progress-chart')).toBeInTheDocument()
    })

    it('renderiza TrendBadge quando trendAnalysis está disponível', () => {
      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)
      expect(screen.getByTestId('trend-badge')).toBeInTheDocument()
    })

    it('não renderiza TrendBadge quando trendAnalysis é null', () => {
      mockUseEvolutionHistory.mockReturnValue({
        ...DEFAULT_HOOK_RETURN,
        trendAnalysis: null,
      })

      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)

      expect(screen.queryByTestId('trend-badge')).not.toBeInTheDocument()
    })

    it('renderiza TimelineComponent quando há milestones', () => {
      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)
      expect(screen.getByTestId('timeline-component')).toBeInTheDocument()
    })

    it('não renderiza TimelineComponent quando não há milestones', () => {
      mockUseEvolutionHistory.mockReturnValue({
        ...DEFAULT_HOOK_RETURN,
        milestones: [],
      })

      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)

      expect(screen.queryByTestId('timeline-component')).not.toBeInTheDocument()
    })

    it('renderiza ExportMenu quando há snapshots', () => {
      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)
      expect(screen.getByTestId('export-menu')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 6. Botão de fechar (Req 9.4)
  // --------------------------------------------------------------------------

  describe('botão de fechar', () => {
    it('chama onClose ao clicar no botão de fechar', () => {
      const onClose = jest.fn()
      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} onClose={onClose} />)

      fireEvent.click(screen.getByRole('button', { name: /fechar painel/i }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('chama onClose ao clicar no overlay', () => {
      const onClose = jest.fn()
      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} onClose={onClose} />)

      // O overlay é o div com bg-black/50
      const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50') as HTMLElement
      fireEvent.click(overlay)

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  // --------------------------------------------------------------------------
  // 7. Contexto de meta (Req 6.1, 6.4, 9.4)
  // --------------------------------------------------------------------------

  describe('contexto de meta e navegação (Req 6.1, 6.4, 9.4)', () => {
    it('exibe "Progresso geral do paciente" quando goalId não é fornecido (Req 6.1)', () => {
      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)
      expect(screen.getByText('Progresso geral do paciente')).toBeInTheDocument()
    })

    it('exibe "Meta específica" quando goalId é fornecido (Req 6.4)', () => {
      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} goalId="goal-1" />)
      expect(screen.getByText('Meta específica')).toBeInTheDocument()
    })

    it('passa goalId correto para o hook quando fornecido (Req 6.4)', () => {
      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} goalId="goal-42" />)
      expect(mockUseEvolutionHistory).toHaveBeenCalledWith(
        expect.objectContaining({ goalId: 'goal-42', patientId: 'patient-1' })
      )
    })

    it('passa patientId para o hook mantendo contexto do paciente (Req 9.4)', () => {
      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)
      expect(mockUseEvolutionHistory).toHaveBeenCalledWith(
        expect.objectContaining({ patientId: 'patient-1' })
      )
    })

    it('passa goalId undefined para o hook quando não fornecido (Req 6.1)', () => {
      render(<EvolutionHistoryPanel {...DEFAULT_PROPS} />)
      expect(mockUseEvolutionHistory).toHaveBeenCalledWith(
        expect.objectContaining({ goalId: undefined })
      )
    })
  })
})
