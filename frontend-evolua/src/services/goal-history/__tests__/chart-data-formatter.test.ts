/**
 * Testes unitários para ChartDataFormatter
 * Valida: Requisitos 2.2, 2.4, 2.5, 6.2
 */

import { ChartDataFormatter } from '../chart-data-formatter'
import type { GoalProgressSnapshot, Milestone } from '@/types/evolution-history'

function makeSnapshot(
  id: string,
  progress: number,
  date: Date,
  goalId = 'goal-1'
): GoalProgressSnapshot {
  return { id, goalId, progress, createdAt: date, therapistId: 'therapist-1' }
}

function makeMilestone(
  id: string,
  type: Milestone['type'],
  date: Date,
  goalId = 'goal-1'
): Milestone {
  return { id, goalId, type, date, progress: 0, description: '', createdAt: date }
}

describe('ChartDataFormatter', () => {
  let formatter: ChartDataFormatter

  beforeEach(() => {
    formatter = new ChartDataFormatter()
  })

  // =========================================================================
  // format (Req 2.2, 2.4)
  // =========================================================================
  describe('format', () => {
    it('retorna array vazio para snapshots vazios', () => {
      const result = formatter.format([], [])
      expect(result).toEqual([])
    })

    it('mapeia snapshot para ChartDataPoint com campos corretos', () => {
      const date = new Date('2024-01-15T10:00:00Z')
      const snapshots = [makeSnapshot('s1', 50, date)]
      const result = formatter.format(snapshots, [])

      expect(result).toHaveLength(1)
      expect(result[0].date).toEqual(date)
      expect(result[0].progress).toBe(50)
      expect(result[0].variation).toBe(0) // primeiro snapshot, sem variação
      expect(result[0].isMilestone).toBe(false)
    })

    it('calcula variação corretamente entre snapshots consecutivos', () => {
      const date1 = new Date('2024-01-01T00:00:00Z')
      const date2 = new Date('2024-01-15T00:00:00Z')
      const snapshots = [
        makeSnapshot('s1', 20, date1),
        makeSnapshot('s2', 50, date2),
      ]
      const result = formatter.format(snapshots, [])

      expect(result[0].variation).toBe(0)
      expect(result[1].variation).toBe(30)
    })

    it('calcula variação negativa quando progresso diminui', () => {
      const date1 = new Date('2024-01-01T00:00:00Z')
      const date2 = new Date('2024-01-15T00:00:00Z')
      const snapshots = [
        makeSnapshot('s1', 80, date1),
        makeSnapshot('s2', 50, date2),
      ]
      const result = formatter.format(snapshots, [])

      expect(result[1].variation).toBe(-30)
    })

    it('ordena snapshots por data (mais antigo primeiro)', () => {
      const date1 = new Date('2024-01-01T00:00:00Z')
      const date2 = new Date('2024-01-15T00:00:00Z')
      // Fornecidos em ordem inversa
      const snapshots = [
        makeSnapshot('s2', 50, date2),
        makeSnapshot('s1', 20, date1),
      ]
      const result = formatter.format(snapshots, [])

      expect(result[0].progress).toBe(20)
      expect(result[1].progress).toBe(50)
    })

    it('marca isMilestone=true quando snapshot coincide com milestone (dentro de 1 minuto)', () => {
      const date = new Date('2024-01-15T10:00:00Z')
      const milestoneDate = new Date('2024-01-15T10:00:30Z') // 30 segundos depois
      const snapshots = [makeSnapshot('s1', 100, date)]
      const milestones = [makeMilestone('ms-1', 'completed', milestoneDate)]

      const result = formatter.format(snapshots, milestones)

      expect(result[0].isMilestone).toBe(true)
      expect(result[0].milestoneType).toBe('completed')
    })

    it('não marca isMilestone quando snapshot está fora da tolerância de 1 minuto', () => {
      const date = new Date('2024-01-15T10:00:00Z')
      const milestoneDate = new Date('2024-01-15T10:02:00Z') // 2 minutos depois
      const snapshots = [makeSnapshot('s1', 100, date)]
      const milestones = [makeMilestone('ms-1', 'completed', milestoneDate)]

      const result = formatter.format(snapshots, milestones)

      expect(result[0].isMilestone).toBe(false)
    })

    it('processa múltiplos snapshots corretamente', () => {
      const dates = [
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-08T00:00:00Z'),
        new Date('2024-01-15T00:00:00Z'),
      ]
      const snapshots = [
        makeSnapshot('s1', 0, dates[0]),
        makeSnapshot('s2', 30, dates[1]),
        makeSnapshot('s3', 60, dates[2]),
      ]
      const result = formatter.format(snapshots, [])

      expect(result).toHaveLength(3)
      expect(result[0].variation).toBe(0)
      expect(result[1].variation).toBe(30)
      expect(result[2].variation).toBe(30)
    })
  })

  // =========================================================================
  // groupByWeek (Req 2.5)
  // =========================================================================
  describe('groupByWeek', () => {
    it('retorna array vazio para snapshots vazios', () => {
      const result = formatter.groupByWeek([])
      expect(result).toEqual([])
    })

    it('retorna um snapshot por semana (o último da semana)', () => {
      // Dois snapshots na mesma semana
      const monday = new Date('2024-01-08T00:00:00Z') // segunda
      const friday = new Date('2024-01-12T00:00:00Z') // sexta (mesma semana)
      const snapshots = [
        makeSnapshot('s1', 20, monday),
        makeSnapshot('s2', 40, friday),
      ]
      const result = formatter.groupByWeek(snapshots)

      // Deve retornar apenas 1 snapshot (o último da semana)
      expect(result).toHaveLength(1)
      expect(result[0].progress).toBe(40)
    })

    it('retorna um snapshot por semana para semanas diferentes', () => {
      const week1 = new Date('2024-01-08T00:00:00Z')
      const week2 = new Date('2024-01-15T00:00:00Z')
      const week3 = new Date('2024-01-22T00:00:00Z')
      const snapshots = [
        makeSnapshot('s1', 10, week1),
        makeSnapshot('s2', 20, week2),
        makeSnapshot('s3', 30, week3),
      ]
      const result = formatter.groupByWeek(snapshots)

      expect(result).toHaveLength(3)
    })

    it('ordena snapshots antes de agrupar', () => {
      const week1 = new Date('2024-01-08T00:00:00Z')
      const week2 = new Date('2024-01-15T00:00:00Z')
      // Fornecidos em ordem inversa
      const snapshots = [
        makeSnapshot('s2', 50, week2),
        makeSnapshot('s1', 20, week1),
      ]
      const result = formatter.groupByWeek(snapshots)

      expect(result).toHaveLength(2)
    })
  })

  // =========================================================================
  // formatTooltipData (Req 2.4)
  // =========================================================================
  describe('formatTooltipData', () => {
    it('formata data no formato dd/MM/yyyy às HH:mm', () => {
      const snapshot = makeSnapshot('s1', 50, new Date('2024-01-15T10:30:00Z'))
      const result = formatter.formatTooltipData(snapshot)

      expect(result.date).toMatch(/\d{2}\/\d{2}\/\d{4} às \d{2}:\d{2}/)
    })

    it('formata progresso com símbolo de percentual', () => {
      const snapshot = makeSnapshot('s1', 75, new Date('2024-01-15T10:00:00Z'))
      const result = formatter.formatTooltipData(snapshot)

      expect(result.progress).toBe('75%')
    })

    it('formata variação positiva com sinal de mais', () => {
      const snapshot: GoalProgressSnapshot = {
        id: 's1',
        goalId: 'goal-1',
        progress: 50,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        therapistId: 'therapist-1',
        variation: 15
      }
      const result = formatter.formatTooltipData(snapshot)

      expect(result.variation).toBe('+15%')
    })

    it('formata variação negativa sem sinal de mais', () => {
      const snapshot: GoalProgressSnapshot = {
        id: 's1',
        goalId: 'goal-1',
        progress: 30,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        therapistId: 'therapist-1',
        variation: -10
      }
      const result = formatter.formatTooltipData(snapshot)

      expect(result.variation).toBe('-10%')
    })

    it('retorna "0%" quando variation é undefined', () => {
      const snapshot = makeSnapshot('s1', 50, new Date('2024-01-15T10:00:00Z'))
      // variation não definida
      const result = formatter.formatTooltipData(snapshot)

      expect(result.variation).toBe('0%')
    })
  })

  // =========================================================================
  // shouldGroupByWeek (Req 2.5)
  // =========================================================================
  describe('shouldGroupByWeek', () => {
    it('retorna false para array vazio', () => {
      expect(formatter.shouldGroupByWeek([])).toBe(false)
    })

    it('retorna false para um único snapshot', () => {
      const snapshots = [makeSnapshot('s1', 50, new Date())]
      expect(formatter.shouldGroupByWeek(snapshots)).toBe(false)
    })

    it('retorna false quando período é menor que 6 meses (180 dias)', () => {
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 90) // 3 meses
      const snapshots = [
        makeSnapshot('s1', 0, start),
        makeSnapshot('s2', 50, end),
      ]
      expect(formatter.shouldGroupByWeek(snapshots)).toBe(false)
    })

    it('retorna true quando período é maior que 6 meses (180 dias)', () => {
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 200) // mais de 6 meses
      const snapshots = [
        makeSnapshot('s1', 0, start),
        makeSnapshot('s2', 50, end),
      ]
      expect(formatter.shouldGroupByWeek(snapshots)).toBe(true)
    })

    it('retorna false quando período é exatamente 180 dias', () => {
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 180)
      const snapshots = [
        makeSnapshot('s1', 0, start),
        makeSnapshot('s2', 50, end),
      ]
      // 180 dias não é > 180, então retorna false
      expect(formatter.shouldGroupByWeek(snapshots)).toBe(false)
    })

    it('considera o snapshot mais antigo e mais recente independente da ordem', () => {
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 200)
      // Fornecidos em ordem inversa
      const snapshots = [
        makeSnapshot('s2', 50, end),
        makeSnapshot('s1', 0, start),
      ]
      expect(formatter.shouldGroupByWeek(snapshots)).toBe(true)
    })
  })
})
