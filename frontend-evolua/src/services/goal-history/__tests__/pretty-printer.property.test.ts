/**
 * Testes de Propriedade para PrettyPrinter
 *
 * **Property 25: Round-trip de Serialização**
 * **Validates: Requirements 10.4**
 *
 * Para qualquer objeto GoalProgressSnapshot válido, aplicar parse(print(snapshot))
 * deve produzir um objeto equivalente ao original.
 */

import { PrettyPrinter } from '../pretty-printer'
import { HistoryParser } from '../history-parser'
import type { GoalProgressSnapshot } from '@/types/evolution-history'

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

/** Gera um float aleatório no intervalo [min, max] */
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/** Gera uma string de texto aleatória */
function randomString(minLen = 5, maxLen = 50): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '
  const len = randomInt(minLen, maxLen)
  return Array.from({ length: len }, () => chars[randomInt(0, chars.length - 1)]).join('')
}

/** Gera uma data aleatória entre 2020 e 2025 */
function randomDate(): Date {
  const start = new Date('2020-01-01').getTime()
  const end = new Date('2025-12-31').getTime()
  return new Date(start + Math.random() * (end - start))
}

/**
 * Gera um GoalProgressSnapshot válido com combinações aleatórias de campos opcionais.
 * Cobre todas as 8 combinações possíveis de (notes, variation, daysSinceLast).
 */
function generateValidSnapshot(): GoalProgressSnapshot {
  const hasNotes = Math.random() < 0.5
  const hasVariation = Math.random() < 0.5
  const hasDaysSinceLast = Math.random() < 0.5

  const snapshot: GoalProgressSnapshot = {
    id: generateUUID(),
    goalId: generateUUID(),
    progress: randomInt(0, 100),
    createdAt: randomDate(),
    therapistId: generateUUID(),
  }

  if (hasNotes) {
    snapshot.notes = randomString(5, 200)
  }

  if (hasVariation) {
    // variation pode ser negativo (regressão) ou positivo (melhora) — schema exige int
    snapshot.variation = randomInt(-100, 100)
  }

  if (hasDaysSinceLast) {
    snapshot.daysSinceLast = randomInt(1, 365)
  }

  return snapshot
}

/**
 * Compara dois GoalProgressSnapshot para equivalência semântica.
 * Datas são comparadas por valor (getTime), não por referência.
 */
function snapshotsAreEqual(a: GoalProgressSnapshot, b: GoalProgressSnapshot): boolean {
  if (a.id !== b.id) return false
  if (a.goalId !== b.goalId) return false
  if (a.progress !== b.progress) return false
  if (a.therapistId !== b.therapistId) return false
  if (a.createdAt.getTime() !== b.createdAt.getTime()) return false

  // Campos opcionais: ambos devem ser undefined ou ter o mesmo valor
  if (a.notes !== b.notes) return false
  if (a.variation !== b.variation) return false
  if (a.daysSinceLast !== b.daysSinceLast) return false

  return true
}

// ============================================================================
// Property 25: Round-trip de Serialização
// Validates: Requirements 10.4
// ============================================================================

