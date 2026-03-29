import { GoalProgressSnapshotSchema } from '@/lib/schemas/evolution-history.schema'
import type { GoalProgressSnapshot } from '@/types/evolution-history'

/**
 * Parser para validação e transformação de dados históricos
 */
export class HistoryParser {
  /**
   * Parseia string JSON para array de snapshots
   * @param json - String JSON contendo snapshots
   * @returns Array de snapshots validados
   * @throws Error se JSON for inválido
   */
  parse(json: string): GoalProgressSnapshot[] {
    try {
      const data = JSON.parse(json)
      
      if (!Array.isArray(data)) {
        throw new Error('JSON deve conter um array de snapshots')
      }

      return data.map(item => this.parseSnapshot(item))
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('JSON inválido: formato incorreto')
      }
      throw error
    }
  }

  /**
   * Valida se dados conformam com schema de snapshot
   * @param data - Dados a serem validados
   * @returns true se válido, false caso contrário
   */
  validate(data: unknown): data is GoalProgressSnapshot {
    const result = GoalProgressSnapshotSchema.safeParse(data)
    return result.success
  }

  /**
   * Parseia snapshot individual
   * @param raw - Dados brutos do snapshot
   * @returns Snapshot validado
   * @throws Error se dados forem inválidos
   */
  parseSnapshot(raw: unknown): GoalProgressSnapshot {
    // Converter strings de data para objetos Date
    if (typeof raw === 'object' && raw !== null) {
      const obj = raw as any
      if (typeof obj.createdAt === 'string') {
        obj.createdAt = new Date(obj.createdAt)
      }
    }

    const result = GoalProgressSnapshotSchema.safeParse(raw)
    
    if (!result.success) {
      const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      throw new Error(`Snapshot inválido: ${errors}`)
    }

    return result.data
  }

  /**
   * Parseia array de snapshots com tratamento de erros
   * @param json - String JSON contendo array
   * @param options - Opções de parsing
   * @returns Array de snapshots válidos (inválidos são ignorados)
   */
  parseArray(
    json: string,
    options?: { onError?: (error: Error) => void }
  ): GoalProgressSnapshot[] {
    try {
      const data = JSON.parse(json)
      
      if (!Array.isArray(data)) {
        throw new Error('JSON deve conter um array')
      }

      const validSnapshots: GoalProgressSnapshot[] = []

      for (const item of data) {
        try {
          const snapshot = this.parseSnapshot(item)
          validSnapshots.push(snapshot)
        } catch (error) {
          // Registrar erro mas continuar processamento
          if (options?.onError && error instanceof Error) {
            options.onError(error)
          }
          console.warn('Snapshot inválido ignorado:', error)
        }
      }

      return validSnapshots
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('JSON inválido: formato incorreto')
      }
      throw error
    }
  }
}

// Exportar instância singleton
export const historyParser = new HistoryParser()
