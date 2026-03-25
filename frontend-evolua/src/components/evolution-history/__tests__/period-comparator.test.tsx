/**
 * @jest-environment jsdom
 *
 * Testes unitários para PeriodComparator
 * Validates: Requirements 5.2, 5.3, 5.4
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import type { GoalProgressSnapshot, PeriodSelection, PeriodComparisonResult } from '@/types/evolution-history'

// ============================================================================
// Mocks
// ============================================================================

const mockComparePeriods = jest.fn()

jest.mock('@/services/goal-history', () => ({
  trendAnalyzer: {
    comparePeriods: (...args: Parameters<typeof mockComparePeriods>) => mockComparePeriods(...args),
  },
}))

// Import after mocks
import { PeriodComparator } from '../period-comparator'

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

const SNAPSHOTS: GoalProgressSnapshot[] = [
  makeSnapshot({ id: 'snap-1', progress: 30, createdAt: new Date('2024-01-01T10:00:00.000Z') }),
  makeSnapshot({ id: 'snap-2', progress: 60, createdAt: new Date('2024-02-01T10:00:00.000Z') }),
  makeSnapshot({ id: 'snap-3', progress: 80, createdAt: new Date('2024-03-01T10:00:00.000Z') }),
]

const makeComparison = (overrides: Partial<PeriodComparisonResult> = {}): PeriodComparisonResult => ({
  period1: {
    averageProgress: 45.0,
    updateCount: 3,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
  },
  period2: {
    averageProgress: 70.0,
    updateCount: 5,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-28'),
  },
  variation: 25.0,
  ...overrides,
})

// ============================================================================
// Tests
// ============================================================================

describe('PeriodComparator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockComparePeriods.mockReturnValue(makeComparison())
  })

  // --------------------------------------------------------------------------
  // 1. Períodos predefinidos (Req 5.2)
  // --------------------------------------------------------------------------

  describe('seleção de períodos predefinidos (Req 5.2)', () => {
    it('renderiza os quatro botões de período predefinido', () => {
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={jest.fn()} />)

      expect(screen.getAllByText('Últimos 7 dias')).toHaveLength(2)
      expect(screen.getAllByText('Últimos 30 dias')).toHaveLength(2)
      expect(screen.getAllByText('Últimos 3 meses')).toHaveLength(2)
      expect(screen.getAllByText('Últimos 6 meses')).toHaveLength(2)
    })

    it('renderiza os rótulos Período 1 e Período 2', () => {
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={jest.fn()} />)

      expect(screen.getAllByText('Período 1')).toHaveLength(2) // label + stats card
      expect(screen.getAllByText('Período 2')).toHaveLength(2)
    })

    it('chama onPeriodChange ao selecionar um período predefinido no Período 1', () => {
      const onPeriodChange = jest.fn()
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={onPeriodChange} />)

      const last7DaysButtons = screen.getAllByText('Últimos 7 dias')
      fireEvent.click(last7DaysButtons[0])

      expect(onPeriodChange).toHaveBeenCalledTimes(1)
      const [periods] = onPeriodChange.mock.calls[0]
      expect(periods[0]).toEqual({ type: 'preset', preset: 'last7days' })
    })

    it('chama onPeriodChange ao selecionar um período predefinido no Período 2', () => {
      const onPeriodChange = jest.fn()
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={onPeriodChange} />)

      const last6MonthsButtons = screen.getAllByText('Últimos 6 meses')
      fireEvent.click(last6MonthsButtons[1])

      expect(onPeriodChange).toHaveBeenCalledTimes(1)
      const [periods] = onPeriodChange.mock.calls[0]
      expect(periods[1]).toEqual({ type: 'preset', preset: 'last6months' })
    })

    it('usa os períodos iniciais fornecidos via initialPeriods', () => {
      const initialPeriods: [PeriodSelection, PeriodSelection] = [
        { type: 'preset', preset: 'last7days' },
        { type: 'preset', preset: 'last6months' },
      ]
      render(
        <PeriodComparator
          snapshots={SNAPSHOTS}
          onPeriodChange={jest.fn()}
          initialPeriods={initialPeriods}
        />
      )

      // Deve renderizar sem erros com os períodos iniciais
      expect(screen.getAllByText('Últimos 7 dias')).toHaveLength(2)
    })
  })

  // --------------------------------------------------------------------------
  // 2. Períodos personalizados (Req 5.3)
  // --------------------------------------------------------------------------

  describe('seleção de períodos personalizados (Req 5.3)', () => {
    it('exibe botão "Personalizado" em cada seletor de período', () => {
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={jest.fn()} />)

      const customButtons = screen.getAllByText('Personalizado')
      expect(customButtons).toHaveLength(2)
    })

    it('exibe inputs de data ao clicar em "Personalizado" no Período 1', () => {
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={jest.fn()} />)

      const customButtons = screen.getAllByText('Personalizado')
      fireEvent.click(customButtons[0])

      const dateInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/)
      expect(dateInputs.length).toBeGreaterThanOrEqual(2)
    })

    it('exibe inputs de data ao clicar em "Personalizado" no Período 2', () => {
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={jest.fn()} />)

      const customButtons = screen.getAllByText('Personalizado')
      fireEvent.click(customButtons[1])

      const dateInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/)
      expect(dateInputs.length).toBeGreaterThanOrEqual(2)
    })

    it('chama onPeriodChange com type "custom" ao selecionar período personalizado', () => {
      const onPeriodChange = jest.fn()
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={onPeriodChange} />)

      const customButtons = screen.getAllByText('Personalizado')
      fireEvent.click(customButtons[0])

      expect(onPeriodChange).toHaveBeenCalledTimes(1)
      const [periods] = onPeriodChange.mock.calls[0]
      expect(periods[0].type).toBe('custom')
      expect(periods[0].customRange).toBeDefined()
    })

    it('exibe labels "De" e "Até" nos inputs de data personalizada', () => {
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={jest.fn()} />)

      const customButtons = screen.getAllByText('Personalizado')
      fireEvent.click(customButtons[0])

      expect(screen.getAllByText('De').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Até').length).toBeGreaterThanOrEqual(1)
    })
  })

  // --------------------------------------------------------------------------
  // 3. Estatísticas comparativas (Req 5.4)
  // --------------------------------------------------------------------------

  describe('exibição de estatísticas comparativas (Req 5.4)', () => {
    it('exibe o progresso médio do Período 1', () => {
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={jest.fn()} />)

      expect(screen.getByText('45.0%')).toBeInTheDocument()
    })

    it('exibe o progresso médio do Período 2', () => {
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={jest.fn()} />)

      expect(screen.getByText('70.0%')).toBeInTheDocument()
    })

    it('exibe a variação percentual entre os períodos', () => {
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={jest.fn()} />)

      expect(screen.getByText('+25.0%')).toBeInTheDocument()
    })

    it('exibe o número de atualizações do Período 1', () => {
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={jest.fn()} />)

      expect(screen.getByText('3 atualizações')).toBeInTheDocument()
    })

    it('exibe o número de atualizações do Período 2', () => {
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={jest.fn()} />)

      expect(screen.getByText('5 atualizações')).toBeInTheDocument()
    })

    it('exibe variação negativa com sinal de menos', () => {
      mockComparePeriods.mockReturnValue(
        makeComparison({ variation: -15.5 })
      )
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={jest.fn()} />)

      expect(screen.getByText('-15.5%')).toBeInTheDocument()
    })

    it('exibe label "Variação" na seção de comparação', () => {
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={jest.fn()} />)

      expect(screen.getByText('Variação')).toBeInTheDocument()
    })

    it('exibe mensagem de dados insuficientes quando há menos de 2 snapshots', () => {
      mockComparePeriods.mockReturnValue(null)
      render(
        <PeriodComparator
          snapshots={[makeSnapshot()]}
          onPeriodChange={jest.fn()}
        />
      )

      expect(
        screen.getByText('Dados insuficientes para comparação de períodos.')
      ).toBeInTheDocument()
    })

    it('não exibe cards de estatísticas quando não há dados suficientes', () => {
      render(
        <PeriodComparator
          snapshots={[makeSnapshot()]}
          onPeriodChange={jest.fn()}
        />
      )

      expect(screen.queryByText('45.0%')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 4. Callback onPeriodChange (Req 5.2, 5.3)
  // --------------------------------------------------------------------------

  describe('callback onPeriodChange', () => {
    it('passa ambos os períodos no callback ao alterar Período 1', () => {
      const onPeriodChange = jest.fn()
      const initialPeriods: [PeriodSelection, PeriodSelection] = [
        { type: 'preset', preset: 'last30days' },
        { type: 'preset', preset: 'last3months' },
      ]
      render(
        <PeriodComparator
          snapshots={SNAPSHOTS}
          onPeriodChange={onPeriodChange}
          initialPeriods={initialPeriods}
        />
      )

      const last7DaysButtons = screen.getAllByText('Últimos 7 dias')
      fireEvent.click(last7DaysButtons[0])

      expect(onPeriodChange).toHaveBeenCalledWith([
        { type: 'preset', preset: 'last7days' },
        { type: 'preset', preset: 'last3months' },
      ])
    })

    it('passa ambos os períodos no callback ao alterar Período 2', () => {
      const onPeriodChange = jest.fn()
      const initialPeriods: [PeriodSelection, PeriodSelection] = [
        { type: 'preset', preset: 'last30days' },
        { type: 'preset', preset: 'last3months' },
      ]
      render(
        <PeriodComparator
          snapshots={SNAPSHOTS}
          onPeriodChange={onPeriodChange}
          initialPeriods={initialPeriods}
        />
      )

      const last7DaysButtons = screen.getAllByText('Últimos 7 dias')
      fireEvent.click(last7DaysButtons[1])

      expect(onPeriodChange).toHaveBeenCalledWith([
        { type: 'preset', preset: 'last30days' },
        { type: 'preset', preset: 'last7days' },
      ])
    })

    it('chama trendAnalyzer.comparePeriods com os snapshots e períodos selecionados', () => {
      render(<PeriodComparator snapshots={SNAPSHOTS} onPeriodChange={jest.fn()} />)

      expect(mockComparePeriods).toHaveBeenCalledWith(
        SNAPSHOTS,
        expect.objectContaining({ type: 'preset' }),
        expect.objectContaining({ type: 'preset' })
      )
    })
  })
})
