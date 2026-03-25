/**
 * @jest-environment jsdom
 *
 * Property 20: Layout Responsivo Mobile
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4
 *
 * Verifica que o EvolutionHistoryPanel adapta seu layout para viewports mobile e desktop.
 */

import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import type {
  GoalProgressSnapshot,
  Milestone,
  TrendAnalysis,
} from '@/types/evolution-history'

// ============================================================================
// Mocks
// ============================================================================

const mockUseEvolutionHistory = jest.fn()

jest.mock('@/hooks/use-evolution-history', () => ({
  useEvolutionHistory: (...args: unknown[]) => mockUseEvolutionHistory(...args),
}))

jest.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: jest.fn(),
}))

jest.mock('../skeleton-loader', () => ({
  SkeletonLoader: () => <div data-testid="skeleton-loader" />,
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
import { useMediaQuery } from '@/hooks/use-media-query'

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>

// ============================================================================
// Fixtures
// ============================================================================

const makeSnapshot = (overrides: Partial<GoalProgressSnapshot> = {}): GoalProgressSnapshot => ({
  id: '1',
  goalId: 'g1',
  progress: 50,
  createdAt: new Date(),
  therapistId: 't1',
  ...overrides,
})

const makeTrendAnalysis = (overrides: Partial<TrendAnalysis> = {}): TrendAnalysis => ({
  trend: 'improvement',
  averageWeeklyRate: 5,
  periodDays: 30,
  startProgress: 0,
  endProgress: 50,
  totalVariation: 50,
  ...overrides,
})

const DEFAULT_PROPS = {
  patientId: 'patient-1',
  isOpen: true,
  onClose: jest.fn(),
}

// Combinações de dados para iteração
const DATA_COMBINATIONS = [
  // Sem goalId, com snapshots
  { goalId: undefined, snapshots: [makeSnapshot()], milestones: [], trendAnalysis: makeTrendAnalysis() },
  // Com goalId, com snapshots
  { goalId: 'goal-1', snapshots: [makeSnapshot({ goalId: 'goal-1' })], milestones: [], trendAnalysis: makeTrendAnalysis() },
  // Múltiplos snapshots
  {
    goalId: 'goal-2',
    snapshots: [makeSnapshot({ id: '1', progress: 20 }), makeSnapshot({ id: '2', progress: 60 })],
    milestones: [],
    trendAnalysis: makeTrendAnalysis({ trend: 'stagnation' }),
  },
  // Progresso 0
  { goalId: undefined, snapshots: [makeSnapshot({ progress: 0 })], milestones: [], trendAnalysis: makeTrendAnalysis({ totalVariation: 0 }) },
  // Progresso 100
  { goalId: 'goal-3', snapshots: [makeSnapshot({ progress: 100 })], milestones: [], trendAnalysis: makeTrendAnalysis({ trend: 'improvement', endProgress: 100 }) },
]

// ============================================================================
// Property 20a: Renderiza sem crash em viewport mobile
// ============================================================================

describe('Property 20a: Renderiza sem crash em viewport mobile (isMobile=true)', () => {
  /**
   * Validates: Requirements 8.1, 8.2
   * Para qualquer dado válido, o painel renderiza sem erros em viewport mobile.
   */
  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza sem crash para todas as combinações de dados em mobile', () => {
    for (const combo of DATA_COMBINATIONS) {
      mockUseEvolutionHistory.mockReturnValue({
        snapshots: combo.snapshots,
        milestones: combo.milestones,
        trendAnalysis: combo.trendAnalysis,
        loading: false,
        error: null,
        refetch: jest.fn(),
      })

      expect(() => {
        const { unmount } = render(
          <EvolutionHistoryPanel
            {...DEFAULT_PROPS}
            goalId={combo.goalId}
            isOpen={true}
          />
        )
        unmount()
      }).not.toThrow()
    }
  })

  it('renderiza sem crash com loading=true em mobile', () => {
    mockUseEvolutionHistory.mockReturnValue({
      snapshots: [],
      milestones: [],
      trendAnalysis: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    })

    expect(() => {
      const { unmount } = render(<EvolutionHistoryPanel {...DEFAULT_PROPS} isOpen={true} />)
      unmount()
    }).not.toThrow()
  })

  it('renderiza sem crash com error em mobile', () => {
    mockUseEvolutionHistory.mockReturnValue({
      snapshots: [],
      milestones: [],
      trendAnalysis: null,
      loading: false,
      error: 'Erro de rede',
      refetch: jest.fn(),
    })

    expect(() => {
      const { unmount } = render(<EvolutionHistoryPanel {...DEFAULT_PROPS} isOpen={true} />)
      unmount()
    }).not.toThrow()
  })
})

// ============================================================================
// Property 20b: Renderiza sem crash em viewport desktop
// ============================================================================

describe('Property 20b: Renderiza sem crash em viewport desktop (isMobile=false)', () => {
  /**
   * Validates: Requirements 8.3, 8.4
   * Para qualquer dado válido, o painel renderiza sem erros em viewport desktop.
   */
  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(false)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza sem crash para todas as combinações de dados em desktop', () => {
    for (const combo of DATA_COMBINATIONS) {
      mockUseEvolutionHistory.mockReturnValue({
        snapshots: combo.snapshots,
        milestones: combo.milestones,
        trendAnalysis: combo.trendAnalysis,
        loading: false,
        error: null,
        refetch: jest.fn(),
      })

      expect(() => {
        const { unmount } = render(
          <EvolutionHistoryPanel
            {...DEFAULT_PROPS}
            goalId={combo.goalId}
            isOpen={true}
          />
        )
        unmount()
      }).not.toThrow()
    }
  })

  it('renderiza sem crash com loading=true em desktop', () => {
    mockUseEvolutionHistory.mockReturnValue({
      snapshots: [],
      milestones: [],
      trendAnalysis: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    })

    expect(() => {
      const { unmount } = render(<EvolutionHistoryPanel {...DEFAULT_PROPS} isOpen={true} />)
      unmount()
    }).not.toThrow()
  })

  it('renderiza sem crash com error em desktop', () => {
    mockUseEvolutionHistory.mockReturnValue({
      snapshots: [],
      milestones: [],
      trendAnalysis: null,
      loading: false,
      error: 'Erro de rede',
      refetch: jest.fn(),
    })

    expect(() => {
      const { unmount } = render(<EvolutionHistoryPanel {...DEFAULT_PROPS} isOpen={true} />)
      unmount()
    }).not.toThrow()
  })
})

