/**
 * @jest-environment jsdom
 *
 * Testes de Propriedade para TimelineComponent
 *
 * **Property 6: Ordenação Cronológica de Milestones**
 * **Validates: Requirements 3.1**
 *
 * Para qualquer array de milestones com datas aleatórias, quando renderizado
 * no TimelineComponent, os milestones devem ser exibidos em ordem cronológica
 * (mais antigo primeiro, mais recente por último).
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TimelineComponent } from '../timeline-component'
import type { Milestone, MilestoneType } from '@/types/evolution-history'

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

/** Tipos de milestone disponíveis */
const MILESTONE_TYPES: MilestoneType[] = [
  'started',
  'significant_increase',
  'significant_decrease',
  'completed',
]

/** Gera uma data aleatória dentro de um intervalo de `rangeDays` dias a partir de `baseDate` */
function randomDate(baseDate: Date, rangeDays: number): Date {
  const offsetMs = randomInt(0, rangeDays * 24 * 60 * 60 * 1000)
  return new Date(baseDate.getTime() + offsetMs)
}

/**
 * Gera um array de milestones com datas aleatórias embaralhadas.
 * As datas são geradas dentro de um intervalo de 365 dias a partir de uma data base.
 */
function generateRandomMilestones(count: number): Milestone[] {
  const baseDate = new Date('2023-01-01T00:00:00.000Z')
  const goalId = generateUUID()

  return Array.from({ length: count }, () => {
    const date = randomDate(baseDate, 365)
    return {
      id: generateUUID(),
      goalId,
      type: MILESTONE_TYPES[randomInt(0, MILESTONE_TYPES.length - 1)],
      date,
      progress: randomInt(0, 100),
      description: `Marco de teste ${generateUUID().slice(0, 8)}`,
      createdAt: date,
    }
  })
}

/**
 * Embaralha um array usando Fisher-Yates shuffle.
 * Garante que a ordem de entrada não influencie o resultado.
 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Extrai as datas exibidas no DOM na ordem em que aparecem.
 * O TimelineItem renderiza a data no formato "dd/MM/yyyy 'às' HH:mm".
 * Usamos o aria-label de cada item para extrair a data de forma confiável.
 */
function getRenderedMilestoneDates(container: HTMLElement): Date[] {
  const items = container.querySelectorAll('[role="button"]')
  const dates: Date[] = []

  items.forEach((item) => {
    const ariaLabel = item.getAttribute('aria-label') || ''
    // aria-label format: "Marco: <tipo> em dd/MM/yyyy às HH:mm — <descrição>"
    const match = ariaLabel.match(/em (\d{2})\/(\d{2})\/(\d{4}) às (\d{2}):(\d{2})/)
    if (match) {
      const [, day, month, year, hours, minutes] = match
      // Reconstruct date in local time (same as date-fns format output)
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      )
      dates.push(date)
    }
  })

  return dates
}

// ============================================================================
// Property 6: Ordenação Cronológica de Milestones
// Validates: Requirements 3.1
// ============================================================================

describe('Property 6: Ordenação Cronológica de Milestones (Req 3.1)', () => {
  const ITERATIONS = 100

  it('deve exibir milestones em ordem cronológica (mais antigo primeiro) para qualquer array aleatório', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      // Gera entre 2 e 8 milestones com datas aleatórias
      const count = randomInt(2, 8)
      const milestones = generateRandomMilestones(count)

      // Embaralha para garantir que a ordem de entrada não influencie
      const shuffled = shuffle(milestones)

      const { container, unmount } = render(
        <TimelineComponent milestones={shuffled} />
      )

      const renderedDates = getRenderedMilestoneDates(container)

      // Verifica que temos o número correto de itens renderizados
      expect(renderedDates).toHaveLength(count)

      // Verifica que as datas estão em ordem cronológica (mais antigo primeiro)
      for (let j = 0; j < renderedDates.length - 1; j++) {
        const current = renderedDates[j].getTime()
        const next = renderedDates[j + 1].getTime()
        expect(current).toBeLessThanOrEqual(next)
      }

      unmount()
    }
  })

  it('deve exibir milestones em ordem cronológica mesmo quando fornecidos em ordem inversa', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const count = randomInt(2, 6)
      const milestones = generateRandomMilestones(count)

      // Ordena do mais recente para o mais antigo (ordem inversa)
      const reverseSorted = [...milestones].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      )

      const { container, unmount } = render(
        <TimelineComponent milestones={reverseSorted} />
      )

      const renderedDates = getRenderedMilestoneDates(container)

      expect(renderedDates).toHaveLength(count)

      // Verifica ordem cronológica (mais antigo primeiro)
      for (let j = 0; j < renderedDates.length - 1; j++) {
        const current = renderedDates[j].getTime()
        const next = renderedDates[j + 1].getTime()
        expect(current).toBeLessThanOrEqual(next)
      }

      unmount()
    }
  })

  it('deve exibir milestones em ordem cronológica mesmo quando fornecidos já ordenados', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const count = randomInt(2, 6)
      const milestones = generateRandomMilestones(count)

      // Ordena do mais antigo para o mais recente (ordem cronológica)
      const chronologicallySorted = [...milestones].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      )

      const { container, unmount } = render(
        <TimelineComponent milestones={chronologicallySorted} />
      )

      const renderedDates = getRenderedMilestoneDates(container)

      expect(renderedDates).toHaveLength(count)

      // Verifica que a ordem cronológica é mantida
      for (let j = 0; j < renderedDates.length - 1; j++) {
        const current = renderedDates[j].getTime()
        const next = renderedDates[j + 1].getTime()
        expect(current).toBeLessThanOrEqual(next)
      }

      unmount()
    }
  })
})