describe('Property 25: Round-trip de Serialização (Req 10.4)', () => {
  const ITERATIONS = 100
  let printer: PrettyPrinter
  let parser: HistoryParser

  beforeEach(() => {
    printer = new PrettyPrinter()
    parser = new HistoryParser()
  })

  it('parse(print(snapshot)) deve produzir objeto equivalente ao original para 100 snapshots aleatórios', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const original = generateValidSnapshot()

      // print serializa o snapshot para JSON formatado
      const printed = printer.print(original)

      // parse espera um array JSON — envolvemos o snapshot em array
      const roundTripped = parser.parse(`[${printed}]`)

      expect(roundTripped).toHaveLength(1)

      const restored = roundTripped[0]

      expect(snapshotsAreEqual(original, restored)).toBe(true)
    }
  })

  it('deve preservar o campo id após round-trip', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const original = generateValidSnapshot()
      const printed = printer.print(original)
      const [restored] = parser.parse(`[${printed}]`)

      expect(restored.id).toBe(original.id)
    }
  })

  it('deve preservar o campo goalId após round-trip', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const original = generateValidSnapshot()
      const printed = printer.print(original)
      const [restored] = parser.parse(`[${printed}]`)

      expect(restored.goalId).toBe(original.goalId)
    }
  })

  it('deve preservar o campo progress após round-trip', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const original = generateValidSnapshot()
      const printed = printer.print(original)
      const [restored] = parser.parse(`[${printed}]`)

      expect(restored.progress).toBe(original.progress)
    }
  })

  it('deve preservar o campo createdAt após round-trip', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const original = generateValidSnapshot()
      const printed = printer.print(original)
      const [restored] = parser.parse(`[${printed}]`)

      expect(restored.createdAt).toBeInstanceOf(Date)
      expect(restored.createdAt.getTime()).toBe(original.createdAt.getTime())
    }
  })

  it('deve preservar o campo therapistId após round-trip', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const original = generateValidSnapshot()
      const printed = printer.print(original)
      const [restored] = parser.parse(`[${printed}]`)

      expect(restored.therapistId).toBe(original.therapistId)
    }
  })

  it('deve preservar o campo opcional notes após round-trip', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const original = generateValidSnapshot()
      const printed = printer.print(original)
      const [restored] = parser.parse(`[${printed}]`)

      expect(restored.notes).toBe(original.notes)
    }
  })

  it('deve preservar o campo opcional variation após round-trip', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const original = generateValidSnapshot()
      const printed = printer.print(original)
      const [restored] = parser.parse(`[${printed}]`)

      expect(restored.variation).toBe(original.variation)
    }
  })

  it('deve preservar o campo opcional daysSinceLast após round-trip', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const original = generateValidSnapshot()
      const printed = printer.print(original)
      const [restored] = parser.parse(`[${printed}]`)

      expect(restored.daysSinceLast).toBe(original.daysSinceLast)
    }
  })

  it('deve funcionar para snapshots com todos os campos opcionais presentes', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const original: GoalProgressSnapshot = {
        id: generateUUID(),
        goalId: generateUUID(),
        progress: randomInt(0, 100),
        createdAt: randomDate(),
        therapistId: generateUUID(),
        notes: randomString(10, 100),
        variation: randomInt(-100, 100),
        daysSinceLast: randomInt(1, 365),
      }

      const printed = printer.print(original)
      const [restored] = parser.parse(`[${printed}]`)

      expect(snapshotsAreEqual(original, restored)).toBe(true)
    }
  })

  it('deve funcionar para snapshots sem nenhum campo opcional', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const original: GoalProgressSnapshot = {
        id: generateUUID(),
        goalId: generateUUID(),
        progress: randomInt(0, 100),
        createdAt: randomDate(),
        therapistId: generateUUID(),
      }

      const printed = printer.print(original)
      const [restored] = parser.parse(`[${printed}]`)

      expect(snapshotsAreEqual(original, restored)).toBe(true)
      expect(restored.notes).toBeUndefined()
      expect(restored.variation).toBeUndefined()
      expect(restored.daysSinceLast).toBeUndefined()
    }
  })

  it('deve produzir JSON válido (parseable) para qualquer snapshot', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const original = generateValidSnapshot()
      const printed = printer.print(original)

      expect(() => JSON.parse(printed)).not.toThrow()
    }
  })

  it('deve preservar progress nos valores de fronteira (0 e 100)', () => {
    const boundaries = [0, 100]

    for (const progress of boundaries) {
      for (let i = 0; i < 10; i++) {
        const original: GoalProgressSnapshot = {
          id: generateUUID(),
          goalId: generateUUID(),
          progress,
          createdAt: randomDate(),
          therapistId: generateUUID(),
        }

        const printed = printer.print(original)
        const [restored] = parser.parse(`[${printed}]`)

        expect(restored.progress).toBe(progress)
      }
    }
  })
})