// ============================================================================
// Property 20c: Classes CSS mobile (fullscreen: inset-0)
// ============================================================================

describe('Property 20c: Container do painel tem classes CSS mobile (inset-0) em viewport mobile', () => {
  /**
   * Validates: Requirements 8.1, 8.2
   * Em mobile, o painel deve ocupar a tela inteira (inset-0).
   */
  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(true)
    mockUseEvolutionHistory.mockReturnValue({
      snapshots: [makeSnapshot()],
      milestones: [],
      trendAnalysis: makeTrendAnalysis(),
      loading: false,
      error: null,
      refetch: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('o painel contém a classe inset-0 para layout fullscreen em mobile', () => {
    const { container } = render(<EvolutionHistoryPanel {...DEFAULT_PROPS} isOpen={true} />)

    // O painel é o segundo elemento fixed (o primeiro é o overlay)
    const fixedElements = container.querySelectorAll('.fixed')
    // Deve haver pelo menos 2 elementos fixed: overlay e painel
    expect(fixedElements.length).toBeGreaterThanOrEqual(2)

    // O painel (segundo fixed) deve ter inset-0
    const panel = fixedElements[1] as HTMLElement
    expect(panel.className).toContain('inset-0')
  })

  it('a classe inset-0 está presente para todas as combinações de dados em mobile', () => {
    for (const combo of DATA_COMBINATIONS) {
      mockUseEvolutionHistory.mockReturnValue({
        snapshots: combo.snapshots,
        milestones: combo.milestones,
        trendAnalysis: combo.trendAnalysis,
        loading: false,
        error: null,
        refetch: jest.fn(),
      })

      const { container, unmount } = render(
        <EvolutionHistoryPanel {...DEFAULT_PROPS} goalId={combo.goalId} isOpen={true} />
      )

      const fixedElements = container.querySelectorAll('.fixed')
      expect(fixedElements.length).toBeGreaterThanOrEqual(2)

      const panel = fixedElements[1] as HTMLElement
      expect(panel.className).toContain('inset-0')

      unmount()
    }
  })
})

// ============================================================================
// Property 20d: Classes CSS desktop (md:max-w-4xl)
// ============================================================================

describe('Property 20d: Container do painel tem classes CSS desktop (md:max-w-4xl) em viewport desktop', () => {
  /**
   * Validates: Requirements 8.3, 8.4
   * Em desktop, o painel deve ser um drawer lateral com largura máxima.
   */
  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(false)
    mockUseEvolutionHistory.mockReturnValue({
      snapshots: [makeSnapshot()],
      milestones: [],
      trendAnalysis: makeTrendAnalysis(),
      loading: false,
      error: null,
      refetch: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('o painel contém a classe md:max-w-4xl para layout de drawer em desktop', () => {
    const { container } = render(<EvolutionHistoryPanel {...DEFAULT_PROPS} isOpen={true} />)

    const fixedElements = container.querySelectorAll('.fixed')
    expect(fixedElements.length).toBeGreaterThanOrEqual(2)

    const panel = fixedElements[1] as HTMLElement
    expect(panel.className).toContain('md:max-w-4xl')
  })

  it('a classe md:max-w-4xl está presente para todas as combinações de dados em desktop', () => {
    for (const combo of DATA_COMBINATIONS) {
      mockUseEvolutionHistory.mockReturnValue({
        snapshots: combo.snapshots,
        milestones: combo.milestones,
        trendAnalysis: combo.trendAnalysis,
        loading: false,
        error: null,
        refetch: jest.fn(),
      })

      const { container, unmount } = render(
        <EvolutionHistoryPanel {...DEFAULT_PROPS} goalId={combo.goalId} isOpen={true} />
      )

      const fixedElements = container.querySelectorAll('.fixed')
      expect(fixedElements.length).toBeGreaterThanOrEqual(2)

      const panel = fixedElements[1] as HTMLElement
      expect(panel.className).toContain('md:max-w-4xl')

      unmount()
    }
  })
})
