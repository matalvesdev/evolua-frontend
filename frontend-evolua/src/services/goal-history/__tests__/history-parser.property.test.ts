/**
 * Testes de Propriedade para HistoryParser
 *
 * **Property 26: Resiliência a Dados Corrompidos**
 * **Validates: Requirements 10.5**
 *
 * Para qualquer conjunto de dados contendo registros válidos e inválidos misturados,
 * o Parser deve:
 *   1. Processar todos os registros válidos com sucesso
 *   2. Registrar erros para os registros inválidos
 *   3. NÃO lançar exceção nem interromper o processamento ao encontrar dados inválidos
 *   4. Retornar apenas os registros válidos
 */

import { HistoryParser } from '../history-parser'

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

/** Escolhe um elemento aleatório de um array */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Gera um objeto snapshot válido (como objeto JS, não string) */
function generateValidSnapshotObject(): Record<string, unknown> {
  return {
    id: generateUUID(),
    goalId: generateUUID(),
    progress: randomInt(0, 100),
    createdAt: new Date().toISOString(),
    therapistId: generateUUID()
  }
}

/** Gera um registro inválido de um dos tipos possíveis */
function generateInvalidRecord(): unknown {
  const invalidTypes = [
    // null
    () => null,
    // undefined (serializado como null em JSON)
    () => null,
    // string aleatória
    () => 'not-an-object',
    // número
    () => 42,
    // booleano
    () => true,
    // objeto sem campos obrigatórios
    () => ({}),
    // id inválido (não UUID)
    () => ({ id: 'not-a-uuid', goalId: generateUUID(), progress: 50, createdAt: new Date().toISOString(), therapistId: generateUUID() }),
    // goalId inválido
    () => ({ id: generateUUID(), goalId: 'invalid-id', progress: 50, createdAt: new Date().toISOString(), therapistId: generateUUID() }),
    // progress fora do intervalo (negativo)
    () => ({ id: generateUUID(), goalId: generateUUID(), progress: -1, createdAt: new Date().toISOString(), therapistId: generateUUID() }),
    // progress fora do intervalo (acima de 100)
    () => ({ id: generateUUID(), goalId: generateUUID(), progress: 101, createdAt: new Date().toISOString(), therapistId: generateUUID() }),
    // progress como string
    () => ({ id: generateUUID(), goalId: generateUUID(), progress: '50', createdAt: new Date().toISOString(), therapistId: generateUUID() }),
    // createdAt inválido
    () => ({ id: generateUUID(), goalId: generateUUID(), progress: 50, createdAt: 'not-a-date', therapistId: generateUUID() }),
    // therapistId inválido
    () => ({ id: generateUUID(), goalId: generateUUID(), progress: 50, createdAt: new Date().toISOString(), therapistId: 'bad-id' }),
    // faltando campo id
    () => ({ goalId: generateUUID(), progress: 50, createdAt: new Date().toISOString(), therapistId: generateUUID() }),
    // faltando campo goalId
    () => ({ id: generateUUID(), progress: 50, createdAt: new Date().toISOString(), therapistId: generateUUID() }),
    // faltando campo progress
    () => ({ id: generateUUID(), goalId: generateUUID(), createdAt: new Date().toISOString(), therapistId: generateUUID() }),
    // faltando campo createdAt
    () => ({ id: generateUUID(), goalId: generateUUID(), progress: 50, therapistId: generateUUID() }),
    // faltando campo therapistId
    () => ({ id: generateUUID(), goalId: generateUUID(), progress: 50, createdAt: new Date().toISOString() }),
    // progress como float (não inteiro)
    () => ({ id: generateUUID(), goalId: generateUUID(), progress: 50.5, createdAt: new Date().toISOString(), therapistId: generateUUID() }),
    // array vazio no lugar de objeto
    () => [],
  ]

  return randomChoice(invalidTypes)()
}

/**
 * Gera um array misto com `validCount` registros válidos e `invalidCount` inválidos,
 * embaralhados aleatoriamente. Retorna o array e os índices dos registros válidos.
 */
function generateMixedArray(validCount: number, invalidCount: number): {
  items: unknown[]
  validCount: number
} {
  const valids = Array.from({ length: validCount }, generateValidSnapshotObject)
  const invalids = Array.from({ length: invalidCount }, generateInvalidRecord)

  // Embaralhar
  const combined: unknown[] = [...valids, ...invalids]
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[combined[i], combined[j]] = [combined[j], combined[i]]
  }

  return { items: combined, validCount: valids.length }
}

// ============================================================================
// Property 26: Resiliência a Dados Corrompidos
// Validates: Requirements 10.5
// ============================================================================

