import type { GoalProgressSnapshot } from '@/types/evolution-history'

/**
 * Formatador de dados para serialização
 */
export class PrettyPrinter {
  /**
   * Serializa snapshot para JSON formatado
   * @param snapshot - Snapshot a ser serializado
   * @returns String JSON formatada com indentação
   */
  print(snapshot: GoalProgressSnapshot): string {
    return this.format(snapshot, 2)
  }

  /**
   * Serializa array de snapshots para JSON formatado
   * @param snapshots - Array de snapshots
   * @returns String JSON formatada com indentação
   */
  printArray(snapshots: GoalProgressSnapshot[]): string {
    return this.format(snapshots, 2)
  }

  /**
   * Formata objeto genérico para JSON com indentação
   * @param obj - Objeto a ser formatado
   * @param indent - Número de espaços para indentação
   * @returns String JSON formatada
   */
  format(obj: unknown, indent: number = 2): string {
    return JSON.stringify(obj, null, indent)
  }
}

// Exportar instância singleton
export const prettyPrinter = new PrettyPrinter()
