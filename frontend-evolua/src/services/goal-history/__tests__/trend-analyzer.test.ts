import { TrendAnalyzer } from '../trend-analyzer'
import type { GoalProgressSnapshot, PeriodSelection } from '@/types/evolution-history'

// Helper para criar snapshots com datas relativas ao momento atual
function makeSnapshot(
  id: string,
  progress: number,
  daysAgo: number,
  goalId = 'goal-1'
): GoalProgressSnapshot {
  const createdAt = new Date()
  createdAt.setDate(createdAt.getDate() - daysAgo)
  return { id, goalId, progress, createdAt, therapistId: 'therapist-1' }
}

// Helper para criar snapshots com datas absolutas
function makeSnapshotAt(
  id: string,
  progress: number,
  date: Date,
  goalId = 'goal-1'
): GoalProgressSnapshot {
  return { id, goalId, progress, createdAt: date, therapistId: 'therapist-1' }
}

describe('TrendAnalyzer', () => {
  let analyzer: TrendAnalyzer

  beforeEach(() => {
    analyzer = new TrendAnalyzer()
  })

  // =========================================================================
  // analyzeTrend
  // =========================================================================
  describe('analyzeTrend', () => {
    describe('improvement (Req 4.2)', () => {
      it('classifica como improvement quando progresso aumentou exatamente 10%', () => {
        const snapshots = [
          makeSnapshot('s1', 20, 25),
          makeSnapshot('s2', 30, 10),
        ]
        expect(analyzer.analyzeTrend(snapshots, 30)).toBe('improvement')
      })

      it('classifica como improvement quando progresso aumentou mais de 10%', () => {
        const snapshots = [
          makeSnapshot('s1', 10, 28),
          makeSnapshot('s2', 50, 5),
        ]
        expect(analyzer.analyzeTrend(snapshots, 30)).toBe('improvement')
      })

      it('classifica como improvement com variação de exatamente 10 pontos percentuais', () => {
        const snapshots = [
          makeSnapshot('s1', 0, 29),
          makeSnapshot('s2', 10, 1),
        ]
        expect(analyzer.analyzeTrend(snapshots, 30)).toBe('improvement')
      })
    })

    describe('stagnation (Req 4.3)', () => {
      it('classifica como stagnation quando variação é menor que 10%', () => {
        const snapshots = [
          makeSnapshot('s1', 50, 25),
          makeSnapshot('s2', 55, 5),
        ]
        expect(analyzer.analyzeTrend(snapshots, 30)).toBe('stagnation')
      })

      it('classifica como stagnation quando não há variação', () => {
        const snapshots = [
          makeSnapshot('s1', 40, 20),
          makeSnapshot('s2', 40, 5),
        ]
        expect(analyzer.analyzeTrend(snapshots, 30)).toBe('stagnation')
      })

      it('classifica como stagnation quando variação positiva é menor que 10', () => {
        const snapshots = [
          makeSnapshot('s1', 30, 28),
          makeSnapshot('s2', 39, 2),
        ]
        expect(analyzer.analyzeTrend(snapshots, 30)).toBe('stagnation')
      })

      it('classifica como stagnation quando variação negativa é menor que 10 em módulo', () => {
        const snapshots = [
          makeSnapshot('s1', 50, 28),
          makeSnapshot('s2', 42, 2),
        ]
        expect(analyzer.analyzeTrend(snapshots, 30)).toBe('stagnation')
      })
    })

    describe('regression (Req 4.4)', () => {
      it('classifica como regression quando progresso diminuiu exatamente 10%', () => {
        const snapshots = [
          makeSnapshot('s1', 50, 25),
          makeSnapshot('s2', 40, 5),
        ]
        expect(analyzer.analyzeTrend(snapshots, 30)).toBe('regression')
      })

      it('classifica como regression quando progresso diminuiu mais de 10%', () => {
        const snapshots = [
          makeSnapshot('s1', 80, 28),
          makeSnapshot('s2', 30, 2),
        ]
        expect(analyzer.analyzeTrend(snapshots, 30)).toBe('regression')
      })
    })

    describe('edge cases: dados insuficientes', () => {
      it('retorna stagnation com array vazio', () => {
        expect(analyzer.analyzeTrend([], 30)).toBe('stagnation')
      })

      it('retorna stagnation com apenas um snapshot', () => {
        const snapshots = [makeSnapshot('s1', 50, 5)]
        expect(analyzer.analyzeTrend(snapshots, 30)).toBe('stagnation')
      })

      it('retorna stagnation quando nenhum snapshot está dentro do período', () => {
        // Todos os snapshots são mais antigos que o período
        const snapshots = [
          makeSnapshot('s1', 10, 60),
          makeSnapshot('s2', 50, 45),
        ]
        expect(analyzer.analyzeTrend(snapshots, 30)).toBe('stagnation')
      })

      it('retorna stagnation quando apenas um snapshot está dentro do período', () => {
        const snapshots = [
          makeSnapshot('s1', 10, 60), // fora do período
          makeSnapshot('s2', 50, 10), // dentro do período
        ]
        expect(analyzer.analyzeTrend(snapshots, 30)).toBe('stagnation')
      })
    })

    describe('período customizado', () => {
      it('usa o periodDays fornecido para filtrar snapshots', () => {
        // Snapshot de 5 dias atrás: improvement em período de 7 dias
        const snapshots = [
          makeSnapshot('s1', 0, 6),
          makeSnapshot('s2', 50, 2),
        ]
        expect(analyzer.analyzeTrend(snapshots, 7)).toBe('improvement')
      })

      it('ignora snapshots fora do período especificado', () => {
        // Snapshot antigo mostraria improvement, mas está fora do período de 7 dias
        const snapshots = [
          makeSnapshot('s1', 0, 20),  // fora do período de 7 dias
          makeSnapshot('s2', 50, 15), // fora do período de 7 dias
          makeSnapshot('s3', 50, 5),  // dentro do período
          makeSnapshot('s4', 55, 1),  // dentro do período — variação de 5 = stagnation
        ]
        expect(analyzer.analyzeTrend(snapshots, 7)).toBe('stagnation')
      })
    })
  })

  // =========================================================================
  // calculateAverageWeeklyRate (Req 4.6)
  // =========================================================================
  describe('calculateAverageWeeklyRate', () => {
    it('retorna 0 com array vazio', () => {
      expect(analyzer.calculateAverageWeeklyRate([])).toBe(0)
    })

    it('retorna 0 com apenas um snapshot', () => {
      const snapshots = [makeSnapshot('s1', 50, 0)]
      expect(analyzer.calculateAverageWeeklyRate(snapshots)).toBe(0)
    })

    it('retorna 0 quando todos os snapshots têm a mesma data (período zero)', () => {
      const now = new Date()
      const snapshots = [
        makeSnapshotAt('s1', 0, now),
        makeSnapshotAt('s2', 50, now),
      ]
      expect(analyzer.calculateAverageWeeklyRate(snapshots)).toBe(0)
    })

    it('calcula taxa semanal corretamente para 2 semanas', () => {
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 14) // exatamente 2 semanas

      const snapshots = [
        makeSnapshotAt('s1', 0, start),
        makeSnapshotAt('s2', 20, end),
      ]
      // 20 pontos em 2 semanas = 10 por semana
      expect(analyzer.calculateAverageWeeklyRate(snapshots)).toBe(10)
    })

    it('calcula taxa semanal corretamente para 4 semanas', () => {
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 28) // 4 semanas

      const snapshots = [
        makeSnapshotAt('s1', 20, start),
        makeSnapshotAt('s2', 60, end),
      ]
      // 40 pontos em 4 semanas = 10 por semana
      expect(analyzer.calculateAverageWeeklyRate(snapshots)).toBe(10)
    })

    it('retorna taxa negativa quando há regressão', () => {
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 14) // 2 semanas

      const snapshots = [
        makeSnapshotAt('s1', 60, start),
        makeSnapshotAt('s2', 40, end),
      ]
      // -20 pontos em 2 semanas = -10 por semana
      expect(analyzer.calculateAverageWeeklyRate(snapshots)).toBe(-10)
    })

    it('usa o snapshot mais antigo e mais recente independente da ordem fornecida', () => {
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 14)

      // Fornecidos em ordem inversa
      const snapshots = [
        makeSnapshotAt('s2', 20, end),
        makeSnapshotAt('s1', 0, start),
      ]
      expect(analyzer.calculateAverageWeeklyRate(snapshots)).toBe(10)
    })

    it('considera múltiplos snapshots intermediários (usa apenas primeiro e último)', () => {
      const end = new Date()
      const mid = new Date(end)
      mid.setDate(mid.getDate() - 7)
      const start = new Date(end)
      start.setDate(start.getDate() - 14)

      const snapshots = [
        makeSnapshotAt('s1', 0, start),
        makeSnapshotAt('s2', 5, mid),   // intermediário
        makeSnapshotAt('s3', 20, end),
      ]
      // 20 pontos em 2 semanas = 10 por semana
      expect(analyzer.calculateAverageWeeklyRate(snapshots)).toBe(10)
    })
  })

  // =========================================================================
  // detectMilestones
  // =========================================================================
  describe('detectMilestones', () => {
    it('retorna array vazio para snapshots vazios', () => {
      expect(analyzer.detectMilestones([])).toEqual([])
    })

    it('detecta milestone de início quando progresso inicial é 0', () => {
      const snapshots = [makeSnapshot('s1', 0, 10)]
      const milestones = analyzer.detectMilestones(snapshots)
      expect(milestones).toHaveLength(1)
      expect(milestones[0].type).toBe('started')
    })

    it('não detecta milestone de início quando progresso inicial não é 0', () => {
      const snapshots = [makeSnapshot('s1', 30, 10)]
      const milestones = analyzer.detectMilestones(snapshots)
      expect(milestones.every(m => m.type !== 'started')).toBe(true)
    })

    it('detecta significant_increase quando variação é >= 20%', () => {
      const snapshots = [
        makeSnapshot('s1', 0, 20),
        makeSnapshot('s2', 20, 10),
      ]
      const milestones = analyzer.detectMilestones(snapshots)
      expect(milestones.some(m => m.type === 'significant_increase')).toBe(true)
    })

    it('detecta significant_decrease quando variação é <= -20%', () => {
      const snapshots = [
        makeSnapshot('s1', 80, 20),
        makeSnapshot('s2', 50, 10),
      ]
      const milestones = analyzer.detectMilestones(snapshots)
      expect(milestones.some(m => m.type === 'significant_decrease')).toBe(true)
    })

    it('detecta milestone de conclusão quando progresso atinge 100%', () => {
      const snapshots = [
        makeSnapshot('s1', 80, 10),
        makeSnapshot('s2', 100, 1),
      ]
      const milestones = analyzer.detectMilestones(snapshots)
      expect(milestones.some(m => m.type === 'completed')).toBe(true)
    })

    it('não detecta mudança significativa quando variação é menor que 20%', () => {
      const snapshots = [
        makeSnapshot('s1', 0, 20),
        makeSnapshot('s2', 19, 10),
      ]
      const milestones = analyzer.detectMilestones(snapshots)
      expect(milestones.every(m => m.type !== 'significant_increase')).toBe(true)
    })
  })

  // =========================================================================
  // comparePeriods
  // =========================================================================
  describe('comparePeriods', () => {
    it('calcula variação entre dois períodos', () => {
      const now = new Date()

      const period1Start = new Date(now)
      period1Start.setDate(period1Start.getDate() - 60)
      const period1End = new Date(now)
      period1End.setDate(period1End.getDate() - 31)

      const period2Start = new Date(now)
      period2Start.setDate(period2Start.getDate() - 30)
      const period2End = new Date(now)

      const snapshots = [
        makeSnapshotAt('s1', 20, period1Start),
        makeSnapshotAt('s2', 40, period1End),
        makeSnapshotAt('s3', 60, period2Start),
        makeSnapshotAt('s4', 80, period2End),
      ]

      const period1: PeriodSelection = {
        type: 'custom',
        customRange: { start: period1Start, end: period1End }
      }
      const period2: PeriodSelection = {
        type: 'custom',
        customRange: { start: period2Start, end: period2End }
      }

      const result = analyzer.comparePeriods(snapshots, period1, period2)

      expect(result.period1.averageProgress).toBe(30) // (20+40)/2
      expect(result.period2.averageProgress).toBe(70) // (60+80)/2
      expect(result.variation).toBe(40)
    })

    it('retorna variação negativa quando período 2 tem progresso menor', () => {
      const now = new Date()

      const p1Start = new Date(now); p1Start.setDate(p1Start.getDate() - 60)
      const p1End = new Date(now); p1End.setDate(p1End.getDate() - 31)
      const p2Start = new Date(now); p2Start.setDate(p2Start.getDate() - 30)
      const p2End = new Date(now)

      const snapshots = [
        makeSnapshotAt('s1', 80, p1Start),
        makeSnapshotAt('s2', 80, p1End),
        makeSnapshotAt('s3', 40, p2Start),
        makeSnapshotAt('s4', 40, p2End),
      ]

      const result = analyzer.comparePeriods(
        snapshots,
        { type: 'custom', customRange: { start: p1Start, end: p1End } },
        { type: 'custom', customRange: { start: p2Start, end: p2End } }
      )

      expect(result.variation).toBe(-40)
    })

    it('retorna averageProgress 0 para período sem snapshots', () => {
      const now = new Date()
      const p1Start = new Date(now); p1Start.setDate(p1Start.getDate() - 60)
      const p1End = new Date(now); p1End.setDate(p1End.getDate() - 31)
      const p2Start = new Date(now); p2Start.setDate(p2Start.getDate() - 30)
      const p2End = new Date(now)

      // Snapshots apenas no período 1
      const snapshots = [
        makeSnapshotAt('s1', 50, p1Start),
        makeSnapshotAt('s2', 70, p1End),
      ]

      const result = analyzer.comparePeriods(
        snapshots,
        { type: 'custom', customRange: { start: p1Start, end: p1End } },
        { type: 'custom', customRange: { start: p2Start, end: p2End } }
      )

      expect(result.period2.averageProgress).toBe(0)
      expect(result.period2.updateCount).toBe(0)
    })
  })

  // =========================================================================
  // createTrendAnalysis
  // =========================================================================
  describe('createTrendAnalysis', () => {
    it('retorna análise com trend stagnation e zeros para array vazio', () => {
      const result = analyzer.createTrendAnalysis([])
      expect(result.trend).toBe('stagnation')
      expect(result.startProgress).toBe(0)
      expect(result.endProgress).toBe(0)
      expect(result.totalVariation).toBe(0)
      expect(result.averageWeeklyRate).toBe(0)
    })

    it('retorna análise com trend stagnation e zeros para um único snapshot', () => {
      const snapshots = [makeSnapshot('s1', 50, 5)]
      const result = analyzer.createTrendAnalysis(snapshots)
      expect(result.trend).toBe('stagnation')
      expect(result.startProgress).toBe(0)
      expect(result.endProgress).toBe(0)
      expect(result.totalVariation).toBe(0)
    })

    it('retorna análise completa com improvement para snapshots com variação >= 10', () => {
      const snapshots = [
        makeSnapshot('s1', 10, 25),
        makeSnapshot('s2', 50, 5),
      ]
      const result = analyzer.createTrendAnalysis(snapshots, 30)
      expect(result.trend).toBe('improvement')
      expect(result.startProgress).toBe(10)
      expect(result.endProgress).toBe(50)
      expect(result.totalVariation).toBe(40)
      expect(result.periodDays).toBe(30)
    })

    it('retorna análise completa com regression para snapshots com variação <= -10', () => {
      const snapshots = [
        makeSnapshot('s1', 80, 25),
        makeSnapshot('s2', 30, 5),
      ]
      const result = analyzer.createTrendAnalysis(snapshots, 30)
      expect(result.trend).toBe('regression')
      expect(result.startProgress).toBe(80)
      expect(result.endProgress).toBe(30)
      expect(result.totalVariation).toBe(-50)
    })

    it('usa periodDays padrão de 30 quando não fornecido', () => {
      const snapshots = [
        makeSnapshot('s1', 0, 25),
        makeSnapshot('s2', 20, 5),
      ]
      const result = analyzer.createTrendAnalysis(snapshots)
      expect(result.periodDays).toBe(30)
    })

    it('usa periodDays customizado quando fornecido', () => {
      const snapshots = [
        makeSnapshot('s1', 0, 5),
        makeSnapshot('s2', 15, 1),
      ]
      const result = analyzer.createTrendAnalysis(snapshots, 7)
      expect(result.periodDays).toBe(7)
    })

    it('calcula averageWeeklyRate corretamente', () => {
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 14)

      const snapshots = [
        makeSnapshotAt('s1', 0, start),
        makeSnapshotAt('s2', 20, end),
      ]
      const result = analyzer.createTrendAnalysis(snapshots, 30)
      expect(result.averageWeeklyRate).toBe(10) // 20 pontos / 2 semanas
    })
  })

  // =========================================================================
  // comparePeriods com preset
  // =========================================================================
  describe('comparePeriods com preset', () => {
    it('usa preset last30days para calcular período', () => {
      const now = new Date()
      const recentDate = new Date(now)
      recentDate.setDate(recentDate.getDate() - 10)

      const snapshots = [
        makeSnapshotAt('s1', 50, recentDate),
        makeSnapshotAt('s2', 70, now),
      ]

      const period1: PeriodSelection = { type: 'preset', preset: 'last30days' }
      const period2: PeriodSelection = { type: 'preset', preset: 'last7days' }

      const result = analyzer.comparePeriods(snapshots, period1, period2)

      // Ambos os snapshots estão dentro dos últimos 30 dias
      expect(result.period1.updateCount).toBe(2)
      // Apenas o snapshot de 10 dias atrás pode estar fora dos últimos 7 dias
      expect(result.period2.updateCount).toBeGreaterThanOrEqual(1)
    })
  })
})