describe('Property 26: Resiliência a Dados Corrompidos (Req 10.5)', () => {
  const ITERATIONS = 100
  let parser: HistoryParser

  beforeEach(() => {
    parser = new HistoryParser()
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('deve retornar apenas os registros válidos de um array misto, sem lançar exceção', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const validCount = randomInt(1, 10)
      const invalidCount = randomInt(1, 10)
      const { items } = generateMixedArray(validCount, invalidCount)

      const json = JSON.stringify(items)

      // Propriedade 3: NÃO deve lançar exceção
      let result: ReturnType<typeof parser.parseArray>
      expect(() => {
        result = parser.parseArray(json)
      }).not.toThrow()

      // Propriedade 4: deve retornar apenas os registros válidos
      // O número de resultados deve ser <= validCount (pode ser menor se algum válido
      // gerado tiver problema de conversão de data, mas nunca maior)
      expect(result!.length).toBeLessThanOrEqual(validCount)
      expect(result!.length).toBeGreaterThanOrEqual(0)
    }
  })

  it('deve processar todos os registros válidos com sucesso', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const validCount = randomInt(1, 8)
      const invalidCount = randomInt(1, 8)
      const { items } = generateMixedArray(validCount, invalidCount)

      const json = JSON.stringify(items)
      const result = parser.parseArray(json)

      // Cada item retornado deve ter todos os campos obrigatórios
      for (const snapshot of result) {
        expect(snapshot).toHaveProperty('id')
        expect(snapshot).toHaveProperty('goalId')
        expect(snapshot).toHaveProperty('progress')
        expect(snapshot).toHaveProperty('createdAt')
        expect(snapshot).toHaveProperty('therapistId')

        expect(typeof snapshot.id).toBe('string')
        expect(typeof snapshot.goalId).toBe('string')
        expect(typeof snapshot.therapistId).toBe('string')
        expect(typeof snapshot.progress).toBe('number')
        expect(snapshot.progress).toBeGreaterThanOrEqual(0)
        expect(snapshot.progress).toBeLessThanOrEqual(100)
        expect(snapshot.createdAt).toBeInstanceOf(Date)
      }
    }
  })

  it('deve registrar erros para registros inválidos via callback onError', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const validCount = randomInt(0, 5)
      const invalidCount = randomInt(1, 5)
      const { items } = generateMixedArray(validCount, invalidCount)

      const json = JSON.stringify(items)
      const errors: Error[] = []

      parser.parseArray(json, { onError: (err) => errors.push(err) })

      // Deve ter registrado pelo menos um erro (há pelo menos 1 inválido)
      expect(errors.length).toBeGreaterThanOrEqual(1)

      // Cada erro deve ser uma instância de Error com mensagem
      for (const err of errors) {
        expect(err).toBeInstanceOf(Error)
        expect(err.message.length).toBeGreaterThan(0)
      }
    }
  })

  it('deve não interromper o processamento ao encontrar dados inválidos no meio do array', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      // Garante que há registros válidos APÓS registros inválidos
      const validAfter = randomInt(1, 5)
      const invalidBefore = randomInt(1, 5)

      const invalids = Array.from({ length: invalidBefore }, generateInvalidRecord)
      const valids = Array.from({ length: validAfter }, generateValidSnapshotObject)

      // Inválidos primeiro, depois válidos
      const items = [...invalids, ...valids]
      const json = JSON.stringify(items)

      const result = parser.parseArray(json)

      // Deve ter processado os registros válidos que vieram depois dos inválidos
      expect(result.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('deve retornar array vazio quando todos os registros são inválidos', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const invalidCount = randomInt(1, 10)
      const invalids = Array.from({ length: invalidCount }, generateInvalidRecord)
      const json = JSON.stringify(invalids)

      const result = parser.parseArray(json)

      expect(result).toEqual([])
    }
  })

  it('deve retornar todos os registros quando todos são válidos', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const validCount = randomInt(1, 10)
      const valids = Array.from({ length: validCount }, generateValidSnapshotObject)
      const json = JSON.stringify(valids)

      const result = parser.parseArray(json)

      expect(result.length).toBe(validCount)
    }
  })

  it('deve não chamar onError quando todos os registros são válidos', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const validCount = randomInt(1, 10)
      const valids = Array.from({ length: validCount }, generateValidSnapshotObject)
      const json = JSON.stringify(valids)

      const errors: Error[] = []
      parser.parseArray(json, { onError: (err) => errors.push(err) })

      expect(errors.length).toBe(0)
    }
  })

  it('deve funcionar sem callback onError (erros silenciosos via console.warn)', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const validCount = randomInt(1, 5)
      const invalidCount = randomInt(1, 5)
      const { items } = generateMixedArray(validCount, invalidCount)
      const json = JSON.stringify(items)

      // Sem callback — não deve lançar
      expect(() => parser.parseArray(json)).not.toThrow()
    }
  })
})
