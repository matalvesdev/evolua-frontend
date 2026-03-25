/**
 * @jest-environment jsdom
 *
 * Testes unitários para TimelineComponent
 * Validates: Requirements 3.1, 3.5
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TimelineComponent } from '../timeline-component'
import type { Milestone } from '@/types/evolution-history'

// ============================================================================
// Fixtures
// ============================================================================

const makeMilestone = (overrides: Partial<Milestone> = {}): Milestone => ({
  id: 'milestone-1',
  goalId: 'goal-1',
  type: 'started',
  date: new Date('2024-01-15T10:00:00.000Z'),
  progress: 0,
  description: 'Meta iniciada',
  createdAt: new Date('2024-01-15T10:00:00.000Z'),
  ...overrides,
})

const MILESTONES: Milestone[] = [
  makeMilestone({
    id: 'ms-1',
    type: 'started',
    date: new Date('2024-01-01T08:00:00.000Z'),
    progress: 0,
    description: 'Meta iniciada',
  }),
  makeMilestone({
    id: 'ms-2',
    type: 'significant_increase',
    date: new Date('2024-02-10T09:00:00.000Z'),
    progress: 40,
    description: 'Aumento significativo',
  }),
  makeMilestone({
    id: 'ms-3',
    type: 'completed',
    date: new Date('2024-03-20T11:00:00.000Z'),
    progress: 100,
    description: 'Meta concluída',
  }),
]

// ============================================================================
// Tests
// ============================================================================

describe('TimelineComponent', () => {
  describe('estado vazio', () => {
    it('renderiza mensagem de estado vazio quando não há milestones', () => {
      render(<TimelineComponent milestones={[]} />)
      expect(screen.getByText('Nenhum marco registrado ainda')).toBeInTheDocument()
    })

    it('não renderiza nenhum item de timeline quando milestones está vazio', () => {
      render(<TimelineComponent milestones={[]} />)
      expect(screen.queryAllByRole('button')).toHaveLength(0)
    })
  })

  describe('renderização de milestones (Req 3.1)', () => {
    it('renderiza o número correto de milestones', () => {
      render(<TimelineComponent milestones={MILESTONES} />)
      expect(screen.getAllByRole('button')).toHaveLength(3)
    })

    it('renderiza um único milestone corretamente', () => {
      const single = [makeMilestone({ description: 'Único marco' })]
      render(<TimelineComponent milestones={single} />)
      expect(screen.getAllByRole('button')).toHaveLength(1)
      expect(screen.getByText('Único marco')).toBeInTheDocument()
    })

    it('renderiza milestones em ordem cronológica (mais antigo primeiro)', () => {
      // Fornece milestones em ordem inversa para garantir que o componente ordena
      const reversed = [...MILESTONES].reverse()
      render(<TimelineComponent milestones={reversed} />)

      const buttons = screen.getAllByRole('button')
      const ariaLabels = buttons.map((b) => b.getAttribute('aria-label') ?? '')

      // O primeiro item deve ser o mais antigo (ms-1: Meta iniciada)
      expect(ariaLabels[0]).toContain('Meta iniciada')
      // O último item deve ser o mais recente (ms-3: Meta concluída)
      expect(ariaLabels[ariaLabels.length - 1]).toContain('Meta concluída')
    })

    it('renderiza milestones em ordem cronológica mesmo quando fornecidos fora de ordem', () => {
      const outOfOrder: Milestone[] = [
        makeMilestone({ id: 'c', date: new Date('2024-03-15T12:00:00'), description: 'Terceiro' }),
        makeMilestone({ id: 'a', date: new Date('2024-01-15T12:00:00'), description: 'Primeiro' }),
        makeMilestone({ id: 'b', date: new Date('2024-02-15T12:00:00'), description: 'Segundo' }),
      ]

      render(<TimelineComponent milestones={outOfOrder} />)

      const buttons = screen.getAllByRole('button')
      // Verifica que o primeiro botão é o mais antigo e o último é o mais recente
      expect(buttons[0]).toHaveAttribute('aria-label', expect.stringContaining('Primeiro'))
      expect(buttons[1]).toHaveAttribute('aria-label', expect.stringContaining('Segundo'))
      expect(buttons[2]).toHaveAttribute('aria-label', expect.stringContaining('Terceiro'))
    })
  })

  describe('onClick handler (Req 3.5)', () => {
    it('chama onMilestoneClick com o milestone correto ao clicar', () => {
      const onMilestoneClick = jest.fn()

      render(<TimelineComponent milestones={MILESTONES} onMilestoneClick={onMilestoneClick} />)

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])

      expect(onMilestoneClick).toHaveBeenCalledTimes(1)
      // O primeiro botão renderizado é o mais antigo (ms-1)
      expect(onMilestoneClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'ms-1' })
      )
    })

    it('chama onMilestoneClick com o milestone correto para cada item', () => {
      const onMilestoneClick = jest.fn()

      render(<TimelineComponent milestones={MILESTONES} onMilestoneClick={onMilestoneClick} />)

      const buttons = screen.getAllByRole('button')

      fireEvent.click(buttons[1])
      expect(onMilestoneClick).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 'ms-2' })
      )

      fireEvent.click(buttons[2])
      expect(onMilestoneClick).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 'ms-3' })
      )
    })

    it('não lança erro quando onMilestoneClick não é fornecido', () => {
      render(<TimelineComponent milestones={MILESTONES} />)

      const buttons = screen.getAllByRole('button')
      expect(() => fireEvent.click(buttons[0])).not.toThrow()
    })
  })

  describe('highlight de milestone selecionado (Req 3.5)', () => {
    it('aplica aria-pressed=true no milestone que corresponde a highlightedMilestoneId', () => {
      render(
        <TimelineComponent
          milestones={MILESTONES}
          highlightedMilestoneId="ms-2"
        />
      )

      const buttons = screen.getAllByRole('button')
      // ms-1 (índice 0) — não destacado
      expect(buttons[0]).toHaveAttribute('aria-pressed', 'false')
      // ms-2 (índice 1) — destacado
      expect(buttons[1]).toHaveAttribute('aria-pressed', 'true')
      // ms-3 (índice 2) — não destacado
      expect(buttons[2]).toHaveAttribute('aria-pressed', 'false')
    })

    it('não destaca nenhum milestone quando highlightedMilestoneId não é fornecido', () => {
      render(<TimelineComponent milestones={MILESTONES} />)

      screen.getAllByRole('button').forEach((btn) => {
        expect(btn).toHaveAttribute('aria-pressed', 'false')
      })
    })

    it('não destaca milestones que não correspondem a highlightedMilestoneId', () => {
      render(
        <TimelineComponent
          milestones={MILESTONES}
          highlightedMilestoneId="ms-1"
        />
      )

      const buttons = screen.getAllByRole('button')
      // Apenas ms-1 deve estar destacado
      expect(buttons[0]).toHaveAttribute('aria-pressed', 'true')
      expect(buttons[1]).toHaveAttribute('aria-pressed', 'false')
      expect(buttons[2]).toHaveAttribute('aria-pressed', 'false')
    })

    it('não destaca nenhum milestone quando highlightedMilestoneId não corresponde a nenhum id', () => {
      render(
        <TimelineComponent
          milestones={MILESTONES}
          highlightedMilestoneId="id-inexistente"
        />
      )

      screen.getAllByRole('button').forEach((btn) => {
        expect(btn).toHaveAttribute('aria-pressed', 'false')
      })
    })
  })
})
