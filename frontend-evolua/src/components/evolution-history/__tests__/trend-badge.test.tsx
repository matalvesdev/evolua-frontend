/**
 * @jest-environment jsdom
 *
 * Validates: Requirements 4.5, 4.6
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TrendBadge } from '../trend-badge'
import type { ProgressTrend } from '@/types/evolution-history'

describe('TrendBadge', () => {
  // =========================================================================
  // Req 4.5 – label text for each trend
  // =========================================================================
  describe('renderização de texto por tendência', () => {
    it('exibe "Melhora" para tendência de improvement', () => {
      render(<TrendBadge trend="improvement" averageWeeklyRate={5} />)
      expect(screen.getByText('Melhora')).toBeInTheDocument()
    })

    it('exibe "Estagnação" para tendência de stagnation', () => {
      render(<TrendBadge trend="stagnation" averageWeeklyRate={0} />)
      expect(screen.getByText('Estagnação')).toBeInTheDocument()
    })

    it('exibe "Regressão" para tendência de regression', () => {
      render(<TrendBadge trend="regression" averageWeeklyRate={-3} />)
      expect(screen.getByText('Regressão')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Req 4.6 – weekly rate display
  // =========================================================================
  describe('exibição da taxa semanal', () => {
    it('exibe o valor da taxa semanal formatado com uma casa decimal', () => {
      render(<TrendBadge trend="improvement" averageWeeklyRate={7.5} />)
      expect(screen.getByText('7.5%')).toBeInTheDocument()
    })

    it('exibe "por semana" como unidade', () => {
      render(<TrendBadge trend="stagnation" averageWeeklyRate={0} />)
      expect(screen.getByText('por semana')).toBeInTheDocument()
    })

    it('exibe taxa negativa para regressão', () => {
      render(<TrendBadge trend="regression" averageWeeklyRate={-4.2} />)
      expect(screen.getByText('-4.2%')).toBeInTheDocument()
    })

    it('formata taxa inteira com uma casa decimal (ex: 5 → "5.0%")', () => {
      render(<TrendBadge trend="improvement" averageWeeklyRate={5} />)
      expect(screen.getByText('5.0%')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Req 4.5 – correct color classes per trend
  // =========================================================================
  describe('classes de cor por tendência', () => {
    it('aplica classes verdes para improvement', () => {
      const { container } = render(<TrendBadge trend="improvement" averageWeeklyRate={5} />)
      const colorDiv = container.querySelector('.bg-green-100')
      expect(colorDiv).toBeInTheDocument()
      expect(colorDiv).toHaveClass('text-green-700', 'border-green-200')
    })

    it('aplica classes amarelas para stagnation', () => {
      const { container } = render(<TrendBadge trend="stagnation" averageWeeklyRate={0} />)
      const colorDiv = container.querySelector('.bg-yellow-100')
      expect(colorDiv).toBeInTheDocument()
      expect(colorDiv).toHaveClass('text-yellow-700', 'border-yellow-200')
    })

    it('aplica classes vermelhas para regression', () => {
      const { container } = render(<TrendBadge trend="regression" averageWeeklyRate={-3} />)
      const colorDiv = container.querySelector('.bg-red-100')
      expect(colorDiv).toBeInTheDocument()
      expect(colorDiv).toHaveClass('text-red-700', 'border-red-200')
    })
  })

  // =========================================================================
  // Req 4.5 – correct icon per trend
  // =========================================================================
  describe('ícone correto por tendência', () => {
    it('exibe ícone "arrow_upward" para improvement', () => {
      render(<TrendBadge trend="improvement" averageWeeklyRate={5} />)
      expect(screen.getByText('arrow_upward')).toBeInTheDocument()
    })

    it('exibe ícone "remove" para stagnation', () => {
      render(<TrendBadge trend="stagnation" averageWeeklyRate={0} />)
      expect(screen.getByText('remove')).toBeInTheDocument()
    })

    it('exibe ícone "arrow_downward" para regression', () => {
      render(<TrendBadge trend="regression" averageWeeklyRate={-3} />)
      expect(screen.getByText('arrow_downward')).toBeInTheDocument()
    })
  })
})
