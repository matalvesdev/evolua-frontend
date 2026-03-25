/**
 * Testes de Propriedade para ChartDataFormatter
 *
 * **Property 14: Cálculo de Progresso Geral Ponderado**
 * **Validates: Requirements 6.2**
 *
 * Para qualquer array de valores de progresso de metas:
 *   - calculateOverallProgress deve retornar a média aritmética de todos os valores
 *   - A média deve ser: sum(values) / count(values)
 *   - Para array vazio, deve retornar 0
 *   - Para valor único, deve retornar esse valor
 *   - O resultado deve estar sempre no intervalo [0, 100] quando todas as entradas estão em [0, 100]
 */

import { ChartDataFormatter } from '../chart-data-formatter'

// ============================================================================
// Geradores de dados aleatórios
// ============================================================================

/** Gera um número de ponto flutuante aleatório no intervalo [min, max] */
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/** Gera um inteiro aleatório no intervalo [min, max] (inclusive) */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Gera um array de progressos aleatórios com valores em [0, 100] */
function randomProgressArray(length: number): number[] {
  return Array.from({ length }, () => randomFloat(0, 100))
}

/** Calcula a média aritmética esperada com arredondamento de 2 casas decimais */
function expectedMean(values: number[]): number {
  if (values.length === 0) return 0
  const sum = values.reduce((acc, v) => acc + v, 0)
  return Math.round((sum / values.length) * 100) / 100
}

// ============================================================================
// Property 14: Cálculo de Progresso Geral Ponderado
// Validates: Requirements 6.2
// ============================================================================

describe('Property 14: Cálculo de Progresso Geral Ponderado (Req 6.2)', () => {
  const ITERATIONS = 100
  let formatter: ChartDataFormatter

  beforeEach(() => {
    formatter = new ChartDataFormatter()
  })

  it('deve retornar 0 para array vazio', () => {
    const result = formatter.calculateOverallProgress([])
    expect(result).toBe(0)
  })

  it('deve retornar o próprio valor para array com um único elemento', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const value = randomFloat(0, 100)
      const rounded = Math.round(value * 100) / 100
      const result = formatter.calculateOverallProgress([value])
      expect(result).toBe(Math.round((value / 1) * 100) / 100)
    }
  })

  it('deve calcular a média aritmética correta para arrays aleatórios', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const length = randomInt(2, 20)
      const progresses = randomProgressArray(length)
      const expected = expectedMean(progresses)
      const result = formatter.calculateOverallProgress(progresses)
      expect(result).toBe(expected)
    }
  })

  it('deve retornar resultado no intervalo [0, 100] quando entradas estão em [0, 100]', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const length = randomInt(1, 20)
      const progresses = randomProgressArray(length)
      const result = formatter.calculateOverallProgress(progresses)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(100)
    }
  })

  it('deve calcular média correta para arrays de tamanhos variados (1 a 50 elementos)', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const length = randomInt(1, 50)
      const progresses = randomProgressArray(length)
      const expected = expectedMean(progresses)
      const result = formatter.calculateOverallProgress(progresses)
      expect(result).toBe(expected)
    }
  })

  it('deve retornar 50 para array de valores todos iguais a 50', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const length = randomInt(1, 30)
      const progresses = Array(length).fill(50)
      const result = formatter.calculateOverallProgress(progresses)
      expect(result).toBe(50)
    }
  })

  it('deve calcular média correta para valores nos extremos (0 e 100)', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const length = randomInt(2, 20)
      // Array com apenas 0s e 100s
      const progresses = Array.from({ length }, () => (Math.random() < 0.5 ? 0 : 100))
      const expected = expectedMean(progresses)
      const result = formatter.calculateOverallProgress(progresses)
      expect(result).toBe(expected)
    }
  })
})
