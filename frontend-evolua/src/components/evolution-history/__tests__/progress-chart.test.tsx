/**
 * @jest-environment jsdom
 *
 * Testes unitários para ProgressChart
 * Validates: Requirements 2.2, 2.4, 2.5, 2.6
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import type { GoalProgressSnapshot, Milestone } from '@/types/evolution-history'

// ============================================================================
// Mocks
// ============================================================================

// Mock Recharts - não renderiza bem em jsdom
jest.mock('recharts', () => {
  const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  )
  const MockLineChart = ({ children, data }: { children: React.ReactNode; data: Record<string, unknown>[] }) => (
    <div data-testid="line-chart" data-points={data?.length}>{children}</div>
  )
  const MockLine = ({ dot }: { dot?: React.ReactNode }) => <div data-testid="chart-line" />
  const MockXAxis = () => <div data-testid="x-axis" />
  const MockYAxis = () => <div data-testid="y-axis" />
  const MockCartesianGrid = () => <div data-testid="cartesian-grid" />
  const MockTooltip = () => <div data-testid="chart-tooltip" />
  const MockDot = () => <circle data-testid="chart-dot" />

  return {
    ResponsiveContainer: MockResponsiveContainer,
    LineChart: MockLineChart,
    Line: MockLine,
    XAxis: MockXAxis,
    YAxis: MockYAxis,
    CartesianGrid: MockCartesianGrid,
    Tooltip: MockTooltip,
    Dot: MockDot,
  }
})

// Mock useMediaQuery
jest.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: jest.fn(() => false),
}))

// Mock chartDataFormatter
const mockGroupByWeek = jest.fn((snapshots: GoalProgressSnapshot[]) => snapshots)
const mockShouldGroupByWeek = jest.fn(() => false)
const mockFormat = jest.fn((snapshots: GoalProgressSnapshot[], milestones: Milestone[]) =>
  snapshots.map((s, i) => ({
    date: s.createdAt,
    progress: s.progress,
    variation: 0,
    isMilestone: milestones.some(
      (m) => Math.abs(m.date.getTime() - s.createdAt.getTime()) < 60000
    ),
    milestoneType: milestones.find(
      (m) => Math.abs(m.date.getTime() - s.createdAt.getTime()) < 60000
    )?.type,
  }))
)
const mockFormatTooltipData = jest.fn((snapshot: GoalProgressSnapshot) => ({
  date: '01/01/2024 às 10:00',
  progress: `${snapshot.progress}%`,
  variation: '+5%',
}))

jest.mock('@/services/goal-history', () => ({
  chartDataFormatter: {
    shouldGroupByWeek: (...args: Array<GoalProgressSnapshot[] | Milestone[]>) => mockShouldGroupByWeek(...args),
    groupByWeek: (...args: Array<GoalProgressSnapshot[] | Milestone[]>) => mockGroupByWeek(...args),
    format: (...args: Array<GoalProgressSnapshot[] | Milestone[]>) => mockFormat(...args),
    formatTooltipData: (arg: GoalProgressSnapshot) => mockFormatTooltipData(arg),
  },
}))

// Import after mocks
import { ProgressChart } from '../progress-chart'

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
  id: 'ms-1',
  goalId: 'goal-1',
  type: 'started',
  date: new Date('2024-01-15T10:00:00.000Z'),
  progress: 0,
  description: 'Meta iniciada',
  createdAt: new Date('2024-01-15T10:00:00.000Z'),
  ...overrides,
})

const SNAPSHOTS: GoalProgressSnapshot[] = [
  makeSnapshot({ id: 'snap-1', progress: 20, createdAt: new Date('2024-01-01T10:00:00.000Z') }),
  makeSnapshot({ id: 'snap-2', progress: 50, createdAt: new Date('2024-02-01T10:00:00.000Z') }),
  makeSnapshot({ id: 'snap-3', progress: 80, createdAt: new Date('2024-03-01T10:00:00.000Z') }),
]

const MILESTONES: Milestone[] = [
  makeMilestone({ id: 'ms-1', type: 'started', date: new Date('2024-01-01T10:00:00.000Z') }),
  makeMilestone({ id: 'ms-2', type: 'completed', date: new Date('2024-03-01T10:00:00.000Z'), progress: 80 }),
]

// ============================================================================
// Tests
// ============================================================================

describe('ProgressChart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockShouldGroupByWeek.mockReturnValue(false)
    mockGroupByWeek.mockImplementation((s) => s)
    mockFormat.mockImplementation((snapshots, milestones) =>
      snapshots.map((s: GoalProgressSnapshot) => ({
        date: s.createdAt,
        progress: s.progress,
        variation: 0,
        isMilestone: milestones.some(
          (m: Milestone) => Math.abs(m.date.getTime() - s.createdAt.getTime()) < 60000
        ),
        milestoneType: milestones.find(
          (m: Milestone) => Math.abs(m.date.getTime() - s.createdAt.getTime()) < 60000
        )?.type,
      }))
    )
  })

  // --------------------------------------------------------------------------
  // 1. Renderização básica (Req 2.2)
  // --------------------------------------------------------------------------

  describe('renderização com snapshots válidos (Req 2.2)', () => {
    it('renderiza sem erros com snapshots válidos', () => {
      expect(() =>
        render(<ProgressChart snapshots={SNAPSHOTS} milestones={[]} />)
      ).not.toThrow()
    })

    it('renderiza o container do gráfico', () => {
      render(<ProgressChart snapshots={SNAPSHOTS} milestones={[]} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renderiza o LineChart com os dados formatados', () => {
      render(<ProgressChart snapshots={SNAPSHOTS} milestones={[]} />)
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('renderiza eixo X e eixo Y (Req 2.2)', () => {
      render(<ProgressChart snapshots={SNAPSHOTS} milestones={[]} />)
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    })

    it('chama chartDataFormatter.format com os snapshots e milestones', () => {
      render(<ProgressChart snapshots={SNAPSHOTS} milestones={MILESTONES} />)
      expect(mockFormat).toHaveBeenCalledWith(SNAPSHOTS, MILESTONES)
    })
  })

  // --------------------------------------------------------------------------
  // 2. Estado vazio
  // --------------------------------------------------------------------------

  describe('estado vazio quando não há snapshots', () => {
    it('renderiza mensagem de estado vazio quando snapshots está vazio', () => {
      mockFormat.mockReturnValue([])
      render(<ProgressChart snapshots={[]} milestones={[]} />)
      expect(screen.getByText('Nenhum dado de progresso disponível')).toBeInTheDocument()
    })

    it('não renderiza o gráfico quando não há dados', () => {
      mockFormat.mockReturnValue([])
      render(<ProgressChart snapshots={[]} milestones={[]} />)
      expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 3. Agrupamento semanal para períodos > 6 meses (Req 2.5)
  // --------------------------------------------------------------------------

  describe('agrupamento semanal para períodos longos (Req 2.5)', () => {
    it('chama groupByWeek quando shouldGroupByWeek retorna true', () => {
      mockShouldGroupByWeek.mockReturnValue(true)

      const longPeriodSnapshots: GoalProgressSnapshot[] = [
        makeSnapshot({ id: 's1', createdAt: new Date('2023-01-01T10:00:00.000Z') }),
        makeSnapshot({ id: 's2', createdAt: new Date('2023-08-01T10:00:00.000Z') }),
      ]

      render(<ProgressChart snapshots={longPeriodSnapshots} milestones={[]} />)

      expect(mockShouldGroupByWeek).toHaveBeenCalledWith(longPeriodSnapshots)
      expect(mockGroupByWeek).toHaveBeenCalledWith(longPeriodSnapshots)
    })

    it('não chama groupByWeek quando shouldGroupByWeek retorna false', () => {
      mockShouldGroupByWeek.mockReturnValue(false)

      render(<ProgressChart snapshots={SNAPSHOTS} milestones={[]} />)

      expect(mockShouldGroupByWeek).toHaveBeenCalledWith(SNAPSHOTS)
      expect(mockGroupByWeek).not.toHaveBeenCalled()
    })

    it('passa os snapshots agrupados para format quando período é longo', () => {
      mockShouldGroupByWeek.mockReturnValue(true)
      const grouped = [makeSnapshot({ id: 'grouped-1', progress: 60 })]
      mockGroupByWeek.mockReturnValue(grouped)

      render(<ProgressChart snapshots={SNAPSHOTS} milestones={[]} />)

      expect(mockFormat).toHaveBeenCalledWith(grouped, [])
    })
  })

  // --------------------------------------------------------------------------
  // 4. Marcadores de milestone (Req 2.6)
  // --------------------------------------------------------------------------

  describe('marcadores de milestone (Req 2.6)', () => {
    it('chama format com os milestones fornecidos', () => {
      render(<ProgressChart snapshots={SNAPSHOTS} milestones={MILESTONES} />)
      expect(mockFormat).toHaveBeenCalledWith(SNAPSHOTS, MILESTONES)
    })

    it('renderiza o gráfico quando há milestones', () => {
      render(<ProgressChart snapshots={SNAPSHOTS} milestones={MILESTONES} />)
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('renderiza sem erros quando milestone coincide com snapshot', () => {
      const snapshotWithMilestone = makeSnapshot({
        id: 'snap-ms',
        createdAt: new Date('2024-01-15T10:00:00.000Z'),
        progress: 0,
      })
      const milestone = makeMilestone({
        date: new Date('2024-01-15T10:00:00.000Z'),
        type: 'started',
      })

      expect(() =>
        render(<ProgressChart snapshots={[snapshotWithMilestone]} milestones={[milestone]} />)
      ).not.toThrow()
    })
  })

  // --------------------------------------------------------------------------
  // 5. Tooltip (Req 2.4)
  // --------------------------------------------------------------------------

  describe('tooltip ao hover (Req 2.4)', () => {
    it('renderiza o componente Tooltip no gráfico', () => {
      render(<ProgressChart snapshots={SNAPSHOTS} milestones={[]} />)
      expect(screen.getByTestId('chart-tooltip')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 6. Props opcionais
  // --------------------------------------------------------------------------

  describe('props opcionais', () => {
    it('renderiza sem erros quando onPointHover não é fornecido', () => {
      expect(() =>
        render(<ProgressChart snapshots={SNAPSHOTS} milestones={[]} />)
      ).not.toThrow()
    })

    it('renderiza sem erros quando onMilestoneClick não é fornecido', () => {
      expect(() =>
        render(<ProgressChart snapshots={SNAPSHOTS} milestones={MILESTONES} />)
      ).not.toThrow()
    })

    it('aceita callbacks opcionais sem erros', () => {
      const onPointHover = jest.fn()
      const onMilestoneClick = jest.fn()

      expect(() =>
        render(
          <ProgressChart
            snapshots={SNAPSHOTS}
            milestones={MILESTONES}
            onPointHover={onPointHover}
            onMilestoneClick={onMilestoneClick}
          />
        )
      ).not.toThrow()
    })
  })
})
